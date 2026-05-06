# Microsoft Forms Build Guide — Option A

Step-by-step instructions for whoever has Forms admin access (Shannon or her delegate). Allow ~25 minutes to build both forms.

> **Note from the developer:** Microsoft Forms has no public API for creating forms — they have to be built by clicking through `forms.office.com`. There is no `.form` import format. The closest alternative (Microsoft Graph beta endpoints for Forms) is read-only, so this click-through is the actual production-ready route.

---

## Before you start

1. **Back up the existing forms.**
   - `forms.office.com` → My forms → hover the existing Outreach and Visitor forms → **"..."** → **Duplicate**.
   - Rename each duplicate by appending ` (backup pre-Option-A)`.
   - These backups preserve current responses untouched.

2. **Build the new forms as net-new forms** with the new titles below. Do not edit the existing live forms — the 0–10 scale → Number type change is destructive, and the section restructure would scramble the column order in the existing export.

3. **Plan the cutover.** Build → 2-week pilot with a few volunteers → flip old forms' "Accept responses" to OFF and post the new URLs at every desk → archive the old forms.

---

## A note on question numbering

Microsoft Forms automatically prefixes each question with a number ("1.", "2.", …). **These numbers are managed by Forms, not by you.** When you add or remove a question, Forms renumbers everything after it. Excel exports use the question text as the column header — never the number — so existing pivots that reference categories by header name keep working when new categories are added.

**Practical consequence:** Shannon (or whoever maintains the form later) can add new categories anywhere — top, middle, or bottom of any section — without renaming the existing ones. Forms takes care of the rest.

---

## Reusable patterns (read once)

### How to add a Number question
Forms doesn't have a "Number" question type — you use **Text** with a number restriction.
1. **+ Add new** → **Text**.
2. Type the question label.
3. Click the **"..."** menu on the question card.
4. **Restrictions** → **Number** → **Greater than or equal to: `0`**.
5. Tick **Whole number**.
6. **Required:** ON for "How many people did you help" questions, OFF for category counters.

### How to add a Section
**+ Add new** → **Section** (the icon shows a horizontal split line). Type the section title and optional description. All subsequent questions belong to that section until you add another.

### How to add a Choice question with "Other"
1. **+ Add new** → **Choice**.
2. Type the question.
3. Add options one per line.
4. Click **Add "Other" option** at the bottom of the option list — Forms wires up a free-text input to that choice automatically.
5. **"..."** → leave **Multiple answers** OFF (single-select radio).
6. Drop-down list: OFF for visible radio buttons; ON only when there are too many options to display inline (like Campus).

---

## Form 1: Student Engagement - Outreach Tracking

### 1.1 Create the form
- `forms.office.com` → **+ New Form**
- **Title:** `Student Engagement - Outreach Tracking`
- **Description:**
  > Welcome! Use this form to log outreach activities. Submit one entry per activity, per day worked — if a table covered two activities at once, submit two separate entries. For multi-day campaigns (Pride Month, Black History Month, etc.) submit a fresh entry each day. Your Conestoga login is captured automatically as the submitter.

### 1.2 Add the questions in this order

| Q | Type | Question | Required | Settings |
|---|------|----------|----------|----------|
| 1 | Choice | `Campus` | ✅ | Options: `Waterloo`, `Doon`, `Reuter`, `Cambridge`. **Drop-down list: ON** (in "..."). |
| 2 | Date | `Date of activity` | ✅ | — |
| 3 | Number | `How many people did you help at this activity?` | ✅ | Apply Number pattern. |
| 4 | Choice (single-select) | `Outreach Activity` | ✅ | See option list below. **Multiple answers: OFF** (one activity per submission). Click **Add "Other" option**. |
| 5 | Text (long answer) | `Notes / Highlights` | — | **"..."** → toggle **Long answer: ON**. Required: OFF. |

**Q4 options (in order):**
- `Bell Let's Talk`
- `Black History Month`
- `Campus Welcome Day`
- `CCR and SSP Promotion`
- `Celebrating Diversity`
- `Health and Wellness Outreach`
- `International Women's Day`
- `Pride Month`
- `Sexual Health Week`
- *(then click* **Add "Other" option** *at the bottom)*

### 1.3 Form-level settings
**"..."** (top-right of form editor) → **Settings**:
- ✅ **Only people in my organization can respond**
- ✅ **Record name**
- ❌ **One response per person**
- ❌ **Accept responses** *(turn ON only when ready to launch)*

