/* ============ ICONS (lucide) ============ */
const ICONS = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  sheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8"/><path d="M11 8v8"/><path d="M15 8v8"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  checkc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xc: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/>',
  wifioff: '<path d="M12 20h.01"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/><path d="M5 12.86a10 10 0 0 1 5.17-2.69"/><path d="M19 12.86a10 10 0 0 0-2.01-1.52"/><path d="M2 8.82a15 15 0 0 1 4.18-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/><path d="m2 2 20 20"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  stop: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><path d="M15 9l-6 6"/><path d="m9 9 6 6"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22"/><path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 12l-6.1 3.2L12 21l-1.9-5.8L4 12l6.1-3.2Z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
};
const ic = (n, cls = '', st = '') => `<svg class="i ${cls}" viewBox="0 0 24 24"${st ? ` style="${st}"` : ''}>${ICONS[n] || ICONS.info}</svg>`;
const BRAND = `<img class="brand-mark" src="${LOGO_ICON}" alt="VHG">`;
(function () { const l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/png'; l.href = LOGO_ICON; document.head.appendChild(l); })();

/* ============ STORE ============ */
const KEY = 'vhg-qc-v5';
let DB, ME = null;
const UI = { open: {}, reviewTab: 'submitted', workFilter: 'all', workQ: '', poTab: 'active', repType: 'all', repQ: '', histQ: '', cam: {} };
function load() {
  try { DB = JSON.parse(localStorage.getItem(KEY)); } catch (e) { DB = null; }
  if (!DB || DB.v !== 6) { DB = seedDB(); DB.pos.forEach(p => { if (p.plyPO) p.reuse = { PLY: 'PLY-55672' }; }); save(); }
  applyCat(); save();
  ME = USERS.find(u => u.id === localStorage.getItem(KEY + '-me') && u.active !== false) || null;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { } }
function resetDemo() { localStorage.removeItem(KEY); load(); toast('Đã khôi phục dữ liệu demo', 'ok'); location.hash = ME ? '#/' + defaultRoute() : ''; render(); }

/* ============ HELPERS ============ */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const fd = iso => { if (!iso) return '—'; const x = new Date(iso); return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`; };
const fdt = iso => { if (!iso) return '—'; const x = new Date(iso); return `${pad(x.getDate())}/${pad(x.getMonth() + 1)} ${pad(x.getHours())}:${pad(x.getMinutes())}`; };
const sod = x => { const y = new Date(x); y.setHours(0, 0, 0, 0); return y.getTime(); };
const dayDiff = iso => Math.round((sod(iso) - sod(Date.now())) / DAY);
const num = n => Number(n || 0).toLocaleString(LANG === 'en' ? 'en-US' : 'vi-VN');
const money = n => '$' + Number(n || 0).toLocaleString('en-US');
const nowISO = () => new Date().toISOString();
const U = id => USERS.find(u => u.id === id) || { name: id === 'system' ? 'Hệ thống' : id, title: '' };
const initials = n => n.replace(/[^\p{L}\s.]/gu, '').split(/[\s.]+/).filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase();
const PO = id => DB.pos.find(p => p.id === id);
const INS = id => DB.ins.find(i => i.id === id);
const pill = (t, c = 'gray', nodot) => `<span class="pill ${c}${nodot ? ' nodot' : ''}">${t}</span>`;
const bg = k => PHOTO[k] ? `background-image:url(${PHOTO[k]})` : '';
function relDay(iso) {
  const n = dayDiff(iso);
  if (n < 0) return { t: `Quá hạn ${-n} ngày`, c: 'bad', k: 'overdue' };
  if (n === 0) return { t: 'Hôm nay', c: 'teal', k: 'today' };
  if (n === 1) return { t: 'Ngày mai', c: 'gray', k: 'upcoming' };
  return { t: fd(iso), c: 'gray', k: 'upcoming' };
}
function addLog(k, t, po) { DB.log.unshift({ at: nowISO(), who: ME ? ME.id : 'system', po, k, t }); }
const genId = (k, pre) => `${pre}${++DB.seq[k]}`;
function takePhoto(cat) { const s = PSET[cat] || PSET.dim; UI.cam[cat] = (UI.cam[cat] || 0) + 1; return s[(UI.cam[cat] + 2) % s.length]; }

/* ============ DOMAIN ============ */
const VERDICT = { PASS: ['Đạt', 'ok'], COND: ['Đạt có điều kiện', 'warn'], FAIL: ['Không đạt', 'bad'] };
const CONCL = { pass: ['Đạt', 'ok'], cond: ['Đạt có điều kiện', 'warn'], fail: ['Không đạt', 'bad'] };
const insPOs = i => i.pos.map(PO).filter(Boolean);
function wwKL(it) {
  if (it.kl === 'NA') return 'NA';
  const c = it.crit; if (c.some(x => x === 'F')) return 'F';
  return c.slice(0, 12).every(x => x === 'P') ? 'P' : '';
}
function dirSum(rows) { return rows.reduce((a, r) => ({ qo: a.qo + (+r.qo || 0), qi: a.qi + (+r.qi || 0), cr: a.cr + (+r.cr || 0), ma: a.ma + (+r.ma || 0), mi: a.mi + (+r.mi || 0), rj: a.rj + (+r.rj || 0) }), { qo: 0, qi: 0, cr: 0, ma: 0, mi: 0, rj: 0 }); }
const deltaE = (m, r) => (m && r && m.L !== '' && m.L != null) ? Math.sqrt((m.L - r.L) ** 2 + (m.a - r.a) ** 2 + (m.b - r.b) ** 2) : NaN;

const EVAL = {
  PLY(i) {
    const D = i.data; const miss = []; let pass = 0, fail = 0, pend = 0;
    PLY_CHECKS.forEach(c => { const r = D.checks[c.k] || {};
      if (!r.st) miss.push({ k: 'chk', id: c.k, t: `${c.t} — chưa đánh giá` }); else if (r.st === 'Pass') pass++; else if (r.st === 'Fail') fail++; else pend++;
      if (r.st && !(r.v || '').trim()) miss.push({ k: 'chk', id: c.k, t: `${c.t} — chưa nhập kết quả` });
      if (!(r.ph || []).length) miss.push({ k: 'chk', id: c.k, t: `${c.t} — cần ảnh` }); });
    if ((D.veneer || []).length < 2) miss.push({ k: 'sec', id: 'veneer', t: 'Ảnh veneer mặt trước / sau (tối thiểu 2)' });
    if (!(D.verify || {}).st) miss.push({ k: 'sec', id: 'verify', t: 'Đối chiếu mẫu PPS — chưa đánh giá' });
    const s = sev => (D.defects || []).filter(x => x.sev === sev).reduce((a, x) => a + (+x.qty || 0), 0);
    const crit = s('critical'), maj = s('major'), min = s('minor'), rej = +D.rej || 0;
    if (!D.conclusion) miss.push({ k: 'concl', id: 'concl', t: 'Chưa chọn kết luận (bước 15)' });
    return { total: PLY_CHECKS.length, done: pass + fail + pend, pass, fail, pend, score: Math.round(pass / PLY_CHECKS.length * 100), crit, maj, min, rej, insp: D.header.sampling, N: D.header.qty,
      verdict: crit || rej || fail ? 'FAIL' : maj || pend ? 'COND' : 'PASS', miss };
  },
  WW(i) {
    const D = i.data; const miss = []; let p = 0, f = 0, na = 0, open = 0;
    D.items.forEach((it, k) => { const kl = wwKL(it);
      if (kl === 'P') p++; else if (kl === 'F') f++; else if (kl === 'NA') na++; else { open++; miss.push({ k: 'item', id: k, t: `${it.code} (${it.part}) — chưa chấm đủ tiêu chí` }); }
      if (kl === 'NA' && !(it.dg || '').trim()) miss.push({ k: 'item', id: k, t: `${it.code} — N/A cần diễn giải` });
      if (kl === 'F' && !(it.dg || '').trim()) miss.push({ k: 'item', id: k, t: `${it.code} — tiêu chí không đạt cần diễn giải` });
      if ((kl === 'P' || kl === 'F') && Object.keys(it.ph || {}).length < 2) miss.push({ k: 'item', id: k, t: `${it.code} (${it.part}) — cần tối thiểu 2 ảnh` }); });
    if (i.kind !== 'recheck' && !i.codes && Object.keys(D.load || {}).length < 3) miss.push({ k: 'sec', id: 'load', t: 'Chất xếp – vận chuyển: cần tối thiểu 3 ảnh' });
    if (!D.conclusion) miss.push({ k: 'concl', id: 'concl', t: 'Chưa chọn kết luận (bước 15)' });
    const insp = D.items.reduce((a, it) => a + (wwKL(it) === 'NA' ? 0 : +it.slkiem || 0), 0), N = D.items.reduce((a, it) => a + (+it.slsx || 0), 0);
    return { total: D.items.length, done: p + f + na, pass: p, fail: f, na, score: p + f ? Math.round(p / (p + f) * 100) : 0, crit: 0, maj: f, min: 0, rej: 0, insp, N,
      verdict: f ? 'FAIL' : na || open ? 'COND' : 'PASS', miss };
  },
  DIR(i) { return evalRows(i, true); },
  FIN(i) { return evalRows(i, false); },
  PIG(i) {
    const D = i.data; const miss = []; let done = 0, total = 0, fail = 0;
    D.steps.slice(0, 9).forEach((s, k) => { total++; if (s.ok) done++; else miss.push({ k: 'step', id: k, t: `Bước ${k + 1}: ${PIG_STEPS[k][1]} — chưa hoàn tất` }); });
    PIG_SEC.forEach(sec => sec.rows.forEach((r, k) => { total++; const v = (D.sec[sec.k] || [])[k] || {}; if (v.r) { done++; if (v.r === 'F') fail++; } else miss.push({ k: 'sec', id: sec.k, t: `${sec.t.split('(')[0].trim()} · ${r[0]}` }); }));
    PIG_TIMES.forEach((t, k) => { total++; const x = D.xr[k]; if (x && x['D65/10'] && ['L', 'a', 'b'].every(c => x['D65/10'][c] !== '' && x['D65/10'][c] != null)) done++; else miss.push({ k: 'xr', id: k, t: `X-Rite ${t} — chưa đo` }); });
    D.kcma.forEach((r, k) => { total++; if (r.r) { done++; if (r.r === 'F') fail++; } else miss.push({ k: 'kcma', id: k, t: `KCMA · ${KCMA[k][0]} — chưa có kết quả` }); });
    const last = [...PIG_TIMES.keys()].reverse().find(k => D.xr[k] && D.xr[k]['D65/10'] && D.xr[k]['D65/10'].L !== '');
    const de = last != null ? deltaE(D.xr[last]['D65/10'], D.ref['D65/10']) : NaN;
    if (de > 1) fail++;
    if (!D.conclusion) miss.push({ k: 'concl', id: 'concl', t: 'Chưa chọn kết luận (bước 15)' });
    return { total, done, pass: done - fail, fail, score: Math.round(done / total * 100), crit: 0, maj: fail, min: 0, rej: 0, insp: D.approval.qty, N: D.approval.qty, de,
      verdict: fail ? 'FAIL' : done < total ? 'COND' : 'PASS', miss };
  },
};
function evalRows(i, isDir) {
  const D = i.data; const miss = []; const S = dirSum(D.rows || []);
  (D.rows || []).forEach((r, k) => { if (!(+r.qi > 0)) miss.push({ k: 'row', id: k, t: `${r.code} — chưa nhập SL kiểm` }); });
  if (isDir) {
    D.cp.forEach((c, k) => { if (!c.r) miss.push({ k: 'cp', id: k, t: `Control plan · ${DIR_CP[k].st} — chưa đánh giá` }); else if (c.r === 'NG' && !(c.note || '').trim()) miss.push({ k: 'cp', id: k, t: `Control plan · ${DIR_CP[k].st} — NG cần ghi chú` }); });
    const withPh = DIR_SECTIONS.filter(s => ((D.sec[s.k] || {}).ph || []).length).length;
    if (withPh < 4) miss.push({ k: 'sec', id: 'sec', t: `Ảnh theo công đoạn: cần tối thiểu 4 mục (đang có ${withPh})` });
    if ((S.ma + S.cr + S.mi) > 0 && !(D.defects || []).length) miss.push({ k: 'sec', id: 'defects', t: 'Có lỗi — cần ảnh lỗi kèm mô tả' });
  } else {
    D.pack.forEach((c, k) => { if (!c) miss.push({ k: 'pack', id: k, t: `Đóng gói · ${FIN_PACK[k]} — chưa đánh giá` }); });
    if (Object.keys(D.load || {}).length < 3) miss.push({ k: 'sec', id: 'load', t: 'Chất xếp container: cần tối thiểu 3 ảnh' });
  }
  if (!D.conclusion) miss.push({ k: 'concl', id: 'concl', t: 'Chưa chọn kết luận (bước 15)' });
  let over = false; (D.rows || []).forEach(r => { const A = aql(+r.qo || 1); if ((+r.ma || 0) > A.acMaj || (+r.mi || 0) > A.acMin) over = true; });
  const verdict = S.cr || S.rj ? 'FAIL' : over ? 'COND' : 'PASS';
  return { total: (D.rows || []).length, done: (D.rows || []).filter(r => +r.qi > 0).length, pass: S.qi - S.rj, fail: S.rj, score: S.qi ? Math.round((S.qi - S.rj) / S.qi * 100) : 0, crit: S.cr, maj: S.ma, min: S.mi, rej: S.rj, insp: S.qi, N: S.qo, verdict, miss };
}
function evalInsp(i) { if (!i.data || !EVAL[i.type]) return { total: 0, done: 0, score: 0, crit: 0, maj: 0, min: 0, rej: 0, insp: 0, N: 0, verdict: 'COND', miss: [] }; return EVAL[i.type](i); }

/* coverage of a PO by inspection type */
function typeState(p, ty) {
  if (!p.plan.includes(ty)) return { state: 'na', list: [] };
  const list = DB.ins.filter(i => i.kind === 'qc' && i.type === ty && i.pos.includes(p.id));
  if (p.reuse && p.reuse[ty]) return { state: 'reused', list, from: INS(p.reuse[ty]) };
  const ap = list.filter(i => i.status === 'approved');
  let done = ap.length > 0;
  if (ty === 'WW' && done) { const cov = new Set(); ap.forEach(i => i.data.items.forEach(it => { if (it.po === p.id && ['P', 'F'].includes(wwKL(it))) cov.add(it.code + it.part); })); done = p.lines.every(l => cov.has(l.code + l.part)); }
  if (done) return { state: 'done', list };
  if (list.some(i => ['submitted', 'offline'].includes(i.status))) return { state: 'review', list };
  const open = list.filter(i => i.status !== 'approved');
  if (open.length) return { state: open.every(i => blockedBy(i)) ? 'waiting' : 'progress', list };
  return { state: ap.length ? 'partial' : 'none', list };
}
const TS_UI = { done: ['Đã duyệt', 'ok'], reused: ['Dùng lại', 'teal'], review: ['Chờ duyệt', 'warn'], progress: ['Đang kiểm', 'info'], waiting: ['Chờ phiếu trước', 'gray'], partial: ['Đạt một phần', 'warn'], none: ['Chưa lập', 'gray'], na: ['Không áp dụng', 'gray'] };
function blockedBy(i) {
  if (i.kind !== 'qc' || !['todo', 'draft'].includes(i.status)) return null;
  const miss = [];
  insPOs(i).forEach(p => (PREREQ[i.type] || []).forEach(t => { if (p.plan.includes(t) && !['done', 'reused'].includes(typeState(p, t).state)) miss.push({ po: p.id, type: t }); }));
  return miss.length ? miss : null;
}
const insState = i => blockedBy(i) ? 'blocked' : i.status;
const IS = { blocked: ['Chờ phiếu trước', 'gray'], todo: ['Cần làm', 'teal'], draft: ['Đang làm', 'info'], offline: ['Chờ đồng bộ', 'warn'], submitted: ['Chờ duyệt', 'warn'], returned: ['Trả bổ sung', 'bad'], approved: ['Đã duyệt', 'ok'] };
const isPill = i => { const s = IS[insState(i)]; return pill(s[0], s[1]); };
function poCheck(p) {
  const types = p.plan.map(t => ({ t, ...typeState(p, t) }));
  const conds = [
    { t: 'Đủ kết quả các loại đánh giá đã lập kế hoạch', ok: types.every(x => ['done', 'reused'].includes(x.state)), sub: types.filter(x => !['done', 'reused'].includes(x.state)).map(x => TYPES[x.t].short).join(', ') },
    { t: 'Không còn phiếu chờ duyệt / chờ đồng bộ', ok: !DB.ins.some(i => i.pos.includes(p.id) && ['submitted', 'offline'].includes(i.status)), sub: '' },
  ];
  return { types, conds, ready: conds.every(c => c.ok) };
}
function poState(p) { if (p.closed) return 'closed'; if (poCheck(p).ready) return 'ready'; if (DB.ins.some(i => i.pos.includes(p.id)) || p.reuse) return 'in_qc'; return 'planning'; }
const PS = { planning: ['Chờ lập kế hoạch', 'violet'], in_qc: ['Đang QC', 'info'], ready: ['Sẵn sàng chốt', 'teal'], closed: ['Đã chốt', 'ok'] };
const psPill = p => { const s = PS[poState(p)]; return pill(s[0], s[1], s[1] === 'solid'); };
const poQty = p => p.lines.reduce((a, l) => a + l.qty, 0);
function stagePct(p, k) { const st = PROD_STEPS.map((s, i) => [s, p.progress[i]]).filter(([s]) => s.g === k); return Math.round(st.reduce((a, [, v]) => a + v, 0) / st.length); }
const poPct = p => Math.round(p.progress.reduce((a, b) => a + b, 0) / p.progress.length);
function forecast(p) { if (!p.bottleneck || p.closed) return 0; return ({ RML: 1, WW: 3, PAINT: 5, FIN: 3, PACK: 2 }[p.bottleneck.g] || 2); }
function risk(p) { if (p.closed) return ['Đã chốt', 'ok']; const l = forecast(p); if (l >= 5) return ['Cao', 'bad']; if (l > 0) return ['Trung bình', 'warn']; return ['Thấp', 'ok']; }

/* ============ UI PRIMITIVES ============ */
function toast(msg, type = 'ok') {
  const box = document.getElementById('toasts'); if (!box) return;
  const el = document.createElement('div'); el.className = `toast ${type}`;
  el.innerHTML = `<span class="ti">${ic({ ok: 'check', bad: 'x', warn: 'alert', info: 'info' }[type], '', 'width:14px;height:14px')}</span><span>${msg}</span>`;
  box.appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 220); }, 3200);
}
function openModal({ title, sub = '', body, foot = '', size = '', drawer = false }) {
  const root = document.getElementById('layer');
  root.innerHTML = `<div class="overlay" onclick="closeModal()"></div><div class="${drawer ? 'drawer' : 'modal ' + size}" role="dialog" aria-modal="true">
    <div class="modal-h"><div class="ttl"><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><button class="icon-btn sm" aria-label="Đóng" onclick="closeModal()">${ic('x')}</button></div>
    <div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ''}</div>`;
}
function closeModal() { const r = document.getElementById('layer'); if (r) r.innerHTML = ''; }
let __cb = null;
function confirmBox(title, text, okLabel, cls, fn) { __cb = fn; openModal({ title, body: `<p class="muted">${text}</p>`, foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn ${cls}" onclick="const f=__cb;closeModal();f&&f()">${okLabel}</button>` }); }
function viewPhoto(k, cap) { const el = document.createElement('div'); el.className = 'lightbox'; el.onclick = () => el.remove(); el.innerHTML = `<div><img src="${PHOTO[k]}" alt=""><p>${esc(cap || '')}</p></div>`; document.body.appendChild(el); }
const empty = (t, s = '', icn = 'inbox') => `<div class="empty">${ic(icn)}<b>${t}</b>${s}</div>`;
const kv = (l, v) => `<div class="kv"><label>${l}</label><b title="${esc(String(v).replace(/<[^>]+>/g, ''))}">${v}</b></div>`;
const bar = (pct, color) => `<div class="bar"><i style="--w:${pct}%${color ? `;--c:${color}` : ''}"></i><b>${pct}%</b></div>`;
const segPick = b => b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
const gallery = (keys, caps = []) => keys.length ? `<div class="gallery">${keys.map((k, j) => `<figure><div class="img" style="${bg(k)}" onclick="viewPhoto('${k}','${esc(caps[j] || '')}')"></div>${caps[j] ? `<figcaption>${esc(caps[j])}</figcaption>` : ''}</figure>`).join('')}</div>` : '';

