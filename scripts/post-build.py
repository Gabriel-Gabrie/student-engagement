#!/usr/bin/env python3
"""
Post-process the openpyxl-generated template via Excel COM automation.

Adds PivotTables, Slicers, and PivotCharts that openpyxl can't create.

Slicer scope:
- Campus + Time block + Timeline filter the heatmap-host pivot, the
  Weekly report pivot, and the Monthly report pivot (all share one cache
  on tblVisitor).
- Top Categories chart (sourced from tblVisitorLong) is its own cache
  and shows lifetime totals — slicers don't filter it.
- Outreach charts (sourced from tblOutreach) are also their own cache
  and show lifetime totals.

This is intentional: the unfiltered KPIs / Top Categories give Shannon
the lifetime view; the slicer-aware Reports sheets give her time/campus
breakdowns. Two views, no data-model complexity.

Requirements:
    Windows + Excel + pywin32 (`pip install pywin32`)

Usage (from repo root):
    python scripts/post-build.py
"""

import sys
import time
from pathlib import Path

# Force UTF-8 console output so non-ASCII names don't crash on Windows cp1252.
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

try:
    import win32com.client as wc
    from pywintypes import com_error
except ImportError:
    sys.exit(
        "pywin32 is required: pip install pywin32. This step is Windows-only "
        "since it drives Excel via COM."
    )


# Excel constants
XL_DATABASE = 1
XL_ROW_FIELD = 1
XL_COLUMN_FIELD = 2
XL_DATA_FIELD = 4
XL_SUM = -4157
XL_SHEET_VERY_HIDDEN = 2

# Field names from build-template.py
HEADCOUNT = "How many people did you help during this time block?"
TIME_BLOCK = "Time block this submission covers"
OUTREACH_HEADCOUNT = "How many people attended the outreach activity?"
OUTREACH_DATE = "Date of outreach activity"


def find_sheet(wb, predicate):
    for sheet in wb.Worksheets:
        if predicate(sheet.Name):
            return sheet
    raise RuntimeError(
        f"No sheet matched. Available: {[s.Name for s in wb.Worksheets]}"
    )


