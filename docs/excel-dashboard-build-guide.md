# Excel Dashboard Build Guide — Option A+

This guide turns the two Microsoft Forms into a live, filterable, Shannon-friendly dashboard in **one Excel workbook on OneDrive**, with no Power BI license required. Allow ~60 minutes the first time you build it.

**Quick-start:** the column headers for the two data tables are in [`templates/tblVisitor-headers.csv`](../templates/tblVisitor-headers.csv) and [`templates/tblOutreach-headers.csv`](../templates/tblOutreach-headers.csv) — you can copy-paste row 1 from those CSVs into a fresh workbook to skip the manual header-typing step.

## What you'll end up with

A single `.xlsx` file with these sheets:

| Sheet | Purpose |
|---|---|
| `Visitor` | Live data sheet — Power Query refreshes from the Forms response file |
| `Outreach` | Live data sheet — same, for outreach (one row per submission, since each submission is a single activity) |
| `Dashboard` | KPI tiles, heatmap, charts, slicers, timeline — Shannon's main view |
| `Reports — Weekly` | Same data, grouped by ISO week |
| `Reports — Monthly` | Same data, grouped by month |
| `How to use` | One-pager for Shannon |

---

## Step 1 — Set up the data sources

### 1.1 Connect the Forms responses to OneDrive

For **each form** (Visitor + Outreach):

1. Open the form in `forms.office.com` → click **Responses** tab.
2. Click **Open in Excel** (or "Open results in Excel" — the wording varies).
3. Microsoft creates a workbook in your OneDrive that **auto-syncs from Forms**. Rename it for clarity:
   - `Student Engagement - Visitor Tracking (responses).xlsx`
   - `Student Engagement - Outreach Tracking (responses).xlsx`
4. Move both files into a single OneDrive folder, e.g., `OneDrive/Student Engagement/Live Data/`. **Note the folder path** — you'll need it.

> These two workbooks are the live feed. Don't edit them by hand. New responses appear here within ~30 seconds of submission.

### 1.2 Create the dashboard workbook

1. In the same `Student Engagement/` folder, create a new Excel workbook: `Student Engagement - Dashboard.xlsx`. (Or open the starter template.)
2. Open it. This is where everything else happens.

---

## Step 2 — Pull data into the dashboard via Power Query

### 2.1 Connect to Visitor responses

1. **Data** tab → **Get Data** → **From File** → **From Workbook**.
2. Browse to the Visitor responses workbook. Select it.
3. Power Query Navigator opens. Pick **Sheet1** (or whichever sheet has the Forms response table) → **Transform Data**.
4. In the Power Query editor:
   - Right-click the column "Start time" → **Change Type** → **Date/Time**.
   - Right-click "Completion time" → same.
   - Select all 24 category columns → **Transform** → **Replace Values** → replace `null` with `0` (this lets SUM treat blanks as zero without you needing IFERROR).
   - **Home** → **Close & Load To...** → **Table** → **Existing worksheet** → cell `A1` of the `Visitor` sheet.

### 2.2 Connect to Outreach responses

Same as 2.1, but loaded into the `Outreach` sheet. No splitting step needed — outreach is single-select, so each submission is already one row with one activity.

### 2.3 Set refresh to "on open" + every 5 minutes

1. **Data** → **Queries & Connections** → right-click each query → **Properties**.
2. Tick **Refresh data when opening the file** AND **Refresh every 5 minutes**.
3. Save.

The dashboard now refreshes automatically every 5 minutes while open, and grabs the latest data when Shannon opens it.

---

## Step 3 — Build the Dashboard sheet

Layout target:

```
┌─────────────────────────────────────────────────────┐
│ [Date timeline slicer]                              │
│ [Campus slicer] [Time block slicer]                 │
├─────────────────────────────────────────────────────┤
│ KPI tile  KPI tile  KPI tile  KPI tile  KPI tile    │
├─────────────────────────────────────────────────────┤
│ Heatmap (Campus × Time block)  │ Top categories (h-bar) │
├─────────────────────────────────────────────────────┤
│ Daily trend (line)             │ Section mix (stacked) │
├─────────────────────────────────────────────────────┤
│ Outreach themes (h-bar)        │ Outreach by campus    │
├─────────────────────────────────────────────────────┤
│ Recent outreach (table)                             │
└─────────────────────────────────────────────────────┘
```

