# Excel Dashboard Build Guide — Option A+ (v2 — long-format)

The template is built around the **actual Microsoft Forms export shape** (with column names like `How many people did you help during this time block?` intact) and uses a long-format helper table so the dashboard automatically handles new categories Shannon adds in the future.

You connect three Power Query queries, click a couple of buttons, and the dashboard works.

---

## What's in the template

[`templates/student-engagement-dashboard-starter.xlsx`](../templates/student-engagement-dashboard-starter.xlsx)

| Sheet | What's in it | Notes |
|---|---|---|
| `How to use` | One-page reference | Opens by default |
| `Dashboard` | KPI tiles + heatmap (formula-based, lifetime) + 2 slicers + 3 PivotCharts | Slicers filter Weekly + Monthly only |
| `Visitor` | `tblVisitor` — Forms's wide visitor export | 33 columns, all named exactly as Forms exports them |
| `Outreach` | `tblOutreach` — Forms's wide outreach export | 9 columns |
| `Reports — Weekly` | `ptWeekly` PivotTable on tblVisitor | Right-click any date → Group → tick Days(7) + Months + Years after data loads |
| `Reports — Monthly` | `ptMonthly` PivotTable on tblVisitor | Right-click any date → Group → tick Months + Years |
| `VisitorLong` (hidden) | `tblVisitorLong` — long-format from Power Query Unpivot | Drives the Top Categories chart and "Inquiries logged" KPI |
| `_PivotHost` (hidden) | Hosts the slicer-source pivot and the chart-source pivots | Don't unhide unless debugging |
| `_Helpers` (hidden) | Drives the Top Campus KPI | |

**Already wired:** Campus + Time block slicers filter the slicer-host pivot, the Weekly report, and the Monthly report. KPIs and Top Categories show lifetime totals — this is intentional and explained at the bottom of "How to use".

---

## Step 1 — Save the template into OneDrive (~2 min)

1. Download the template from the repo.
2. Save to `OneDrive/Student Engagement/Dashboards/Student Engagement - Dashboard.xlsx` (overwrite your old one if you have it).
3. Open it. You'll land on the "How to use" sheet.

## Step 2 — Connect Power Query (3 queries, ~15 min)

You'll create three queries. The first two load your Forms responses; the third is a derivative query that unpivots the visitor categories into long format.

### 2a. Connect the two Forms response files

For each form (Visitor first, then Outreach), open the form in `forms.office.com` → **Responses** tab → **Open in Excel**. Microsoft creates an auto-syncing workbook in your OneDrive. Save them in `OneDrive/Student Engagement/Live Data/` and rename:
- `Visitor Responses.xlsx`
- `Outreach Responses.xlsx`

### 2b. Visitor query

1. **Data** → **Get Data** → **From File** → **From Workbook**.
2. Browse to `Visitor Responses.xlsx`. Pick **Sheet1** → click **Transform Data** (not "Load").
3. The Power Query editor opens. On the right, in the **Query Settings** panel, change the query Name to `Visitor`.
4. **Home** → **Close & Load To...** → **Table** → **Existing worksheet** → click cell `A1` of the **Visitor** sheet → click OK.
5. Excel asks if you want to replace the existing table. Click **Replace** (or **Yes**).
6. **Verify the table name.** Click any cell inside the loaded table. The **Table Design** ribbon tab appears. Look at the **Table Name** box on the left. If it shows anything OTHER than `tblVisitor` (often it shows `Visitor`, `Sheet1`, or the query name), type `tblVisitor` and press Enter. The KPI tiles and heatmap won't work until the table name matches.

### 2c. Outreach query

Same as 2b but with `Outreach Responses.xlsx`, loaded into the **Outreach** sheet (replacing `tblOutreach`).

**Same table-name verification applies**: after loading, click into the table → Table Design tab → confirm name is `tblOutreach`, rename if it's anything else (e.g., `Outreach`, `Sheet1`).

