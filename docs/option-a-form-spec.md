# Option A — Microsoft Forms Revision Spec

Apply these changes directly in the Forms editor. Both forms stay restricted to "Only people in my organization can respond" (Conestoga tenant).

---

## Form 1 — Student Ambassador Outreach Tracking

**Form description (replace existing):**
> Welcome! Use this form to log outreach activities. Submit **one entry per day worked**, even for multi-day campaigns (Pride Month, Black History Month, etc.). Please record the volunteer's name explicitly — do not rely on the desk login.

### Question changes

| # | Action | Question | Settings |
|---|---|---|---|
| 1 | Keep | Campus Name | Dropdown: Waterloo, Doon, Reuter, Cambridge. Required. |
| 2 | **Add** | Volunteer Name | Short text. Required. |
| 3 | **Add** | Date of activity | Date. Required. Default: today. |
| 4 | **Modify** | How many people did you help at this activity? | Was 0–10 scale → change to **Number**. Restrictions: whole number, ≥ 0. Required. |
| 5 | **Modify** | Outreach Activity | Was single-select radio → change to **multi-select (checkboxes)**. Keep all existing options + "Other" with text input. Required (at least one). |
| 6 | **Add** | Notes / Highlights | Long text. Optional. |

---

## Form 2 — Visitor Tracking — All Campuses

**Form description (replace existing):**
> Welcome! Use this form to log visitor inquiries at the welcome desk. Submit **at the end of every time block** (Morning / Afternoon / Evening), or **every hour during peak times** (Welcome Week, exam season). Skip past categories that didn't come up — leave them blank. Blank means zero.

### Top-of-form questions

| # | Action | Question | Settings |
|---|---|---|---|
| 1 | Keep | Campus | Dropdown. Required. |
| 2 | **Add** | Volunteer Name | Short text. Required. |
| 3 | **Add** | Time block | Single choice. Options: `Morning (open–12pm)`, `Afternoon (12–4pm)`, `Evening (4pm–close)`. Required. |
| 4 | **Modify** | How many people did you help during this time block? | Was 0–10 scale → change to **Number**. Whole number, ≥ 0. Required. |

### Inquiry categories — restructure into 6 sections

Use Forms **Sections** (the "Add new" → "Section" feature) for each header below. All counter questions: **Number**, whole number, ≥ 0, **optional** (blank = 0).

**Section 1: Library**
- Library – Academic Integrity
- Library – Tech Loans / TeachMeTech
- Library – Research / Writing Consultants

**Section 2: International**
- Immigration / International Student Advising Referral
- International Transition Services
- International Admissions – Second Program

**Section 3: Academic & Registration**
- Learning Services / Math Help / Tutors
- Timetable / Registration Concern
- Want to Change Program
- Connect with Faculty / Program Coordinator / Chair
- Student Fees / Student Financial Services

**Section 4: Health & Wellness**
- Health Insurance
- Medical Clinic / Medical Care
- Mental Health Support / Counselling

**Section 5: Campus Services**
- Bus Pass / Transportation
- OneCard
- Parking
- IT Support
- Job Search / Career Services
- Housing / Accommodation

**Section 6: CSI & Other**
- CSI – Frosh Kits
- CSI – Peer Advocates
- Wayfinding – General
- Others *(Number)*
- Others (Inquiry) — Long text, optional. Use this to describe what "Others" was about.

---

## Forms settings checklist (both forms)

- Settings → "Only people in my organization can respond" — **ON**
- Settings → "Record name" — **ON** (audit trail; Volunteer Name field is the source of truth)
- Settings → "One response per person" — **OFF** (volunteers submit multiple times per shift)
- For every Number question: Restrictions → **Number** → "Greater than or equal to 0" + "Whole number"

---

## Migration note

Existing Excel response sheets keep working. New columns (Volunteer Name, Time block, Date of activity, Notes) append to the right. Existing column order for inquiry categories is preserved. See `shannon-reporting-notes.md` for what changes in her pivots.
