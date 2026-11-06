/* =====================================================================
   NHÂN VIÊN QC — việc của tôi · quét mã · phiếu kiểm theo từng loại
   ===================================================================== */
const tmeta = i => i.kind === 'prod' ? { code: 'P1', short: 'Production', name: 'Cập nhật tiến độ', icon: 'activity' } : TYPES[i.type];
function getP(o, path, def) { const ks = path.split('.'); let x = o; for (let j = 0; j < ks.length - 1; j++) { x[ks[j]] = x[ks[j]] ?? {}; x = x[ks[j]]; } const l = ks.at(-1); if (x[l] === undefined && def !== undefined) x[l] = def; return [x, l]; }
function setF(id, path, v, re) { const i = INS(id); const [o, k] = getP(i.data, path); o[k] = v; save(); if (re) refreshInsp(id); }
function phAdd(id, path, cat) { const i = INS(id); const [o, k] = getP(i.data, path, []); o[k].push(takePhoto(cat)); save(); refreshInsp(id); }
function phRm(id, path, j) { const i = INS(id); const [o, k] = getP(i.data, path, []); o[k].splice(j, 1); save(); refreshInsp(id); }
function strip(id, path, keys, cat, caps = []) {
  return `<div class="photos">${keys.map((k, j) => `<div class="shot"><div class="img" style="${bg(k)}" onclick="viewPhoto('${k}','${esc(caps[j] || '')}')"></div><button class="rm" aria-label="Xóa ảnh" onclick="phRm('${id}','${path}',${j})">${ic('x')}</button>${caps[j] ? `<div class="cap">${esc(caps[j])}</div>` : ''}</div>`).join('')}
    <button class="shot empty" onclick="phAdd('${id}','${path}','${cat}')"><div class="img">${ic('camera', '', 'width:24px;height:24px')}</div><div class="cap">Chụp ảnh<small>${keys.length ? keys.length + ' ảnh' : 'Chưa có ảnh'}</small></div></button></div>`;
}

/* ---------------- WORK QUEUE ---------------- */
function insHint(i) {
  const s = insState(i);
  if (s === 'blocked') return 'Chờ ' + blockedBy(i).map(b => `${TYPES[b.type].short} (PO ${b.po})`).join(', ');
  if (s === 'returned') return i.returnNote;
  if (s === 'offline') return 'Lưu offline — tự gửi khi có mạng';
  if (s === 'submitted') return `Đã gửi ${fdt(i.submittedAt)} · chờ duyệt`;
  if (i.kind === 'prod') return 'Cập nhật sản lượng 10 công đoạn và điểm nghẽn';
  if (s === 'draft' && i.data) { const e = evalInsp(i); return `Đã chấm ${e.done}/${e.total}`; }
  return i.note || TYPES[i.type].desc;
}
/* Bảng mã hàng nhóm theo PO: mỗi PO một dòng tiêu đề + màu nhận diện riêng */
const PO_TONES = ['teal', 'violet', 'amber', 'blue', 'green', 'red'];
function poGroupRows(lines) {
  const ids = [...new Set(lines.map(x => x.p.id))];
  return ids.map((pid, k) => { const L = lines.filter(x => x.p.id === pid); const p = L[0].p; const tone = PO_TONES[k % PO_TONES.length];
    return `<tr class="po-grp pt-${tone}"><td colspan="4"><span class="po-tag">PO ${pid}</span><span class="t-sm muted">${esc(p.customer)} · ${esc(p.series)} · ${esc(p.color)} · ${esc(p.factory)}</span><span class="t-sm fw6" style="margin-left:auto">${L.length} mã · ${num(L.reduce((a, x) => a + x.l.qty, 0))} pcs</span></td></tr>`
      + L.map((x, j) => `<tr class="po-row pt-${tone}"><td class="muted">${j + 1}</td><td class="nw fw6">${x.l.code}</td><td>${x.l.part}</td><td class="r">${num(x.l.qty)}</td></tr>`).join(''); }).join('');
}
function insRow(i) {
  const m = tmeta(i); const s = insState(i); const rd = relDay(i.due);
  const tone = s === 'blocked' ? 'gray' : i.kind === 'recheck' ? 'amber' : i.kind === 'prod' ? 'blue' : s === 'returned' ? 'red' : 'teal';
  const href = isLead() && s === 'submitted' ? 'review/' + i.id : isLead() && s === 'approved' && i.kind === 'qc' ? 'report/ins/' + i.id : 'task/' + i.id;
  return `<a class="li ${s === 'blocked' ? 'locked' : ''}" href="#/${href}"><span class="ico tone-${tone}">${ic(s === 'blocked' ? 'lock' : i.kind === 'recheck' ? 'repeat' : m.icon)}</span>
    <div class="body"><div class="title">${i.priority === 'high' && ['todo', 'draft', 'returned'].includes(s) ? '<span class="dot-live"></span>' : ''}<span class="trunc">${esc(i.title)}</span></div>
    <div class="meta"><span>${m.code} · ${m.short}</span><span>PO ${i.pos.join(', ')}</span><span>${i.factory}</span>${isLead() ? `<span>${U(i.assignee).name}</span>` : ''}</div>
    <div class="meta"><span class="trunc" style="max-width:520px;${s === 'returned' ? 'color:var(--red)' : ''}">${esc(insHint(i))}</span></div></div>
    <div class="side">${isPill(i)}<small style="${rd.c === 'bad' && !['submitted', 'approved'].includes(s) ? 'color:var(--red)' : ''}">${['submitted', 'approved', 'offline'].includes(s) ? fd(i.submittedAt || i.due) : rd.t}</small></div></a>`;
}
function pageWork() {
  const lead = isLead();
  const done = lead ? DB.ins.filter(i => i.status === 'approved' && i.kind === 'qc') : [];
  const all = myIns().filter(i => i.status !== 'approved');
  const isOpen = i => !['submitted', 'offline'].includes(i.status);
  const open = all.filter(isOpen);
  /* 1 danh sách: việc cần làm ở trên, phiếu đã gửi (chờ duyệt / chờ đồng bộ) ở dưới */
  const cnt = { all: all.length, today: open.filter(i => relDay(i.due).k === 'today').length, overdue: open.filter(i => relDay(i.due).k === 'overdue').length, upcoming: open.filter(i => relDay(i.due).k === 'upcoming').length, sent: all.length - open.length, submitted: all.filter(i => i.status === 'submitted').length, returned: all.filter(i => i.status === 'returned').length, approved: done.length };
  if (lead && UI.workFilter === 'sent') UI.workFilter = 'submitted'; if (!lead && ['submitted', 'returned', 'approved'].includes(UI.workFilter)) UI.workFilter = 'all';
  let list = UI.workFilter === 'all' ? all : UI.workFilter === 'sent' ? all.filter(i => !isOpen(i)) : UI.workFilter === 'submitted' ? all.filter(i => i.status === 'submitted') : UI.workFilter === 'returned' ? all.filter(i => i.status === 'returned') : UI.workFilter === 'approved' ? done.slice().sort((a, b) => (b.review?.at || '').localeCompare(a.review?.at || '')) : open.filter(i => relDay(i.due).k === UI.workFilter);
  const q = UI.workQ.toLowerCase(); if (q) list = list.filter(i => (i.id + i.title + i.pos.join(' ') + i.factory).toLowerCase().includes(q));
  const ord = { returned: 0, draft: 1, todo: 2, blocked: 4, offline: 5, submitted: 6 };
  if (UI.workFilter !== 'approved') list.sort((a, b) => (ord[insState(a)] - ord[insState(b)]) || ((b.priority === 'high') - (a.priority === 'high')) || a.due.localeCompare(b.due));
  const CT = { all: 'pri', today: 'pri', overdue: 'red', upcoming: 'blue', sent: 'amber', submitted: 'amber', returned: 'red', approved: 'green' };
  const chip = (k, l) => `<button class="chip c-${CT[k] || 'pri'} ${UI.workFilter === k ? 'on' : ''}" onclick="UI.workFilter='${k}';render()">${l} <b class="${cnt[k] ? '' : 'z'}">${cnt[k]}</b></button>`;
  return `${pageHead(lead ? 'Lịch kiểm QC' : 'Việc của tôi', lead ? 'Toàn bộ phiếu kiểm của các PO — theo người kiểm, hạn và trạng thái duyệt (bước 19).' : 'Phiếu kiểm được giao và cập nhật tiến độ.', lead ? `<button class="btn btn-primary" onclick="pickPO()">${ic('plus')} Lập phiếu kiểm</button>` : '')}
  <div class="card">
    <div class="card-b tight row wrap between" style="border-bottom:1px solid var(--line)"><div class="filters">${chip('all', 'Tất cả')}${chip('today', 'Hôm nay')}${chip('overdue', 'Quá hạn')}${chip('upcoming', 'Sắp tới')}${lead ? chip('submitted', 'Chờ duyệt') + chip('returned', 'Trả bổ sung') + chip('approved', 'Đã duyệt') : chip('sent', 'Đã gửi')}</div>
      <div class="search" style="width:280px">${ic('search')}<input placeholder="Lọc theo PO, xưởng, phiếu…" value="${esc(UI.workQ)}" oninput="UI.workQ=this.value;clearTimeout(window.__wq);window.__wq=setTimeout(()=>{render();const s=document.querySelector('.content .card .search input');s.focus();s.setSelectionRange(s.value.length,s.value.length)},250)"></div></div>
    <div class="list">${list.length ? list.map(insRow).join('') : empty('Không có việc', 'Hàng đợi trống với bộ lọc hiện tại.', 'checkc')}</div></div>`;
}
function pickPO() { openModal({ title: 'Chọn PO để lập phiếu kiểm', body: `<div class="card"><div class="list">${DB.pos.filter(p => !p.closed).map(p => `<button class="li" onclick="closeModal();planModal('${p.id}')"><div class="body"><div class="title">PO ${p.id} ${psPill(p)}</div><div class="meta"><span>${p.customer}</span><span>${p.series}</span><span>${p.factory}</span></div></div>${ic('right', 'muted')}</button>`).join('')}</div></div>` }); }

