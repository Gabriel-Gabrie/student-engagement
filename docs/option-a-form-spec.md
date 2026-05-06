# Option A — Microsoft Forms Revision Spec

The structural spec for the two redesigned forms. For step-by-step click instructions on building them, see `forms-build-guide.md`.

Both forms stay restricted to "Only people in my organization can respond" (Conestoga tenant).

---

## Form 1 — Student Engagement - Outreach Tracking

> **Title:** `Student Engagement - Outreach Tracking` (renamed from "Student Ambassador Outreach Tracking")

**Form description (replace existing):**
> Welcome! Use this form to log outreach activities. Submit **one entry per activity, per day worked** — if a table covered two activities at once (e.g., Pride Month + CCR), submit two separate entries with each entry's own headcount. For multi-day campaigns (Pride Month, Black History Month, etc.) submit a fresh entry each day. Your Conestoga login is captured automatically as the submitter.

### Question changes

| # | Action | Question | Settings |
|---|---|---|---|
| 1 | Keep | Campus | Dropdown: Waterloo, Doon, Reuter, Cambridge. Required. |
| 2 | **Add** | Date of activity | Date. Required. Default: today. |
| 3 | **Modify** | How many people did you help at this activity? | Was 0–10 scale → change to **Number**. Restrictions: whole number, ≥ 0. Required. |
| 4 | Keep | Outreach Activity | Single-select radio. Keep all existing options + "Other" with text input. Required. **One activity per submission** — do NOT change to multi-select. |
| 5 | **Add** | Notes / Highlights | Long text. Optional. |

> **No Volunteer Name field.** Every volunteer signs in with their own `employeeid@conestogac.on.ca` account, so Forms' built-in **Record name** setting captures Name and Email automatically — no extra question needed.

---

## Form 2 — Student Engagement - Visitor Tracking

> **Title:** `Student Engagement - Visitor Tracking` (renamed from "Visitor Tracking - All Campuses - Current")

**Form description (replace existing):**
> Welcome! Use this form to log visitor inquiries at the welcome desk. Submit **at the end of every time block** (Morning / Afternoon), or **every hour during peak times** (Welcome Week, exam season). Skip past categories that didn't come up — leave them blank. Blank means zero.

### Top-of-form questions

| # | Action | Question | Settings |
|---|---|---|---|
| 1 | Keep | Campus | Dropdown. Required. |
| 2 | **Add** | Time block this submission covers | Single choice. Options: `Morning (open – 12pm)`, `Afternoon (12 – close)`. Required. |
| 3 | **Modify** | How many people did you help during this time block? | Was 0–10 scale → change to **Number**. Whole number, ≥ 0. Required. |

> **No Volunteer Name field.** Same as the Outreach form — Forms' built-in **Record name** setting captures the volunteer's Conestoga Name and Email automatically.

### Inquiry categories — 7 sections, ordered by likely frequency

Use Forms **Sections** (the "Add new" → "Section" feature) for each header below. The most-frequent inquiries land in Section 1 so a quiet shift can submit without scrolling. All counter questions: **Number**, whole number, ≥ 0, **optional** (blank = 0).

**Section 1: Common Help** *(highest-frequency inquiries)*
- Wayfinding – General
- OneCard
- IT Support
- Bus Pass / Transportation
- Parking
- Timetable / Registration Concern

**Section 2: Academic & Registration**
- Student Fees / Student Financial Services
- Learning Services / Math Help / Tutors
- Want to Change Program
- Connect with Faculty / Program Coordinator / Chair

**Section 3: Health & Wellness**
- Health Insurance
- Mental Health Support / Counselling
- Medical Clinic / Medical Care

**Section 4: Housing & Career**
- Housing / Accommodation
- Job Search / Career Services

**Section 5: International**
- Immigration / International Student Advising Referral
- International Transition Services
- International Admissions – Second Program

**Section 6: Library**
- Library – Tech Loans / TeachMeTech
- Library – Research / Writing Consultants
- Library – Academic Integrity

**Section 7: CSI & Other**
- CSI – Frosh Kits
- CSI – Peer Advocates
- Others *(Number)*
- Others (Inquiry) — Long text, optional. Use this to describe what "Others" was about.

---

## Forms settings checklist (both forms)

- Settings → "Only people in my organization can respond" — **ON**
- Settings → "Record name" — **ON** (this is what auto-captures the volunteer's Conestoga Name + Email; it's the sole source of submitter identity since every volunteer signs in with their own `employeeid@conestogac.on.ca` account)
- Settings → "One response per person" — **OFF** (volunteers submit multiple times per shift)
- For every Number counter: "..." → **Restrictions** → **Number** → "Greater than or equal to 0" + tick **Whole number**

---

## Migration note

Build the new forms as **net-new forms** rather than editing the existing ones. Reasons:
- The 0–10 scale → Number type change is destructive — old responses will keep their scale-based values, but new submissions will write integers, which makes the column type ambiguous in Excel exports.
- The 7-section restructure scrambles category column order in the export. Cleaner to start fresh.

Recommended cutover: build new forms in parallel, pilot with a subset of volunteers for 2 weeks, then turn off the old forms ("Accept responses: OFF") and post the new URLs at every desk. Keep the old forms' response data archived as a baseline.

See `shannon-reporting-notes.md` for what changes in her Excel pivots, and `forms-build-guide.md` for click-by-click instructions for whoever has Forms admin access.
