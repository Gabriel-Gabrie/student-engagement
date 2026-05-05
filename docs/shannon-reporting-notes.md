# Reporting Notes for Shannon

What changes in your Excel workflow after Option A goes live.

---

## What stays the same

- Both forms still export to Excel from the Forms "Open in Excel" / "Get a link to view results in Excel" flow.
- Existing inquiry category column order is preserved on the Visitor form.
- Your per-campus and per-category totals still come from `SUM` of the corresponding column.

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
| Visitor | Volunteer Name | Free text. Use this for shift attribution, not the auto-captured submitter email. |
| Visitor | Time block | Morning / Afternoon / Evening. Use as a pivot row to see peak-hour patterns per campus. |
| Outreach | Volunteer Name | Same. |
| Outreach | Date of activity | This is the **event** date, not the submission date. Use it as your time axis. |
| Outreach | Notes / Highlights | Free text. Skim weekly. |

### 4. Outreach Activity is now multi-select

Instead of a single value like `Pride Month`, the cell can contain multiple values, typically separated by `;` or `, ` depending on the export.

**Example cell:** `Pride Month; CCR and SSP Promotion`

To pivot by individual activity, split the column into rows once before pivoting:

1. Open the file in Excel → **Data → From Table/Range** (Power Query).
2. Select the **Outreach Activity** column.
3. **Home → Split Column → By Delimiter** → choose `;` (or whatever your export uses) → **Advanced options → Split into: Rows**.
4. **Close & Load** back to the sheet.
5. Pivot as usual. A single submission with two themes now produces two rows — one per theme — and your per-theme totals reflect every event the theme appeared in.

If you'd rather not use Power Query, a simpler-but-rougher approach is to filter `Outreach Activity` cells with `*Pride Month*` (using `COUNTIF(range, "*Pride Month*")`) for each theme. Less precise but no setup.

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
3. **Outreach theme × Campus (after the split) → headcount** — shows which themes resonate where.
4. **Volunteer Name × Submission count** — sanity check that all volunteers are submitting.
