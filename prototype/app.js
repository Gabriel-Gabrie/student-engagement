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

function questionLabel(text, required) {
  return el('label', { class: 'q-label' }, [
    text,
    required ? el('span', { class: 'required' }, ' *') : null,
  ]);
}

// ===== Visitor form =====

function renderVisitorForm(form) {
  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('Campus', true),
    el('select', { name: 'campus', required: true }, [
      el('option', { value: '' }, 'Select your answer'),
      ...CAMPUSES.map(c => el('option', { value: c }, c)),
    ]),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('Time block this submission covers', true),
    el('div', { class: 'radio-list' },
      TIME_BLOCKS.map(tb => el('label', {}, [
        el('input', { type: 'radio', name: 'timeBlock', value: tb.value, required: true }),
        tb.label,
      ]))
    ),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('How many people did you help during this time block?', true),
    el('input', {
      type: 'number', name: 'peopleHelped', min: 0, step: 1,
      inputmode: 'numeric', required: true, placeholder: '0',
    }),
  ]));

  for (const section of VISITOR_SECTIONS) {
    form.appendChild(el('div', { class: 'section-header' }, section.title));
    for (const item of section.items) {
      form.appendChild(el('div', { class: 'question' }, [
        questionLabel(item.label, false),
        el('input', {
          type: 'number', name: 'cat_' + item.key, min: 0, step: 1,
          inputmode: 'numeric', placeholder: '0',
        }),
      ]));
    }
  }

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('Others (Inquiry)', false),
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
  const today = new Date().toISOString().slice(0, 10);

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('Campus', true),
    el('select', { name: 'campus', required: true }, [
      el('option', { value: '' }, 'Select your answer'),
      ...CAMPUSES.map(c => el('option', { value: c }, c)),
    ]),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('Date of activity', true),
    el('input', { type: 'date', name: 'activityDate', required: true, value: today }),
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('How many people did you help at this activity?', true),
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
    questionLabel('Outreach Activity (select all that apply)', true),
    list,
  ]));

  form.appendChild(el('div', { class: 'question' }, [
    questionLabel('Notes / Highlights', false),
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

// ===== Dashboard =====

const TEAL_PALETTE = ['#036c70', '#2a9d97', '#5cbab1', '#8fd2c8', '#bee5db', '#e0f2ec', '#0a4f54', '#077a7e'];

const dashCharts = {};

function renderDashboard(root) {
  if (typeof Chart === 'undefined') {
    root.innerHTML = '<div class="dash-empty">Chart library failed to load. Check your network connection.</div>';
    return;
  }

  const state = {
    dateRange: 'all',
    campuses: new Set(CAMPUSES),
    timeBlocks: new Set(TIME_BLOCKS.map(t => t.value)),
  };

  root.innerHTML = '';

  const filterBar = el('div', { id: 'dash-filters', class: 'filter-bar' });
  const kpiGrid   = el('div', { id: 'dash-kpis',    class: 'kpi-grid'   });
  const row1      = el('div', { id: 'dash-row1',    class: 'dash-row'   });
  const row2      = el('div', { id: 'dash-row2',    class: 'dash-row'   });
  const outHead   = el('h2',  {}, 'Outreach');
  const row3      = el('div', { id: 'dash-row3',    class: 'dash-row'   });
  const recentHead = el('h2', {}, 'Recent outreach activity');
  const recentBox = el('div', { id: 'dash-recent', class: 'recent-list' });

  root.appendChild(filterBar);
  root.appendChild(kpiGrid);
  root.appendChild(row1);
  root.appendChild(row2);
  root.appendChild(outHead);
  root.appendChild(row3);
  root.appendChild(recentHead);
  root.appendChild(recentBox);

  const loadFn = state.dateRange ? () => null : null;

  function rerender() {
    const visitorAll  = loadSubmissions(VISITOR_KEY);
    const outreachAll = loadSubmissions(OUTREACH_KEY);
    const visitor  = applyFilters(visitorAll,  state, 'visitor');
    const outreach = applyFilters(outreachAll, state, 'outreach');

    if (visitor.length === 0 && outreach.length === 0) {
      kpiGrid.innerHTML = '';
      row1.innerHTML = '';
      row2.innerHTML = '';
      row3.innerHTML = '';
      recentBox.innerHTML = '';
      kpiGrid.appendChild(el('div', { class: 'dash-empty' },
        'No data matches the current filters. Try widening the date range, or visit the Submissions page and click "Load sample data".'));
      return;
    }

    renderKpis(kpiGrid, visitor, outreach);
    renderHeatmapAndTopCats(row1, visitor);
    renderTrendAndSections(row2, visitor);
    renderOutreachRow(row3, outreach);
    renderRecentList(recentBox, outreach);
  }

  buildFilterBar(filterBar, state, rerender);
  rerender();
}

function applyFilters(items, state, type) {
  const cutoff = dateCutoff(state.dateRange);
  return items.filter(s => {
    const dateField = type === 'outreach' ? (s.activityDate || s.submittedAt) : s.submittedAt;
    if (cutoff && new Date(dateField) < cutoff) return false;
    if (!state.campuses.has(s.campus)) return false;
    if (type === 'visitor' && !state.timeBlocks.has(s.timeBlock)) return false;
    return true;
  });
}

function dateCutoff(range) {
  const now = new Date();
  if (range === 'last7')     return new Date(now.getTime() - 7  * 86400000);
  if (range === 'last30')    return new Date(now.getTime() - 30 * 86400000);
  if (range === 'thismonth') return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

function buildFilterBar(bar, state, rerender) {
  const dateSel = el('select', {
    onchange: e => { state.dateRange = e.target.value; rerender(); },
  }, [
    el('option', { value: 'all' },        'All time'),
    el('option', { value: 'last7' },      'Last 7 days'),
    el('option', { value: 'last30' },     'Last 30 days'),
    el('option', { value: 'thismonth' },  'This month'),
  ]);

  const campusChips = el('div', { class: 'chip-group' },
    CAMPUSES.map(c => chip(c, c, () => state.campuses, rerender))
  );
  const timeChips = el('div', { class: 'chip-group' },
    TIME_BLOCKS.map(tb => chip(tb.label.split(' ')[0], tb.value, () => state.timeBlocks, rerender))
  );

  bar.appendChild(el('div', { class: 'filter' }, [
    el('span', { class: 'filter-label' }, 'Date range'),
    dateSel,
  ]));
  bar.appendChild(el('div', { class: 'filter' }, [
    el('span', { class: 'filter-label' }, 'Campus'),
    campusChips,
  ]));
  bar.appendChild(el('div', { class: 'filter' }, [
    el('span', { class: 'filter-label' }, 'Time block'),
    timeChips,
  ]));
}

function chip(label, value, getSet, rerender) {
  const btn = el('button', { class: 'chip active', type: 'button' }, label);
  btn.addEventListener('click', () => {
    const set = getSet();
    if (set.has(value)) set.delete(value); else set.add(value);
    btn.classList.toggle('active', set.has(value));
    rerender();
  });
  return btn;
}

function kpiTile(value, label, sub) {
  return el('div', { class: 'kpi-tile' }, [
    el('div', { class: 'kpi-value' }, String(value)),
    sub ? el('div', { class: 'kpi-sub' }, sub) : null,
    el('div', { class: 'kpi-label' }, label),
  ]);
}

function renderKpis(host, visitor, outreach) {
  host.innerHTML = '';

  const totalHelped = visitor.reduce((a, s) => a + (s.peopleHelped || 0), 0);
  const totalInq    = visitor.reduce((a, s) => a + sumValues(s.counts), 0);

  const byCampus = {};
  for (const s of visitor) byCampus[s.campus] = (byCampus[s.campus] || 0) + (s.peopleHelped || 0);
  const topCampus = Object.entries(byCampus).sort((a, b) => b[1] - a[1])[0];

  const catTotals = {};
  for (const s of visitor) {
    for (const [k, n] of Object.entries(s.counts || {})) catTotals[k] = (catTotals[k] || 0) + n;
  }
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat
    ? VISITOR_CATEGORIES.find(c => c.key === topCat[0])?.label.replace('Library – ', '').replace(' / ', ' / ') || topCat[0]
    : '—';

  const volunteers = new Set();
  for (const s of visitor)  if (s.submitterEmail) volunteers.add(s.submitterEmail);
  for (const s of outreach) if (s.submitterEmail) volunteers.add(s.submitterEmail);

  const outreachHelped = outreach.reduce((a, s) => a + (s.peopleHelped || 0), 0);

  host.appendChild(kpiTile(totalHelped, 'People helped (visitor)'));
  host.appendChild(kpiTile(totalInq,    'Inquiries logged', `${visitor.length} submissions`));
  host.appendChild(kpiTile(topCampus ? topCampus[0] : '—', 'Top campus by headcount',
    topCampus ? `${topCampus[1]} helped` : ''));
  host.appendChild(kpiTile(topCatLabel, 'Top inquiry category',
    topCat ? `${topCat[1]} this period` : ''));
  host.appendChild(kpiTile(outreachHelped, 'People helped (outreach)',
    `${outreach.length} ${outreach.length === 1 ? 'event' : 'events'}`));
  host.appendChild(kpiTile(volunteers.size, 'Active volunteers'));
}

function sumValues(obj) {
  return Object.values(obj || {}).reduce((a, n) => a + n, 0);
}

function renderHeatmapAndTopCats(row, visitor) {
  row.innerHTML = '';

  const heatTile = el('div', { class: 'dash-tile' }, [
    el('div', { class: 'dash-tile-title' }, 'Engagement heatmap'),
    el('div', { class: 'dash-tile-sub' }, 'People helped — Campus × Time block'),
  ]);
  heatTile.appendChild(buildHeatmap(visitor));
  row.appendChild(heatTile);

  const topTile = el('div', { class: 'dash-tile' }, [
    el('div', { class: 'dash-tile-title' }, 'Top inquiry categories'),
    el('div', { class: 'dash-tile-sub' }, 'Sum of category counts across submissions'),
  ]);
  const wrap = el('div', { class: 'chart-wrap' });
  const canvas = el('canvas');
  wrap.appendChild(canvas);
  topTile.appendChild(wrap);
  row.appendChild(topTile);

  drawTopCategoriesChart(canvas, visitor);
}

function buildHeatmap(visitor) {
  const grid = el('div', { class: 'heatmap' });
  grid.appendChild(el('div', { class: 'heatmap-corner' }, ''));
  for (const tb of TIME_BLOCKS) {
    grid.appendChild(el('div', { class: 'heatmap-col-label' }, tb.label.split(' ')[0]));
  }

  const matrix = {};
  for (const c of CAMPUSES) {
    matrix[c] = { morning: 0, afternoon: 0, evening: 0 };
  }
  for (const s of visitor) {
    if (matrix[s.campus] && s.timeBlock in matrix[s.campus]) {
      matrix[s.campus][s.timeBlock] += s.peopleHelped || 0;
    }
  }

  const allValues = [];
  for (const c of CAMPUSES) for (const tb of TIME_BLOCKS) allValues.push(matrix[c][tb.value]);
  const maxVal = Math.max(1, ...allValues);

  for (const c of CAMPUSES) {
    grid.appendChild(el('div', { class: 'heatmap-row-label' }, c));
    for (const tb of TIME_BLOCKS) {
      const v = matrix[c][tb.value];
      const cls = v === 0 ? 'empty'
                : v < maxVal * 0.25 ? 'q1'
                : v < maxVal * 0.5  ? 'q2'
                : v < maxVal * 0.75 ? 'q3'
                : 'q4';
      grid.appendChild(el('div', { class: `heatmap-cell ${cls}` }, v === 0 ? '–' : String(v)));
    }
  }
  return grid;
}

function destroyChart(canvas) {
  const id = canvas.id || canvas.dataset.chartId;
  if (id && dashCharts[id]) {
    dashCharts[id].destroy();
    delete dashCharts[id];
  }
}

function drawTopCategoriesChart(canvas, visitor) {
  const totals = {};
  for (const s of visitor) {
    for (const [k, n] of Object.entries(s.counts || {})) totals[k] = (totals[k] || 0) + n;
  }
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const labels = top.map(([k]) => VISITOR_CATEGORIES.find(c => c.key === k)?.label || k);
  const data   = top.map(([, v]) => v);

  if (top.length === 0) {
    canvas.parentElement.replaceChildren(el('div', { class: 'dash-empty' }, 'No inquiries logged in this filter range.'));
    return;
  }

  const id = 'top-cats-' + Math.random().toString(36).slice(2);
  canvas.dataset.chartId = id;
  destroyChart(canvas);
  dashCharts[id] = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: '#036c70', borderRadius: 3 }] },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { precision: 0 }, grid: { color: '#eee' } },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    },
  });
}