### 1.4 Test
1. **Preview** → fill it as a Pride Month table → Submit. Then fill it again as a CCR Promotion entry on the same date → Submit. (Two separate submissions, one per activity.)
2. **Responses** → click the Excel icon → confirm columns match what's in `shannon-reporting-notes.md`. The two submissions should appear as two rows.
3. Delete the test responses (Responses → "..." → **Delete all responses**).

---

## Form 2: Student Engagement - Visitor Tracking

### 2.1 Create the form
- `forms.office.com` → **+ New Form**
- **Title:** `Student Engagement - Visitor Tracking`
- **Description:**
  > Welcome! Use this form to log visitor inquiries at the welcome desk. Submit at the end of every time block (Morning / Afternoon), or every hour during peak times (Welcome Week, exam season). Skip past categories that didn't come up — leave them blank. Blank means zero.

### 2.2 Top-of-form questions (no section yet)

| Q | Type | Question | Required | Settings |
|---|------|----------|----------|----------|
| 1 | Choice | `Campus` | ✅ | `Waterloo`, `Doon`, `Reuter`, `Cambridge`. **Drop-down list: ON.** |
| 2 | Choice | `Time block this submission covers` | ✅ | Options: `Morning (open – 12pm)`, `Afternoon (12 – close)`. Multiple answers: OFF. Drop-down list: OFF. |
| 3 | Number | `How many people did you help during this time block?` | ✅ | Apply Number pattern. |

### 2.3 Sections (apply Number pattern to every category — Required: OFF)

> Add a Section with the title shown, then add one Number question per category. The order below is the recommended order at launch, but the order is purely cosmetic — Forms auto-numbers, and the column position in the Excel export follows whichever order you build them in.

#### Section 1: Common Help
*(optional description: "These are the highest-frequency inquiries — fill counts here first.")*
- `Wayfinding – General`
- `OneCard`
- `IT Support`
- `Bus Pass / Transportation`
- `Parking`
- `Timetable / Registration Concern`

#### Section 2: Academic & Registration
- `Student Fees / Student Financial Services`
- `Learning Services / Math Help / Tutors`
- `Want to Change Program`
- `Connect with Faculty / Program Coordinator / Chair`

#### Section 3: Health & Wellness
- `Health Insurance`
- `Mental Health Support / Counselling`
- `Medical Clinic / Medical Care`

#### Section 4: Housing & Career
- `Housing / Accommodation`
- `Job Search / Career Services`

#### Section 5: International
- `Immigration / International Student Advising Referral`
- `International Transition Services`
- `International Admissions – Second Program`

#### Section 6: Library
- `Library – Tech Loans / TeachMeTech`
- `Library – Research / Writing Consultants`
- `Library – Academic Integrity`

#### Section 7: CSI & Other
- `CSI – Frosh Kits`
- `CSI – Peer Advocates`
- `Others` *(Number, optional)*

Then add **one final question** (still inside Section 7, no need to start a new section):
- **Type:** Text → toggle **Long answer: ON**
- **Question:** `Others (Inquiry)`
- **Required:** OFF
- **Description / placeholder:** `If you logged anything under "Others" above, briefly describe what it was about.`

### 2.4 Form-level settings
Same as Form 1:
- ✅ Only people in my organization can respond
- ✅ Record name
- ❌ One response per person
- ❌ Accept responses *(until ready to launch)*

### 2.5 Test before launch
1. **Preview** → fill as a busy Doon Friday afternoon: Campus = Doon, Time block = Afternoon, Helped = 23, then Wayfinding 10, Bus Pass 4, OneCard 3, Timetable 2 (note the headcount-vs-sum gap by design). Skip everything else. Submit.
2. **Responses** → Excel icon → verify columns and that empty categories appear as blank cells (not zeroes).
3. Delete the test response.

---

## After both forms are built

1. **Pilot for 2 weeks** with 1–2 volunteers per campus. Watch for confusion or skipped fields.
2. Read `shannon-reporting-notes.md` and rebuild any pivots that referenced categories by column letter — the column order has changed.
3. **Print `volunteer-instructions.md`** and post it at each desk.
4. Set a calendar reminder for **2 weeks after launch** to review with Shannon: are the totals making sense, are the new fields (Time block, Date of activity, Notes) being filled, are any categories so rarely used they could be merged or dropped?

## Sanity checks once data is flowing

- Pivot **Time block × Campus → headcount** → there should be a clear pattern (Doon afternoon usually heaviest).
- Pivot **Email × submission count** → every active volunteer should have multiple submissions per shift.
- Compare **headcount sum** vs **inquiry sum** per campus → inquiry sum should be ≥ headcount (one person, multiple inquiries). If they're equal or inquiry sum is lower, volunteers may be under-logging categories.
