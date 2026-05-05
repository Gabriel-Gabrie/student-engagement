// Option A prototype — static, browser-only.
// All data lives in localStorage. Nothing leaves the browser.

// ===== Constants =====

const CAMPUSES = ['Waterloo', 'Doon', 'Reuter', 'Cambridge'];

const TIME_BLOCKS = [
  { value: 'morning',   label: 'Morning (open – 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12 – 4pm)' },
  { value: 'evening',   label: 'Evening (4pm – close)' },
];

const VISITOR_SECTIONS = [
  { title: 'Common Help', items: [
    { key: 'wayfinding',                 label: 'Wayfinding – General' },
    { key: 'onecard',                    label: 'OneCard' },
    { key: 'it_support',                 label: 'IT Support' },
    { key: 'bus_pass',                   label: 'Bus Pass / Transportation' },
    { key: 'parking',                    label: 'Parking' },
    { key: 'timetable_registration',     label: 'Timetable / Registration Concern' },
  ]},
  { title: 'Academic & Registration', items: [
    { key: 'student_fees',               label: 'Student Fees / Student Financial Services' },
    { key: 'learning_services',          label: 'Learning Services / Math Help / Tutors' },
    { key: 'change_program',             label: 'Want to Change Program' },
    { key: 'connect_faculty',            label: 'Connect with Faculty / Program Coordinator / Chair' },
  ]},
  { title: 'Health & Wellness', items: [
    { key: 'health_insurance',           label: 'Health Insurance' },
    { key: 'mental_health',              label: 'Mental Health Support / Counselling' },
    { key: 'medical_clinic',             label: 'Medical Clinic / Medical Care' },
  ]},
  { title: 'Housing & Career', items: [
    { key: 'housing',                    label: 'Housing / Accommodation' },
    { key: 'job_search',                 label: 'Job Search / Career Services' },
  ]},
  { title: 'International', items: [
    { key: 'immigration_advising',       label: 'Immigration / International Student Advising Referral' },
    { key: 'intl_transition',            label: 'International Transition Services' },
    { key: 'intl_admissions_second',     label: 'International Admissions – Second Program' },
  ]},
  { title: 'Library', items: [
    { key: 'library_tech_loans',         label: 'Library – Tech Loans / TeachMeTech' },
    { key: 'library_research_writing',   label: 'Library – Research / Writing Consultants' },
    { key: 'library_academic_integrity', label: 'Library – Academic Integrity' },
  ]},
  { title: 'CSI & Other', items: [
    { key: 'csi_frosh_kits',             label: 'CSI – Frosh Kits' },
    { key: 'csi_peer_advocates',         label: 'CSI – Peer Advocates' },
    { key: 'others_count',               label: 'Others' },
  ]},
];

const VISITOR_CATEGORIES = VISITOR_SECTIONS.flatMap(s => s.items);

const OUTREACH_ACTIVITIES = [
  "Bell Let's Talk",
  'Black History Month',
  'Campus Welcome Day',
  'CCR and SSP Promotion',
  'Celebrating Diversity',
  'Health and Wellness Outreach',
  "International Women's Day",
  'Pride Month',
  'Sexual Health Week',
];

const VISITOR_KEY  = 'option_a_visitor_submissions';
const OUTREACH_KEY = 'option_a_outreach_submissions';

// In production, Microsoft Forms auto-captures the submitter's Name and Email
// from the Conestoga login. In this static demo, we simulate that with a fixed
// identity for live submissions. The seeded sample data uses varied identities
// so the multi-volunteer view is still meaningful.
const DEMO_USER = {
  name:  'Demo User',
  email: 'demo.user@conestogac.on.ca',
};

// ===== Storage =====