def main():
    repo_root = Path(__file__).resolve().parent.parent
    xlsx_path = (
        repo_root / "templates" / "student-engagement-dashboard-starter.xlsx"
    )
    if not xlsx_path.exists():
        sys.exit(
            f"Template not found: {xlsx_path}\n"
            "Run `python scripts/build-template.py` first."
        )

    print(f"Opening {xlsx_path} ...")
    try:
        from win32com.client import gencache
        excel = gencache.EnsureDispatch("Excel.Application")
    except Exception:
        excel = wc.DispatchEx("Excel.Application")

    excel.Visible = False
    excel.DisplayAlerts = False
    excel.ScreenUpdating = False

    wb = None
    try:
        wb = excel.Workbooks.Open(str(xlsx_path))

        dashboard = find_sheet(wb, lambda n: n.lower() == "dashboard")
        weekly = find_sheet(
            wb, lambda n: n.lower().startswith("reports") and "weekly" in n.lower()
        )
        monthly = find_sheet(
            wb, lambda n: n.lower().startswith("reports") and "monthly" in n.lower()
        )

        # Hidden host sheet for the slicer-source pivot
        host = wb.Worksheets.Add()
        host.Name = "_PivotHost"

        # ------ Pivots on tblVisitor (shared cache) ------
        print("Creating shared pivot cache on tblVisitor ...")
        cache_v = wb.PivotCaches().Create(
            SourceType=XL_DATABASE, SourceData="tblVisitor"
        )

        print("Building slicer-host pivot ...")
        pt_host = cache_v.CreatePivotTable(
            TableDestination=host.Range("A1"),
            TableName="ptSlicerHost",
        )
        pt_host.PivotFields("Campus").Orientation = XL_ROW_FIELD
        helped = pt_host.PivotFields(HEADCOUNT)
        helped.Orientation = XL_DATA_FIELD
        helped.Function = XL_SUM

        print("Building Weekly report pivot ...")
        pt_weekly = cache_v.CreatePivotTable(
            TableDestination=weekly.Range("B10"),
            TableName="ptWeekly",
        )
        pt_weekly.PivotFields("Completion time").Orientation = XL_ROW_FIELD
        pt_weekly.PivotFields("Campus").Orientation = XL_COLUMN_FIELD
        f = pt_weekly.PivotFields(HEADCOUNT)
        f.Orientation = XL_DATA_FIELD
        f.Function = XL_SUM
        f.NumberFormat = "0"
        try:
            pt_weekly.RowAxisLayout(1)  # tabular
        except com_error:
            pass

        print("Building Monthly report pivot ...")
        pt_monthly = cache_v.CreatePivotTable(
            TableDestination=monthly.Range("B10"),
            TableName="ptMonthly",
        )
        pt_monthly.PivotFields("Completion time").Orientation = XL_ROW_FIELD
        pt_monthly.PivotFields("Campus").Orientation = XL_COLUMN_FIELD
        f2 = pt_monthly.PivotFields(HEADCOUNT)
        f2.Orientation = XL_DATA_FIELD
        f2.Function = XL_SUM
        f2.NumberFormat = "0"
        try:
            pt_monthly.RowAxisLayout(1)
        except com_error:
            pass

        # ------ Slicers on the visitor cache ------
        print("Adding Campus slicer ...")
        sc_campus = wb.SlicerCaches.Add2(pt_host, "Campus")
        sc_campus.Slicers.Add(
            SlicerDestination=dashboard,
            Name="slCampus",
            Caption="Campus",
            Top=30, Left=20, Width=200, Height=130,
        )

        print("Adding Time block slicer ...")
        sc_time = wb.SlicerCaches.Add2(pt_host, TIME_BLOCK)
        sc_time.Slicers.Add(
            SlicerDestination=dashboard,
            Name="slTime",
            Caption="Time block",
            Top=30, Left=230, Width=270, Height=130,
        )

        # Wire to all visitor pivots
        print("Wiring slicers to Weekly + Monthly pivots ...")
        for sc in (sc_campus, sc_time):
            for pt in (pt_weekly, pt_monthly):
                try:
                    sc.PivotTables.AddPivotTable(pt)
                except com_error as e:
                    msg = e.excepinfo[2] if e.excepinfo else str(e)
                    print(f"  (skip {sc.Name} -> {pt.Name}: {msg})")

        host.Visible = XL_SHEET_VERY_HIDDEN

        # ------ Top Categories pivot+chart on tblVisitorLong ------
        print("Building Top Categories pivot+chart on tblVisitorLong ...")
        try:
            cache_long = wb.PivotCaches().Create(
                SourceType=XL_DATABASE, SourceData="tblVisitorLong"
            )
            # Park the pivot on the hidden _PivotHost sheet (column D so it
            # doesn't overlap ptSlicerHost in column A).
            pt_top = cache_long.CreatePivotTable(
                TableDestination=host.Range("D1"),
                TableName="ptTopCategories",
            )
            pt_top.PivotFields("Category").Orientation = XL_ROW_FIELD
            ftc = pt_top.PivotFields("Count")
            ftc.Orientation = XL_DATA_FIELD
            ftc.Function = XL_SUM
            ftc.NumberFormat = "0"

            # Add PivotChart to Dashboard, sourced from this pivot
            chart_obj = dashboard.Shapes.AddChart2(201, 57)  # 201=default style; 57=xlBarClustered
            chart_obj.Top = 270
            chart_obj.Left = 10
            chart_obj.Width = 700
            chart_obj.Height = 240
            chart_obj.Chart.SetSourceData(pt_top.TableRange1)
            chart_obj.Chart.HasTitle = False
            chart_obj.Chart.HasLegend = False
            chart_obj.Name = "chTopCategories"
        except com_error as e:
            msg = e.excepinfo[2] if e.excepinfo else str(e)
            print(f"  Top Categories chart skipped: {msg}")

        # ------ Outreach Themes pivot+chart on tblOutreach ------
        print("Building Outreach Themes pivot+chart on tblOutreach ...")
        try:
            cache_o = wb.PivotCaches().Create(
                SourceType=XL_DATABASE, SourceData="tblOutreach"
            )
            pt_themes = cache_o.CreatePivotTable(
                TableDestination=host.Range("G1"),
                TableName="ptOutreachThemes",
            )
            pt_themes.PivotFields("Outreach Activity").Orientation = XL_ROW_FIELD
            fth = pt_themes.PivotFields(OUTREACH_HEADCOUNT)
            fth.Orientation = XL_DATA_FIELD
            fth.Function = XL_SUM
            fth.NumberFormat = "0"

            chart_obj = dashboard.Shapes.AddChart2(201, 57)
            chart_obj.Top = 540
            chart_obj.Left = 10
            chart_obj.Width = 350
            chart_obj.Height = 240
            chart_obj.Chart.SetSourceData(pt_themes.TableRange1)
            chart_obj.Chart.HasTitle = False
            chart_obj.Chart.HasLegend = False
            chart_obj.Name = "chOutreachThemes"
        except com_error as e:
            msg = e.excepinfo[2] if e.excepinfo else str(e)
            print(f"  Outreach Themes chart skipped: {msg}")

        # ------ Outreach by Campus pivot+chart on tblOutreach ------
        print("Building Outreach by Campus pivot+chart on tblOutreach ...")
        try:
            # Re-use cache_o for second pivot — same source
            pt_oc = cache_o.CreatePivotTable(
                TableDestination=host.Range("J1"),
                TableName="ptOutreachByCampus",
            )
            pt_oc.PivotFields("Campus").Orientation = XL_ROW_FIELD
            foc = pt_oc.PivotFields(OUTREACH_HEADCOUNT)
            foc.Orientation = XL_DATA_FIELD
            foc.Function = XL_SUM
            foc.NumberFormat = "0"

            chart_obj = dashboard.Shapes.AddChart2(201, 51)  # 51 = xlColumnClustered
            chart_obj.Top = 800
            chart_obj.Left = 10
            chart_obj.Width = 700
            chart_obj.Height = 200
            chart_obj.Chart.SetSourceData(pt_oc.TableRange1)
            chart_obj.Chart.HasTitle = False
            chart_obj.Chart.HasLegend = False
            chart_obj.Name = "chOutreachByCampus"
        except com_error as e:
            msg = e.excepinfo[2] if e.excepinfo else str(e)
            print(f"  Outreach by Campus chart skipped: {msg}")

        print("Saving ...")
        wb.Save()
        wb.Close(SaveChanges=False)
        wb = None

        print("Post-processing complete.")
        print("  Slicers: Campus, Time block (filter Weekly + Monthly + heatmap-host).")
        print("  PivotCharts: Top Categories, Outreach Themes, Outreach by Campus.")
        print("  Add Timeline manually after Power Query loads real data.")
    except Exception:
        if wb is not None:
            try:
                wb.Close(SaveChanges=False)
            except Exception:
                pass
        raise
    finally:
        excel.Quit()
        time.sleep(0.2)


if __name__ == "__main__":
    main()