**Common mistake to avoid:** in step 1, double-check the file picker is showing `Outreach Responses.xlsx` and not the dashboard workbook itself. If the Outreach query gets pointed at the dashboard file, Refresh All will fail with "We couldn't get the data from 'tblOutreach' in the workbook ..." (because that's a self-reference).

### 2d. VisitorLong query (this is the new piece — read carefully)

This is the key to making the dashboard handle new categories automatically. You're going to take the Visitor query, transform a copy of it, and load that into the hidden VisitorLong sheet.

1. Open the **Queries & Connections** panel: **Data** → **Queries & Connections**.
2. In the panel on the right, you should see two queries: `Visitor` and `Outreach`.
3. **Right-click** `Visitor` → **Reference**.
4. The Power Query editor opens with a new query that just references Visitor. On the right, change the Name to `VisitorLong`.
5. Now you'll select the 24 category columns to unpivot:
   - Find the column **Wayfinding** (it's after "How many people did you help…").
   - **Click** the column header for `Wayfinding` to select it.
   - Scroll right to find **Others** (the last category column, just before `Others (Inquiry)`).
   - **Hold Shift and click** the `Others` column header.
   - All 24 category columns are now selected (highlighted).
6. **Right-click** any of the selected column headers → **Unpivot Columns** (NOT "Unpivot Other Columns" — that's the wrong direction).
7. The categories collapse into two new columns: `Attribute` (the category name) and `Value` (the count).
8. **Right-click** the `Attribute` column header → **Rename** → type `Category`.
9. **Right-click** the `Value` column header → **Rename** → type `Count`.
10. **Home** → **Close & Load To...**.
11. The dialog asks where to load. The `VisitorLong` sheet is hidden — you need to unhide it briefly:
   - Cancel the dialog.
   - Right-click **any sheet tab** at the bottom → **Unhide** → pick **VisitorLong** → OK.
   - Now go back: **Data** → **Queries & Connections** → right-click `VisitorLong` → **Load To...** → **Table** → **Existing worksheet** → click cell `A1` of the now-visible **VisitorLong** sheet → OK → **Replace** when prompted.
12. After loading: right-click the **VisitorLong** tab at the bottom → **Hide**.

### 2e. Set all 3 queries to auto-refresh

1. **Data** → **Queries & Connections** → right-click each query in turn → **Properties**.
2. Tick: **Refresh data when opening the file**.
3. Tick: **Refresh every** → set to `5` minutes.
4. OK.

### 2f. Refresh now

1. **Data** → **Refresh All**.
2. Wait ~10 seconds.

## Step 3 — Verify

Click the **Dashboard** tab. You should see:

- **KPI tiles** with real numbers (or 0s if no submissions yet — but no `#REF!` errors).
- **Heatmap** with values per campus × time block, color-shaded.
- **Top Inquiry Categories chart** showing bars, one per category that has at least one count.
- **Outreach themes** + **Outreach by campus** charts populated (if you have outreach data).
- **Campus slicer** + **Time block slicer** at the top.

Click the **Reports — Weekly** tab. The pivot shows your data with dates running down and campuses across. Dates are not yet grouped by week — see Step 5 below.

## Step 4 — Add the Timeline (1 min)

The post-build script can't add this — Excel COM has a stubborn quirk with Timeline creation. Add it now that real data has loaded:

1. Click any cell inside the pivot on **Reports — Weekly**.
2. **PivotTable Analyze** tab → **Insert Timeline** → tick `Completion time` → OK.
3. The timeline appears. **Click on it once** to select it → **Ctrl+X**.
4. Click the **Dashboard** tab → click somewhere near the top right → **Ctrl+V**.
5. **Right-click** the timeline → **Report Connections** → tick `ptSlicerHost`, `ptWeekly`, `ptMonthly` → OK.

Drag the timeline range — Reports sheets refilter live.

## Step 5 — Group dates on the report pivots (1 min each)

**Reports — Weekly:**
1. Right-click any date in the leftmost column of the pivot → **Group**.
2. Tick **Days** with `Number of days: 7`, plus **Months** + **Years**. Click OK.

**Reports — Monthly:**
1. Right-click any date → **Group**.
2. Tick **Months** + **Years** only. Click OK.

---

## Why this design is future-proof

The previous template hard-coded 24 specific category column names everywhere. Adding a new question in Forms broke a dozen formulas.

This version handles it like this:

- **New category in Forms** (e.g., Shannon adds "Voter Registration"): Power Query loads it as a new column on `tblVisitor`. The next refresh of the `VisitorLong` query unpivots it automatically — no Power Query edit needed because the Unpivot Columns step works on whatever columns the user originally selected. Wait — that's wrong; the Unpivot step is "static" in the sense it remembers the columns selected at design time. **You'd need to edit the VisitorLong query once: change the Unpivot Columns step's column list to include the new category.** That's a 30-second edit instead of a multi-formula rework.
- A more durable variant: in the VisitorLong query, instead of Unpivot Columns, do **Unpivot Other Columns** with the *identifier* columns selected (Id, Start time, Completion time, Email, Name, Campus, Time block, Headcount, Others (Inquiry)). That way new category columns are automatically swept into the unpivot. Trade-off: if Forms adds a non-category column you'd have to add it to the identifier list. Pick whichever pattern matches your maintenance habits.
- **Renaming a category in Forms**: Power Query throws on next refresh because it expects the old column name. Edit the Visitor query's "Renamed Columns" step (if any) or the Unpivot list. ~30 seconds.
- **New campus**: appears automatically in slicers, pivots, and charts. Update `_Helpers` rows 4–7 if you want the Top Campus KPI to include it.

---

## Slicer scope (so you know what filters what)

| Element | Filters when you click a slicer? |
|---|---|
| KPI tiles (4 tiles at top of Dashboard) | ❌ Lifetime totals |
| Heatmap | ❌ Lifetime totals (the heatmap is formula-driven) |
| Top Categories chart | ❌ Lifetime — sources `tblVisitorLong`, separate cache |
| Outreach Themes chart | ❌ Lifetime — sources `tblOutreach`, separate cache |
| Outreach by Campus chart | ❌ Lifetime — sources `tblOutreach`, separate cache |
| Reports — Weekly pivot | ✅ Yes |
| Reports — Monthly pivot | ✅ Yes |

If you want everything to filter together you'd need to add the queries to Excel's Power Pivot data model and create relationships on `Id`. That's a worthwhile upgrade later but not required for v2.

---

## Regenerating the template from source

If the schema changes, regenerate:

```bash
python scripts/build-template.py    # base structure (cross-platform)
python scripts/post-build.py        # COM polish (Windows + Excel)
```

Requires `pip install openpyxl pywin32` and Excel installed for the post-build step.

---

## Troubleshooting

| Symptom | Likely fix |
|---|---|
| `#REF!` in a KPI tile | First check the table name — click into the data table, Table Design tab → name should be `tblVisitor` / `tblOutreach` / `tblVisitorLong` exactly. If wrong, rename. If table name is right, then a column name doesn't match — click the #REF! cell, see which column it references, check the data table's headers. |
| Refresh All says "We couldn't get the data from 'tblOutreach' in the workbook ..." with the dashboard file's URL | The Outreach query's Source step points at the dashboard file (self-reference), not at the Outreach Responses file. Edit the query → look at the Source step's path → if wrong, delete the query and recreate it pointing at `Outreach Responses.xlsx`. |
| Heatmap is all zeros even with data | Time block question wording must START with "Morning", "Afternoon", or "Evening". Heatmap uses wildcard match (`Morning*`) so anything starting with those words works. If your options use different wording, edit the formulas on Dashboard rows 9–12. |
| Top Categories chart is empty | The `VisitorLong` query didn't load. Reopen Power Query → make sure the query exists and the Unpivot step is the last/last-meaningful step → Close & Load. |
| Slicer shows `(blank)` as an option | You have rows in `tblVisitor` with empty Campus or Time block. Either there are placeholder rows still around, or some Forms submissions skipped a required field somehow. Check the data. |

---

## Power Automate "real" live feed (optional, later)

The Forms→Excel auto-sync is good (~30s latency). For ~5s latency with optional row enrichment (e.g., section-bucket lookup, Teams notifications), see [`power-automate-flow-spec.md`](power-automate-flow-spec.md). The dashboard's Power Query connections would point at a different file fed by the flow.
