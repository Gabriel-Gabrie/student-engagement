#!/usr/bin/env python3
"""
Build the starter Excel dashboard template for Option A+.

Usage (from repo root):
    python scripts/build-template.py

Output:
    templates/student-engagement-dashboard-starter.xlsx
"""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.formatting.rule import ColorScaleRule
from openpyxl.styles import (
    Alignment,
    Border,
    Font,
    PatternFill,
    Side,
)
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.table import Table, TableStyleInfo

# ---------- Style palette ----------
TEAL = "036C70"
TEAL_DARK = "024C4F"
TEAL_MID = "5CBAB1"
TEAL_LIGHT = "D6F0EB"
GREY_BG = "F7FAFA"
GREY_BORDER = "D1D1D1"
GREY_TEXT = "707070"
TEXT = "242424"
WHITE = "FFFFFF"

# ---------- Domain constants ----------
CAMPUSES = ["Waterloo", "Doon", "Reuter", "Cambridge"]
TIME_BLOCKS = [
    "Morning (open – 12pm)",
    "Afternoon (12 – 4pm)",
    "Evening (4pm – close)",
]

CATEGORIES = [
    # Section 1 — Common Help
    "Wayfinding – General",
    "OneCard",
    "IT Support",
    "Bus Pass / Transportation",
    "Parking",
    "Timetable / Registration Concern",
    # Section 2 — Academic & Registration
    "Student Fees / Student Financial Services",
    "Learning Services / Math Help / Tutors",
    "Want to Change Program",
    "Connect with Faculty / Program Coordinator / Chair",
    # Section 3 — Health & Wellness
    "Health Insurance",
    "Mental Health Support / Counselling",
    "Medical Clinic / Medical Care",
    # Section 4 — Housing & Career
    "Housing / Accommodation",
    "Job Search / Career Services",
    # Section 5 — International
    "Immigration / International Student Advising Referral",
    "International Transition Services",
    "International Admissions – Second Program",
    # Section 6 — Library
    "Library – Tech Loans / TeachMeTech",
    "Library – Research / Writing Consultants",
    "Library – Academic Integrity",
    # Section 7 — CSI & Other
    "CSI – Frosh Kits",
    "CSI – Peer Advocates",
    "Others",
]

VISITOR_COLS = [
    "Submission ID",
    "Submitted at",
    "Name",
    "Email",
    "Campus",
    "Time block",
    "How many helped",
    *CATEGORIES,
    "Others (Inquiry)",
]

OUTREACH_COLS = [
    "Submission ID",
    "Submitted at",
    "Name",
    "Email",
    "Campus",
    "Date of activity",
    "How many helped",
    "Outreach Activity",
    "Other activity (text)",
    "Notes",
]

OUTREACH_THEMES = [
    "Bell Let's Talk",
    "Black History Month",
    "Campus Welcome Day",
    "CCR and SSP Promotion",
    "Celebrating Diversity",
    "Health and Wellness Outreach",
    "International Women's Day",
    "Pride Month",
    "Sexual Health Week",
    "Other",
]


# ---------- Style helpers ----------
def fill(color: str) -> PatternFill:
    return PatternFill("solid", fgColor=color)


def border(color: str = GREY_BORDER) -> Border:
    s = Side(border_style="thin", color=color)
    return Border(left=s, right=s, top=s, bottom=s)


HEADER_FONT = Font(name="Calibri", size=11, bold=True, color=WHITE)
HEADER_FILL = fill(TEAL)
TITLE_FONT = Font(name="Calibri", size=20, bold=True, color=TEAL_DARK)
SECTION_FONT = Font(name="Calibri", size=12, bold=True, color=WHITE)
KPI_VALUE_FONT = Font(name="Calibri", size=22, bold=True, color=TEAL_DARK)
KPI_LABEL_FONT = Font(
    name="Calibri", size=9, bold=True, color=GREY_TEXT
)
HELP_TEXT_FONT = Font(name="Calibri", size=10, color=GREY_TEXT, italic=True)
BODY_FONT = Font(name="Calibri", size=11, color=TEXT)