function renderTrendAndSections(row, visitor) {
  row.innerHTML = '';

  const trendTile = el('div', { class: 'dash-tile' }, [
    el('div', { class: 'dash-tile-title' }, 'Daily people helped'),
    el('div', { class: 'dash-tile-sub' }, 'Trend over time across all campuses'),
  ]);
  const trendWrap = el('div', { class: 'chart-wrap' });
  const trendCanvas = el('canvas');
  trendWrap.appendChild(trendCanvas);
  trendTile.appendChild(trendWrap);
  row.appendChild(trendTile);

  const secTile = el('div', { class: 'dash-tile' }, [
    el('div', { class: 'dash-tile-title' }, 'Inquiry mix by campus'),
    el('div', { class: 'dash-tile-sub' }, 'Stacked by section bucket'),
  ]);
  const secWrap = el('div', { class: 'chart-wrap' });
  const secCanvas = el('canvas');
  secWrap.appendChild(secCanvas);
  secTile.appendChild(secWrap);
  row.appendChild(secTile);

  drawTrendChart(trendCanvas, visitor);
  drawSectionsChart(secCanvas, visitor);
}

function drawTrendChart(canvas, visitor) {
  const byDay = {};
  for (const s of visitor) {
    const day = (s.submittedAt || '').slice(0, 10);
    if (!day) continue;
    byDay[day] = (byDay[day] || 0) + (s.peopleHelped || 0);
  }
  const days = Object.keys(byDay).sort();
  const data = days.map(d => byDay[d]);

  if (days.length === 0) {
    canvas.parentElement.replaceChildren(el('div', { class: 'dash-empty' }, 'No submissions in this filter range.'));
    return;
  }

  const id = 'trend-' + Math.random().toString(36).slice(2);
  canvas.dataset.chartId = id;
  destroyChart(canvas);
  dashCharts[id] = new Chart(canvas, {
    type: 'line',
    data: { labels: days, datasets: [{
      data, borderColor: '#036c70', backgroundColor: 'rgba(3, 108, 112, 0.1)',
      fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#036c70',
    }]},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 11 } }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eee' } },
      },
    },
  });
}