function loadSubmissions(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function saveSubmissions(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}
function nextId(prefix, list) {
  const max = list.reduce((m, s) => {
    const match = /\d+$/.exec(s.id || '');
    return match ? Math.max(m, parseInt(match[0], 10)) : m;
  }, 0);
  return `${prefix}${max + 1}`;
}

// ===== DOM helpers =====

function el(tag, attrs, children) {
  attrs = attrs || {};
  const node = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  if (children != null) {
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
  }
  return node;
}

function questionLabel(num, text, required) {
  return el('label', { class: 'q-label' }, [
    `${num}. ${text}`,
    required ? el('span', { class: 'required' }, ' *') : null,
  ]);
}

// ===== Visitor form =====

function renderVisitorForm(form) {
  let q = 1;

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'Campus', true),
    el('select', { name: 'campus', required: true }, [
      el('option', { value: '' }, 'Select your answer'),
      ...CAMPUSES.map(c => el('option', { value: c }, c)),
    ]),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'Time block this submission covers', true),
    el('div', { class: 'radio-list' },
      TIME_BLOCKS.map(tb => el('label', {}, [
        el('input', { type: 'radio', name: 'timeBlock', value: tb.value, required: true }),
        tb.label,
      ]))
    ),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'How many people did you help during this time block?', true),
    el('input', {
      type: 'number', name: 'peopleHelped', min: 0, step: 1,
      inputmode: 'numeric', required: true, placeholder: '0',
    }),
  ]));

  for (const section of VISITOR_SECTIONS) {
    form.appendChild(el('div', { class: 'section-header' }, section.title));
    for (const item of section.items) {
      form.appendChild(el('div', { class: 'question' }, [
        questionLabel(q++, item.label, false),
        el('input', {
          type: 'number', name: 'cat_' + item.key, min: 0, step: 1,
          inputmode: 'numeric', placeholder: '0',
        }),
      ]));
    }
  }

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'Others (Inquiry)', false),
    el('p', { class: 'help' }, 'If you logged anything under "Others" above, briefly describe what it was about.'),
    el('textarea', { name: 'othersInquiry', rows: 3, placeholder: 'Describe…' }),
  ]));

  form.appendChild(el('div', { class: 'actions' }, [
    el('button', { type: 'submit', class: 'submit' }, 'Submit'),
  ]));
}

function handleVisitorSubmit(e) {
  e.preventDefault();
  const data = new FormData(e.target);

  const counts = {};
  for (const item of VISITOR_CATEGORIES) {
    const v = data.get('cat_' + item.key);
    if (v == null || v === '') continue;
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && n > 0) counts[item.key] = n;
  }

  const list = loadSubmissions(VISITOR_KEY);
  list.push({
    id: nextId('v', list),
    submittedAt: new Date().toISOString(),
    submitterName:  DEMO_USER.name,
    submitterEmail: DEMO_USER.email,
    campus: data.get('campus'),
    timeBlock: data.get('timeBlock'),
    peopleHelped: parseInt(data.get('peopleHelped'), 10) || 0,
    counts,
    othersInquiry: (data.get('othersInquiry') || '').trim(),
  });
  saveSubmissions(VISITOR_KEY, list);

  window.location.href = 'submissions.html?flash=visitor';
}

// ===== Outreach form =====

function renderOutreachForm(form) {
  let q = 1;
  const today = new Date().toISOString().slice(0, 10);

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'Campus', true),
    el('select', { name: 'campus', required: true }, [
      el('option', { value: '' }, 'Select your answer'),
      ...CAMPUSES.map(c => el('option', { value: c }, c)),
    ]),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'Date of activity', true),
    el('input', { type: 'date', name: 'activityDate', required: true, value: today }),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'How many people did you help at this activity?', true),
    el('input', {
      type: 'number', name: 'peopleHelped', min: 0, step: 1,
      inputmode: 'numeric', required: true, placeholder: '0',
    }),
  ]));

  const list = el('div', { class: 'checkbox-list' },
    OUTREACH_ACTIVITIES.map(a => el('label', {}, [
      el('input', { type: 'checkbox', name: 'activity', value: a }),
      a,
    ]))
  );

  const otherCheck = el('input', { type: 'checkbox', name: 'activity', value: '__other__' });
  const otherText  = el('input', {
    type: 'text', name: 'otherActivity', placeholder: 'Describe the other activity…',
    disabled: true, class: 'inline-text',
  });
  otherCheck.addEventListener('change', () => {
    otherText.disabled = !otherCheck.checked;
    if (!otherCheck.checked) otherText.value = '';
    else otherText.focus();
  });
  list.appendChild(el('div', { class: 'other-row' }, [
    el('label', {}, [otherCheck, 'Other:']),
    otherText,
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'Outreach Activity (select all that apply)', true),
    list,
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel(q++, 'Notes / Highlights', false),
    el('textarea', {
      name: 'notes', rows: 3,
      placeholder: 'Anything Shannon should know — turnout, supply needs, great conversations…',
    }),
  ]));

  form.appendChild(el('div', { class: 'actions' }, [
    el('button', { type: 'submit', class: 'submit' }, 'Submit'),
  ]));
}

function handleOutreachSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);

  const all = data.getAll('activity');
  const activities = all.filter(a => a !== '__other__');
  const otherChecked = all.includes('__other__');
  const otherActivity = otherChecked ? (data.get('otherActivity') || '').trim() : '';

  if (activities.length === 0 && !otherActivity) {
    alert('Please select at least one outreach activity (or fill in "Other").');
    return;
  }

  const list = loadSubmissions(OUTREACH_KEY);
  list.push({
    id: nextId('o', list),
    submittedAt: new Date().toISOString(),
    submitterName:  DEMO_USER.name,
    submitterEmail: DEMO_USER.email,
    campus: data.get('campus'),
    activityDate: data.get('activityDate'),
    peopleHelped: parseInt(data.get('peopleHelped'), 10) || 0,
    activities,
    otherActivity,
    notes: (data.get('notes') || '').trim(),
  });
  saveSubmissions(OUTREACH_KEY, list);

  window.location.href = 'submissions.html?flash=outreach';
}

// ===== Submissions view =====

function renderSubmissionsView(root) {
  const flash = new URLSearchParams(window.location.search).get('flash');
  if (flash === 'visitor' || flash === 'outreach') {
    root.appendChild(el('div', { class: 'flash' },
      flash === 'visitor' ? 'Visitor submission saved.' : 'Outreach submission saved.'
    ));
  }

  root.appendChild(el('p', { class: 'muted' },
    'This is what Shannon would see when she opens the form responses in Excel. ' +
    'Use "Download CSV" to take it into Excel and pivot for real.'
  ));

  root.appendChild(el('div', { class: 'toolbar' }, [
    el('button', { class: 'toolbar-btn', onclick: () => downloadCsv('visitor')  }, 'Download Visitor CSV'),
    el('button', { class: 'toolbar-btn', onclick: () => downloadCsv('outreach') }, 'Download Outreach CSV'),
    el('button', { class: 'toolbar-btn', onclick: seedSamples }, 'Load sample data'),
    el('button', { class: 'toolbar-btn danger', onclick: clearAll }, 'Clear all'),
  ]));

  const visitor = loadSubmissions(VISITOR_KEY);
  root.appendChild(el('h2', {}, `Visitor submissions (${visitor.length})`));
  root.appendChild(buildVisitorSummary(visitor));
  root.appendChild(buildVisitorTable(visitor));

  const outreach = loadSubmissions(OUTREACH_KEY);
  root.appendChild(el('h2', {}, `Outreach submissions (${outreach.length})`));
  root.appendChild(buildOutreachSummary(outreach));
  root.appendChild(buildOutreachTable(outreach));
}

function buildVisitorSummary(submissions) {
  const totalHelped = submissions.reduce((a, s) => a + (s.peopleHelped || 0), 0);
  const totalInquiries = submissions.reduce((a, s) =>
    a + Object.values(s.counts || {}).reduce((b, n) => b + n, 0), 0);

  const byCampus = {};
  for (const s of submissions) byCampus[s.campus] = (byCampus[s.campus] || 0) + (s.peopleHelped || 0);
  const topCampus = Object.entries(byCampus).sort((a, b) => b[1] - a[1])[0];

  const catTotals = {};
  for (const s of submissions) {
    for (const [k, n] of Object.entries(s.counts || {})) {
      catTotals[k] = (catTotals[k] || 0) + n;
    }
  }
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat
    ? `${VISITOR_CATEGORIES.find(c => c.key === topCat[0])?.label || topCat[0]} (${topCat[1]})`
    : '—';

  return el('div', { class: 'summary' }, [
    summaryCard('Total people helped', totalHelped),
    summaryCard('Total inquiries logged', totalInquiries),
    summaryCard('Top campus by headcount', topCampus ? `${topCampus[0]} (${topCampus[1]})` : '—'),
    summaryCard('Top inquiry category', topCatLabel),
  ]);
}

function buildOutreachSummary(submissions) {
  const totalHelped = submissions.reduce((a, s) => a + (s.peopleHelped || 0), 0);
  const themeTotals = {};
  for (const s of submissions) {
    for (const a of (s.activities || [])) themeTotals[a] = (themeTotals[a] || 0) + (s.peopleHelped || 0);
  }
  const topTheme = Object.entries(themeTotals).sort((a, b) => b[1] - a[1])[0];

  return el('div', { class: 'summary' }, [
    summaryCard('Total people helped (outreach)', totalHelped),
    summaryCard('Outreach entries', submissions.length),
    summaryCard('Top outreach theme', topTheme ? `${topTheme[0]} (${topTheme[1]})` : '—'),
  ]);
}

function summaryCard(label, value) {
  return el('div', { class: 'summary-card' }, [
    el('div', { class: 'summary-value' }, String(value)),
    el('div', { class: 'summary-label' }, label),
  ]);
}