# ---------- Sheet builders ----------
def build_data_sheet(ws, columns, table_name):
    """Create an Excel structured table with the given columns."""
    for idx, col_name in enumerate(columns, start=1):
        cell = ws.cell(row=1, column=idx, value=col_name)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="left", vertical="center")
        cell.border = border()

    # Add an empty data row so Excel recognizes this as a table with rows
    for idx in range(1, len(columns) + 1):
        ws.cell(row=2, column=idx, value=None)

    last_col_letter = get_column_letter(len(columns))
    table_range = f"A1:{last_col_letter}2"

    table = Table(displayName=table_name, ref=table_range)
    table.tableStyleInfo = TableStyleInfo(
        name="TableStyleMedium2",
        showFirstColumn=False,
        showLastColumn=False,
        showRowStripes=True,
        showColumnStripes=False,
    )
    ws.add_table(table)

    # Column widths
    for idx, col_name in enumerate(columns, start=1):
        # Reasonable widths based on header length
        width = max(14, min(50, len(col_name) + 4))
        ws.column_dimensions[get_column_letter(idx)].width = width

    ws.row_dimensions[1].height = 28
    ws.freeze_panes = "A2"
    return ws


def add_section_header(ws, row, text, span=8):
    """Insert a teal section divider that spans the dashboard width."""
    cell = ws.cell(row=row, column=1, value=text)
    cell.font = SECTION_FONT
    cell.fill = HEADER_FILL
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    ws.merge_cells(
        start_row=row, start_column=1, end_row=row, end_column=span
    )
    ws.row_dimensions[row].height = 22


def kpi_tile(ws, row, col, label, formula, sub_formula=None):
    """Build a styled 3-row KPI tile starting at (row, col), 3 columns wide."""
    title_cell = ws.cell(row=row, column=col, value=label)
    title_cell.font = KPI_LABEL_FONT
    title_cell.alignment = Alignment(
        horizontal="left", vertical="center", indent=1
    )
    title_cell.fill = fill(GREY_BG)
    title_cell.border = Border(top=Side(border_style="medium", color=TEAL))
    ws.merge_cells(
        start_row=row, start_column=col, end_row=row, end_column=col + 2
    )

    value_cell = ws.cell(row=row + 1, column=col, value=formula)
    value_cell.font = KPI_VALUE_FONT
    value_cell.alignment = Alignment(
        horizontal="left", vertical="center", indent=1
    )
    value_cell.fill = fill(GREY_BG)
    ws.merge_cells(
        start_row=row + 1, start_column=col, end_row=row + 1, end_column=col + 2
    )

    sub_cell = ws.cell(row=row + 2, column=col, value=sub_formula or "")
    sub_cell.font = HELP_TEXT_FONT
    sub_cell.alignment = Alignment(
        horizontal="left", vertical="top", indent=1
    )
    sub_cell.fill = fill(GREY_BG)
    ws.merge_cells(
        start_row=row + 2, start_column=col, end_row=row + 2, end_column=col + 2
    )

    ws.row_dimensions[row].height = 16
    ws.row_dimensions[row + 1].height = 30
    ws.row_dimensions[row + 2].height = 16