function drawSectionsChart(canvas, visitor) {
  const sectionTotals = {};
  for (const c of CAMPUSES) {
    sectionTotals[c] = {};
    for (const sec of VISITOR_SECTIONS) sectionTotals[c][sec.title] = 0;
  }
  for (const s of visitor) {
    if (!sectionTotals[s.campus]) continue;
    for (const sec of VISITOR_SECTIONS) {
      let total = 0;
      for (const item of sec.items) total += (s.counts || {})[item.key] || 0;
      sectionTotals[s.campus][sec.title] += total;
    }
  }

  const datasets = VISITOR_SECTIONS.map((sec, i) => ({
    label: sec.title,
    data: CAMPUSES.map(c => sectionTotals[c][sec.title]),
    backgroundColor: TEAL_PALETTE[i % TEAL_PALETTE.length],
  }));

  const totalSum = datasets.reduce((a, d) => a + d.data.reduce((b, n) => b + n, 0), 0);
  if (totalSum === 0) {
    canvas.parentElement.replaceChildren(el('div', { class: 'dash-empty' }, 'No inquiries in this filter range.'));
    return;
  }

  const id = 'sec-' + Math.random().toString(36).slice(2);
  canvas.dataset.chartId = id;
  destroyChart(canvas);
  dashCharts[id] = new Chart(canvas, {
    type: 'bar',
    data: { labels: CAMPUSES, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eee' } },
      },
    },
  });
}