function buildVisitorTable(submissions) {
  if (submissions.length === 0) {
    return el('p', { class: 'muted' },
      'No submissions yet. Fill out the visitor form, or click "Load sample data" above.');
  }

  const headers = [
    'ID', 'Submitted at', 'Name', 'Email', 'Campus', 'Time block', 'How many helped',
    ...VISITOR_CATEGORIES.map(c => c.label),
    'Others (Inquiry)',
  ];
  const rows = submissions.map(s => {
    const cells = [
      s.id,
      formatTime(s.submittedAt),
      s.submitterName  || '',
      s.submitterEmail || '',
      s.campus,
      timeBlockLabel(s.timeBlock),
      String(s.peopleHelped ?? ''),
    ];
    for (const c of VISITOR_CATEGORIES) {
      const n = (s.counts || {})[c.key];
      cells.push(n ? String(n) : '');
    }
    cells.push(s.othersInquiry || '');
    return cells;
  });
  return buildTable(headers, rows, 7);
}

function buildOutreachTable(submissions) {
  if (submissions.length === 0) {
    return el('p', { class: 'muted' }, 'No submissions yet.');
  }
  const headers = [
    'ID', 'Submitted at', 'Name', 'Email', 'Campus', 'Date of activity',
    'How many helped', 'Outreach Activity', 'Other activity (text)', 'Notes',
  ];
  const rows = submissions.map(s => [
    s.id,
    formatTime(s.submittedAt),
    s.submitterName  || '',
    s.submitterEmail || '',
    s.campus,
    s.activityDate || '',
    String(s.peopleHelped ?? ''),
    [
      ...(s.activities || []),
      s.otherActivity ? `Other: ${s.otherActivity}` : null,
    ].filter(Boolean).join('; '),
    s.otherActivity || '',
    s.notes || '',
  ]);
  return buildTable(headers, rows, 6);
}

function buildTable(headers, rows, firstNumericIndex) {
  const wrap = el('div', { class: 'table-wrap' });
  const table = el('table');
  table.appendChild(el('thead', {}, [
    el('tr', {}, headers.map(h => el('th', {}, h))),
  ]));
  const tbody = el('tbody', {}, rows.map(r =>
    el('tr', {}, r.map((c, i) => {
      const numeric = i >= firstNumericIndex && /^\d*$/.test(c) && c !== '';
      const empty = c === '' || c == null;
      return el('td', { class: numeric ? 'num' : (empty ? 'empty' : '') }, empty ? '—' : String(c));
    }))
  ));
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleString();
}
function timeBlockLabel(v) {
  return TIME_BLOCKS.find(tb => tb.value === v)?.label || v || '';
}

// ===== CSV =====