### 3.1 Build the supporting pivot tables (hidden later)

Add a hidden `_Pivots` sheet with these PivotTables, all sourced from the `Visitor` or `Outreach` table:

| Pivot name | Source | Rows | Columns | Values |
|---|---|---|---|---|
| `pvHeatmap` | Visitor | Campus | Time block | Sum of `How many helped` |
| `pvTopCats` | Visitor | (one per category — see note) | — | Sum |
| `pvDaily` | Visitor | Submitted at (grouped by Days) | — | Sum of `How many helped` |
| `pvSections` | Visitor | Campus | Section bucket *(see 3.4)* | Sum of inquiries |
| `pvOutreachThemes` | Outreach | Outreach Activity | — | Sum of `How many helped` |
| `pvOutreachCampus` | Outreach | Campus | — | Sum of `How many helped` |

> **Top categories pivot:** since each category is a separate column on the Visitor sheet, the cleanest way is to first **unpivot** the 24 category columns in Power Query (Select all 24 → **Unpivot Columns**), creating a `Category | Count` pair per row. Then pivot on `Category` → Sum of `Count`. This is a one-time setup and makes Top Categories trivial to maintain when categories change.

### 3.2 KPI tiles (top row)

Use `=GETPIVOTDATA(...)` or simple SUMIFS for each tile. Example for "People helped":

```
=SUM(Visitor[How many helped])
```

For "Top campus by headcount":

```
=INDEX(pvHeatmap[Campus], MATCH(MAX(pvHeatmap[Total]), pvHeatmap[Total], 0))
```

Style each tile: a 3-row block — large bold number on top, small subtitle, ALL-CAPS label. Border-top in the Conestoga teal (`#036C70`).

Build 5 tiles:
- `=SUM(Visitor[How many helped])` → "People helped (visitor)"
- `=SUM(unpivoted Count column)` → "Inquiries logged"
- Top campus formula above → "Top campus"
- `=COUNTA(UNIQUE(Visitor[Email]))` → "Active volunteers"
- `=SUM(Outreach[How many helped])` → "People helped (outreach)"

### 3.3 Heatmap (Campus × Time block)

1. Create a 4×3 table referencing `pvHeatmap`. Row labels: `Waterloo, Doon, Reuter, Cambridge`. Column labels: `Morning, Afternoon, Evening`.
2. Cells: `=GETPIVOTDATA("How many helped", pvHeatmap!$A$1, "Campus", "Doon", "Time block", "Morning")` and so on.
3. **Home** → **Conditional Formatting** → **Color Scales** → **More Rules** → **3-Color Scale**: low = `#FFFFFF`, mid = `#95D6CD`, high = `#036C70`. Add to the 4×3 cell range.

### 3.4 Top categories (horizontal bar chart)

1. Click in the unpivoted-categories pivot.
2. **Insert** → **PivotChart** → **Bar** → **Clustered Bar**.
3. Sort the pivot rows by `Count` descending. Filter to top 10.
4. Format: remove gridlines, hide chart title (will use a sheet-level header), bar color = `#036C70`.

### 3.5 Daily trend (line chart)

1. Click in `pvDaily`. Right-click the date column header → **Group** → tick **Days** only, untick others (gives one row per day).
2. Insert PivotChart → Line.
3. Format: line color `#036C70`, marker on, no gridlines on x-axis, soft grey gridlines on y-axis.

### 3.6 Section mix (stacked bar by campus)

You'll need a section-bucket column on the Visitor table. Two approaches — pick one:

**Option A (simpler): add a calculated column in Power Query** — when you unpivot categories, add a custom column that maps each category key to its section name with a switch statement:

```
= if [Category] = "Wayfinding – General" then "Common Help"
  else if [Category] = "OneCard" then "Common Help"
  else if [Category] = "IT Support" then "Common Help"
  ...
  else "Other"
```

Then pvot Campus × Section → Sum.

**Option B (no Power Query): build a lookup table on a hidden sheet** mapping each of the 24 category column names to a section bucket, and use `XLOOKUP` from a helper column.