def build_dashboard_sheet(ws):
    # Hide gridlines
    ws.sheet_view.showGridLines = False

    # Column widths — 8 columns wide layout
    for c in range(1, 13):
        ws.column_dimensions[get_column_letter(c)].width = 16

    # Title row
    ws["A1"] = "Student Engagement Dashboard"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:H1")
    ws.row_dimensions[1].height = 32

    ws["A2"] = (
        "Sums every submission in tblVisitor / tblOutreach. "
        "Add a date timeline + slicers later for interactive filtering."
    )
    ws["A2"].font = HELP_TEXT_FONT
    ws.merge_cells("A2:H2")
    ws.row_dimensions[2].height = 18

    # ----- KPI tiles (rows 4-6) -----
    add_section_header(ws, 3, "  KEY METRICS")

    kpi_tile(
        ws, 4, 1,
        "PEOPLE HELPED (VISITOR)",
        "=IFERROR(SUM(tblVisitor[How many helped]),0)",
        "=IF(ROWS(tblVisitor[Submission ID])=0,\"No data yet\",ROWS(tblVisitor[Submission ID])&\" submissions\")",
    )
    kpi_tile(
        ws, 4, 4,
        "INQUIRIES LOGGED",
        "=" + "+".join(
            f"IFERROR(SUM(tblVisitor[{c}]),0)" for c in CATEGORIES
        ),
        "Sum across all 24 categories",
    )
    kpi_tile(
        ws, 4, 7,
        "TOP CAMPUS BY HEADCOUNT",
        (
            "=IFERROR(INDEX(_Helpers!A4:A7,"
            "MATCH(MAX(_Helpers!B4:B7),_Helpers!B4:B7,0))"
            ",\"—\")"
        ),
        "=IFERROR(MAX(_Helpers!B4:B7)&\" people helped\",\"No data\")",
    )
    kpi_tile(
        ws, 4, 10,
        "PEOPLE HELPED (OUTREACH)",
        "=IFERROR(SUM(tblOutreach[How many helped]),0)",
        "=IFERROR(ROWS(tblOutreach[Submission ID])&\" outreach entries\",\"\")",
    )

    # ----- Heatmap section (rows 8-13) -----
    add_section_header(ws, 7, "  ENGAGEMENT HEATMAP — CAMPUS × TIME BLOCK")

    # Column headers (time blocks)
    ws.cell(row=8, column=1, value="Campus").font = HEADER_FONT
    ws.cell(row=8, column=1).fill = HEADER_FILL
    ws.cell(row=8, column=1).alignment = Alignment(
        horizontal="center", vertical="center"
    )
    for i, tb in enumerate(["Morning", "Afternoon", "Evening"]):
        c = ws.cell(row=8, column=2 + i, value=tb)
        c.font = HEADER_FONT
        c.fill = HEADER_FILL
        c.alignment = Alignment(horizontal="center", vertical="center")

    # Row headers (campuses) and SUMIFS cells
    for r, campus in enumerate(CAMPUSES):
        rrow = 9 + r
        c = ws.cell(row=rrow, column=1, value=campus)
        c.font = Font(name="Calibri", size=11, bold=True, color=TEXT)
        c.alignment = Alignment(horizontal="left", vertical="center", indent=1)
        c.fill = fill(GREY_BG)

        for ti, tb_label in enumerate(TIME_BLOCKS):
            cell = ws.cell(row=rrow, column=2 + ti)
            cell.value = (
                f"=IFERROR(SUMIFS(tblVisitor[How many helped],"
                f"tblVisitor[Campus],\"{campus}\","
                f"tblVisitor[Time block],\"{tb_label}\"),0)"
            )
            cell.alignment = Alignment(
                horizontal="center", vertical="center"
            )
            cell.font = Font(name="Calibri", size=12, bold=True, color=TEXT)
            cell.border = border()
        ws.row_dimensions[rrow].height = 28

    # Conditional formatting on the heatmap data cells
    rule = ColorScaleRule(
        start_type="num", start_value=0, start_color=WHITE,
        mid_type="percentile", mid_value=50, mid_color=TEAL_MID,
        end_type="max", end_color=TEAL,
    )
    ws.conditional_formatting.add("B9:D12", rule)

    # ----- Top categories chart (rows 15-30, columns A-D) -----
    add_section_header(ws, 14, "  TOP INQUIRY CATEGORIES")
    ws.cell(row=15, column=1, value="Chart sourced from _Helpers!H column. Sort the helper rows by count desc to manually rank the bars.").font = HELP_TEXT_FONT
    ws.merge_cells("A15:H15")

    chart = BarChart()
    chart.type = "bar"  # horizontal
    chart.style = 2
    chart.title = None
    chart.y_axis.title = None
    chart.x_axis.title = None
    chart.legend = None
    chart.height = 12
    chart.width = 18

    cat_ref = Reference(
        ws.parent["_Helpers"], min_col=7, min_row=4, max_row=27
    )
    val_ref = Reference(
        ws.parent["_Helpers"], min_col=8, min_row=3, max_row=27
    )
    chart.add_data(val_ref, titles_from_data=True)
    chart.set_categories(cat_ref)
    ws.add_chart(chart, "A16")

    # ----- Outreach themes chart (rows 32-46) -----
    add_section_header(ws, 31, "  OUTREACH THEMES — PEOPLE HELPED")

    chart2 = BarChart()
    chart2.type = "bar"
    chart2.style = 2
    chart2.title = None
    chart2.legend = None
    chart2.height = 11
    chart2.width = 18

    theme_cat_ref = Reference(
        ws.parent["_Helpers"], min_col=10, min_row=4,
        max_row=3 + len(OUTREACH_THEMES),
    )
    theme_val_ref = Reference(
        ws.parent["_Helpers"], min_col=11, min_row=3,
        max_row=3 + len(OUTREACH_THEMES),
    )
    chart2.add_data(theme_val_ref, titles_from_data=True)
    chart2.set_categories(theme_cat_ref)
    ws.add_chart(chart2, "A32")

    # ----- Outreach by campus chart (rows 48-58) -----
    add_section_header(ws, 47, "  OUTREACH REACH BY CAMPUS")

    chart3 = BarChart()
    chart3.type = "col"
    chart3.style = 2
    chart3.title = None
    chart3.legend = None
    chart3.height = 8
    chart3.width = 18

    oc_cat_ref = Reference(
        ws.parent["_Helpers"], min_col=13, min_row=4, max_row=7
    )
    oc_val_ref = Reference(
        ws.parent["_Helpers"], min_col=14, min_row=3, max_row=7
    )
    chart3.add_data(oc_val_ref, titles_from_data=True)
    chart3.set_categories(oc_cat_ref)
    ws.add_chart(chart3, "A48")

    # ----- Footer note -----
    add_section_header(ws, 60, "  WHAT'S MISSING — ADD MANUALLY IN EXCEL")
    ws.cell(row=61, column=1, value="The starter pre-builds: data tables, KPI tiles, heatmap, and 3 charts.").font = BODY_FONT
    ws.cell(row=62, column=1, value=(
        "Add manually for full interactivity: 1) Power Query connection to your Forms response files "
        "(Data → Get Data → From File → From Workbook). 2) Slicers on Campus/Time block "
        "(Insert → Slicer, after creating any pivot table). 3) Date Timeline (Insert → Timeline). "
        "See excel-dashboard-build-guide.md for the rest."
    )).font = HELP_TEXT_FONT
    ws.cell(row=62, column=1).alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells("A62:H64")
    ws.row_dimensions[62].height = 60

    return ws