function downloadCsv(type) {
  const key = type === 'visitor' ? VISITOR_KEY : OUTREACH_KEY;
  const subs = loadSubmissions(key);
  if (subs.length === 0) { alert('Nothing to export yet.'); return; }
  const csv = type === 'visitor' ? visitorCsv(subs) : outreachCsv(subs);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: `${type}-submissions.csv` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function visitorCsv(subs) {
  const headers = [
    'ID', 'Submitted at', 'Name', 'Email', 'Campus', 'Time block', 'How many helped',
    ...VISITOR_CATEGORIES.map(c => c.label),
    'Others (Inquiry)',
  ];
  const rows = subs.map(s => [
    s.id, s.submittedAt, s.submitterName || '', s.submitterEmail || '',
    s.campus, timeBlockLabel(s.timeBlock), s.peopleHelped ?? 0,
    ...VISITOR_CATEGORIES.map(c => (s.counts || {})[c.key] ?? ''),
    s.othersInquiry || '',
  ]);
  return toCsv([headers, ...rows]);
}

function outreachCsv(subs) {
  const headers = [
    'ID', 'Submitted at', 'Name', 'Email', 'Campus', 'Date of activity',
    'How many helped', 'Outreach Activity', 'Other activity (text)', 'Notes',
  ];
  const rows = subs.map(s => [
    s.id, s.submittedAt, s.submitterName || '', s.submitterEmail || '',
    s.campus, s.activityDate || '', s.peopleHelped ?? 0,
    [
      ...(s.activities || []),
      s.otherActivity ? `Other: ${s.otherActivity}` : null,
    ].filter(Boolean).join('; '),
    s.otherActivity || '',
    s.notes || '',
  ]);
  return toCsv([headers, ...rows]);
}

function toCsv(rows) {
  return rows.map(r => r.map(csvField).join(',')).join('\r\n');
}
function csvField(v) {
  const s = v == null ? '' : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ===== Sample data + clear =====

function clearAll() {
  if (!confirm('Delete all submissions saved in this browser?')) return;
  localStorage.removeItem(VISITOR_KEY);
  localStorage.removeItem(OUTREACH_KEY);
  window.location.reload();
}

function seedSamples() {
  const sampleSubmitters = {
    maya:   { submitterName: 'Maya Patel',  submitterEmail: 'maya.patel@conestogac.on.ca' },
    jordan: { submitterName: 'Jordan Lee',  submitterEmail: 'jordan.lee@conestogac.on.ca' },
    aaron:  { submitterName: 'Aaron Chen',  submitterEmail: 'aaron.chen@conestogac.on.ca' },
    priya:  { submitterName: 'Priya Singh', submitterEmail: 'priya.singh@conestogac.on.ca' },
    sam:    { submitterName: 'Sam Rivera',  submitterEmail: 'sam.rivera@conestogac.on.ca' },
  };

  const visitor = [
    { ...sampleSubmitters.maya,   campus: 'Doon',      timeBlock: 'morning',
      submittedAt: '2026-04-28T11:30:00', peopleHelped: 8,
      counts: { wayfinding: 6, onecard: 2, it_support: 1 } },
    { ...sampleSubmitters.maya,   campus: 'Doon',      timeBlock: 'afternoon',
      submittedAt: '2026-04-28T16:15:00', peopleHelped: 14,
      counts: { wayfinding: 12, bus_pass: 4, onecard: 3, timetable_registration: 2 } },
    { ...sampleSubmitters.jordan, campus: 'Waterloo',  timeBlock: 'afternoon',
      submittedAt: '2026-04-29T14:00:00', peopleHelped: 6,
      counts: { library_tech_loans: 3, library_research_writing: 2, mental_health: 1 } },
    { ...sampleSubmitters.aaron,  campus: 'Doon',      timeBlock: 'evening',
      submittedAt: '2026-04-29T19:00:00', peopleHelped: 12,
      counts: { wayfinding: 8, bus_pass: 3, csi_frosh_kits: 4, onecard: 2 } },
    { ...sampleSubmitters.priya,  campus: 'Reuter',    timeBlock: 'morning',
      submittedAt: '2026-04-30T11:00:00', peopleHelped: 4,
      counts: { immigration_advising: 2, intl_transition: 1, health_insurance: 1 } },
    { ...sampleSubmitters.sam,    campus: 'Cambridge', timeBlock: 'afternoon',
      submittedAt: '2026-04-30T15:45:00', peopleHelped: 9,
      counts: { wayfinding: 5, timetable_registration: 3, change_program: 1, job_search: 2 } },
  ];

  const outreach = [
    { ...sampleSubmitters.maya,   campus: 'Doon',      activityDate: '2026-03-08',
      submittedAt: '2026-03-08T17:00:00', peopleHelped: 47,
      activities: ["International Women's Day", 'Celebrating Diversity'],
      otherActivity: '', notes: 'Big turnout in atrium, ran out of pins by 1pm.' },
    { ...sampleSubmitters.jordan, campus: 'Waterloo',  activityDate: '2026-02-15',
      submittedAt: '2026-02-15T18:00:00', peopleHelped: 22,
      activities: ['Black History Month', 'CCR and SSP Promotion'],
      otherActivity: '', notes: '' },
    { ...sampleSubmitters.priya,  campus: 'Reuter',    activityDate: '2026-02-07',
      submittedAt: '2026-02-07T16:30:00', peopleHelped: 18,
      activities: ["Bell Let's Talk", 'Health and Wellness Outreach'],
      otherActivity: '', notes: 'Counselling sign-ups doubled vs last year.' },
    { ...sampleSubmitters.sam,    campus: 'Cambridge', activityDate: '2025-09-05',
      submittedAt: '2025-09-05T16:00:00', peopleHelped: 65,
      activities: ['Campus Welcome Day'],
      otherActivity: '', notes: 'Frosh kits very popular; need 50% more next year.' },
  ];

  const existingV = loadSubmissions(VISITOR_KEY);
  const existingO = loadSubmissions(OUTREACH_KEY);

  const newV = [];
  for (const s of visitor) {
    newV.push({ id: nextId('v', existingV.concat(newV)), othersInquiry: '', ...s });
  }
  const newO = [];
  for (const s of outreach) {
    newO.push({ id: nextId('o', existingO.concat(newO)), ...s });
  }

  saveSubmissions(VISITOR_KEY,  existingV.concat(newV));
  saveSubmissions(OUTREACH_KEY, existingO.concat(newO));
  window.location.reload();
}