function renderOutreachRow(row, outreach) {
  row.innerHTML = '';

  const themeTile = el('div', { class: 'dash-tile' }, [
    el('div', { class: 'dash-tile-title' }, 'Top outreach themes'),
    el('div', { class: 'dash-tile-sub' }, 'People helped per theme (multi-select aware)'),
  ]);
  const themeWrap = el('div', { class: 'chart-wrap' });
  const themeCanvas = el('canvas');
  themeWrap.appendChild(themeCanvas);
  themeTile.appendChild(themeWrap);
  row.appendChild(themeTile);

  const campTile = el('div', { class: 'dash-tile' }, [
    el('div', { class: 'dash-tile-title' }, 'Outreach reach by campus'),
    el('div', { class: 'dash-tile-sub' }, 'Total people helped at outreach activities'),
  ]);
  const campWrap = el('div', { class: 'chart-wrap' });
  const campCanvas = el('canvas');
  campWrap.appendChild(campCanvas);
  campTile.appendChild(campWrap);
  row.appendChild(campTile);

  drawOutreachThemesChart(themeCanvas, outreach);
  drawOutreachCampusChart(campCanvas, outreach);
}

function drawOutreachThemesChart(canvas, outreach) {
  const themes = {};
  for (const s of outreach) {
    for (const a of (s.activities || [])) themes[a] = (themes[a] || 0) + (s.peopleHelped || 0);
    if (s.otherActivity) themes[`Other: ${s.otherActivity}`] = (themes[`Other: ${s.otherActivity}`] || 0) + (s.peopleHelped || 0);
  }
  const sorted = Object.entries(themes).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    canvas.parentElement.replaceChildren(el('div', { class: 'dash-empty' }, 'No outreach activities in this filter range.'));
    return;
  }

  const id = 'themes-' + Math.random().toString(36).slice(2);
  canvas.dataset.chartId = id;
  destroyChart(canvas);
  dashCharts[id] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: sorted.map(([k]) => k),
      datasets: [{ data: sorted.map(([, v]) => v), backgroundColor: '#2a9d97', borderRadius: 3 }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { precision: 0 }, grid: { color: '#eee' } },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    },
  });
}

