# Excel Dashboard Build Guide — Option A+

The dashboard ships pre-built. Open the template, do **two** things, and you have a live dashboard. Optionally add slicers later for interactive filtering.

---

## What's in the template

[`templates/student-engagement-dashboard-starter.xlsx`](../templates/student-engagement-dashboard-starter.xlsx)

| Sheet | What's in it |
|---|---|
| `How to use` | One-page reference for Shannon — opens by default |
| `Dashboard` | KPIs, heatmap, top-categories chart, outreach-themes chart, outreach-by-campus chart — all pre-formulated |
| `Visitor` | Empty data table (`tblVisitor`) with all 32 column headers |
| `Outreach` | Empty data table (`tblOutreach`) with 10 column headers |
| `Reports — Weekly` | Placeholder; build a pivot here grouped by week |
| `Reports — Monthly` | Placeholder; build a pivot here grouped by month |
| `_Helpers` | Hidden — drives the charts. Don't delete. |

The KPI tiles, heatmap, and three charts are formula-driven (no pivot tables required). They show 0/blank until you connect data; once data flows in, everything refreshes automatically.

---

## Step 1 — Save the template into OneDrive (~2 min)

1. Download the template from the repo.
2. Save it to `OneDrive/Student Engagement/Dashboards/Student Engagement - Dashboard.xlsx`.
3. Open it. You should land on the "How to use" sheet.

## Step 2 — Connect Power Query to the Forms responses (~10 min)

For each form (Visitor, then Outreach), open the form in `forms.office.com` → **Responses** tab → **Open in Excel**. Microsoft creates an auto-syncing workbook in your OneDrive. Move both into `OneDrive/Student Engagement/Live Data/` and rename:
- `Visitor Responses.xlsx`
- `Outreach Responses.xlsx`

Now in the dashboard workbook:

1. **Data** → **Get Data** → **From File** → **From Workbook**.
2. Browse to `Visitor Responses.xlsx`. Pick **Sheet1** → **Transform Data**.
3. In Power Query:
   - Select all 24 category columns → **Transform** → **Replace Values** → replace `null` with `0`.
   - **Home** → **Close & Load To...** → **Table** → **Existing worksheet** → cell `A1` of the **Visitor** sheet → click OK.
   - Excel will warn that `tblVisitor` already exists — that's fine; click "Replace" / "Yes."

4. Repeat for `Outreach Responses.xlsx` → load into the **Outreach** sheet (replace `tblOutreach`).

5. **Data** → **Queries & Connections** → right-click each query → **Properties** → tick:
   - ✅ **Refresh data when opening the file**
   - ✅ **Refresh every 5 minutes**

Save. Switch to the **Dashboard** sheet. The KPIs and heatmap should now show real numbers within ~30 seconds. The charts populate too.

**That's it for the basic dashboard.** Anything below is optional polish.

---

## Step 3 — Optional: add interactive slicers + timeline (~10 min)

Slicers and timelines require at least one PivotTable. Easiest path:

1. Click the **Visitor** sheet. **Insert** → **PivotTable** → table = `tblVisitor` → New Worksheet.
2. Drag any field into the pivot (you can hide this pivot later — its only job is to host the slicers).
3. With the pivot selected: **PivotTable Analyze** → **Insert Slicer** → tick `Campus` and `Time block` → OK.
4. **PivotTable Analyze** → **Insert Timeline** → tick `Submitted at` → OK.
5. Move the slicers and timeline to the top of the Dashboard sheet.
6. **Right-click each slicer** → **Report Connections** → tick every relevant pivot. (You'll add more pivots in Step 4 — come back here to wire them up.)

The slicers don't filter the existing formula-based KPIs/charts directly — that's a known limitation of the formula-driven approach. To get full slicer-driven filtering, you need to also rebuild the dashboard's chart elements as PivotCharts (Step 4).

> **Practical truth:** the formula-driven dashboard the template gives you is "always shows everything." It's still very useful — Shannon sees the lifetime totals, the heatmap is intuitive, and the charts work. Slicer-driven interactivity is a 30-min upgrade you can do later if she asks for it.

---

## Step 4 — Optional: replace charts with PivotCharts for slicer interactivity (~30 min)

Only do this if Step 3 isn't enough.

For each existing chart on the Dashboard sheet (Top categories, Outreach themes, Outreach by campus):
1. **Insert** → **PivotChart** → source = `tblVisitor` (or `tblOutreach` for the outreach charts).
2. Configure rows/values per the table below.
3. Right-click the chart → **Move Chart** → To: Dashboard.
4. Delete the old static chart that was there.
5. **PivotChart Analyze** → **Filter Connections** → tick the slicers and timeline from Step 3.

| Chart | Source | Rows | Values |
|---|---|---|---|
| Top categories (h-bar) | `tblVisitor` after **Unpivot** of 24 category columns in Power Query (creates `Category | Count` pairs) | Category | Sum of Count |
| Daily trend (line) | `tblVisitor` | Submitted at (group by Days) | Sum of How many helped |
| Section mix (stacked bar) | `tblVisitor` (with a Section bucket lookup column added in Power Query) | Campus → Section bucket | Sum of inquiries |
| Outreach themes (h-bar) | `tblOutreach` | Outreach Activity | Sum of How many helped |
| Outreach by campus (col) | `tblOutreach` | Campus | Sum of How many helped |

The unpivot-categories step (top-categories chart) is the only finicky one. In Power Query, after loading the visitor data, select all 24 category columns → **Transform** → **Unpivot Columns** → load into a new query named `Visitor unpivoted`. Pivots on this query against `Category` give you sortable, filterable category totals.

---

## Step 5 — Optional: build the Weekly / Monthly Reports sheets

Both Reports sheets are placeholders. To build them:

1. Click into `Reports — Weekly`. **Insert** → **PivotTable** → table = `tblVisitor`.
2. Pivot config:
   - **Rows**: `Submitted at` (right-click → **Group** → tick **Days** with `Number of days: 7`, **Months**, **Years**), then `Campus`.
   - **Values**: Sum of `How many helped`.
3. Format for print: **Page Layout** → **Orientation: Landscape**, **Page Setup** → **Print Area** = the pivot range.
4. Same for `Reports — Monthly`, but in **Group**, tick **Months** + **Years** only.

Shannon clicks **File → Export → PDF** for a printable snapshot.

---

## Regenerating the template

If the schema changes (new categories, renamed columns, etc.), re-run:

```bash
python scripts/build-template.py
```

This rewrites `templates/student-engagement-dashboard-starter.xlsx` from scratch. Requires Python 3 and openpyxl (`pip install openpyxl`).

---

## Power Automate "real" live feed (optional, later)

The Forms→Excel auto-sync from Step 2 is good (~30s latency). If you later want ~5s latency with optional row enrichment, see [`power-automate-flow-spec.md`](power-automate-flow-spec.md). The dashboard doesn't need any changes — the flow writes into a different file you point Power Query at.
