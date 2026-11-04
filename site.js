// Nav: mobile toggle + active section highlight
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

const links = [...menu.querySelectorAll('a')];
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

// Fade sections in as they scroll into view
const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

// ---------- Charts ----------
const ME = '#24508F', OTHERS = '#C9732C', TEAM = '#9AA0AA', INK = '#3D4A63', GRID = 'rgba(20,33,61,0.08)';

function table(id, head, rows) {
  const t = document.getElementById(id);
  t.innerHTML = '<tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr>' +
    rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('');
}

function charts() {
  Chart.defaults.font.family = 'Inter, -apple-system, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = INK;
  const tooltip = { backgroundColor: '#0C234B', padding: 10, cornerRadius: 6, titleFont: { weight: '600' }, displayColors: false };

  // 1. Adjectives: PRS counts out of 9, flagged when I also chose the word (SPI)
  const adj = [
    ['Hard-Working', 9, false], ['Growth-Oriented', 9, true], ['Self-Confident', 9, false],
    ['Caring', 8, false], ['Involved', 8, false], ['Problem-Solver', 8, false],
    ['Driven', 6, true], ['Well-Rounded', 6, true], ['Calm', 5, true],
    ['Curious', 4, true], ['Easygoing', 1, true], ['Spontaneous', 0, true],
  ];
  new Chart(document.getElementById('adjChart'), {
    type: 'bar',
    data: {
      labels: adj.map(a => a[2] ? a[0] + '  ●' : a[0]),
      datasets: [{
        data: adj.map(a => a[1]),
        backgroundColor: adj.map(a => a[2] ? ME : OTHERS),
        borderRadius: 4, borderSkipped: 'start', barThickness: 16, minBarLength: 3,
      }],
    },
    options: {
      indexAxis: 'y', maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...tooltip, callbacks: {
          title: c => adj[c[0].dataIndex][0],
          label: c => `${c.raw} of 9 respondents (${Math.round(c.raw / 9 * 100)}%)` + (adj[c.dataIndex][2] ? ' · also my pick' : ''),
        } },
      },
      scales: {
        x: { min: 0, max: 9, ticks: { stepSize: 3 }, grid: { color: GRID }, border: { display: false }, title: { display: true, text: 'Respondents (of 9)' } },
        y: { grid: { display: false }, border: { display: false } },
      },
    },
  });
  table('adjTable', ['Word', 'PRS respondents (of 9)', 'In my SPI?'], adj.map(a => [a[0], a[1], a[2] ? 'Yes' : 'No']));

  // 2. Motivators: my SPI ratings
  const mot = [
    ['Competition', 85], ['Business & profit', 80], ['Ideas & data', 80], ['Fun & variety', 75],
    ['Creativity', 75], ['Belonging', 70], ['Tradition', 70], ['Helping others', 50],
    ['Stability', 25], ['Fame & recognition', 10],
  ];
  new Chart(document.getElementById('motChart'), {
    type: 'bar',
    data: { labels: mot.map(m => m[0]), datasets: [{ data: mot.map(m => m[1]), backgroundColor: ME, borderRadius: 4, borderSkipped: 'start', barThickness: 16 }] },
    options: {
      indexAxis: 'y', maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => `My rating: ${c.raw} / 100` } } },
      scales: {
        x: { min: 0, max: 100, ticks: { stepSize: 25 }, grid: { color: GRID }, border: { display: false } },
        y: { grid: { display: false }, border: { display: false } },
      },
    },
  });
  table('motTable', ['Motivator', 'My rating (of 100)'], mot);

  // 3. Communication style quadrant
  const indiv = [[3, 1, 1], [3, 3, 3], [7, -1, 1], [3, 5, 1], [1, 1, 1], [5, -1, 1], [3, -1, 1]];
  const quadrants = {
    id: 'quadrants',
    beforeDraw(chart) {
      const { ctx, chartArea: a, scales: { x, y } } = chart;
      const cx = x.getPixelForValue(0), cy = y.getPixelForValue(0);
      ctx.save();
      ctx.strokeStyle = 'rgba(20,33,61,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, a.top); ctx.lineTo(cx, a.bottom); ctx.moveTo(a.left, cy); ctx.lineTo(a.right, cy); ctx.stroke();
      ctx.font = '600 11px Inter, sans-serif'; ctx.fillStyle = 'rgba(20,33,61,0.45)';
      const pad = 8;
      ctx.textAlign = 'left';  ctx.fillText('AMIABLE', a.left + pad, a.top + 16);
      ctx.textAlign = 'right'; ctx.fillText('EXPRESSIVE', a.right - pad, a.top + 16);
      ctx.textAlign = 'left';  ctx.fillText('ANALYTICAL', a.left + pad, a.bottom - pad);
      ctx.textAlign = 'right'; ctx.fillText('DRIVER', a.right - pad, a.bottom - pad);
      ctx.restore();
    },
  };
  new Chart(document.getElementById('styleChart'), {
    type: 'bubble',
    data: {
      datasets: [
        { label: 'Individual respondents', data: indiv.map(p => ({ x: p[0], y: p[1], r: 5 + p[2] * 3, n: p[2] })), backgroundColor: 'rgba(201,115,44,0.30)', borderColor: 'rgba(201,115,44,0.7)', borderWidth: 1 },
        { label: 'PRS average', data: [{ x: 3.44, y: 1.44, r: 10 }], backgroundColor: OTHERS, borderColor: '#fff', borderWidth: 2, pointStyle: 'rectRot' },
        { label: 'Me (SPI)', data: [{ x: 1.0, y: -3.0, r: 10 }], backgroundColor: ME, borderColor: '#fff', borderWidth: 2, pointStyle: 'rect' },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...tooltip, callbacks: {
          title: c => c[0].dataset.label,
          label: c => {
            const d = c.raw;
            const who = d.n ? ` · ${d.n} respondent${d.n > 1 ? 's' : ''}` : '';
            return `Proactivity ${d.x}, Reactivity ${d.y}${who}`;
          },
        } },
      },
      scales: {
        x: { min: -9, max: 9, ticks: { stepSize: 3 }, grid: { color: GRID }, border: { display: false }, title: { display: true, text: 'Proactivity →' } },
        y: { min: -9, max: 9, ticks: { stepSize: 3 }, grid: { color: GRID }, border: { display: false }, title: { display: true, text: 'Reactivity →' } },
      },
    },
    plugins: [quadrants],
  });
  table('styleTable', ['Source', 'Proactivity', 'Reactivity', 'Style'], [
    ['Me (SPI, attitudinal)', '1.0', '-3.0', 'Driver'],
    ['PRS average (9 respondents)', '3.44', '1.44', 'Expressive'],
    ['PRS respondents', '', '', '6 Expressive, 3 Driver'],
  ]);

  // 4. 360 trend across three rounds
  const rounds = ['Round 1 · Sep 15', 'Round 2 · Sep 27', 'Round 3 · Oct 11'];
  const me = [3.94, 3.39, 3.33], quality = [4.0, 3.0, 3.67], team = [3.52, 3.36, 3.38];
  new Chart(document.getElementById('teamChart'), {
    type: 'line',
    data: {
      labels: rounds,
      datasets: [
        { label: 'Me, all six behaviors', data: me, borderColor: ME, backgroundColor: ME, borderWidth: 2, pointRadius: 5, pointHoverRadius: 7, pointBorderColor: '#fff', pointBorderWidth: 2 },
        { label: 'Me, quality of deliverables', data: quality, borderColor: OTHERS, backgroundColor: OTHERS, borderWidth: 2, pointRadius: 5, pointHoverRadius: 7, pointBorderColor: '#fff', pointBorderWidth: 2, pointStyle: 'rectRot' },
        { label: 'Team average', data: team, borderColor: TEAM, backgroundColor: TEAM, borderWidth: 2, borderDash: [5, 4], pointRadius: 4, pointHoverRadius: 6 },
      ],
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 10, right: 8 } },
      clip: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltip, displayColors: true, callbacks: { label: c => ` ${c.dataset.label}: ${c.raw.toFixed(2)}` } } },
      scales: {
        y: { min: 2.75, max: 4.0, ticks: { stepSize: 0.25, callback: v => v.toFixed(2) }, grid: { color: GRID }, border: { display: false }, title: { display: true, text: 'Score (1 to 4 scale)' } },
        x: { grid: { display: false }, border: { display: false } },
      },
    },
  });
  table('teamTable', ['Round', 'Me (6 behaviors)', 'Me (quality)', 'Team average'],
    rounds.map((r, i) => [r, me[i].toFixed(2), quality[i].toFixed(2), team[i].toFixed(2)]));
}

if (window.Chart) (document.fonts ? document.fonts.ready : Promise.resolve()).then(charts);
else document.querySelectorAll('.chart-box').forEach(b => { b.style.height = 'auto'; b.innerHTML = '<p class="muted small">Chart could not load. Open "View data" below for the numbers.</p>'; });