/* ============ ROUTER ============ */
function route() { const h = (location.hash || '').replace(/^#\/?/, ''); const [r, a, b] = h.split('/'); return { r: r || '', a: a && decodeURIComponent(a), b: b && decodeURIComponent(b) }; }
function go(path) { if (location.hash !== '#/' + path) location.hash = '#/' + path; else render(); }
const defaultRoute = () => !ME ? '' : isLead() ? 'dashboard' : 'work';
window.addEventListener('hashchange', () => { closeModal(); render(); window.scrollTo(0, 0); });

/* ============ NAV ============ */
const myIns = () => DB.ins.filter(i => isLead() || i.assignee === ME.id || (i.team || []).includes(ME.id));
function counts() {
  return { review: DB.ins.filter(i => i.status === 'submitted').length, syncErr: DB.syncLog.filter(s => !s.ok && !s.resolved).length,
    alerts: DB.alerts.filter(a => a.status === 'new').length,
    work: myIns().filter(i => !['approved', 'submitted'].includes(i.status)).length };
}
function navItems() {
  const c = counts();
  if (isLead()) return [
    { r: 'pos', t: 'Purchase Orders', m: 'PO', i: 'box' },
    { r: 'work', t: 'Lịch kiểm QC', m: 'Lịch kiểm', i: 'calendar', cnt: c.review },
    { r: 'dashboard', t: 'Tổng quan & Báo cáo', m: 'Báo cáo', i: 'dashboard', cnt: c.alerts, hot: 1 },
  ];
  return [{ r: 'work', t: 'Việc của tôi', m: 'Việc', i: 'clipboard', cnt: c.work }];
}
const ROUTE_ALIAS = { po: 'pos', merge: 'pos', task: 'work', review: 'work', inspect: 'work', report: 'dashboard', reports: 'dashboard' };
function notifications() {
  const out = [];
  if (isLead()) {
    DB.alerts.filter(a => a.status === 'new').forEach(a => out.push({ c: 'red', i: 'zap', t: `Cảnh báo nghiêm trọng · PO ${a.pos.join(', ')}`, s: a.title, at: a.at, go: 'dashboard' }));
    DB.ins.filter(i => i.status === 'submitted').forEach(i => out.push({ c: 'amber', i: 'inbox', t: `${i.id} chờ duyệt`, at: i.submittedAt, go: 'review/' + i.id }));
    DB.syncLog.filter(s => !s.ok && !s.resolved).forEach(s => out.push({ c: 'red', i: 'refresh', t: `Lỗi đồng bộ PO ${s.po}`, s: s.issues[0], at: s.at, go: 'sync' }));
  } else {
    myIns().filter(i => i.status === 'returned').forEach(i => out.push({ c: 'red', i: 'undo', t: `${i.id} bị trả bổ sung`, s: i.returnNote, at: i.review?.at, go: 'task/' + i.id }));
    myIns().filter(i => ['todo', 'draft'].includes(i.status) && relDay(i.due).k === 'today' && !blockedBy(i) && i.kind === 'qc').forEach(i => out.push({ c: 'teal', i: 'clipboard', t: `Hôm nay: ${i.title}`, s: TYPES[i.type].name, at: i.createdAt, go: 'task/' + i.id }));
  }
  return out.sort((a, b) => (b.at || '').localeCompare(a.at || ''));
}

/* ===== Điện thoại: bảng chuyển thành thẻ dọc (không phải kéo ngang) =====
   Mỗi ô nhận nhãn data-l lấy từ tiêu đề cột; CSS @media (max-width:640px) hiển thị "nhãn · giá trị".
   Bỏ qua bảng mẫu báo cáo (.paper) vì đó là bản in A4. */
function mobTables(root) {
  (root || document).querySelectorAll('table.tbl,table.mini-tbl').forEach(t => {
    if (t.closest('.paper,.paper-wrap')) return;
    const heads = []; t.querySelectorAll('thead tr:first-child th').forEach(th => { const n = +th.getAttribute('colspan') || 1; for (let k = 0; k < n; k++) heads.push(tr(th.textContent.trim())); });
    t.classList.add('mcard'); if (heads[0] === '#') t.classList.add('mhash');
    t.querySelectorAll('tbody tr').forEach(row => { let k = 0; [...row.children].forEach(td => { const n = +td.getAttribute('colspan') || 1; const l = n > 1 ? '' : (heads[k] || ''); if (td.getAttribute('data-l') !== l) td.setAttribute('data-l', l); if (n > 1) td.classList.add('mspan'); k += n; }); });
  });
}
/* bản mẫu báo cáo A4: trên điện thoại thu nhỏ vừa chiều ngang (chụm 2 ngón để phóng to) */
function fitPaper() { document.querySelectorAll('.paper-wrap').forEach(w => { const p = w.querySelector('.paper'); if (!p) return; p.style.zoom = ''; if (innerWidth > 640) return; p.style.zoom = Math.min(1, (w.clientWidth - 16) / p.scrollWidth).toFixed(3); }); }
addEventListener('resize', fitPaper);
let __mobT = 0;
new MutationObserver(() => { if (__mobT) return; __mobT = setTimeout(() => { __mobT = 0; mobTables(); fitPaper(); }); }).observe(document.documentElement, { childList: true, subtree: true });
/* ============ SHELL ============ */
function render() {
  const app = document.getElementById('app');
  if (!ME) { app.innerHTML = loginView(); return; }
  const rt = route(); if (!rt.r) { go(defaultRoute()); return; }
  const page = renderPage(rt); const cur = ROUTE_ALIAS[rt.r] || rt.r; const items = navItems();
  const dark = document.documentElement.dataset.theme === 'dark'; const noti = notifications();
  app.innerHTML = `<div class="shell">
  <aside class="sidebar"><div class="brand">${BRAND}<div><b>VHG QC</b><small>Quality Control Center</small></div></div>
    <nav class="side-nav">${items.filter(it => !it.sec).map(it => `<a class="nav-item ${cur === it.r ? 'on' : ''}" href="#/${it.r}">${ic(it.i)}<span class="trunc">${it.t}</span>${it.cnt ? `<span class="cnt ${it.hot ? 'hot' : ''}">${it.cnt}</span>` : ''}</a>`).join('')}</nav>
    <div class="side-foot"><div class="avatar">${initials(ME.name)}</div><div class="who"><b class="trunc">${ME.name}</b><small class="trunc">${ME.title}</small></div></div></aside>
  <div class="main">
    <header class="topbar"><a class="brand only-m" href="#/${defaultRoute()}" aria-label="Trang chủ">${BRAND}</a>
      <div class="search">${ic('search')}<input id="gsearch" placeholder="Tìm PO, mã hàng, phiếu…" autocomplete="off" oninput="doSearch(this.value)" onfocus="doSearch(this.value)" onblur="setTimeout(()=>{const p=document.getElementById('spop');p&&p.remove()},180)"><kbd>/</kbd></div>
      <div class="top-right"><button class="sync ${DB.online ? '' : 'off'}" title="Bấm để giả lập mất / có mạng" onclick="toggleOnline()"><span>${DB.online ? 'Đã đồng bộ' : `Offline${DB.outbox.length ? ' · ' + DB.outbox.length + ' chờ gửi' : ''}`}</span></button>
        <div style="position:relative"><button class="icon-btn" aria-label="Thông báo" onclick="toggleBell(event)">${ic('bell')}${noti.length ? '<span class="dot"></span>' : ''}</button><div id="bell"></div></div>
        ${langBtn()}<button class="icon-btn hide-m" aria-label="Giao diện" onclick="toggleTheme()">${ic(dark ? 'sun' : 'moon')}</button>
        ${`<div style="position:relative"><button class="icon-btn" aria-label="Menu" title="Menu" onclick="toggleMore(event)">${ic('menu')}${isLead() && counts().syncErr ? '<span class="dot"></span>' : ''}</button><div id="more"></div></div>`}</div></header>
    <main class="content ${UI.wide ? 'wide' : ''}" id="content">${page}</main></div>
  <nav class="bottom-nav">${items.filter(i => !i.sec && !i.hm).map(it => `<a class="${cur === it.r ? 'on' : ''}" href="#/${it.r}">${ic(it.i, '', 'width:20px;height:20px')}<span>${it.m || it.t}</span>${it.cnt ? `<span class="cnt">${it.cnt}</span>` : ''}</a>`).join('')}</nav></div>`;
  UI.wide = false; mobTables(); fitPaper();
}
function renderPage(rt) {
  const L = { dashboard: pageDashboard, pos: pagePOs, po: () => pagePO(rt.a), merge: () => pageMerge(rt.a), sync: pageSync, review: () => rt.a ? pageReviewDetail(rt.a) : (UI.workFilter = 'submitted', history.replaceState(null, '', '#/work'), pageWork()), work: pageWork, task: () => pageInsView(rt.a), reports: pageReports, report: () => pageReportDoc(rt.a, rt.b), history: pageHistory };
  const R = {
    lead: L, admin: { ...L, admin: pageAdmin },
    qc: { work: pageWork, task: () => pageTask(rt.a), inspect: () => pageInspect(rt.a), history: pageHistory },
  }[ME.role];
  const fn = R[rt.r];
  if (!fn) return empty('Không có quyền truy cập trang này', `<a class="link" href="#/${defaultRoute()}">Về trang chính</a>`, 'lock');
  try { return fn(); } catch (e) { console.error(e); return empty('Không tìm thấy dữ liệu', `<a class="link" href="#/${defaultRoute()}">Về trang chính</a>`, 'info'); }
}
/* Tổng quan & Báo cáo: 1 trang, 2 tab (Dashboard · Trung tâm báo cáo) */
function hubHead(cur, sub, acts = '') {
  const tabs = [['dashboard', 'Tổng quan', 'dashboard'], ['reports', 'Trung tâm báo cáo', 'file']];
  return pageHead('Tổng quan & Báo cáo', sub, acts) + `<div class="tabs" style="margin:-8px 0 16px">${tabs.map(t => `<button class="${t[0] === cur ? 'on' : ''}" onclick="go('${t[0]}')">${ic(t[2], '', 'width:16px;height:16px')} ${t[1]}</button>`).join('')}</div>`;
}
function pageHead(title, sub, acts = '', back = '') {
  return `<div class="page-head">${back ? `<a class="back" href="#/${back}" aria-label="Quay lại">${ic('left')}</a>` : ''}<div class="ttl"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
}
function toggleTheme() { const r = document.documentElement; r.dataset.theme = r.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem(KEY + '-theme', r.dataset.theme); render(); }
function toggleOnline() {
  DB.online = !DB.online;
  if (DB.online && DB.outbox.length) { const n = DB.outbox.length; DB.outbox.forEach(id => { const i = INS(id); if (i) deliver(i); }); DB.outbox = []; save(); render(); toast(`Có mạng trở lại — đã gửi ${n} phiếu chờ đồng bộ`, 'ok'); return; }
  save(); render(); toast(DB.online ? 'Đã kết nối mạng' : 'Mất kết nối — phiếu sẽ lưu nháp offline trên thiết bị', DB.online ? 'ok' : 'warn');
}
/* menu 3 gạch (góc phải): các trang ít dùng của Lead */
function moreItems() { const c = counts(); if (!isLead()) return [{ r: 'history', t: 'Lịch sử của tôi', s: 'Phiếu đã gửi và hoạt động của bạn', i: 'history' }]; return [...(ME.role === 'admin' ? [{ r: 'admin', t: 'Danh mục & phân quyền', s: 'Người dùng, nơi kiểm, loại đánh giá, lỗi', i: 'database' }] : []), { r: 'sync', t: 'Đồng bộ Base', s: 'PO, PO Line từ Base Service', i: 'refresh', cnt: c.syncErr }, { r: 'history', t: 'Nhật ký hoạt động', s: 'Audit trail toàn hệ thống', i: 'history' }]; }
function toggleMore(e) {
  e.stopPropagation(); const b = document.getElementById('more'); if (b.innerHTML) { b.innerHTML = ''; return; }
  const cur = route().r;
  b.innerHTML = `<div class="pop" style="width:280px"><div class="pop-list">${moreItems().map(m => `<a class="pop-item${cur === m.r ? ' on' : ''}" href="#/${m.r}" onclick="document.getElementById('more').innerHTML=''"><span class="ico sm tone-${m.cnt ? 'red' : 'gray'}">${ic(m.i, '', 'width:14px;height:14px')}</span><span style="min-width:0;flex:1"><b class="t-sm fw6" style="display:block">${m.t}</b><span class="t-xs muted" style="display:block">${m.s}</span></span>${m.cnt ? pill(m.cnt, 'bad', 1) : ''}</a>`).join('')}<button type="button" class="pop-item" onclick="logout()"><span class="ico sm tone-gray">${ic('logout', '', 'width:14px;height:14px')}</span><span style="min-width:0;flex:1"><b class="t-sm fw6" style="display:block">Đăng xuất</b><span class="t-xs muted" style="display:block">${esc(ME.name)} · ${esc(ME.title)}</span></span></button></div></div>`;
}
document.addEventListener('click', e => { const b = document.getElementById('more'); if (b && b.innerHTML && !e.target.closest('#more')) b.innerHTML = ''; });
function toggleBell(e) {
  e.stopPropagation(); const b = document.getElementById('bell'); if (b.innerHTML) { b.innerHTML = ''; return; }
  const list = notifications();
  b.innerHTML = `<div class="pop"><div class="pop-h">Thông báo ${pill(list.length, list.length ? 'bad' : 'gray', 1)}</div><div class="pop-list">${list.length ? list.map(n => `<a class="pop-item" href="#/${n.go}"><span class="ico sm tone-${n.c}">${ic(n.i, '', 'width:14px;height:14px')}</span><span style="min-width:0"><b class="t-sm fw6" style="display:block">${esc(n.t)}</b><span class="t-xs muted" style="display:block">${esc(n.s || '')}</span><span class="t-xs muted-2">${fdt(n.at)}</span></span></a>`).join('') : empty('Không có thông báo mới', '', 'bell')}</div></div>`;
}
document.addEventListener('click', e => { const b = document.getElementById('bell'); if (b && b.innerHTML && !e.target.closest('#bell')) b.innerHTML = ''; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); document.querySelectorAll('.lightbox').forEach(x => x.remove()); }
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { const s = document.getElementById('gsearch'); if (s) { e.preventDefault(); s.focus(); } }
});
const qcGo = pid => { if (isLead()) return 'po/' + pid; const i = myIns().find(x => x.pos.includes(pid) && x.status !== 'approved') || myIns().find(x => x.pos.includes(pid)); return i ? 'task/' + i.id : ''; };
function doSearch(q) {
  const box = document.querySelector('.search'); let pop = document.getElementById('spop'); q = q.trim().toLowerCase();
  if (!q) { pop && pop.remove(); return; }
  const res = [];
  {
    DB.pos.forEach(p => { if ((p.id + p.customer + p.series + p.color + p.factory).toLowerCase().includes(q)) res.push({ i: 'box', t: 'PO ' + p.id, go: qcGo(p.id) }); if (res.length && !res.at(-1).go) res.pop();
      p.lines.forEach(l => { if (l.code.toLowerCase().includes(q)) res.push({ i: 'scan', t: l.sku, go: qcGo(p.id) }); if (res.length && !res.at(-1).go) res.pop(); }); });
    myIns().forEach(i => { if ((i.id + i.title + i.pos.join(' ')).toLowerCase().includes(q)) res.push({ i: 'clipboard', t: i.title, go: 'task/' + i.id }); });
  }
  if (!pop) { pop = document.createElement('div'); pop.id = 'spop'; pop.className = 'search-pop'; box.appendChild(pop); }
  pop.innerHTML = res.length ? res.slice(0, 12).map(r => `<a href="#/${r.go}">${ic(r.i, 'muted')}<span style="min-width:0"><b class="t-sm fw6 trunc" style="display:block">${esc(r.t)}</b><span class="t-xs muted trunc" style="display:block">${esc(r.s)}</span></span></a>`).join('') : `<div class="empty" style="padding:20px">Không tìm thấy “${esc(q)}”</div>`;
}

/* ============ LOGIN ============ */
let LOGIN = { role: 'lead', qc: 'qc1', showPw: false };
function loginView() {
  const u = loginUser();
  const pick = LOGIN.role === 'qc' ? `<label class="field"><span>QC</span><select class="sel" onchange="LOGIN.qc=this.value;render()">${activeQC().map(x => `<option value="${x.id}" ${x.id === LOGIN.qc ? 'selected' : ''}>${x.name} — ${x.title}</option>`).join('')}</select></label>` : '';
  const role = (k, t, s, i) => `<button type="button" class="role-opt ${LOGIN.role === k ? 'on' : ''}" onclick="LOGIN.role='${k}';render()">${ic(i)}<b>${t}</b><small>${s}</small></button>`;
  return `<div class="login">
  <section class="login-hero"><div class="brand login-logo"><img src="${LOGO_FULL}" alt="VHG Living Furniture"><div><b>QC Center</b><small>Quality Control Center</small></div></div>
    <div class="hero-mid"><span class="eyebrow">${ic('sparkle', '', 'width:14px;height:14px')} Quản lý chất lượng cho xưởng gỗ</span>
      <p class="hero-title">Mọi phiếu kiểm,<br><em>một luồng duy nhất.</em></p>
      <p class="hero-sub">PO đồng bộ từ Base · Lead lập kế hoạch nhiều loại đánh giá cho từng PO · QC kiểm tại xưởng kể cả khi mất mạng · duyệt, cảnh báo Critical · báo cáo xuất đúng mẫu đang dùng.</p>
      <div class="hero-forms">${TYPE_ORDER.map(k => `<div><b>${TYPES[k].code} · ${TYPES[k].short}</b><small>${TYPES[k].doc}</small></div>`).join('')}</div></div></section>
  <main class="login-side"><form class="login-card stack" onsubmit="event.preventDefault();doLogin()">
    <div class="row between"><div><h1 style="font-size:22px;line-height:30px;font-weight:600">Đăng nhập</h1><p class="muted mt4">Chọn vai trò demo để vào hệ thống</p></div><div class="row" style="gap:8px">${langBtn()}<button type="button" class="icon-btn" aria-label="Giao diện" onclick="toggleTheme()">${ic(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon')}</button></div></div>
    <div class="role-grid">${role('admin', 'Admin', 'Toàn quyền, danh mục', 'shield')}${role('lead', 'Lead QC', 'Kế hoạch, duyệt, báo cáo', 'users')}${role('qc', 'QC', 'Kiểm tại xưởng', 'clipboard')}</div>
    ${pick}
    <label class="field"><span>Email</span><input class="inp" value="${u.email}" readonly></label>
    <label class="field"><span>Mật khẩu</span><span style="position:relative;display:block"><input class="inp" type="${LOGIN.showPw ? 'text' : 'password'}" value="demo123" aria-label="Mật khẩu"><button type="button" aria-label="Hiện mật khẩu" onclick="LOGIN.showPw=!LOGIN.showPw;render()" style="position:absolute;right:4px;top:4px;width:32px;height:32px;display:grid;place-items:center;color:var(--muted)">${ic('eye')}</button></span></label>
    <button class="btn btn-primary btn-lg btn-block" type="submit">Đăng nhập</button>
    <div class="row between t-sm muted" style="padding-top:12px;border-top:1px solid var(--line)"><span>Vào với: <b style="color:var(--text)">${u.name}</b></span><button type="button" class="link t-sm" onclick="resetDemo()">Khôi phục dữ liệu demo</button></div>
  </form></main></div>`;
}
function loginUser() { const act = USERS.filter(x => x.active !== false); return LOGIN.role === 'qc' ? (act.find(x => x.id === LOGIN.qc) || activeQC()[0]) : act.find(x => x.role === LOGIN.role) || USERS.find(x => x.role === LOGIN.role); }
function doLogin() { ME = loginUser(); localStorage.setItem(KEY + '-me', ME.id); location.hash = '#/' + defaultRoute(); render(); toast(`Xin chào, ${ME.name}`, 'ok'); }
function logout() { ME = null; localStorage.removeItem(KEY + '-me'); location.hash = ''; render(); }
