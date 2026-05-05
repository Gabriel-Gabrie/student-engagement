# Reporting Notes for Shannon

What changes in your Excel workflow after Option A goes live.

The two forms have been renamed:
- **Student Engagement - Visitor Tracking** (was "Visitor Tracking - All Campuses - Current")
- **Student Engagement - Outreach Tracking** (was "Student Ambassador Outreach Tracking")

---

## What stays the same

- Both forms still export to Excel from the Forms "Open in Excel" / "Get a link to view results in Excel" flow.
- Your per-campus and per-category totals still come from `SUM` of the corresponding column.
- The auto-captured **Name** and **Email** columns from "Record name" are unchanged.

## What changes that may break existing pivots

**Inquiry category column order is different.** The 24 categories are now grouped into 7 sections (most-frequent first), so the columns appear in a new order in the Excel export. If your pivots reference categories by **column letter** (e.g., `=SUM(M2:M500)`), they will break. Pivots referencing categories by **column header name** (e.g., a pivot table built from a structured table) will continue to work.

Before launching: open one of your existing pivot files, switch the data source range to the new Excel link, and verify totals match expectations on the test responses.

## What changes

### 1. The 0–10 cap is gone

Counts are now real integers with no upper limit. A Welcome-Week Friday can finally show 47 wayfinding inquiries instead of capping at 10. Existing pivots auto-pick up the higher numbers.

### 2. Blank cells now mean zero

Volunteers skip past categories that didn't come up. In Excel:
- `SUM` already treats blanks as 0 — **no formula change needed.**
- `COUNT` counts only non-blank cells. If you were using `COUNT` to tally how often a category came up at all, switch to `COUNTIF(range, ">0")`.
- `AVERAGE` skips blanks. If you want blanks to count as 0 in averages, use `SUMIF / COUNTA` or fill blanks with 0 first.

### 3. New columns on the right

Existing pivots are not affected; these append at the end of the export.

| Form | New column | Notes |
|---|---|---|
| Visitor | Time block | Morning / Afternoon / Evening. Use as a pivot row to see peak-hour patterns per campus. |
| Outreach | Date of activity | This is the **event** date, not the submission date. Use it as your time axis. |
| Outreach | Notes / Highlights | Free text. Skim weekly. |

The auto-captured **Name** and **Email** columns (from Forms' "Record name" setting) are unchanged — these were already in the export. Since every volunteer signs in with their own `@conestogac.on.ca` account, those columns are now the source of truth for shift attribution.

### 4. Outreach Activity stays single-select

Each outreach submission represents **one** activity, even if a table covered two themes simultaneously. In that case the volunteer submits the form twice — once per theme — with each submission's own headcount. So `Outreach Activity` is a single value per row (e.g., `Pride Month` or `Other`). No semicolon-splitting, no Power Query unpivot — pivots Just Work.

If a volunteer submits twice on the same date for the same campus, that's expected. Check `Submission ID` and `Submitted at` to distinguish them.

### 5. Total-headcount question on Visitor form was reworded

Was: *Select the total number of visitors* (0–10 scale).
Now: *How many people did you help during this time block?* (free integer).

Same column position. Same role in your pivots. Just expect bigger numbers and trust them.

### 6. "Total visitors" vs. "sum of categories" — the gap is normal

These will not match, and that's expected:
- **Total people helped** counts unique individuals.
- **Sum of category counts** counts inquiries.
- One person asking about OneCard *and* Bus Pass = 1 person, 2 inquiries.

Report them as two different metrics. Don't try to reconcile them — we'll get clean per-interaction data in Option B.

---

## Suggested new pivots to try

1. **Time block × Campus → headcount** — shows which campuses need more presence at which times.
2. **Time block × Category bucket → inquiry count** — shows what students need help with when.
3. **Outreach Activity × Campus → sum of headcount** — shows which themes resonate where (no splitting needed).
4. **Email × Submission count** — sanity check that all volunteers are submitting.
