# Power Automate Flow Spec — Live Feed for the Dashboard

This is the optional "real" live feed for A+. It replaces the Forms→Excel built-in sync (which has 30s–2min latency and occasionally lags) with a Power Automate flow that fires on every form submission and writes a clean, dashboard-ready row to Excel. Latency: ~5 seconds.

You can build A+ without this and add it later. The dashboard workbook doesn't change — only the data source it reads from.

## Why bother

| | Built-in Forms→Excel sync | Power Automate flow |
|---|---|---|
| Latency | 30s – 2min | ~5s |
| Reliability | Good but Microsoft throttles | Solid |
| Enrichment (e.g., section bucket lookup) | Not possible | Trivial |
| Multi-select splitting (outreach themes) | Done in Power Query | Can be done at write time |
| Easy to add alerts (e.g., Teams notification) | No | Yes |
| Cost | Free | Free with M365 EDU |

## Prerequisites

1. M365 with Power Automate access (included in EDU plans).
2. Both forms built and accepting responses.
3. A blank Excel workbook in OneDrive with a structured table to receive rows. We'll call it `Student Engagement - Live Feed.xlsx`.

## Set up the destination workbook

1. Create `Student Engagement - Live Feed.xlsx` in `OneDrive/Student Engagement/`.
2. Add two sheets: `Visitor` and `Outreach`.
3. On each sheet, type column headers (row 1) matching the Forms response shape — see the column lists at the bottom of this doc.
4. Select all the headers + at least one blank row → **Insert** → **Table** → tick "My table has headers" → click OK.
5. Rename each table:
   - Visitor sheet's table → `tblVisitor` (Table Design → Table Name).
   - Outreach sheet's table → `tblOutreach`.
6. Save. The dashboard workbook's Power Query will point at these tables instead of at the Forms response files.

---

## Flow 1: Visitor submission → row in tblVisitor

### Steps

1. `flow.microsoft.com` → **Create** → **Automated cloud flow**.
2. Name: `Visitor Tracking → Live Feed`.
3. Trigger: **When a new response is submitted (Microsoft Forms)**.
4. Form Id: pick `Student Engagement - Visitor Tracking`.

5. **Action: Get response details (Microsoft Forms)**
   - Form Id: same.
   - Response Id: `triggerOutputs()?['body/resourceData/responseId']` (auto-populates from "Dynamic content").

6. **Action: Add a row into a table (Excel Online (Business))**
   - Location: OneDrive for Business
   - Document Library: OneDrive
   - File: `/Student Engagement/Student Engagement - Live Feed.xlsx`
   - Table: `tblVisitor`
   - Map each column from the Get response details outputs. Columns to map (use Dynamic content → "Get response details"):

| Column in tblVisitor | Source field |
|---|---|
| `Submission ID` | Response Id |
| `Submitted at` | Submission time |
| `Name` | Name (from Record name) |
| `Email` | Email (from Record name) |
| `Campus` | Campus answer |
| `Time block` | Time block answer |
| `How many helped` | "How many people did you help…" answer |
| `Wayfinding – General` | corresponding Forms answer |
| ... (all 24 categories) | ... |
| `Others (Inquiry)` | the Long text answer |

7. **(Optional) Action: Compose** — derive a `Section bucket` value using a switch expression. Example expression for "Common Help":

```
if(or(or(or(or(or(
  greater(int(coalesce(outputs('Get_response_details')?['body/<wayfinding-questionId>'], '0')), 0),
  greater(int(coalesce(outputs('Get_response_details')?['body/<onecard-questionId>'], '0')), 0)),
  ...
)))), 'Common Help', '')
```

(Skip this if you handle bucketing in Power Query — it's already covered there.)

8. **Save** the flow → run a test → submit the visitor form once → confirm a row appears in `tblVisitor`.

---

## Flow 2: Outreach submission → 1 row in tblOutreach

Outreach is single-select (one activity per submission), so this flow is a straight "submission → row" mapping with no loops.

### Steps

1. New flow: `Outreach Tracking → Live Feed`.
2. Trigger: **When a new response is submitted** → form: `Student Engagement - Outreach Tracking`.
3. Action: **Get response details**.
4. Action: **Add a row into a table** → `tblOutreach`. Map columns:

| Column in tblOutreach | Source field |
|---|---|
| `Submission ID` | Response Id |
| `Submitted at` | Submission time |
| `Name` | Name |
| `Email` | Email |
| `Campus` | Campus answer |
| `Date of activity` | Date answer |
| `How many helped` | "How many people did you help…" answer |
| `Outreach Activity` | Outreach Activity answer (the selected option, or "Other") |
| `Other activity (text)` | Free-text "Other" answer (empty unless "Other" was selected) |
| `Notes` | Notes / Highlights |

5. (Optional) Add a Teams notification action after the row write — "Posted: <Outreach Activity> at <Campus> on <Date>, helped <N>". Sends to a Teams channel for visibility.
6. Save → test.

---

## Flow 3 (optional): Daily summary email to Shannon

1. Trigger: **Recurrence** → frequency: Day, every 1, time: 9:00 AM.
2. Action: **List rows present in a table** → `tblVisitor` → filter to rows where `Submitted at >= addDays(utcNow(), -1)`.
3. Action: **Compose** → build an HTML summary string with totals.
4. Action: **Send an email (V2)** → To: Shannon → Subject: "Yesterday's engagement — auto-summary" → Body: HTML compose output.

This becomes Shannon's morning digest — total people helped yesterday across all campuses, top categories, top campus. Optional but high-value.

---

## Switching the dashboard to read from this Live Feed file

In the dashboard workbook (`Student Engagement - Dashboard.xlsx`):

1. **Data** → **Queries & Connections** → right-click the `Visitor` query → **Edit**.
2. In Power Query, find the `Source` step (top of the Applied Steps list).
3. Change the file path from the Forms response file to `/Student Engagement/Student Engagement - Live Feed.xlsx`. Pick `tblVisitor`.
4. Same for the `Outreach` query — point to `tblOutreach`.
5. Refresh. Dashboard now reads from the Power Automate-fed table. Latency drops from minutes to seconds.

---

## Column lists (for the destination tables)

### `tblVisitor` columns

```
Submission ID
Submitted at
Name
Email
Campus
Time block
How many helped
Wayfinding – General
OneCard
IT Support
Bus Pass / Transportation
Parking
Timetable / Registration Concern
Student Fees / Student Financial Services
Learning Services / Math Help / Tutors
Want to Change Program
Connect with Faculty / Program Coordinator / Chair
Health Insurance
Mental Health Support / Counselling
Medical Clinic / Medical Care
Housing / Accommodation
Job Search / Career Services
Immigration / International Student Advising Referral
International Transition Services
International Admissions – Second Program
Library – Tech Loans / TeachMeTech
Library – Research / Writing Consultants
Library – Academic Integrity
CSI – Frosh Kits
CSI – Peer Advocates
Others
Others (Inquiry)
```

### `tblOutreach` columns

```
Submission ID
Submitted at
Name
Email
Campus
Date of activity
How many helped
Outreach Activity
Other activity (text)
Notes
```

> Each outreach submission produces exactly one row. If a volunteer ran two activities at the same table, they submit the form twice — that's two rows with the same date and campus but different `Outreach Activity` and `Submission ID`.
