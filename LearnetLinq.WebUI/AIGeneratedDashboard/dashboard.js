(function () {
  'use strict';
  const data = globalThis.AirtelData;
  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('en-IN');
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const program = id => data.programs.find(p => p.id === id);
  const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '—';
  const overdue = row => row.status !== 'Completed' && row.due < data.snapshot;
  function selectRows(filters) {
    const since = filters.period === 'month' ? '2026-10-01' : filters.period === 'quarter' ? '2026-08-01' : '2026-04-01';
    return data.enrollments.filter(r => r.enrolledAt >= since && r.enrolledAt <= data.snapshot && (filters.circle === 'all' || r.circle === filters.circle) && (filters.course === 'all' || r.programId === filters.course));
  }
  function summary(rows) {
    const completed = rows.filter(r => r.status === 'Completed').length;
    const assessed = rows.filter(r => r.score !== null);
    return { learners: new Set(rows.map(r => r.learnerId)).size, enrolled: rows.length, completed, assessed: assessed.length, passed: assessed.filter(r => r.score >= 70).length, overdue: rows.filter(overdue).length, inProgress: rows.filter(r => r.status === 'In progress').length, notStarted: rows.filter(r => r.status === 'Not started').length };
  }
  function batchRows(rows) {
    return data.batches.map(b => {
      const entries = rows.filter(r => r.batchId === b.id);
      if (!entries.length) return null;
      const s = summary(entries);
      return { ...b, entries, ...s, status: s.completed === s.enrolled ? 'Completed' : s.overdue ? 'Needs attention' : 'In progress', completion: s.completed / s.enrolled * 100 };
    }).filter(Boolean);
  }
  function csvCell(value) { let s = String(value == null ? '' : value); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }
  function csv(headers, rows) { return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n'); }
  globalThis.AirtelDashboard = { selectRows, summary, batchRows, overdue, csv, pct };
  const state = { view: 'overview', period: 'all', circle: 'all', course: 'all', query: '', risk: 'all', page: 1 };
  const pageSize = 8;
  let rows = [], tableRows = [], toastTimer;
  data.circles.forEach(c => $('circle').add(new Option(c, c)));
  data.programs.forEach(p => $('course').add(new Option(p.name, p.id)));
  function metrics(s) {
    const cards = [
      ['Enrolled learners', fmt(s.learners), `<strong>${fmt(s.enrolled)}</strong> training enrollments`, '♙', ''],
      ['Completion rate', pct(s.completed, s.enrolled), `<strong>${fmt(s.completed)}</strong> completed enrollments`, '✓', ''],
      ['Assessment pass rate', pct(s.passed, s.assessed), `<strong>${fmt(s.passed)} / ${fmt(s.assessed)}</strong> assessed · pass ≥ 70`, '◎', ''],
      ['Overdue training', fmt(s.overdue), `<strong>${pct(s.overdue, s.enrolled)}</strong> of selected enrollments`, '◷', 'warning']
    ];
    $('metrics').innerHTML = cards.map(([label, value, note, icon, type]) => `<article class="metric ${type}"><span class="metric-icon" aria-hidden="true">${icon}</span><p class="metric-label">${label}</p><p class="metric-value">${value}</p><div class="metric-note">${note}</div></article>`).join('');
  }
  function trend() {
    const startMonth = state.period === 'month' ? 10 : state.period === 'quarter' ? 8 : 4;
    const months = Array.from({ length: 11 - startMonth }, (_, i) => startMonth + i);
    const points = months.map(m => { const r = rows.filter(x => Number(x.enrolledAt.slice(5, 7)) === m); return { month: m, enrolled: r.length, completed: r.filter(x => x.status === 'Completed').length }; });
    const w = 600, h = 216, left = 38, right = 15, top = 15, bottom = 30;
    const max = Math.max(10, Math.ceil(Math.max(...points.map(p => p.enrolled), 0) / 50) * 50);
    const x = i => left + (points.length === 1 ? (w - left - right) / 2 : i / (points.length - 1) * (w - left - right));
    const y = n => h - bottom - n / max * (h - bottom - top);
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const grids = Array.from({ length: 5 }, (_, i) => `<line x1="${left}" y1="${y(max * i / 4)}" x2="${w - right}" y2="${y(max * i / 4)}" stroke="#eceef2" stroke-dasharray="3 4"/><text x="${left - 8}" y="${y(max * i / 4) + 3}" text-anchor="end" fill="#9299a5" font-size="9">${Math.round(max * i / 4)}</text>`).join('');
    const path = key => points.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p[key])}`).join(' ');
    const area = path('enrolled') + ` L ${x(points.length - 1)} ${h - bottom} L ${x(0)} ${h - bottom} Z`;
    const labels = points.map((p, i) => `<text x="${x(i)}" y="${h - 7}" text-anchor="middle" fill="#9299a5" font-size="9">${names[p.month - 1]}</text>`).join('');
    const dots = points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.enrolled)}" r="4" fill="#e40000" stroke="white" stroke-width="2"><title>${names[p.month - 1]}: ${p.enrolled} enrolled, ${p.completed} completed</title></circle><circle cx="${x(i)}" cy="${y(p.completed)}" r="3" fill="#138267" stroke="white" stroke-width="1.5"><title>${p.completed} completed</title></circle>`).join('');
    $('trend-chart').innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(points.map(p => names[p.month - 1] + ': ' + p.enrolled + ' enrolled, ' + p.completed + ' completed').join('; '))}"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e40000" stop-opacity=".1"/><stop offset="100%" stop-color="#e40000" stop-opacity="0"/></linearGradient></defs>${grids}<path d="${area}" fill="url(#area)"/><path d="${path('enrolled')}" fill="none" stroke="#e40000" stroke-width="2.5"/><path d="${path('completed')}" fill="none" stroke="#138267" stroke-width="2.5"/>${dots}${labels}</svg>`;
  }
  function outcomes(s) {
    const a = s.enrolled ? s.completed / s.enrolled * 100 : 0;
    const b = s.enrolled ? s.inProgress / s.enrolled * 100 : 0;
    $('outcomes').innerHTML = `<div class="donut" role="img" aria-label="${s.completed} completed, ${s.inProgress} in progress, ${s.notStarted} not started" style="background:conic-gradient(#138267 0% ${a}%,#f0b46b ${a}% ${a + b}%,#e9ecf1 ${a + b}% 100%)"><div class="donut-center"><strong>${pct(s.completed, s.enrolled)}</strong><small>completion rate</small></div></div>`;
    $('outcome-legend').innerHTML = [['Completed', s.completed, '#138267'], ['In progress', s.inProgress, '#f0b46b'], ['Not started', s.notStarted, '#b7bfcc']].map(([name, count, color]) => `<div class="outcome-item"><i style="background:${color}"></i>${name}<strong>${fmt(count)} <span style="color:#89909a;font-weight:400">· ${pct(count, s.enrolled)}</span></strong></div>`).join('');
  }
  function programs() {
    const rates = data.programs.map(p => ({ ...p, ...summary(rows.filter(r => r.programId === p.id)) })).filter(p => p.enrolled).sort((a, b) => b.completed / b.enrolled - a.completed / a.enrolled);
    $('program-chart').innerHTML = rates.length ? rates.map(p => `<div class="program-row"><span>${escape(p.name)}</span><div class="bar-track" role="img" aria-label="${escape(p.name)}: ${pct(p.completed, p.enrolled)} completed"><div class="bar-fill" style="width:${p.completed / p.enrolled * 100}%"></div></div><strong>${Math.round(p.completed / p.enrolled * 100)}%</strong></div>`).join('') : '<p class="empty">No enrollments match these filters.</p>';
    return rates;
  }
  function insights(s, rates) {
    const weakest = rates.slice().sort((a, b) => a.completed / a.enrolled - b.completed / b.enrolled)[0];
    const failed = s.assessed - s.passed;
    const items = [
      [s.overdue ? `${fmt(s.overdue)} enrollments need a follow-up` : 'No overdue training in this selection', s.overdue ? 'Reconnect learners with their trainers to finish overdue training.' : 'All incomplete training is still within its due date.', 'Review overdue learners →', 'learners', 'risk'],
      [weakest ? `${weakest.name}: ${pct(weakest.completed, weakest.enrolled)} completed` : 'No program data in this selection', weakest ? (weakest.completed / weakest.enrolled < .8 ? 'Below the 80% demo target. Review cohort age and delivery blockers.' : 'Above the 80% demo target. Monitor upcoming cohorts.') : 'Choose another circle or program to explore training activity.', 'Explore training batches →', 'batches', 'all'],
      [failed ? `${fmt(failed)} assessment attempts below pass score` : 'No failed assessments in this selection', 'The demo pass score is 70. Review learner scores to plan refresher sessions.', 'View learner results →', 'learners', 'all']
    ];
    $('insights').innerHTML = items.map(([title, text, action, view, risk], i) => `<div class="insight"><span class="insight-number">0${i + 1}</span><div><h3>${escape(title)}</h3><p>${escape(text)}</p><button class="text-button" data-insight-view="${view}" data-insight-risk="${risk}">${action}</button></div></div>`).join('');
  }
  function circleTable() {
    $('circle-table').innerHTML = data.circles.map(c => ({ name: c, ...summary(rows.filter(r => r.circle === c)) })).filter(c => c.enrolled).map(c => `<tr><td><button class="circle-name" data-circle="${escape(c.name)}">${escape(c.name)} ↗</button></td><td>${fmt(c.learners)}</td><td>${fmt(c.enrolled)}</td><td><strong>${pct(c.completed, c.enrolled)}</strong><div class="mini-progress"><span style="width:${c.completed / c.enrolled * 100}%"></span></div></td><td>${pct(c.passed, c.assessed)}</td><td><span class="pill ${c.overdue ? 'amber' : 'green'}">${c.overdue}</span></td></tr>`).join('') || '<tr><td colspan="6" class="empty">No circle data matches these filters.</td></tr>';
  }
  function recordSelection() {
    const learnerView = state.view === 'learners';
    const source = learnerView ? rows : batchRows(rows);
    const q = state.query.trim().toLowerCase();
    return source.filter(r => {
      const isRisk = learnerView ? overdue(r) : r.overdue > 0;
      if (state.risk === 'risk' && !isRisk) return false;
      if (state.risk === 'complete' && r.status !== 'Completed') return false;
      const haystack = learnerView ? `${r.learnerId} ${r.learnerName} ${r.batchId} ${r.circle} ${program(r.programId).name}` : `${r.id} ${r.trainer} ${r.circle} ${program(r.programId).name}`;
      return !q || haystack.toLowerCase().includes(q);
    });
  }
  function records() {
    const learnerView = state.view === 'learners';
    $('records-title').textContent = learnerView ? 'Learner progress' : 'Training batches';
    $('records-subtitle').textContent = learnerView ? 'Individual enrollments, assessment scores, and due dates' : 'Delivery health and progress, at a glance';
    $('records-caption').textContent = learnerView ? 'Synthetic learner enrollments' : 'Synthetic training batches';
    $('search').placeholder = learnerView ? 'Search learner, program or batch…' : 'Search batch, program or trainer…';
    const heads = learnerView ? ['Learner / ID', 'Learning program', 'Circle', 'Progress', 'Score', 'Status', 'Due date'] : ['Batch / Program', 'Circle', 'Trainer', 'Enrolled', 'Completion', 'Status', 'Details'];
    $('records-head').innerHTML = '<tr>' + heads.map(h => `<th scope="col">${h}</th>`).join('') + '</tr>';
    tableRows = recordSelection();
    const pages = Math.max(1, Math.ceil(tableRows.length / pageSize));
    state.page = Math.min(state.page, pages);
    const first = (state.page - 1) * pageSize;
    $('records-body').innerHTML = tableRows.slice(first, first + pageSize).map(r => learnerView ? `<tr><td><strong>${escape(r.learnerName)}</strong><small>${r.learnerId} · ${r.batchId}</small></td><td>${escape(program(r.programId).name)}</td><td>${escape(r.circle)}</td><td>${r.progress}%<div class="mini-progress"><span style="width:${r.progress}%"></span></div></td><td>${r.score === null ? '—' : `<span class="pill ${r.score >= 70 ? 'green' : 'red'}">${r.score} / 100</span>`}</td><td><span class="pill ${overdue(r) ? 'amber' : r.status === 'Completed' ? 'green' : 'gray'}">${overdue(r) ? 'Overdue' : r.status}</span></td><td>${r.due}</td></tr>` : `<tr><td><strong>${r.id}</strong><small>${escape(program(r.programId).name)}</small></td><td>${escape(r.circle)}</td><td>${escape(r.trainer)}</td><td>${r.enrolled} / ${r.capacity}</td><td>${pct(r.completed, r.enrolled)}<div class="mini-progress"><span style="width:${r.completion}%"></span></div></td><td><span class="pill ${r.overdue ? 'amber' : r.status === 'Completed' ? 'green' : 'gray'}">${r.status}</span></td><td><button class="text-button" data-batch="${r.id}" style="margin:0" aria-label="View batch ${r.id}">View ↗</button></td></tr>`).join('') || `<tr><td colspan="${heads.length}" class="empty">No records match your selection.<br>Try another search or reset the filters.</td></tr>`;
    $('record-count').textContent = `${fmt(tableRows.length)} ${learnerView ? 'enrollments' : 'batches'}`;
    $('page-info').textContent = tableRows.length ? `Showing ${first + 1}–${Math.min(first + pageSize, tableRows.length)} of ${fmt(tableRows.length)} · Page ${state.page} / ${pages}` : '0 records';
    $('previous').disabled = state.page <= 1;
    $('next').disabled = state.page >= pages;
    document.querySelectorAll('[data-risk]').forEach(b => { b.classList.toggle('active', b.dataset.risk === state.risk); b.setAttribute('aria-pressed', String(b.dataset.risk === state.risk)); });
  }
  function report(s) {
    $('report-summary').innerHTML = [['Reporting period', $('period').selectedOptions[0].text], ['Circle', state.circle === 'all' ? 'All circles' : state.circle], ['Learning program', state.course === 'all' ? 'All programs' : program(state.course).name], ['Unique learners', fmt(s.learners)], ['Enrollments', fmt(s.enrolled)], ['Completion rate', pct(s.completed, s.enrolled)], ['Assessment pass rate', pct(s.passed, s.assessed)], ['Overdue enrollments', fmt(s.overdue)]].map(([k, v]) => `<div class="report-line"><span>${k}</span><strong>${escape(v)}</strong></div>`).join('');
  }
  function render() {
    rows = selectRows(state);
    const s = summary(rows);
    metrics(s); trend(); outcomes(s); insights(s, programs()); circleTable(); records(); report(s);
    $('filter-summary').textContent = `${fmt(s.enrolled)} synthetic enrollments · ${fmt(s.learners)} unique learners · ${state.circle === 'all' ? 'All circles' : state.circle} · ${$('period').selectedOptions[0].text}`;
  }
  function setView(view) {
    state.view = ['overview', 'batches', 'learners', 'reports'].includes(view) ? view : 'overview';
    const titles = { overview: ['A clearer view of learning.', 'Track training delivery, learner outcomes, and where to focus next.', 'Overview'], batches: ['Every cohort. One clear view.', 'Monitor training delivery and catch overdue enrollments early.', 'Training batches'], learners: ['Keep every learner moving.', 'Explore progress, assessment results, and training that needs attention.', 'Learner progress'], reports: ['From insight to evidence.', 'Export your snapshot and explore the AI-assisted assignment deliverables.', 'Reports & evidence'] };
    const [title, description, breadcrumb] = titles[state.view];
    $('page-title').textContent = title; $('page-description').textContent = description; $('breadcrumb').textContent = breadcrumb;
    $('overview-view').hidden = state.view !== 'overview'; $('records-panel').hidden = state.view === 'reports'; $('reports-view').hidden = state.view !== 'reports';
    document.querySelectorAll('[data-view]').forEach(a => { a.classList.toggle('active', a.dataset.view === state.view); if (a.dataset.view === state.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    state.query = ''; state.risk = 'all'; state.page = 1; $('search').value = ''; render();
  }
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500); }
  function download(name, headers, values) {
    const url = URL.createObjectURL(new Blob([csv(headers, values)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('CSV exported with your current filters.');
  }
  function exportSummary() {
    const s = summary(rows);
    download('AirtelLMS-summary-2026-10-14.csv', ['Metric', 'Value', 'Data type'], Object.entries({ Snapshot: data.snapshot, Period: $('period').selectedOptions[0].text, Circle: state.circle, Program: state.course, Learners: s.learners, Enrollments: s.enrolled, Completed: s.completed, CompletionRate: pct(s.completed, s.enrolled), Assessed: s.assessed, Passed: s.passed, PassRate: pct(s.passed, s.assessed), Overdue: s.overdue }).map(([k, v]) => [k, v, 'Synthetic']));
  }
  $('export').addEventListener('click', () => {
    if (state.view === 'reports') { exportSummary(); return; }
    if (state.view === 'learners') download('AirtelLMS-learners-2026-10-14.csv', ['Enrollment', 'Learner ID', 'Learner', 'Batch', 'Program', 'Circle', 'Progress', 'Score', 'Status', 'Due', 'Synthetic'], tableRows.map(r => [r.id, r.learnerId, r.learnerName, r.batchId, program(r.programId).name, r.circle, r.progress, r.score, overdue(r) ? 'Overdue' : r.status, r.due, true]));
    else download('AirtelLMS-batches-2026-10-14.csv', ['Batch', 'Program', 'Circle', 'Trainer', 'Enrolled', 'Completed', 'Completion rate', 'Overdue', 'Status', 'Start', 'Due', 'Synthetic'], tableRows.map(r => [r.id, program(r.programId).name, r.circle, r.trainer, r.enrolled, r.completed, pct(r.completed, r.enrolled), r.overdue, r.status, r.start, r.due, true]));
  });
  $('export-summary').addEventListener('click', exportSummary);
  ['period', 'circle', 'course'].forEach(key => $(key).addEventListener('change', () => { state[key] = $(key).value; state.page = 1; render(); }));
  $('reset').addEventListener('click', () => { ['period', 'circle', 'course'].forEach(k => { state[k] = 'all'; $(k).value = 'all'; }); state.query = ''; state.risk = 'all'; state.page = 1; $('search').value = ''; render(); });
  $('search').addEventListener('input', () => { state.query = $('search').value; state.page = 1; records(); });
  $('previous').addEventListener('click', () => { state.page = Math.max(1, state.page - 1); records(); });
  $('next').addEventListener('click', () => { state.page++; records(); });
  document.addEventListener('click', event => {
    const risk = event.target.closest('[data-risk]'); if (risk) { state.risk = risk.dataset.risk; state.page = 1; records(); }
    const circle = event.target.closest('[data-circle]'); if (circle) { state.circle = circle.dataset.circle; $('circle').value = state.circle; state.page = 1; render(); }
    const insight = event.target.closest('[data-insight-view]'); if (insight) { location.hash = insight.dataset.insightView; setView(insight.dataset.insightView); state.risk = insight.dataset.insightRisk; records(); $('records-panel').scrollIntoView({ block: 'start' }); }
    const batchButton = event.target.closest('[data-batch]'); if (batchButton) {
      const b = batchRows(rows).find(r => r.id === batchButton.dataset.batch);
      $('detail-title').textContent = b.id + ' · ' + program(b.programId).name;
      $('detail-body').innerHTML = `<div class="detail-meta">${[['Circle', b.circle], ['Trainer', b.trainer], ['Start', b.start], ['Due', b.due], ['Completion', pct(b.completed, b.enrolled)], ['Overdue', b.overdue]].map(([k, v]) => `<div><small>${k}</small><strong>${escape(v)}</strong></div>`).join('')}</div><p class="detail-note">${b.enrolled} synthetic enrollments · ${b.completed} completed · ${b.passed} passed out of ${b.assessed} assessed. Showing the first 10 enrollments; the learner view contains all records.</p><div class="table-scroll"><table><thead><tr><th scope="col">Learner</th><th scope="col">Progress</th><th scope="col">Score</th><th scope="col">Status</th></tr></thead><tbody>${b.entries.slice(0, 10).map(r => `<tr><td>${escape(r.learnerName)}</td><td>${r.progress}%</td><td>${r.score === null ? '—' : r.score}</td><td>${overdue(r) ? 'Overdue' : r.status}</td></tr>`).join('')}</tbody></table></div>`;
      $('details').showModal();
    }
  });
  $('close-dialog').addEventListener('click', () => $('details').close());
  window.addEventListener('hashchange', () => {
    const view = location.hash.slice(1);
    if (view !== state.view) setView(view);
  });
  setView(location.hash.slice(1));
})();
