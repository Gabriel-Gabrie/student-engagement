# Excel Dashboard Build Guide — Option A+

The dashboard ships pre-built. Open the template, do **two** things, and you have a live dashboard with slicers and report pivots ready to go.

---

## What's in the template

[`templates/student-engagement-dashboard-starter.xlsx`](../templates/student-engagement-dashboard-starter.xlsx)

| Sheet | What's in it |
|---|---|
| `How to use` | One-page reference for Shannon — opens by default |
| `Dashboard` | KPIs, heatmap, top-categories chart, outreach-themes chart, outreach-by-campus chart, **Campus + Time block slicers** |
| `Visitor` | Empty data table (`tblVisitor`) with all 32 column headers — 3 placeholder rows that Power Query overwrites on first load |
| `Outreach` | Empty data table (`tblOutreach`) with 10 column headers — same pattern |
| `Reports — Weekly` | **Pre-built PivotTable** (`ptWeekly`): Submitted at × Campus → Sum of helped |
| `Reports — Monthly` | **Pre-built PivotTable** (`ptMonthly`): same shape |
| `_Helpers` | Hidden — drives the formula charts |
| `_PivotHost` | Hidden — hosts the slicer-source pivot. Don't unhide unless you're debugging. |

**Already wired:** the Campus and Time block slicers on the Dashboard sheet filter all three pivots (`ptSlicerHost`, `ptWeekly`, `ptMonthly`) simultaneously. Click a chip and watch the Reports sheets update.

The KPI tiles, heatmap, and three formula-driven charts are intentionally *not* slicer-controlled — they always show lifetime totals. This is the "lifetime view + filterable reports" split.

---

## Step 1 — Save the template into OneDrive (~2 min)

1. Download the template from the repo.
2. Save to `OneDrive/Student Engagement/Dashboards/Student Engagement - Dashboard.xlsx`.
3. Open it. You'll land on the "How to use" sheet.

## Step 2 — Connect Power Query (~10 min)

For each form (Visitor, then Outreach), open the form in `forms.office.com` → **Responses** tab → **Open in Excel**. Microsoft creates an auto-syncing workbook in your OneDrive. Move both into `OneDrive/Student Engagement/Live Data/` and rename:
- `Visitor Responses.xlsx`
- `Outreach Responses.xlsx`

Now in the dashboard workbook:

1. **Data** → **Get Data** → **From File** → **From Workbook**.
2. Browse to `Visitor Responses.xlsx`. Pick **Sheet1** → **Transform Data**.
3. In Power Query:
   - Select all 24 category columns → **Transform** → **Replace Values** → replace `null` with `0`.
   - **Home** → **Close & Load To...** → **Table** → **Existing worksheet** → cell `A1` of the **Visitor** sheet → click OK.
   - Excel will warn that `tblVisitor` already exists — click **Replace** / **Yes**.

4. Repeat for `Outreach Responses.xlsx` → load into the **Outreach** sheet (replace `tblOutreach`).

5. **Data** → **Queries & Connections** → right-click each query → **Properties** → tick:
   - ✅ **Refresh data when opening the file**
   - ✅ **Refresh every 5 minutes**

6. **Data** → **Refresh All** to load the data right now.

Save. Switch to the Dashboard. KPIs and heatmap should populate within ~30 seconds. The Reports sheets show real pivots. The slicers filter everything.

**That's it for the working dashboard.** The optional steps below add nice-to-haves.

---

## Step 3 — Optional: add the Timeline (1 min)

The post-build script couldn't add the Timeline programmatically — Excel COM has a stubborn quirk with Timeline creation on near-empty pivots. Add it manually now that real data has loaded:

1. Click into any pivot on the **Reports — Weekly** sheet.
2. **PivotTable Analyze** → **Insert Timeline** → tick `Submitted at` → OK.
3. Drag the timeline to the top of the **Dashboard** sheet next to the existing slicers.
4. **Right-click the timeline** → **Report Connections** → tick `ptWeekly`, `ptMonthly`, `ptSlicerHost`.

Drag the date range slider — Reports sheets refilter live.

## Step 4 — Optional: replace static charts with PivotCharts (~30 min)

The 3 charts on the Dashboard (Top Categories, Outreach Themes, Outreach by Campus) are formula-driven so they always show lifetime totals. To make them slicer-responsive, replace them with PivotCharts:

For each existing chart:
1. Delete it (right-click → Cut).
2. **Insert** → **PivotChart** → source = `tblVisitor` (or `tblOutreach`).
3. Configure rows/values per the table below.
4. Right-click the new PivotChart → **Move Chart** → To: Dashboard.
5. **PivotChart Analyze** → **Filter Connections** → tick the slicers + timeline.

| Chart | Source | Rows | Values |
|---|---|---|---|
| Top categories | `tblVisitor` after Power Query **Unpivot** of the 24 category columns | Category | Sum of Count |
| Outreach themes | `tblOutreach` | Outreach Activity | Sum of How many helped |
| Outreach by campus | `tblOutreach` | Campus | Sum of How many helped |

The category unpivot trick: in the existing Visitor query, duplicate the query (Power Query → right-click → Reference), select all 24 category columns, **Transform → Unpivot Columns**. You now have a query with one row per category-per-submission, perfect for top-categories pivots.

## Step 5 — Optional: configure date grouping on the report pivots

The Reports sheets have raw pivots (no grouping). To group them:

**Reports — Weekly:**
1. Right-click any date row in `ptWeekly` → **Group**.
2. Tick **Days** with `Number of days: 7`, plus **Months** + **Years**.
3. Click OK. The pivot rolls up by week.

**Reports — Monthly:**
1. Same thing on `ptMonthly`.
2. In **Group**, tick **Months** + **Years** only.

Why this isn't pre-done: date grouping requires real date values in the cache. The placeholder rows are a single year, so grouping pre-load creates funny-looking groups. Do it once after Power Query has loaded real submissions.

For PDF exports: **Page Layout** → Orientation Landscape, **Page Setup** → **Print Area** = the pivot range, then **File** → **Export** → **PDF**.

---

## Maintenance

### Adding a new category in Forms
After the next submission, the new category appears as a new column in the Forms export. Power Query refresh picks it up. To include it in the "Inquiries logged" KPI tile, edit that formula on the Dashboard sheet.

### Renaming a Forms question
Power Query will throw on next refresh because it expects the old column name. Edit the query → "Renamed Columns" step → update the mapping. ~30 seconds.

### Adding a new campus
Update the helper table on `_Helpers` (rows 4-7) and the heatmap rows on the Dashboard. The Campus slicer auto-updates since it pulls distinct values from the data.

---

## Regenerating the template from source

If the schema changes meaningfully (new categories, renamed columns, restructured sections), regenerate from scratch:

```bash
# Build the base structure (cross-platform)
python scripts/build-template.py

# Add pivots, slicers, and reports (Windows + Excel only)
python scripts/post-build.py
```

The two scripts together produce `templates/student-engagement-dashboard-starter.xlsx`. The first uses openpyxl (cross-platform). The second uses Excel COM via pywin32 (Windows-only) because PivotTables and slicers can only be created by Excel itself.

`pip install openpyxl pywin32` if you don't have them.

---

## Power Automate "real" live feed (optional, later)

The Forms→Excel auto-sync from Step 2 is good (~30s latency). If you later want ~5s latency with optional row enrichment (e.g., section-bucket lookup, Teams notifications), see [`power-automate-flow-spec.md`](power-automate-flow-spec.md). The dashboard doesn't need any changes — the flow writes into a different file you point Power Query at.
