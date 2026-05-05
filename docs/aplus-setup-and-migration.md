# A+ Setup & Migration Guide

Plug-and-play instructions for building the entire A+ system on `ggabrie7022@conestogac.on.ca`, testing it end-to-end, then handing the working system over to Shannon (`shannon.court@conestogac.on.ca` or wherever).

The whole stack is M365-native, so migration is "share / move / re-auth," not "rebuild."

---

## Architecture, in one diagram

```
   ┌───────────────────────┐    ┌───────────────────────┐
   │ Visitor Tracking Form │    │ Outreach Tracking Form│
   │ (Microsoft Forms)     │    │ (Microsoft Forms)     │
   └──────────┬────────────┘    └──────────┬────────────┘
              │ submission                 │ submission
              ▼                            ▼
   ┌─────────────────────────────────────────────────┐
   │ Live Data (OneDrive)                            │
   │  • Visitor responses workbook (auto-sync)       │
   │  • Outreach responses workbook (auto-sync)      │
   │  • OR (optional): Live Feed workbook fed by     │
   │    Power Automate flows                         │
   └──────────────────┬──────────────────────────────┘
                      │ Power Query (refresh every 5 min)
                      ▼
   ┌─────────────────────────────────────────────────┐
   │ Student Engagement - Dashboard.xlsx (OneDrive)  │
   │  • Data sheets, hidden pivot sheet              │
   │  • Dashboard sheet — KPIs, heatmap, charts,     │
   │    slicers, timeline                            │
   │  • Reports — Weekly, Monthly                    │
   │  • How to use sheet                             │
   └─────────────────────────────────────────────────┘
```

Everything lives in your OneDrive. Nothing depends on third-party services.

---

## Phase 1 — Build it on ggabrie7022@conestogac.on.ca

### Pre-flight (5 min)

1. Sign into `office.com` with `ggabrie7022@conestogac.on.ca`.
2. Confirm you can open: Forms, Excel Online, OneDrive, Power Automate. (You should — these are all standard EDU.)
3. In OneDrive, create a folder: `Student Engagement/`. Inside it, create two subfolders:
   - `Live Data/` — for the auto-syncing Forms response workbooks.
   - `Dashboards/` — for the dashboard workbook itself.

### Step 1 — Build the two Forms (~25 min)

Follow [`forms-build-guide.md`](forms-build-guide.md) end to end. By the end of this step you have:
- `Student Engagement - Visitor Tracking` form (with 7 sections, ~28 questions, all settings configured)
- `Student Engagement - Outreach Tracking` form (5 questions)
- Both forms set to "Only people in my organization can respond" + "Record name" ON
- "Accept responses" still **OFF** until ready to test

### Step 2 — Smoke-test the forms (5 min)

