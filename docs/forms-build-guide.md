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

### How to add a multi-select Choice question with "Other"
1. **+ Add new** → **Choice**.
2. Type the question.
3. Add options one per line.
4. Click **Add "Other" option** at the bottom of the option list — Forms wires up a free-text input to that choice automatically.
5. **"..."** → toggle **Multiple answers** ON.
6. Drop-down list: OFF.

---

## Form 1: Student Engagement - Outreach Tracking

### 1.1 Create the form
- `forms.office.com` → **+ New Form**
- **Title:** `Student Engagement - Outreach Tracking`
- **Description:**
  > Welcome! Use this form to log outreach activities. Submit one entry per day worked, even for multi-day campaigns (Pride Month, Black History Month, etc.). Your Conestoga login is captured automatically as the submitter.

### 1.2 Add the questions in this order

| Q | Type | Question | Required | Settings |
|---|------|----------|----------|----------|
| 1 | Choice | `Campus` | ✅ | Options: `Waterloo`, `Doon`, `Reuter`, `Cambridge`. **Drop-down list: ON** (in "..."). |
| 2 | Date | `Date of activity` | ✅ | — |
| 3 | Number | `How many people did you help at this activity?` | ✅ | Apply Number pattern. |
| 4 | Choice (multi-select) | `Outreach Activity (select all that apply)` | ✅ | See option list below. **Multiple answers: ON.** Click **Add "Other" option**. |
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
1. **Preview** → fill it as a Pride Month + CCR table, multi-select both → Submit.
2. **Responses** → click the Excel icon → confirm columns match what's in `shannon-reporting-notes.md`.
3. Delete the test response (Responses → "..." → **Delete all responses**).

---

## Form 2: Student Engagement - Visitor Tracking

### 2.1 Create the form
- `forms.office.com` → **+ New Form**
- **Title:** `Student Engagement - Visitor Tracking`
- **Description:**
  > Welcome! Use this form to log visitor inquiries at the welcome desk. Submit at the end of every time block (Morning / Afternoon / Evening), or every hour during peak times (Welcome Week, exam season). Skip past categories that didn't come up — leave them blank. Blank means zero.

### 2.2 Top-of-form questions (no section yet)

| Q | Type | Question | Required | Settings |
|---|------|----------|----------|----------|
| 1 | Choice | `Campus` | ✅ | `Waterloo`, `Doon`, `Reuter`, `Cambridge`. **Drop-down list: ON.** |
| 2 | Choice | `Time block this submission covers` | ✅ | Options: `Morning (open – 12pm)`, `Afternoon (12 – 4pm)`, `Evening (4pm – close)`. Multiple answers: OFF. Drop-down list: OFF. |
| 3 | Number | `How many people did you help during this time block?` | ✅ | Apply Number pattern. |

### 2.3 Sections (apply Number pattern to every category — Required: OFF)

> Add a Section with the title shown, then add one Number question per item, in the order listed.

#### Section 1: Common Help
*(optional description: "These are the highest-frequency inquiries — fill counts here first.")*
1. `Wayfinding – General`
2. `OneCard`
3. `IT Support`
4. `Bus Pass / Transportation`
5. `Parking`
6. `Timetable / Registration Concern`

#### Section 2: Academic & Registration
1. `Student Fees / Student Financial Services`
2. `Learning Services / Math Help / Tutors`
3. `Want to Change Program`
4. `Connect with Faculty / Program Coordinator / Chair`

#### Section 3: Health & Wellness
1. `Health Insurance`
2. `Mental Health Support / Counselling`
3. `Medical Clinic / Medical Care`

#### Section 4: Housing & Career
1. `Housing / Accommodation`
2. `Job Search / Career Services`

#### Section 5: International
1. `Immigration / International Student Advising Referral`
2. `International Transition Services`
3. `International Admissions – Second Program`

#### Section 6: Library
1. `Library – Tech Loans / TeachMeTech`
2. `Library – Research / Writing Consultants`
3. `Library – Academic Integrity`

#### Section 7: CSI & Other
1. `CSI – Frosh Kits`
2. `CSI – Peer Advocates`
3. `Others` *(Number, optional)*

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