def build_helpers_sheet(ws):
    """Hidden helper sheet with computed values that drive the charts."""
    ws.sheet_state = "hidden"
    ws.sheet_view.showGridLines = False

    # ----- Section 1: Campus totals (drives "Top campus" KPI) -----
    ws["A1"] = "CAMPUS TOTALS"
    ws["A1"].font = Font(bold=True, color=TEAL_DARK)
    ws.merge_cells("A1:B1")
    ws["A3"] = "Campus"
    ws["B3"] = "People helped"
    ws["A3"].font = HEADER_FONT
    ws["B3"].font = HEADER_FONT
    ws["A3"].fill = HEADER_FILL
    ws["B3"].fill = HEADER_FILL

    for i, campus in enumerate(CAMPUSES):
        ws.cell(row=4 + i, column=1, value=campus)
        ws.cell(
            row=4 + i,
            column=2,
            value=(
                f"=IFERROR(SUMIFS(tblVisitor[How many helped],"
                f"tblVisitor[Campus],\"{campus}\"),0)"
            ),
        )

    # ----- Section 2: Daily totals placeholder (drives daily trend) -----
    ws["D1"] = "DAILY TOTALS (helper)"
    ws["D1"].font = Font(bold=True, color=TEAL_DARK)
    ws.merge_cells("D1:E1")
    ws["D3"] = "Date"
    ws["E3"] = "People helped"
    ws["D3"].font = HEADER_FONT
    ws["E3"].font = HEADER_FONT
    ws["D3"].fill = HEADER_FILL
    ws["E3"].fill = HEADER_FILL
    ws["D4"] = "(Build a PivotChart on tblVisitor for the daily trend — too dynamic for a static helper.)"
    ws["D4"].font = HELP_TEXT_FONT
    ws.merge_cells("D4:E10")

    # ----- Section 3: Category totals (drives Top Categories chart) -----
    ws["G1"] = "CATEGORY TOTALS"
    ws["G1"].font = Font(bold=True, color=TEAL_DARK)
    ws.merge_cells("G1:H1")
    ws["G3"] = "Category"
    ws["H3"] = "Total inquiries"
    ws["G3"].font = HEADER_FONT
    ws["H3"].font = HEADER_FONT
    ws["G3"].fill = HEADER_FILL
    ws["H3"].fill = HEADER_FILL

    for i, cat in enumerate(CATEGORIES):
        ws.cell(row=4 + i, column=7, value=cat)
        ws.cell(
            row=4 + i,
            column=8,
            value=f"=IFERROR(SUM(tblVisitor[{cat}]),0)",
        )

    # ----- Section 4: Outreach theme totals -----
    ws["J1"] = "OUTREACH THEME TOTALS"
    ws["J1"].font = Font(bold=True, color=TEAL_DARK)
    ws.merge_cells("J1:K1")
    ws["J3"] = "Theme"
    ws["K3"] = "People helped"
    ws["J3"].font = HEADER_FONT
    ws["K3"].font = HEADER_FONT
    ws["J3"].fill = HEADER_FILL
    ws["K3"].fill = HEADER_FILL

    for i, theme in enumerate(OUTREACH_THEMES):
        ws.cell(row=4 + i, column=10, value=theme)
        ws.cell(
            row=4 + i,
            column=11,
            value=(
                f"=IFERROR(SUMIFS(tblOutreach[How many helped],"
                f"tblOutreach[Outreach Activity],\"{theme}\"),0)"
            ),
        )

    # ----- Section 5: Outreach by campus -----
    ws["M1"] = "OUTREACH BY CAMPUS"
    ws["M1"].font = Font(bold=True, color=TEAL_DARK)
    ws.merge_cells("M1:N1")
    ws["M3"] = "Campus"
    ws["N3"] = "People helped"
    ws["M3"].font = HEADER_FONT
    ws["N3"].font = HEADER_FONT
    ws["M3"].fill = HEADER_FILL
    ws["N3"].fill = HEADER_FILL

    for i, campus in enumerate(CAMPUSES):
        ws.cell(row=4 + i, column=13, value=campus)
        ws.cell(
            row=4 + i,
            column=14,
            value=(
                f"=IFERROR(SUMIFS(tblOutreach[How many helped],"
                f"tblOutreach[Campus],\"{campus}\"),0)"
            ),
        )

    # Column widths
    for c in [1, 4, 7, 10, 13]:
        ws.column_dimensions[get_column_letter(c)].width = 36
    for c in [2, 5, 8, 11, 14]:
        ws.column_dimensions[get_column_letter(c)].width = 16

    return ws