Either way: insert PivotChart → **Bar** → **Stacked Bar** off this pivot. Use the teal palette for series colors (`#036C70`, `#2A9D97`, `#5CBAB1`, `#8FD2C8`, `#BEE5DB`, `#E0F2EC`, `#077A7E`).

### 3.7 Outreach charts

Same pattern:
- `pvOutreachThemes` → horizontal bar chart, sorted desc, top 10.
- `pvOutreachCampus` → vertical bar chart.

### 3.8 Recent outreach table

Below the charts, a small table:
- Use a query (`Outreach`) sorted by `Date of activity` descending, top 6 rows.
- Columns: Date, Campus, Outreach Activity, How many helped, Notes.
- Format with light grey alternating rows and a teal left border accent.

---

## Step 4 — Add slicers and timeline

These are what make the dashboard *interactive*.

1. Click any pivot table → **PivotTable Analyze** → **Insert Slicer**.
2. Tick: `Campus`, `Time block`. Click OK.
3. Click any pivot referencing dates → **PivotTable Analyze** → **Insert Timeline**. Tick `Submitted at`. Click OK.
4. **Connect each slicer to all relevant pivots:**
   - Click the slicer → **Slicer** ribbon → **Report Connections** → tick every pivot the slicer should filter.
   - Same for the timeline.
5. Position slicers in a row above the KPI tiles. Style: clean, tile-style buttons.

Now changing the timeline dates or clicking a campus filters every chart and KPI on the dashboard at once.

---

## Step 5 — Reports sheets (weekly / monthly)

These are simplified versions of the dashboard sheet, pre-grouped by week or month for printing/PDF export.

### 5.1 Weekly report

1. Duplicate the Dashboard sheet → rename to `Reports — Weekly`.
2. On every PivotTable on this sheet: right-click the date field → **Group** → select **Days** with **Number of days: 7** AND **Months** AND **Years**.
3. Set the date axis to `Years > Months > 7-day groups`.
4. Set printable layout: Page Layout → Orientation Landscape → Print Area = the dashboard zone.

### 5.2 Monthly report

Same as 5.1, but in **Group**, select **Months** + **Years** only.

### 5.3 Custom date range report

The Dashboard sheet itself, with the timeline slicer set to a custom range. Shannon clicks dates → File → Export → PDF. One click to share.

---

## Step 6 — Polish for Shannon

1. **Hide** the `_Pivots` sheet (right-click tab → Hide). She doesn't need to see it.
2. On the **Dashboard** sheet:
   - Hide gridlines (View → uncheck Gridlines).
   - Hide row/column headers (View → uncheck Headings).
   - Set zoom to 80% so the whole layout fits.
3. **Protect** the dashboard sheet (Review → Protect Sheet) — leave slicers/timeline interactive but block accidental edits to formulas. No password needed for a low-stakes case.
4. Add a `How to use` sheet:
   - "Click the timeline to set your date range."
   - "Click campus chips to filter by campus."
   - "Press F5 to manually refresh; data otherwise refreshes every 5 minutes."
   - "Right-click the dashboard → Save as PDF for a printable snapshot."
5. **Save** the workbook. Pin it in OneDrive for easy access.

---

## Optional — Step 7: Power Automate live feed (replaces Step 1.1's auto-sync)

The Forms→Excel built-in sync from Step 1 is good but Microsoft sometimes throttles it (latency 30s–2min). For true ~5-second latency and the option to enrich rows, use Power Automate. See [`power-automate-flow-spec.md`](power-automate-flow-spec.md). You can switch to this later — the dashboard doesn't change, just the data source it points to.

---

## Maintenance

- **Adding a new category to Forms** → after the next response comes in, the new category appears as a new column in the Visitor responses workbook. The Power Query refresh picks it up automatically. The unpivoted-categories query also adapts (no manual change needed). The Dashboard's `pvTopCats` will start showing the new category at its rank.
- **Adding a new campus** → update the `CAMPUSES` list in the slicer's hidden source list, refresh, done.
- **Categories getting renamed in Forms** → Power Query will throw an error on next refresh because it expects the old column name. Open the affected query → **Edit** → in the steps panel, find `Renamed Columns` → update the mapping → close. ~30 seconds.