/* ---------------- START (10–12) ---------------- */
const banner = (c, icn, t, p, acts = '') => `<div class="banner ${c}">${ic(icn)}<div class="bt"><b>${t}</b>${p ? `<p>${p}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
function ctxCard(i) {
  const ps = insPOs(i);
  return `<div class="card"><div class="card-h"><div class="ttl"><h2>${esc(i.title)}</h2><p>${tmeta(i).code} · ${tmeta(i).name} · ${tmeta(i).doc || ''}</p></div>${isPill(i)}</div>
    <div class="card-b"><div class="kv-grid">${kv('PO', ps.map(p => p.id).join(', '))}${kv('Khách hàng', [...new Set(ps.map(p => p.customer))].join(', '))}${kv('Nơi kiểm', i.factory)}${kv('Người kiểm', [i.assignee, ...(i.team || []).filter(x => x !== i.assignee)].map(x => U(x).name).join(', '))}${kv('Hạn', fd(i.due))}</div></div></div>`;
}
function pageTask(id) {
  const i = INS(id); if (!i || !(i.assignee === ME.id || (i.team || []).includes(ME.id))) throw 0;
  if (i.kind === 'prod') return pageProd(i);
  if (['submitted', 'offline', 'approved'].includes(i.status)) return pageSent(i);
  const s = insState(i); const ps = insPOs(i); UI.confirm = UI.confirm || {}; const started = !!i.data;
  const lines = ps.flatMap(p => p.lines.filter(l => !i.codes || i.codes.includes(l.code)).map(l => ({ p, l })));
  const N = lines.reduce((a, x) => a + x.l.qty, 0);
  const sample = i.type === 'WW' || i.type === 'FIN' ? lines.reduce((a, x) => a + aql(x.l.qty).n, 0) : i.type === 'DIR' ? lines.reduce((a, x) => a + Math.min(12, x.l.qty), 0) : i.type === 'PLY' ? aql(N).n : 7;
  return `${pageHead('Xác nhận phiên kiểm', `${i.id} · hạn ${fd(i.due)}`, '', 'work')}<div class="stack">
  ${s === 'blocked' ? banner('warn', 'hourglass', 'Chưa thể kiểm — chờ phiếu tiên quyết được duyệt (bước 08)', blockedBy(i).map(b => `${TYPES[b.type].code} ${TYPES[b.type].name} của PO ${b.po}: ${TS_UI[typeState(PO(b.po), b.type).state][0].toLowerCase()}`).join('<br>')) : ''}
  ${s === 'returned' ? banner('bad', 'undo', `Lead trả bổ sung — ${fdt(i.review.at)}`, esc(i.returnNote)) : ''}
  ${i.note ? banner('info', 'info', 'Ghi chú từ Lead', esc(i.note)) : ''}
  ${ctxCard(i)}
  <div class="card"><div class="card-h"><div class="ttl"><h2>1 · Đúng PO, xưởng và mã hàng</h2><p>Bước 10 — đối chiếu tem, phiếu chuyền tại hiện trường.</p></div></div>
    <div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th style="width:48px">#</th><th>Mã hàng</th><th>Chi tiết</th><th class="r">SL đơn hàng</th></tr></thead><tbody>${poGroupRows(lines)}</tbody></table></div>
    ${s !== 'blocked' && !started ? `<div class="card-b" style="border-top:1px solid var(--line)"><label class="chk ${UI.confirm[id] ? 'on' : ''}"><input type="checkbox" ${UI.confirm[id] ? 'checked' : ''} onchange="UI.confirm['${id}']=this.checked;render()"><span class="fw5">Tôi đã xác nhận đúng PO, xưởng và mã hàng tại hiện trường</span></label></div>` : ''}</div>
  <div class="card"><div class="card-h"><div class="ttl"><h2>2 · Mẫu phiếu kiểm</h2><p>Bước 11 — theo kế hoạch của Lead.</p></div></div><div class="card-b row" style="gap:16px"><span class="ico tone-teal">${ic(TYPES[i.type].icon)}</span><div style="flex:1;min-width:0"><b>${TYPES[i.type].code} · ${TYPES[i.type].name}</b><p class="t-sm muted mt4">${TYPES[i.type].doc} — ${TYPES[i.type].desc}</p></div></div></div>
  <div class="card"><div class="card-h"><div class="ttl"><h2>3 · Mẫu và số lượng cần kiểm</h2><p>Bước 12 — ${i.type === 'DIR' ? 'Inline: 12 pcs / mã hàng (theo control plan)' : i.type === 'PIG' ? 'Theo lưu trình mẫu màu' : 'AQL ISO 2859-1 · General Level II · Normal'}</p></div></div>
    <div class="card-b"><div class="kv-grid">${kv('Số mã hàng', lines.length)}${kv('Tổng SL đơn hàng', num(N) + ' pcs')}${kv('Tổng SL cần kiểm', num(sample) + ' pcs')}${i.type !== 'DIR' && i.type !== 'PIG' ? kv('Ac major / minor', `${aql(N).acMaj} / ${aql(N).acMin}`) : ''}</div></div></div>
  ${s !== 'blocked' ? `<div class="sticky-actions"><a class="btn btn-lg hide-m" href="#/work">Quay lại</a><button class="btn btn-primary btn-lg grow" ${started || UI.confirm[id] ? '' : 'disabled'} onclick="startInspect('${id}')">${ic(started ? 'edit' : 'clipboard')} ${started ? 'Tiếp tục phiếu kiểm' : 'Bắt đầu kiểm tra'}</button></div>` : ''}</div>`;
}
function initData(i) {
  const ps = insPOs(i); const lines = ps.flatMap(p => p.lines.filter(l => !i.codes || i.codes.includes(l.code)).map(l => ({ p, l })));
  if (i.type === 'WW') return { date: fd(nowISO()), items: lines.map(x => ({ po: x.p.id, ln: x.l.ln, code: x.l.code, part: x.l.part, slsx: x.l.qty, slkiem: aql(x.l.qty).n, crit: WW_CRIT.map(() => ''), kl: '', dg: '', ph: {} })), load: {}, improve: [], note: '', conclusion: '', sig: ME.id === 'qc2' ? 'sig_van' : '' };
  if (i.type === 'DIR' || i.type === 'FIN') {
    const p0 = ps[0]; const base = { rows: lines.map(x => ({ po: x.p.id, desc: x.l.desc || x.l.part, code: x.l.code, qo: x.l.qty, qi: i.type === 'DIR' ? Math.min(12, x.l.qty) : aql(x.l.qty).n, cr: 0, ma: 0, mi: 0, rj: 0, rm: i.type === 'DIR' ? 'Inline' : 'Final' })), defects: [], conclusion: '', note: '' };
    if (i.type === 'DIR') return { ...base, mode: 'Inline', header: { factory: p0.factory === 'Xưởng #96' ? '#96' : i.factory, customer: p0.customer, collection: [...new Set(lines.map(x => x.l.desc || x.l.part))].join(', '), color: p0.color.toUpperCase(), supplier: p0.paint || 'VVT', reportedBy: ME.name, approvedBy: 'Mr. Tin' }, material: '', cp: DIR_CP.map(() => ({ r: '', note: '' })), sec: {} };
    return { ...base, pack: FIN_PACK.map(() => ''), load: {} };
  }
  if (i.type === 'PLY') { const p = ps[0]; return { header: { reportNo: 'VHGLF ' + fd(nowISO()).replace(/\//g, ''), factoryFull: FACTORY_FULL[p.factory] || p.factory, product: 'Plywood Panel - Veneer Birch D+\n胶合板-桦木饰面', itemNo: p.series, dimension: p.lines[0].desc.split('·')[1]?.trim() || '', pkg: 'Pallet height 栈板高度 ≤ 915mm', weight: '27 kg / 59.5 lbs', qty: poQty(p), sampling: aql(poQty(p)).n, inspectors: [i.assignee, ...(i.team || [])].filter((v, k, a) => a.indexOf(v) === k).map(x => U(x).name).join(', '), pps: [] }, checks: {}, veneer: [], plies: [], verify: {}, defects: [], deviations: [], requirement: '', rej: 0, conclusion: '', note: '' }; }
  return null;
}
function startInspect(id) {
  const i = INS(id); if (!i.data) i.data = initData(i);
  if (i.status === 'todo') { i.status = 'draft'; addLog('start', `Bắt đầu ${i.id} (${TYPES[i.type].code} ${TYPES[i.type].short})`, i.pos[0]); }
  save(); go('inspect/' + id);
}
function pageSent(i) {
  return `${pageHead(esc(i.title), `${i.id} · ${tmeta(i).code} ${tmeta(i).name}`, isPill(i), 'work')}<div class="stack">
  ${i.status === 'offline' ? banner('warn', 'wifioff', 'Đang lưu offline (bước 17A)', 'Phiếu sẽ tự gửi khi thiết bị có mạng trở lại.', `<button class="btn btn-sm" onclick="toggleOnline()">${ic('wifi')} Kết nối lại</button>`)
    : i.status === 'submitted' ? banner('info', 'inbox', `Đã gửi lên hệ thống ${fdt(i.submittedAt)}`, 'Lead QC đang xem xét. Bạn sẽ nhận thông báo nếu cần bổ sung.') : banner('ok', 'checkc', i.kind === 'recheck' ? 'Đã hoàn tất kiểm tra lại' : 'Đã được Lead duyệt', i.review ? fdt(i.review.at) : '')}
  ${i.kind === 'qc' && i.data ? insSummary(i) : ''}</div>`;
}

/* ---------------- INSPECT (13–18) ---------------- */
function pageInspect(id) {
  const i = INS(id); if (!i || !(i.assignee === ME.id || (i.team || []).includes(ME.id))) throw 0;
  if (!i.data || !['draft', 'returned'].includes(i.status)) { setTimeout(() => go('task/' + id)); return ''; }
  return `${pageHead(esc(i.title), `${TYPES[i.type].code} · ${TYPES[i.type].doc} · ${ME.name}`, pill(relDay(i.due).t, relDay(i.due).c), 'task/' + id)}<div id="insp">${inspInner(i)}</div>`;
}
function refreshInsp(id) { const i = INS(id); const el = document.getElementById('insp'); if (el) { el.innerHTML = inspInner(i); mobTables(el); } }
function inspInner(i) {
  const body = { PLY: plyBody, WW: wwBody, DIR: dirBody, FIN: finBody, PIG: pigBody }[i.type](i);
  return `<div class="stack">${i.status === 'returned' ? banner('bad', 'undo', 'Lead yêu cầu bổ sung', esc(i.returnNote)) : ''}<div id="miss"></div>
  ${liveCard(i)}<div id="crit">${critBanner(i)}</div>${body}${conclCard(i)}
  <div class="sticky-actions"><a class="btn btn-lg hide-m" href="#/task/${i.id}">Quay lại</a><button class="btn btn-lg" onclick="save();toast('Đã lưu nháp trên thiết bị','ok')">${ic('download')} Lưu nháp</button><button class="btn ${DB.online ? 'btn-primary' : 'btn-warn'} btn-lg grow" onclick="submitInspect('${i.id}')">${ic(DB.online ? 'send' : 'wifioff')} ${DB.online ? 'Gửi phiếu' : 'Lưu offline'}</button></div></div>`;
}
function liveCard(i) {
  const e = evalInsp(i); const c = { PASS: 'var(--green-fill)', COND: 'var(--amber-fill)', FAIL: 'var(--red-fill)' }[e.verdict];
  const pct = e.total ? Math.round(e.done / e.total * 100) : 0;
  return `<div class="card"><div class="card-b score"><div class="ring" style="--p:${pct};--c:${c}" data-v="${pct}%"></div><div style="flex:1;min-width:0"><b>Tiến độ phiếu ${e.done}/${e.total}</b><p class="t-sm muted mt4">Đã kiểm ${num(e.insp)} / ${num(e.N)} pcs · Critical ${e.crit} · Major ${e.maj} · Minor ${e.min}${e.rej ? ' · Rejected ' + e.rej : ''}${isNaN(e.de) || e.de == null ? '' : ' · ΔE ' + e.de.toFixed(2)}</p></div><div style="text-align:right"><span class="t-xs muted" style="display:block;margin-bottom:4px">Hệ thống đánh giá</span>${pill(VERDICT[e.verdict][0], VERDICT[e.verdict][1])}</div></div></div>`;
}
function critOf(i) {
  if (i.type === 'PLY') return (i.data.defects || []).filter(x => x.sev === 'critical').map(x => `${x.d} × ${x.qty}`);
  if (i.type === 'DIR' || i.type === 'FIN') return (i.data.rows || []).filter(r => +r.cr > 0).map(r => `PO ${r.po} ${r.code}: ${r.cr} critical`);
  return [];
}
function critBanner(i) {
  const a = DB.alerts.find(x => x.ins === i.id);
  if (a) return banner(a.status === 'new' ? 'warn' : 'bad', 'zap', `Đã gửi cảnh báo cho Lead lúc ${fdt(a.at)} (bước 14A)`, `${esc(a.title)} — ${{ new: 'Lead chưa phản hồi, tiếp tục hoàn tất phiếu', ack: 'Lead đã ghi nhận cảnh báo' }[a.status] || 'Lead đã ghi nhận cảnh báo'}`);
  const c = critOf(i); if (!c.length) return '';
  return banner('bad', 'zap', 'Có lỗi Critical — cần báo Lead ngay (bước 14)', c.map(esc).join(' · '), `<button class="btn btn-danger btn-sm" onclick="alertModal('${i.id}')">${ic('send')} Gửi cảnh báo</button>`);
}
function alertModal(id) {
  const i = INS(id); const c = critOf(i);
  openModal({ title: 'Gửi cảnh báo cho Lead', sub: `${i.title} · PO ${i.pos.join(', ')}`, body: `<div class="stack"><label class="field"><span>Tiêu đề</span><input class="inp" id="al-t" value="${esc(c[0] || '')}"></label><label class="field"><span>Mô tả & đề xuất</span><textarea class="ta" id="al-d" placeholder="Số lượng ảnh hưởng, vị trí, đề xuất xử lý…"></textarea></label>${banner('info', 'info', 'Lead nhận thông báo ngay', 'Cảnh báo hiện ngay trên Dashboard và thông báo của Lead. Bạn vẫn tiếp tục hoàn tất phiếu.')}</div>`,
    foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-danger" onclick="sendAlert('${id}')">${ic('zap')} Gửi cảnh báo</button>` });
}
function sendAlert(id) {
  const i = INS(id); const t = document.getElementById('al-t').value.trim() || 'Lỗi Critical';
  DB.alerts.unshift({ id: genId('al', 'AL-'), ins: id, pos: i.pos, type: i.type, by: ME.id, at: nowISO(), status: 'new', title: t, text: document.getElementById('al-d').value.trim() || 'Xem chi tiết trong phiếu ' + id });
  addLog('alert', `Gửi cảnh báo Critical: ${t}`, i.pos[0]); save(); closeModal(); refreshInsp(id); toast('Đã gửi cảnh báo — Lead nhận thông báo ngay', 'warn');
}
function conclCard(i) {
  const D = i.data; const e = evalInsp(i);
  return `<div class="card" id="concl"><div class="card-h"><div class="ttl"><h2>Kết luận phiên kiểm</h2><p>Bước 15 — QC tự đánh giá. Hệ thống đề xuất: <b style="color:var(--text)">${VERDICT[e.verdict][0]}</b></p></div></div><div class="card-b stack">
    <div class="seg full">${Object.entries(CONCL).map(([k, v]) => `<button class="${D.conclusion === k ? 'on' : ''}" onclick="setF('${i.id}','conclusion','${k}',1)">${v[0]}</button>`).join('')}</div>
    <label class="field"><span>Nhận xét chung / đề xuất</span><textarea class="ta" onchange="setF('${i.id}','note',this.value)">${esc(D.note || '')}</textarea></label></div></div>`;
}

/* ----- 11B PLY ----- */
function plyBody(i) {
  const D = i.data; const H = D.header; const id = i.id;
  const f = (k, l, ro) => `<label class="field"><span>${l}</span><input class="inp" ${ro ? 'readonly' : ''} value="${esc(H[k])}" onchange="setF('${id}','header.${k}',this.value)"></label>`;
  return `<div class="card"><div class="card-h"><div class="ttl"><h2>Thông tin báo cáo</h2><p>REPORT PLYWOOD 夹板检验报告 · BM-VHGLF-02</p></div></div><div class="card-b grid g3">${f('reportNo', 'Report number')}${f('factoryFull', 'Factory 工厂')}${f('itemNo', 'Item number 项目编号')}${f('dimension', 'Product dimension 产品尺寸')}${f('qty', 'Number of orders 总订单数量', 1)}${f('sampling', 'Sampling rate 抽检数量')}${f('pkg', 'Package height 包装高度')}${f('weight', 'Net weight 净重')}${f('inspectors', 'QC Inspector')}</div>
    <div class="sec-h" style="border-top:1px solid var(--line)">Approved PPS sample 已批准的 PPS 样品</div><div class="card-b">${strip(id, 'header.pps', H.pps, 'ply_pps')}</div></div>
  <div class="card"><div class="sec-h">Yêu cầu kỹ thuật</div><div class="list">${PLY_REQ.map((r, k) => `<div class="li" style="align-items:flex-start"><span class="ico sm tone-gray">${k + 1}</span><div class="body"><b>${r.t}</b><p class="t-sm muted mt4" style="white-space:pre-line">${esc(r.d)}</p></div></div>`).join('')}</div></div>
  <div class="card"><div class="sec-h">I. Overall inspection 总观检验 ${pill(PLY_CHECKS.filter(c => (D.checks[c.k] || {}).st === 'Pass').length + '/' + PLY_CHECKS.length + ' Pass', 'gray', 1)}</div>
    ${PLY_CHECKS.map(c => { const r = D.checks[c.k] || {}; return `<div class="cp" id="chk-${c.k}"><div class="cp-row"><div class="t"><b>${c.t}</b><small>Tiêu chuẩn: ${c.spec}</small></div><div class="pf">${['Pass', 'Pending', 'Fail'].map(s => `<button class="${s === 'Pass' ? 'p' : s === 'Fail' ? 'f' : 'n'} ${r.st === s ? 'on' : ''}" onclick="setF('${id}','checks.${c.k}.st','${s}',1)">${s}</button>`).join('')}</div></div>
      <div class="cp-body" style="grid-template-columns:240px minmax(0,1fr)"><label class="field"><span>Kết quả đo</span><input class="inp" value="${esc(r.v || '')}" placeholder="VD: ${c.spec}" onchange="setF('${id}','checks.${c.k}.v',this.value,1)"></label><div class="field"><span>Ảnh</span>${strip(id, `checks.${c.k}.ph`, r.ph || [], c.ps)}</div></div></div>`; }).join('')}</div>
  <div class="card" id="sec-veneer"><div class="sec-h">II. Material / Veneer 材质/饰面</div><div class="card-b stack"><div class="field"><span>Front D+ / Back D</span>${strip(id, 'veneer', D.veneer, 'ply_veneer')}</div><div class="field"><span>Mặt cắt — 7 plies</span>${strip(id, 'plies', D.plies, 'ply_plies')}</div></div></div>
  <div class="card" id="sec-verify"><div class="sec-h">III. Verify against the approved PPS sample 对照已批准的PPS模板</div><div class="card-b stack"><div class="row between wrap"><span class="t-sm muted">Observe from a distance of 800–1000 mm</span><div class="pf">${['Pass', 'Pending', 'Fail'].map(s => `<button class="${s === 'Pass' ? 'p' : s === 'Fail' ? 'f' : 'n'} ${D.verify.st === s ? 'on' : ''}" onclick="setF('${id}','verify.st','${s}',1)">${s}</button>`).join('')}</div></div>${strip(id, 'verify.ph', D.verify.ph || [], 'ply_verify')}</div></div>
  <div class="card" id="sec-defects"><div class="sec-h">IV. Defects 缺陷 ${pill(`Major ${evalInsp(i).maj} · Minor ${evalInsp(i).min}`, 'gray', 1)}</div>
    ${(D.defects || []).map((x, k) => `<div class="cp"><div class="cp-row"><div class="t"><b>${esc(x.d)}</b><small>${SEV[x.sev].t} · ${x.qty} pcs</small></div><button class="icon-btn sm" aria-label="Xóa" onclick="INS('${id}').data.defects.splice(${k},1);save();refreshInsp('${id}')">${ic('trash')}</button></div><div class="cp-body" style="grid-template-columns:minmax(0,1fr)">${strip(id, `defects.${k}.ph`, x.ph || [], 'ply_defect')}</div></div>`).join('')}
    ${defectForm(id, 'ply')}
    <div class="card-b stack" style="border-top:1px solid var(--line)"><label class="field"><span>Sai khác so với tiêu chuẩn (mỗi dòng một ý)</span><textarea class="ta" onchange="setF('${id}','deviations',this.value.split('\\n').filter(Boolean))">${esc((D.deviations || []).join('\n'))}</textarea></label>
      <div class="grid g2"><label class="field"><span>Requirement 要求</span><textarea class="ta" onchange="setF('${id}','requirement',this.value)">${esc(D.requirement || '')}</textarea></label><label class="field"><span>Q.ty rejected</span><input class="inp" type="number" min="0" value="${D.rej || 0}" onchange="setF('${id}','rej',+this.value,1)"></label></div></div></div>`;
}
function defectForm(id, kind) {
  return `<div class="card-b" style="border-top:1px solid var(--line)"><div class="grid" style="grid-template-columns:minmax(0,2fr) 200px 96px auto;gap:12px;align-items:end">
    <label class="field"><span>Mô tả lỗi</span><input class="inp" id="df-d" list="df-types" placeholder="VD: Veneer peeling at both ends" onchange="defSevPick(this.value)"><datalist id="df-types">${DEFECT_TYPES.map(x => `<option>${x}</option>`).join('')}</datalist></label>
    <label class="field"><span>Mức độ</span><div class="seg full" id="df-sev">${Object.entries(SEV).map(([k, v]) => `<button type="button" data-v="${k}" class="${k === 'major' ? 'on' : ''}" onclick="segPick(this)">${v.t}</button>`).join('')}</div></label>
    <label class="field"><span>SL</span><input class="inp" type="number" min="1" value="1" id="df-q"></label>
    <button class="btn" style="height:40px" onclick="addDefect('${id}')">${ic('plus')} Thêm lỗi</button></div></div>`;
}
function addDefect(id) {
  const i = INS(id); const d = document.getElementById('df-d').value.trim(); if (!d) { document.getElementById('df-d').classList.add('err'); toast('Nhập mô tả lỗi', 'bad'); return; }
  const x = { d, sev: document.querySelector('#df-sev .on').dataset.v, qty: +document.getElementById('df-q').value || 1, ph: [takePhoto('ply_defect')] };
  i.data.defects.push(x); save(); refreshInsp(id); toast(x.sev === 'critical' ? 'Lỗi Critical — hãy gửi cảnh báo cho Lead' : `Đã ghi nhận lỗi × ${x.qty}`, x.sev === 'critical' ? 'bad' : 'ok');
}

/* ----- 11A WW ----- */
function wwBody(i) {
  const D = i.data; const id = i.id; UI.wwf = UI.wwf || 'all';
  const cnt = { all: D.items.length, open: 0, P: 0, F: 0, NA: 0 }; D.items.forEach(it => { const k = wwKL(it) || 'open'; cnt[k]++; });
  const shown = D.items.map((it, k) => [it, k]).filter(([it]) => UI.wwf === 'all' || (wwKL(it) || 'open') === UI.wwf);
  const chip = (k, l) => `<button class="chip ${UI.wwf === k ? 'on' : ''}" onclick="UI.wwf='${k}';refreshInsp('${id}')">${l} <b>${cnt[k]}</b></button>`;
  return `<div class="card"><div class="card-h"><div class="ttl"><h2>I. Dữ liệu chung</h2><p>Chạm vào mã hàng để chấm 13 tiêu chí ✔ / x và chụp ảnh đo thực tế. SL kiểm theo Level II.</p></div><div class="acts"><button class="btn btn-sm" onclick="wwAllPass('${id}')">${ic('check')} Đạt tất cả mã chưa chấm</button></div></div>
    <div class="card-b tight filters" style="border-bottom:1px solid var(--line)">${chip('all', 'Tất cả')}${chip('open', 'Chưa chấm')}${chip('P', 'Passed')}${chip('F', 'Không đạt')}${chip('NA', 'N/A')}</div>
    ${shown.map(([it, k]) => wwItem(i, it, k)).join('') || empty('Không có mã hàng', '', 'box')}</div>
  <div class="card" id="sec-load"><div class="sec-h">III. Chất xếp — vận chuyển ${pill(Object.keys(D.load).length + '/' + WW_LOAD.length + ' ảnh', 'gray', 1)}</div><div class="card-b"><div class="photos">${WW_LOAD.map((s, k) => { const p = D.load[k]; return p ? `<div class="shot"><div class="img" style="${bg(p)}" onclick="viewPhoto('${p}','${esc(s)}')"></div><button class="rm" aria-label="Xóa ảnh" onclick="delete INS('${id}').data.load[${k}];save();refreshInsp('${id}')">${ic('x')}</button><div class="cap">${s}</div></div>` : `<button class="shot empty" onclick="INS('${id}').data.load[${k}]=takePhoto('load');save();refreshInsp('${id}')"><div class="img">${ic('camera', '', 'width:24px;height:24px')}</div><div class="cap">${s}<small>Chụp ảnh</small></div></button>`; }).join('')}</div></div></div>
  <div class="card"><div class="sec-h">IV. Các điểm cải tiến ${pill(D.improve.length, 'gray', 1)}</div><div class="card-b stack">
    ${D.improve.length ? `<div class="photos">${D.improve.map((x, k) => `<div class="shot"><div class="img" style="${bg(x.p)}" onclick="viewPhoto('${x.p}','${esc(x.t)}')"></div><button class="rm" aria-label="Xóa" onclick="INS('${id}').data.improve.splice(${k},1);save();refreshInsp('${id}')">${ic('x')}</button><div class="cap">${esc(x.t)}</div></div>`).join('')}</div>` : ''}
    <div class="row"><input class="inp" id="imp-t" list="df-types2" placeholder="Mô tả điểm cần cải tiến, VD: Bo cạnh không đạt R3"><datalist id="df-types2">${DEFECT_TYPES.map(x => `<option>${x}</option>`).join('')}</datalist><button class="btn" style="height:40px;flex:none" onclick="const t=document.getElementById('imp-t').value.trim();if(!t){toast('Nhập mô tả','bad');return}INS('${id}').data.improve.push({t,p:takePhoto('defect')});save();refreshInsp('${id}')">${ic('camera')} Thêm kèm ảnh</button></div></div></div>`;
}
function wwItem(i, it, k) {
  const id = i.id; const kl = wwKL(it); const open = UI.open[id + k];
  const shots = WW_SHOTS[it.part === 'Mặt hộc' ? 'Mặt hộc' : 'Cánh'];
  const klp = kl === 'P' ? pill('Passed', 'ok') : kl === 'F' ? pill('Không đạt', 'bad') : kl === 'NA' ? pill('N/A', 'gray') : pill('Chưa chấm', 'info');
  return `<div class="cp" id="it-${k}"><button class="cp-row" style="width:100%;text-align:left" onclick="UI.open['${id + k}']=!UI.open['${id + k}'];refreshInsp('${id}')"><span class="ico sm tone-${it.part === 'Mặt hộc' ? 'blue' : 'gray'} t-xs fw6">${k + 1}</span><div class="t"><b>${it.code} <span class="muted fw5">· ${it.part}</span></b><small>PO ${it.po} · SL sản xuất ${num(it.slsx)} · SL kiểm ${it.slkiem} · ${Object.keys(it.ph || {}).length} ảnh</small></div>${klp}<span class="muted">${ic(open ? 'down' : 'right')}</span></button>
    ${open ? `<div class="cp-body" style="grid-template-columns:minmax(0,1fr)">
      <div class="row between wrap"><span class="t-sm muted">Chạm từng tiêu chí: trống → ✔ đạt → x không đạt</span><div class="row"><button class="btn btn-sm" onclick="wwSet('${id}',${k},'allP')">${ic('check')} Đạt tất cả</button><button class="btn btn-sm" onclick="wwSet('${id}',${k},'NA')">N/A</button></div></div>
      ${kl === 'NA' ? '' : `<div class="crit-grid">${WW_CRIT.map((c, j) => `<button class="crit ${it.crit[j] === 'P' ? 'p' : it.crit[j] === 'F' ? 'f' : ''}" onclick="wwSet('${id}',${k},${j})"><span class="mk">${it.crit[j] === 'P' ? '✔' : it.crit[j] === 'F' ? 'x' : ''}</span>${c}</button>`).join('')}</div>`}
      <label class="field"><span>Diễn giải ${kl === 'NA' || kl === 'F' ? '<b style="color:var(--red)">*</b>' : ''}</span><input class="inp ${(kl === 'NA' || kl === 'F') && !it.dg ? 'err' : ''}" value="${esc(it.dg || '')}" placeholder="${kl === 'NA' ? 'Lý do chưa kiểm' : 'Mô tả lỗi / ghi chú'}" onchange="setF('${id}','items.${k}.dg',this.value,1)"></label>
      ${kl === 'NA' ? '' : `<div class="field"><span>Hình ảnh thực tế — ${it.code} ${it.part === 'Mặt hộc' ? 'MK' : 'DOOR'}</span><div class="photos">${shots.map(s => { const p = (it.ph || {})[s]; return p ? `<div class="shot"><div class="img" style="${bg(p)}" onclick="viewPhoto('${p}','${esc(s)}')"></div><button class="rm" aria-label="Xóa" onclick="delete INS('${id}').data.items[${k}].ph['${s}'];save();refreshInsp('${id}')">${ic('x')}</button><div class="cap">${s}</div></div>` : `<button class="shot empty" onclick="const it=INS('${id}').data.items[${k}];it.ph=it.ph||{};it.ph['${s}']=takePhoto('dim');save();refreshInsp('${id}')"><div class="img">${ic('camera', '', 'width:24px;height:24px')}</div><div class="cap">${s}<small>Chụp ảnh</small></div></button>`; }).join('')}</div></div>`}</div>` : ''}</div>`;
}
function wwSet(id, k, j) {
  const it = INS(id).data.items[k];
  if (j === 'allP') { it.kl = ''; it.crit = WW_CRIT.map((_, x) => x === 12 ? '' : 'P'); }
  else if (j === 'NA') { it.kl = it.kl === 'NA' ? '' : 'NA'; it.crit = WW_CRIT.map(() => ''); }
  else { it.kl = ''; it.crit[j] = it.crit[j] === '' ? 'P' : it.crit[j] === 'P' ? 'F' : ''; }
  save(); refreshInsp(id);
}
function wwAllPass(id) { const D = INS(id).data; let n = 0; D.items.forEach((it, k) => { if (!wwKL(it)) { it.crit = WW_CRIT.map((_, x) => x === 12 ? '' : 'P'); n++; } }); save(); refreshInsp(id); toast(n ? `Đã đánh dấu đạt ${n} mã — nhớ chụp ảnh từng mã` : 'Không còn mã chưa chấm', n ? 'ok' : 'info'); }

/* ----- 11C DIR / 11E FIN ----- */
function qtyCtl(id, k, f, v) { return `<span class="qty"><button aria-label="Giảm" onclick="rowStep('${id}',${k},'${f}',-1)">${ic('minus', '', 'width:14px;height:14px')}</button><input type="number" min="0" value="${v}" aria-label="${f}" onchange="rowSet('${id}',${k},'${f}',this.value)"><button aria-label="Tăng" onclick="rowStep('${id}',${k},'${f}',1)">${ic('plus', '', 'width:14px;height:14px')}</button></span>`; }
function rowStep(id, k, f, dlt) { const r = INS(id).data.rows[k]; r[f] = Math.max(0, (+r[f] || 0) + dlt); if (['cr', 'ma', 'mi'].includes(f)) r.rj = Math.min(+r.qi || 0, (+r.cr || 0) + (+r.ma || 0)); save(); refreshInsp(id); }
function rowSet(id, k, f, v) { const r = INS(id).data.rows[k]; r[f] = Math.max(0, +v || 0); if (['cr', 'ma', 'mi'].includes(f)) r.rj = Math.min(+r.qi || 0, (+r.cr || 0) + (+r.ma || 0)); save(); refreshInsp(id); }
function rowsCard(i, title) {
  const D = i.data; const id = i.id; const S = dirSum(D.rows);
  return `<div class="card"><div class="card-h"><div class="ttl"><h2>${title}</h2><p>Mỗi dòng là một mã hàng của PO. SL từ chối tự tính = Critical + Major (có thể sửa).</p></div></div>
    ${D.rows.map((r, k) => `<div class="cp" id="row-${k}"><div class="cp-row"><div class="t"><b>PO ${r.po} · ${r.code}</b><small>${r.desc} · SL đơn hàng ${num(r.qo)}</small></div>${+r.rj ? pill(r.rj + ' rejected', 'bad') : +r.qi ? pill('OK', 'ok') : ''}</div>
      <div class="cp-body" style="grid-template-columns:repeat(auto-fit,minmax(128px,1fr))"><label class="field"><span>SL kiểm</span>${qtyCtl(id, k, 'qi', r.qi)}</label><label class="field"><span>Critical</span>${qtyCtl(id, k, 'cr', r.cr)}</label><label class="field"><span>Major</span>${qtyCtl(id, k, 'ma', r.ma)}</label><label class="field"><span>Minor</span>${qtyCtl(id, k, 'mi', r.mi)}</label><label class="field"><span>Rejected</span>${qtyCtl(id, k, 'rj', r.rj)}</label><label class="field"><span>Ghi chú</span><input class="inp sm" value="${esc(r.rm)}" onchange="INS('${id}').data.rows[${k}].rm=this.value;save()"></label></div></div>`).join('')}
    <div class="card-f" style="justify-content:flex-start;flex-wrap:wrap;gap:16px"><span class="t-sm">Tổng: <b>${num(S.qo)}</b> đơn hàng · <b>${num(S.qi)}</b> kiểm · Critical <b>${S.cr}</b> · Major <b>${S.ma}</b> · Minor <b>${S.mi}</b> · Rejected <b style="color:${S.rj ? 'var(--red)' : 'inherit'}">${S.rj}</b></span></div></div>`;
}
function defectPics(i, cat) {
  const D = i.data; const id = i.id;
  return `<div class="card" id="sec-defects"><div class="sec-h">Pictures of defects found during the inspection ${pill(D.defects.length, 'gray', 1)}</div><div class="card-b stack">
    ${D.defects.map((x, k) => `<div class="stack-8"><div class="row between"><b class="t-sm">${esc(x.t)}</b><button class="icon-btn sm" aria-label="Xóa" onclick="INS('${id}').data.defects.splice(${k},1);save();refreshInsp('${id}')">${ic('trash')}</button></div>${strip(id, `defects.${k}.ph`, x.ph, cat)}</div>`).join('<div class="sep" style="margin:0"></div>')}
    <div class="row"><input class="inp" id="dp-t" placeholder="VD: PO 48150 AF TIMBER DB24 — Hairline, Pinholes 3/12 Pcs"><button class="btn" style="height:40px;flex:none" onclick="const t=document.getElementById('dp-t').value.trim();if(!t){toast('Nhập mô tả lỗi','bad');return}INS('${id}').data.defects.push({t,ph:[takePhoto('${cat}')]});save();refreshInsp('${id}')">${ic('camera')} Thêm lỗi kèm ảnh</button></div></div></div>`;
}
function dirBody(i) {
  const D = i.data; const id = i.id; const H = D.header;
  const f = (k, l) => `<label class="field"><span>${l}</span><input class="inp" value="${esc(H[k])}" onchange="setF('${id}','header.${k}',this.value)"></label>`;
  return `<div class="card"><div class="card-h"><div class="ttl"><h2>During Inline Report / Báo cáo kiểm trên chuyền</h2><p>Daily Inspection Report · ${fd(nowISO())}</p></div><div class="seg">${['Inline', 'Final', 'Re-Final'].map(m => `<button class="${D.mode === m ? 'on' : ''}" onclick="setF('${id}','mode','${m}',1)">${m}</button>`).join('')}</div></div>
    <div class="card-b grid g3">${f('factory', 'Factory (Nhà máy)')}${f('customer', 'Customer (Khách hàng)')}${f('collection', 'Collection range')}${f('color', 'Color code / Mã màu')}${f('supplier', 'Finishing supplier')}${f('approvedBy', 'Review / Approved by')}</div></div>
  ${rowsCard(i, 'Kết quả kiểm theo mã hàng')}
  <div class="card"><div class="sec-h">Control plan on process ${pill(D.cp.filter(c => c.r).length + '/5', 'gray', 1)}</div>${DIR_CP.map((c, k) => `<div class="cp" id="cp-${k}"><div class="cp-row"><div class="t"><b>${c.st}</b><small>${c.pts}</small><small>Tiêu chuẩn: ${c.crit} · Lấy mẫu: ${c.smp}</small></div><div class="pf">${['OK', 'NG'].map(s => `<button class="${s === 'OK' ? 'p' : 'f'} ${D.cp[k].r === s ? 'on' : ''}" onclick="setF('${id}','cp.${k}.r','${s}',1)">${s}</button>`).join('')}</div></div>${D.cp[k].r === 'NG' ? `<div class="cp-body" style="grid-template-columns:minmax(0,1fr)"><input class="inp ${D.cp[k].note ? '' : 'err'}" placeholder="Mô tả điểm không đạt" value="${esc(D.cp[k].note)}" onchange="setF('${id}','cp.${k}.note',this.value,1)"></div>` : ''}</div>`).join('')}</div>
  <div class="card" id="sec-sec"><div class="sec-h">Hình ảnh theo công đoạn</div><div class="card-b stack"><label class="field"><span>Material used</span><input class="inp" value="${esc(D.material)}" placeholder="VD: Birch, White Oak" onchange="setF('${id}','material',this.value)"></label>
    ${DIR_SECTIONS.map(s => { const x = D.sec[s.k] || {}; return `<div class="stack-8"><div class="row between"><b class="t-sm">${s.t}</b>${(x.ph || []).length ? pill(x.ph.length + ' ảnh', 'ok') : pill('Chưa có', 'gray')}</div><input class="inp sm" placeholder="Chú thích, VD: PO 48151 DS GTI, PO 48153 DS GTR" value="${esc(x.cap || '')}" onchange="setF('${id}','sec.${s.k}.cap',this.value)">${strip(id, `sec.${s.k}.ph`, x.ph || [], s.ps)}</div>`; }).join('<div class="sep" style="margin:0"></div>')}</div></div>
  ${defectPics(i, 'defect')}`;
}
function finBody(i) {
  const D = i.data; const id = i.id;
  return `${banner('info', 'info', 'Mẫu 11E là đề xuất', 'Khách chưa cung cấp mẫu Final/Packing — phiếu dựng từ Daily Report (chế độ Final) + chuẩn bị đóng gói + chất xếp của mẫu hàng trắng.')}
  ${rowsCard(i, 'Final inspection — AQL Level II')}
  <div class="card"><div class="sec-h">Preparation before packing ${pill(D.pack.filter(Boolean).length + '/' + FIN_PACK.length, 'gray', 1)}</div>${FIN_PACK.map((t, k) => `<div class="cp" id="pack-${k}"><div class="cp-row"><div class="t"><b>${t}</b></div><div class="pf">${['OK', 'NG', 'N/A'].map(s => `<button class="${s === 'OK' ? 'p' : s === 'NG' ? 'f' : 'x'} ${D.pack[k] === s ? 'on' : ''}" onclick="setF('${id}','pack.${k}','${s}',1)">${s}</button>`).join('')}</div></div></div>`).join('')}</div>
  <div class="card" id="sec-load"><div class="sec-h">Chất xếp — vận chuyển</div><div class="card-b"><div class="photos">${WW_LOAD.map((s, k) => { const p = D.load[k]; return p ? `<div class="shot"><div class="img" style="${bg(p)}"></div><button class="rm" aria-label="Xóa" onclick="delete INS('${id}').data.load[${k}];save();refreshInsp('${id}')">${ic('x')}</button><div class="cap">${s}</div></div>` : `<button class="shot empty" onclick="INS('${id}').data.load[${k}]=takePhoto('load');save();refreshInsp('${id}')"><div class="img">${ic('camera', '', 'width:24px;height:24px')}</div><div class="cap">${s}<small>Chụp ảnh</small></div></button>`; }).join('')}</div></div></div>
  ${defectPics(i, 'defect')}`;
}

/* ----- 11D PIG ----- */
function pigBody(i) {
  const D = i.data; const id = i.id; UI.ill = UI.ill || 'D65/10';
  const full = m => m && ['L', 'a', 'b'].every(c => m[c] !== '' && m[c] != null);
  const due = PIG_TIMES.findIndex((_, k) => !(D.xr[k] && full(D.xr[k]['D65/10'])));
  const H = D.header; const f = (k, l) => `<label class="field"><span>${l}</span><input class="inp" value="${esc(H[k])}" onchange="setF('${id}','header.${k}',this.value)"></label>`;
  return `<div class="card"><div class="card-h"><div class="ttl"><h2>Sample monitoring report — Pigment</h2><p>Báo cáo theo dõi mẫu màu Pigment</p></div></div><div class="card-b grid g3">${f('doorStyle', 'Door style / Kiểu cửa')}${f('color', 'Color / Màu')}${f('customer', 'Customer / Khách hàng')}${f('vendor', 'Vendor / Nhà cung cấp')}${f('start', 'Start date / Ngày bắt đầu')}${f('standard', 'Fabuwood color standard')}</div></div>
  <div class="card"><div class="sec-h">Lưu trình kiểm soát quá trình làm mẫu ${pill(D.steps.filter(s => s.ok).length + '/10', 'gray', 1)}</div>${PIG_STEPS.map((s, k) => `<div class="cp" id="step-${k}"><div class="cp-row"><span class="ico sm ${D.steps[k].ok ? 'tone-green' : 'tone-gray'} t-xs fw6">${D.steps[k].ok ? ic('check', '', 'width:14px;height:14px') : k + 1}</span><div class="t"><b>${s[1]} <span class="muted fw5">· ${s[0]}</span></b><small>${s[2]}${D.steps[k].date ? ' · ' + D.steps[k].date : ''}</small></div>${k === 9 ? pill('Sau khi Lead duyệt', 'gray', 1) : `<div class="pf"><button class="p ${D.steps[k].ok ? 'on' : ''}" onclick="const s=INS('${id}').data.steps[${k}];s.ok=!s.ok;s.date=s.ok?(s.date||fd(nowISO())):'';save();refreshInsp('${id}')">OK</button></div>`}</div></div>`).join('')}</div>
  <div class="card"><div class="card-h"><div class="ttl"><h2>X-Rite color values & sheen</h2><p>Chuẩn ${H.standard} · Master #${H.masterNo} · Quy trình ${H.processSheet}. ΔE tính tự động so với chuẩn, ngưỡng ΔE ≤ 1.0.</p></div><div class="seg">${ILLUM.map(x => `<button class="${UI.ill === x ? 'on' : ''}" onclick="UI.ill='${x}';refreshInsp('${id}')">${x}</button>`).join('')}</div></div>
    <div class="tbl-wrap" tabindex="0"><table class="mini-tbl"><thead><tr><th>Waiting time</th><th>L</th><th>a</th><th>b</th><th>ΔL</th><th>Δa</th><th>Δb</th><th>ΔE</th><th>Sheen min–max</th></tr></thead><tbody>
    <tr style="background:var(--surface-2)"><td><b>Chuẩn</b></td><td>${D.ref[UI.ill].L}</td><td>${D.ref[UI.ill].a}</td><td>${D.ref[UI.ill].b}</td><td colspan="5" class="muted">${UI.ill}</td></tr>
    ${PIG_TIMES.map((t, k) => { const x = D.xr[k] && D.xr[k][UI.ill]; const r = D.ref[UI.ill]; if (k === due) return `<tr id="xr-${k}" style="background:var(--primary-soft)"><td><b>${t}</b><br>${pill('Đến hạn đo', 'teal')}</td>${['L', 'a', 'b'].map(c => `<td><input class="inp sm" aria-label="${c}" style="width:72px" type="number" step="0.01" value="${x && x[c] !== undefined ? x[c] : ''}" onchange="pigXr('${id}',${k},'${c}',this.value)"></td>`).join('')}<td colspan="4">${x && !isNaN(deltaE(x, r)) ? `<b style="color:var(--${deltaE(x, r) <= 1 ? 'green' : 'red'})">ΔE ${deltaE(x, r).toFixed(2)}</b>` : '<span class="muted">Nhập L a b</span>'}</td><td><input class="inp sm" aria-label="Sheen" style="width:96px" placeholder="29–32" value="${D.xr[k] && D.xr[k].sheen ? D.xr[k].sheen.join('–') : ''}" onchange="pigSheen('${id}',${k},this.value)"></td></tr>`;
      if (!x) return `<tr><td class="muted">${t}</td><td colspan="8" class="muted">—</td></tr>`; const e = deltaE(x, r); return `<tr><td>${t}</td><td>${x.L}</td><td>${x.a}</td><td>${x.b}</td><td>${(x.L - r.L).toFixed(2)}</td><td>${(x.a - r.a).toFixed(2)}</td><td>${(x.b - r.b).toFixed(2)}</td><td><b style="color:var(--${e <= 1 ? 'green' : 'red'})">${e.toFixed(2)}</b></td><td>${D.xr[k].sheen ? D.xr[k].sheen.join('–') : ''}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="card-b">${strip(id, 'photos.color', D.photos.color || [], 'color')}</div></div>
  ${PIG_SEC.map(sec => `<div class="card" id="sec-${sec.k}"><div class="sec-h">${sec.t} <span class="muted fw5">· ${sec.when}</span></div>${sec.rows.map((r, k) => { const v = (D.sec[sec.k] || [])[k] || {}; const unit = r[2] && r[2] !== 'sel' ? r[2] : ''; return `<div class="cp"><div class="cp-row"><div class="t"><b>${r[0]}</b><small>Yêu cầu: ${r[1]}</small></div>
      ${r[2] === 'sel' ? `<select class="sel sm" aria-label="Kết quả bám dính" style="width:96px" onchange="pigSec('${id}','${sec.k}',${k},this.value)"><option value="">—</option>${['5B', '4B', '3B', '2B', '1B', '0B'].map(o => `<option ${v.v === o ? 'selected' : ''}>${o}</option>`).join('')}</select>` : unit ? `<input class="inp sm" aria-label="Giá trị đo" style="width:96px" type="number" step="0.1" placeholder="${unit}" value="${v.v ?? ''}" onchange="pigSec('${id}','${sec.k}',${k},this.value)">` : ''}
      <div class="pf"><button class="p ${v.r === 'P' ? 'on' : ''}" onclick="pigSecR('${id}','${sec.k}',${k},'P')">Đạt</button><button class="f ${v.r === 'F' ? 'on' : ''}" onclick="pigSecR('${id}','${sec.k}',${k},'F')">Không đạt</button></div></div></div>`; }).join('')}</div>`).join('')}
  <div class="card"><div class="sec-h">VI. KCMA test — NCC sơn test và cung cấp báo cáo</div>${KCMA.map((t, k) => `<div class="cp" id="kcma-${k}"><div class="cp-row"><span class="ico sm tone-gray t-xs fw6">${k + 1}</span><div class="t"><b>${t[0]}</b><small>${t[1]} · Yêu cầu: ${t[2]}</small></div><div class="pf"><button class="p ${D.kcma[k].r === 'P' ? 'on' : ''}" onclick="setF('${id}','kcma.${k}.r','P',1)">Pass</button><button class="f ${D.kcma[k].r === 'F' ? 'on' : ''}" onclick="setF('${id}','kcma.${k}.r','F',1)">Fail</button></div></div>${D.kcma[k].r ? `<div class="cp-body" style="grid-template-columns:minmax(0,1fr)"><input class="inp sm" placeholder="Số báo cáo test / ghi chú" value="${esc(D.kcma[k].note || '')}" onchange="setF('${id}','kcma.${k}.note',this.value)"></div>` : ''}</div>`).join('')}</div>`;
}
function pigXr(id, k, c, v) { const D = INS(id).data; D.xr[k] = D.xr[k] || { by: ME.name, date: nowISO(), xrite: 'Ci64 #VHG-02' }; D.xr[k][UI.ill] = D.xr[k][UI.ill] || { L: '', a: '', b: '' }; D.xr[k][UI.ill][c] = v === '' ? '' : +v; D.xr[k].date = nowISO(); save(); refreshInsp(id); }
function pigSheen(id, k, v) { const D = INS(id).data; D.xr[k] = D.xr[k] || {}; const m = v.split(/[-–\s]+/).map(Number).filter(x => !isNaN(x)); D.xr[k].sheen = m.length ? [m[0], m[1] ?? m[0]] : null; save(); }
function pigSec(id, s, k, v) { const D = INS(id).data; D.sec[s] = D.sec[s] || []; D.sec[s][k] = D.sec[s][k] || {}; const r = PIG_SEC.find(x => x.k === s).rows[k]; const x = D.sec[s][k]; x.v = r[2] === 'sel' ? v : (v === '' ? '' : +v); if (r[2] === 'sel' && v) x.r = ['5B', '4B'].includes(v) ? 'P' : 'F'; else if (r[3] != null && v !== '') x.r = (+v >= r[3] && +v <= r[4]) ? 'P' : 'F'; save(); refreshInsp(id); }
function pigSecR(id, s, k, r) { const D = INS(id).data; D.sec[s] = D.sec[s] || []; D.sec[s][k] = D.sec[s][k] || {}; D.sec[s][k].r = D.sec[s][k].r === r ? '' : r; save(); refreshInsp(id); }

/* ----- submit ----- */
function missId(m) { return { chk: 'chk-' + m.id, item: 'it-' + m.id, row: 'row-' + m.id, cp: 'cp-' + m.id, step: 'step-' + m.id, xr: 'xr-' + m.id, kcma: 'kcma-' + m.id, pack: 'pack-' + m.id, sec: 'sec-' + m.id, concl: 'concl' }[m.k]; }
function submitInspect(id) {
  const i = INS(id); const e = evalInsp(i);
  if (e.miss.length) {
    e.miss.forEach(m => { if (m.k === 'item') UI.open[id + m.id] = true; }); refreshInsp(id);
    e.miss.forEach(m => { const el = document.getElementById(missId(m)); if (el) el.classList.add('miss'); });
    document.getElementById('miss').innerHTML = banner('bad', 'alert', `Phiếu chưa đầy đủ — còn ${e.miss.length} mục (bước 16)`, e.miss.slice(0, 6).map(m => `<a class="link" style="color:var(--red)" href="javascript:void(0)" onclick="document.getElementById('${missId(m)}')?.scrollIntoView({behavior:'smooth',block:'center'})">${esc(m.t)}</a>`).join('<br>') + (e.miss.length > 6 ? `<br>… và ${e.miss.length - 6} mục khác` : ''));
    document.getElementById('miss').scrollIntoView({ behavior: 'smooth', block: 'center' }); toast(`Còn ${e.miss.length} mục thiếu — bổ sung trước khi gửi`, 'bad'); return;
  }
  if (critOf(i).length && !DB.alerts.some(a => a.ins === id)) { alertModal(id); toast('Có lỗi Critical — gửi cảnh báo cho Lead trước', 'warn'); return; }
  if (!DB.online) { i.status = 'offline'; if (!DB.outbox.includes(id)) DB.outbox.push(id); addLog('offline', `Lưu offline ${i.id}`, i.pos[0]); save(); go('work'); toast('Mất mạng — đã lưu offline, sẽ tự gửi khi có mạng', 'warn'); return; }
  deliver(i); save(); go('work'); toast(`Đã gửi ${i.title} — chờ Lead duyệt`, 'ok');
}
function deliver(i) { i.status = 'submitted'; i.submittedAt = nowISO(); addLog('submit', `Gửi ${i.id} (${TYPES[i.type].code} ${TYPES[i.type].short})`, i.pos[0]); }

/* ---------------- PRODUCTION (P1) ---------------- */
function prodSteps(p, edit) {
  let g = ''; const P = UI.prod;
  return PROD_STEPS.map((s, k) => { const head = s.g !== g ? `<div class="sec-h">${STAGE[s.g].name}</div>` : ''; g = s.g; const pcs = edit ? P.pcs[k] : Math.round(poQty(p) * p.progress[k] / 100); const pct = Math.min(100, Math.round(pcs / poQty(p) * 100));
    return `${head}<div class="cp"><div class="cp-row"><div class="t"><b>${k + 1}. ${s.t}</b><small>${s.s}</small></div>${edit ? `<input class="inp sm" style="width:104px" type="number" min="0" max="${poQty(p)}" value="${pcs}" aria-label="Số lượng" onchange="UI.prod.pcs[${k}]=Math.min(${poQty(p)},+this.value||0);render()">` : `<span class="t-sm num">${num(pcs)}</span>`}<span class="t-sm muted num" style="width:64px">/ ${num(poQty(p))}</span><div style="width:140px">${bar(pct, pct >= 100 ? 'var(--green-fill)' : null)}</div></div></div>`; }).join('');
}
function pageProd(i) {
  const p = insPOs(i)[0]; UI.prod = UI.prod && UI.prod.id === i.id ? UI.prod : { id: i.id, pcs: p.progress.map(v => Math.round(poQty(p) * v / 100)), bn: p.bottleneck ? { ...p.bottleneck } : null };
  const P = UI.prod; const done = i.status === 'approved';
  return `${pageHead('Cập nhật tiến độ sản xuất', `PO ${p.id} · ${p.series} · ${U(i.assignee).name}`, pill(relDay(i.due).t, relDay(i.due).c), 'work')}<div class="stack">
  <div class="card"><div class="card-h"><div class="ttl"><h2>Sản lượng theo 10 công đoạn</h2><p>P1 — số liệu cập nhật lên Dashboard và dự báo giao hàng của Lead.</p></div></div>${prodSteps(p, !done)}</div>
  <div class="card"><div class="card-h"><div class="ttl"><h2>Điểm nghẽn</h2></div></div><div class="card-b stack"><label class="chk ${P.bn ? 'on' : ''}"><input type="checkbox" ${P.bn ? 'checked' : ''} ${done ? 'disabled' : ''} onchange="UI.prod.bn=this.checked?{g:'PAINT',pcs:0,note:''}:null;render()"><span class="fw5">Có điểm nghẽn / hàng kẹt</span></label>
    ${P.bn ? `<div class="grid g3"><label class="field"><span>Công đoạn</span><select class="sel" onchange="UI.prod.bn.g=this.value">${STAGES.map(s => `<option value="${s.k}" ${P.bn.g === s.k ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label><label class="field"><span>Số lượng kẹt</span><input class="inp" type="number" value="${P.bn.pcs}" oninput="UI.prod.bn.pcs=+this.value"></label><label class="field"><span>Nguyên nhân</span><input class="inp" value="${esc(P.bn.note)}" oninput="UI.prod.bn.note=this.value"></label></div>` : ''}</div></div>
  ${done ? banner('ok', 'checkc', 'Đã cập nhật tiến độ hôm nay', fdt(i.review.at)) : `<div class="sticky-actions"><a class="btn btn-lg hide-m" href="#/work">Quay lại</a><button class="btn btn-primary btn-lg grow" onclick="saveProd('${i.id}')">${ic('check')} Lưu tiến độ hôm nay</button></div>`}</div>`;
}
function saveProd(id) {
  const i = INS(id); const p = insPOs(i)[0]; const P = UI.prod;
  if (P.bn && !P.bn.note.trim()) { toast('Nhập nguyên nhân điểm nghẽn', 'bad'); return; }
  p.progress = P.pcs.map(v => Math.min(100, Math.round(v / poQty(p) * 100))); p.bottleneck = P.bn;
  i.status = 'approved'; i.review = { by: ME.id, at: nowISO(), decision: 'prod' }; UI.prod = null;
  addLog('prod', `Cập nhật tiến độ PO ${p.id}${p.bottleneck ? ' · điểm nghẽn ' + STAGE[p.bottleneck.g].name : ''}`, p.id); save(); go('work'); toast(`Đã lưu tiến độ PO ${p.id}`, 'ok');
}