function drawOutreachCampusChart(canvas, outreach) {
  const totals = {};
  for (const c of CAMPUSES) totals[c] = 0;
  for (const s of outreach) totals[s.campus] = (totals[s.campus] || 0) + (s.peopleHelped || 0);

  const sum = CAMPUSES.reduce((a, c) => a + totals[c], 0);
  if (sum === 0) {
    canvas.parentElement.replaceChildren(el('div', { class: 'dash-empty' }, 'No outreach activities in this filter range.'));
    return;
  }

  const id = 'oc-' + Math.random().toString(36).slice(2);
  canvas.dataset.chartId = id;
  destroyChart(canvas);
  dashCharts[id] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: CAMPUSES,
      datasets: [{ data: CAMPUSES.map(c => totals[c]), backgroundColor: '#5cbab1', borderRadius: 3 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eee' } },
      },
    },
  });
}

function renderRecentList(host, outreach) {
  host.innerHTML = '';
  if (outreach.length === 0) {
    host.appendChild(el('div', { class: 'dash-empty' }, 'No outreach activity in this filter range.'));
    return;
  }
  const sorted = outreach.slice().sort((a, b) => (b.activityDate || '').localeCompare(a.activityDate || ''));
  for (const s of sorted.slice(0, 6)) {
    host.appendChild(el('div', { class: 'recent-item' }, [
      el('div', { class: 'recent-date' }, s.activityDate || ''),
      el('div', { class: 'recent-body' }, [
        el('div', { class: 'recent-body-main' }, `${s.campus} — ${(s.activities || []).join(', ') || s.otherActivity || '(no theme)'}`),
        s.notes ? el('div', { class: 'recent-themes' }, s.notes) : null,
      ]),
      el('div', { class: 'recent-helped' }, `${s.peopleHelped || 0}`),
    ]));
  }
}
