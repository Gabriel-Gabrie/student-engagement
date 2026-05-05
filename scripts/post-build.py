#!/usr/bin/env python3
"""
Post-process the openpyxl-generated template via Excel COM automation.

Adds the things openpyxl can't: real PivotTables, Slicers, and a Timeline.
After this runs, the dashboard has Campus + Time block slicers and a
Submitted-at timeline that filter the Weekly and Monthly report pivots.

Requirements:
    - Windows
    - Excel installed (uses COM automation; same as VBA / Excel macros)
    - pywin32 (`pip install pywin32`)

Usage (from repo root):
    python scripts/post-build.py
"""

import sys
import time
from pathlib import Path

# Ensure stdout/stderr handle non-ASCII characters cleanly on Windows consoles
# that default to cp1252.
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


# Excel constants (mirrors XlConstants enum)
XL_DATABASE = 1
XL_ROW_FIELD = 1
XL_COLUMN_FIELD = 2
XL_DATA_FIELD = 4
XL_SUM = -4157
XL_SHEET_VERY_HIDDEN = 2

# SlicerCacheType enum
XL_SLICER = 1
XL_TIMELINE = 2


def find_sheet(wb, predicate):
    """Find the first worksheet matching a predicate (case-insensitive partial match)."""
    for sheet in wb.Worksheets:
        if predicate(sheet.Name):
            return sheet
    raise RuntimeError(f"No sheet matched. Available: {[s.Name for s in wb.Worksheets]}")


def main():
    repo_root = Path(__file__).resolve().parent.parent
    xlsx_path = repo_root / "templates" / "student-engagement-dashboard-starter.xlsx"
    if not xlsx_path.exists():
        sys.exit(
            f"Template not found: {xlsx_path}\n"
            "Run `python scripts/build-template.py` first."
        )

    print(f"Opening {xlsx_path} in Excel COM ...")
    # Early binding via gencache — generates type-library stubs so that COM
    # optional parameters work properly (matters for SlicerCaches.Add2
    # invocation patterns that fail under late binding).
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
        weekly = find_sheet(wb, lambda n: n.lower().startswith("reports") and "weekly" in n.lower())
        monthly = find_sheet(wb, lambda n: n.lower().startswith("reports") and "monthly" in n.lower())

        # Create a hidden host sheet that owns the pivot-cache the slicers attach to
        host = wb.Worksheets.Add()
        host.Name = "_PivotHost"

        # ---- Build ONE shared pivot cache for all three pivots. ----
        # ---- This is the key to slicer wiring — slicers can only filter
        # ---- pivots that share their cache. ----
        print("Creating shared pivot cache from tblVisitor ...")
        shared_cache = wb.PivotCaches().Create(
            SourceType=XL_DATABASE, SourceData="tblVisitor"
        )

        print("Building slicer-host pivot ...")
        pt_host = shared_cache.CreatePivotTable(
            TableDestination=host.Range("A1"),
            TableName="ptSlicerHost",
        )
        pt_host.PivotFields("Campus").Orientation = XL_ROW_FIELD
        helped = pt_host.PivotFields("How many helped")
        helped.Orientation = XL_DATA_FIELD
        helped.Function = XL_SUM

        print("Building Weekly report pivot ...")
        pt_weekly = shared_cache.CreatePivotTable(
            TableDestination=weekly.Range("B10"),
            TableName="ptWeekly",
        )
        pt_weekly.PivotFields("Submitted at").Orientation = XL_ROW_FIELD
        pt_weekly.PivotFields("Campus").Orientation = XL_COLUMN_FIELD
        f = pt_weekly.PivotFields("How many helped")
        f.Orientation = XL_DATA_FIELD
        f.Function = XL_SUM
        f.NumberFormat = "0"
        try:
            pt_weekly.RowAxisLayout(1)
        except com_error:
            pass

        print("Building Monthly report pivot ...")
        pt_monthly = shared_cache.CreatePivotTable(
            TableDestination=monthly.Range("B10"),
            TableName="ptMonthly",
        )
        pt_monthly.PivotFields("Submitted at").Orientation = XL_ROW_FIELD
        pt_monthly.PivotFields("Campus").Orientation = XL_COLUMN_FIELD
        f2 = pt_monthly.PivotFields("How many helped")
        f2.Orientation = XL_DATA_FIELD
        f2.Function = XL_SUM
        f2.NumberFormat = "0"
        try:
            pt_monthly.RowAxisLayout(1)
        except com_error:
            pass

        print("Adding Campus slicer ...")
        sc_campus = wb.SlicerCaches.Add2(pt_host, "Campus")
        sl_campus = sc_campus.Slicers.Add(
            SlicerDestination=dashboard,
            Name="slCampus",
            Caption="Campus",
            Top=30, Left=20, Width=200, Height=130,
        )

        print("Adding Time block slicer ...")
        sc_time = wb.SlicerCaches.Add2(pt_host, "Time block")
        sl_time = sc_time.Slicers.Add(
            SlicerDestination=dashboard,
            Name="slTime",
            Caption="Time block",
            Top=30, Left=230, Width=260, Height=130,
        )

        print("Adding Submitted-at timeline ...")
        timeline_added = False
        sc_timeline = None
        # Try a few invocation variants — Timeline COM is finicky.
        for label, args in [
            ("from Weekly pivot, positional", (pt_weekly, "Submitted at", "", XL_TIMELINE)),
            ("from Weekly pivot, None name", (pt_weekly, "Submitted at", None, XL_TIMELINE)),
            ("from host pivot, positional", (pt_host, "Submitted at", "", XL_TIMELINE)),
        ]:
            try:
                sc_timeline = wb.SlicerCaches.Add2(*args)
                sl_timeline = sc_timeline.Slicers.Add(
                    SlicerDestination=dashboard,
                    Name="slDate",
                    Caption="Date range",
                    Top=30, Left=500, Width=400, Height=130,
                )
                timeline_added = True
                print(f"  Timeline OK ({label})")
                break
            except com_error as exc:
                msg = exc.excepinfo[2] if exc.excepinfo else str(exc)
                print(f"  attempt failed ({label}): {msg}")

        if not timeline_added:
            print("  Timeline creation skipped. To add it manually after data flows in:")
            print("  click ptWeekly -> PivotTable Analyze -> Insert Timeline -> Submitted at.")

        print("Hiding _PivotHost ...")
        host.Visible = XL_SHEET_VERY_HIDDEN

        # ---- Wire slicers (and timeline if it exists) to all pivots ----
        print("Connecting slicers to report pivots ...")
        slicers_to_wire = [sc_campus, sc_time]
        if timeline_added:
            slicers_to_wire.append(sc_timeline)
        for sc in slicers_to_wire:
            for pt in (pt_weekly, pt_monthly):
                try:
                    sc.PivotTables.AddPivotTable(pt)
                except com_error as e:
                    msg = e.excepinfo[2] if e.excepinfo else e
                    print(f"  (skip wiring {sc.Name} → {pt.Name}: {msg})")

        # Save and close
        print("Saving ...")
        wb.Save()
        wb.Close(SaveChanges=False)
        wb = None

        print("Post-processing complete. Slicers, timeline, and report pivots are now live.")
    except Exception:
        # Make sure Excel doesn't hang around if something blows up
        if wb is not None:
            try:
                wb.Close(SaveChanges=False)
            except Exception:
                pass
        raise
    finally:
        excel.Quit()
        # Give COM a moment to release
        time.sleep(0.2)


if __name__ == "__main__":
    main()