def build_how_to_use_sheet(ws):
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 100

    rows = [
        ("How to use this workbook", "title"),
        ("", "blank"),
        ("This is the Option A+ starter — it's pre-built with the data tables, KPI tiles, heatmap, and three charts. You need to do two things to make it live: connect Power Query to your Forms response files, and (optionally) add slicers / a timeline for interactive filtering.", "body"),
        ("", "blank"),
        ("Sheet by sheet", "h2"),
        ("• Dashboard — Shannon's main view. KPI tiles, Campus × Time block heatmap, top categories chart, outreach themes chart, outreach by campus chart. All sourced from formulas — no pivots needed.", "body"),
        ("• Visitor — empty data table with all 32 columns matching the Forms export. Power Query will load Forms responses here.", "body"),
        ("• Outreach — empty data table with 10 columns. Same as above, for outreach.", "body"),
        ("• _Helpers — hidden sheet with the small helper tables that drive the charts. Don't delete.", "body"),
        ("", "blank"),
        ("Step 1 — Connect Power Query (one-time, ~10 min)", "h2"),
        ("Open each form in forms.office.com → Responses → Open in Excel. Microsoft creates an auto-syncing workbook in your OneDrive. Save those files in OneDrive/Student Engagement/Live Data/.", "body"),
        ("Then in this workbook: Data → Get Data → From File → From Workbook → pick the Visitor responses file → Sheet1 → Transform Data. Replace nulls with 0 in the 24 category columns. Close & Load To... → Existing worksheet → cell A1 of the Visitor sheet.", "body"),
        ("Repeat for the Outreach responses file → load into the Outreach sheet.", "body"),
        ("Data → Queries & Connections → right-click each query → Properties → tick 'Refresh data when opening the file' AND 'Refresh every 5 minutes'.", "body"),
        ("That's it. The dashboard now updates within a minute of every new submission.", "body"),
        ("", "blank"),
        ("Step 2 — Optional polish", "h2"),
        ("Add slicers and a timeline for interactive filtering: Insert a PivotTable on tblVisitor (any pivot, even a hidden one), then Insert → Slicer (tick Campus, Time block) and Insert → Timeline (tick Submitted at). Connect the slicers to all charts via Slicer → Report Connections. The dashboard becomes click-to-filter.", "body"),
        ("Add a daily trend line chart: Insert PivotChart on tblVisitor → Date axis = Submitted at (grouped by days), value = Sum of How many helped. Drop the chart on the Dashboard sheet.", "body"),
        ("Add a section-mix stacked bar: same idea, with Campus on the row axis and a custom Section-bucket column on the column axis.", "body"),
        ("", "blank"),
        ("Daily refresh", "h2"),
        ("• Open the file. Data refreshes automatically within ~30 seconds.", "body"),
        ("• If you want to force a refresh: Data → Refresh All (or Ctrl+Alt+F5).", "body"),
        ("", "blank"),
        ("If something looks broken", "h2"),
        ("• KPI shows #REF! → the table reference is broken. Click the cell to see which table/column it's looking for. Most likely the table got renamed; restore tblVisitor / tblOutreach as the table names (Table Design tab).", "body"),
        ("• KPI shows 0 when you expect numbers → check Data → Queries & Connections; the Forms responses file may have moved. Edit the query → fix the source path.", "body"),
        ("• Heatmap is all empty → the Time block question wording must match TIME_BLOCKS exactly: 'Morning (open – 12pm)', 'Afternoon (12 – 4pm)', 'Evening (4pm – close)'. Em-dashes matter; check carefully.", "body"),
        ("", "blank"),
        ("Maintenance", "h2"),
        ("• Adding a category in Forms → after the next submission, the new column appears in the Forms export. Power Query refresh picks it up. To include it in the 'Inquiries logged' KPI, edit that formula on the Dashboard sheet.", "body"),
        ("• Renaming a Forms question → Power Query will throw on next refresh because it expects the old column name. Edit the query → 'Renamed Columns' step → update the mapping.", "body"),
        ("• Adding a new campus → update the helper table on _Helpers (rows 4-7) and the heatmap rows on the Dashboard.", "body"),
    ]

    style_map = {
        "title": Font(name="Calibri", size=20, bold=True, color=TEAL_DARK),
        "h2": Font(name="Calibri", size=13, bold=True, color=TEAL),
        "body": Font(name="Calibri", size=11, color=TEXT),
        "blank": None,
    }

    for i, (text, kind) in enumerate(rows):
        cell = ws.cell(row=i + 1, column=2, value=text)
        if style_map[kind]:
            cell.font = style_map[kind]
        cell.alignment = Alignment(wrap_text=True, vertical="top")
        if kind == "title":
            ws.row_dimensions[i + 1].height = 32
        elif kind == "h2":
            ws.row_dimensions[i + 1].height = 22
        elif kind == "body":
            ws.row_dimensions[i + 1].height = max(20, 16 + len(text) // 80 * 12)

    return ws


def build_reports_sheet(ws, title, group_hint):
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 100

    ws["B1"] = title
    ws["B1"].font = Font(name="Calibri", size=18, bold=True, color=TEAL_DARK)
    ws.row_dimensions[1].height = 30

    ws["B3"] = (
        "This sheet is a placeholder for the rolled-up report. "
        "To build it: Insert a PivotTable on tblVisitor → Rows: Submitted at "
        f"(right-click → Group → {group_hint}), Campus → Values: Sum of How many helped. "
        "Drop slicers for Campus and Time block. Print Layout → Landscape, Page Setup "
        "→ Print Area = the pivot range. Page → File → Export → PDF."
    )
    ws["B3"].font = HELP_TEXT_FONT
    ws["B3"].alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells("B3:H8")
    ws.row_dimensions[3].height = 90
    return ws


# ---------- Workbook assembly ----------
def main():
    wb = Workbook()
    wb.remove(wb.active)

    how_to_use = wb.create_sheet("How to use")
    dashboard = wb.create_sheet("Dashboard")
    visitor = wb.create_sheet("Visitor")
    outreach = wb.create_sheet("Outreach")
    weekly = wb.create_sheet("Reports — Weekly")
    monthly = wb.create_sheet("Reports — Monthly")
    helpers = wb.create_sheet("_Helpers")

    build_data_sheet(visitor, VISITOR_COLS, "tblVisitor")
    build_data_sheet(outreach, OUTREACH_COLS, "tblOutreach")
    build_helpers_sheet(helpers)
    build_dashboard_sheet(dashboard)
    build_how_to_use_sheet(how_to_use)
    build_reports_sheet(weekly, "Weekly Report", "Days × 7 + Months + Years")
    build_reports_sheet(monthly, "Monthly Report", "Months + Years")

    # Set the workbook to open on the How to use sheet
    wb.active = wb.sheetnames.index("How to use")

    # Output
    repo_root = Path(__file__).resolve().parent.parent
    out_path = repo_root / "templates" / "student-engagement-dashboard-starter.xlsx"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out_path)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