1. Toggle "Accept responses" ON for both forms.
2. Click **Preview** → submit a test on the Visitor form using realistic data (Doon, Afternoon, helped 23, Wayfinding 10, Bus Pass 4).
3. Submit a test on the Outreach form (Doon, today, helped 47, International Women's Day, type a note). Submit a second test for the same date with Celebrating Diversity, helped 19, to verify two-activities-same-table tracking.
4. Verify both responses appear in the Forms **Responses** tab.

### Step 3 — Wire up the live data files (10 min)

For each form: in the **Responses** tab, click **Open in Excel**. Microsoft creates a workbook in your OneDrive that auto-syncs. Move both into `Student Engagement/Live Data/` and rename:
- `Visitor Responses.xlsx`
- `Outreach Responses.xlsx`

These are now the live feed. They update within ~30 seconds of every new submission.

### Step 4 — Build the dashboard (~50 min, one-time)

Follow [`excel-dashboard-build-guide.md`](excel-dashboard-build-guide.md). Save the resulting file as `Student Engagement/Dashboards/Student Engagement - Dashboard.xlsx`.

By the end you have a working dashboard reading live from the response files, with KPIs, heatmap, charts, slicers, and a timeline.

### Step 5 — Validate (15 min)

1. Submit 3–4 more test responses across different campuses/time blocks.
2. Open the dashboard. Wait ~1 minute or hit **Data → Refresh All**.
3. Confirm:
   - KPI tiles update.
   - Heatmap shows the right cells.
   - Filtering by campus changes the displayed data.
   - Timeline shrinks to a date range correctly.
4. Click on a Slicer chip — every chart and KPI should update simultaneously. If not, check **Slicer → Report Connections** and tick all relevant pivots.

### Step 6 — (Optional) Add Power Automate live feed

Follow [`power-automate-flow-spec.md`](power-automate-flow-spec.md) to upgrade from the built-in Forms→Excel sync (30s–2min latency) to a flow-based feed (~5s latency, with optional enrichment).

You can do this at any point — even after Shannon takes over. The flow runs under whoever owns it; ownership transfers cleanly.

---

## Phase 2 — Run it for 1–2 weeks on your account

This is the critical de-risk step. Use this period to:
- Verify the auto-refresh is reliable.
- Catch any column-renaming surprises in the Forms exports.
- Find any pivot/slicer connections you missed.
- Tune category definitions in `volunteer-instructions.md` based on real usage.

Submit a handful of fake responses each day. Open the dashboard from your phone (OneDrive mobile + Excel app) to confirm it works on mobile. **If something feels janky, fix it now** — fixes are far cheaper before Shannon's involved.

---

## Phase 3 — Migrate everything to Shannon

This is the plug-and-play piece. Done right, it takes ~30 minutes total.

### Option 3a (recommended) — Microsoft 365 Group with both of you as members

The cleanest model. Forms and OneDrive files live in the Group's shared storage; both Gabriel and Shannon (and anyone added later) own them collectively. No "transfer" needed — ownership is shared from day 1.

Cleanest if you set this up early. To retrofit:

1. `outlook.office.com` → **Groups** → **+ New Group** → name: `Conestoga Student Engagement` → membership: just you and Shannon (others later).
2. Move each Form to the Group:
   - Open each Form → **"..."** → **Move** → choose the Group.
3. Move OneDrive files to the Group's SharePoint document library:
   - Open OneDrive → select all files in `Student Engagement/` → **Move to** → choose the Group's library.
4. Update the dashboard's Power Query data sources to point at the new SharePoint paths (Data → Queries & Connections → right-click each query → Edit → adjust the Source step).
5. Refresh and confirm.

After this, Shannon has full edit access on everything. If she leaves Conestoga, you transfer her membership but the assets stay with the Group.

### Option 3b — Direct ownership transfer / share

Faster, but less clean long-term.

#### Forms
- Open each Form → **Share** → **Share to collaborate** → click **+ Get a link to view and edit**. Copy the link, send to Shannon.
- This makes Shannon a co-owner. She can view all responses, edit questions, and access the response data through her own M365 account.
- Alternative: Form ownership can be fully transferred via `forms.office.com` → "..." → "Move" → into a Group (3a above) or via Microsoft admin tools, but co-ownership is usually enough.

#### OneDrive files
- Right-click each of the 3 workbooks (Visitor Responses, Outreach Responses, Dashboard) → **Share** → enter Shannon's email → permission: **Can edit** → uncheck "Notify people" if you want a clean handover.
- Better: also set Shannon as the **primary owner** — open the file's properties (top right "i" icon in OneDrive) → **Manage access** → grant Shannon "Owner."
- Even better: move the entire `Student Engagement/` folder out of your OneDrive into a SharePoint site Shannon also owns. (This is essentially Option 3a.)

#### Power Automate flows (if you set them up)
- Power Automate doesn't auto-transfer with file ownership.
- Open `flow.microsoft.com` → My flows → click each Student Engagement flow → **...** → **Edit** → **Owners** → add Shannon. Now both of you can edit / monitor / disable.
- Long-term: have Shannon recreate the flows under her account and delete yours, OR keep them under your account and grant her co-owner access.

### Step 3.X — Hand-off checklist

After whichever migration option:

1. ☐ Shannon can submit a test response on each form.
2. ☐ Shannon can open the dashboard and see the test response within 1 minute.
3. ☐ Shannon can edit a Form (e.g., add a category) — she has owner-level access.
4. ☐ Shannon can refresh the dashboard manually (Data → Refresh All).
5. ☐ Shannon's name appears on the dashboard tab as a co-author when both of you have it open.
6. ☐ Volunteer URLs (Forms share links) are sent to Shannon — she'll forward to ambassadors at each campus.
7. ☐ `volunteer-instructions.md` is printed and posted at each desk (after Shannon has tweaked the category definitions).

---

## Authentication gotchas to watch for

When Shannon first opens the dashboard from her own account, Power Query may prompt her to **re-authenticate** the data source. This is normal — Power Query stores credentials per-user.

1. She'll see a yellow banner: "Some data needs your permission to refresh."
2. Click **Edit Credentials** → choose **Organizational account** → sign in with her Conestoga account → click **Connect**.
3. Done — credentials are now cached on her side. She won't be prompted again.

If the dashboard's Power Query points to files in **your** OneDrive (Phase 1 setup), Shannon needs *read access* to those files for refresh to work. Option 3a (Group) sidesteps this entirely. Option 3b requires you to keep the files shared with her.

---

## Costs

| Component | Cost |
|---|---|
| Microsoft Forms | $0 (included in M365 EDU) |
| Excel Online + OneDrive | $0 (included) |
| Power Automate (basic flows) | $0 (included) |
| Power Automate (premium connectors — not used here) | n/a |
| **Total recurring cost** | **$0** |

A+ is genuinely free for Conestoga. Power BI (Option B's dashboard layer) is the thing that costs $10/user/mo — A+ deliberately avoids it.

---

## When you're ready to upgrade to Option B

The data shape from A+ is forward-compatible with B. When Shannon's bought into the dashboard and starts asking for per-interaction granularity / hour-by-hour heatmaps / phone-based outreach logging, the B upgrade is:

1. Build the canvas app + new SharePoint list (the per-interaction table).
2. Power Automate flow: when interaction is logged, ALSO summarize into the existing `tblVisitor` shape so the existing dashboard keeps working.
3. Build a richer Power BI dashboard alongside the existing Excel one.
4. Run both for 2–3 weeks, then sunset the Forms when volunteers have shifted to the canvas app.

Shannon never has a "lights-out" migration moment.
