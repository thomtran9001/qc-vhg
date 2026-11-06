/* =====================================================================
   LEAD QC — Dashboard · Đồng bộ · PO & kế hoạch đánh giá · Duyệt
   ===================================================================== */
const typeChip = (p, t) => { const s = typeState(p, t); const u = TS_UI[s.state]; return `<span class="pill ${u[1]}" title="${TYPES[t].name}: ${u[0]}">${TYPES[t].code} ${u[0]}</span>`; };

/* ---------------- DASHBOARD (P2) ---------------- */
function actionItems() {
  const out = [];
  DB.alerts.filter(a => a.status === 'new').forEach(a => out.push({ lv: 'Cao', c: 'bad', alert: a }));
  DB.syncLog.filter(s => !s.ok && !s.resolved).forEach(s => out.push({ lv: 'Cao', c: 'bad', i: 'refresh', t: `Lỗi đồng bộ PO ${s.po}`, s: s.issues.join(' · '), go: 'sync' }));
  DB.ins.filter(i => i.status === 'submitted').forEach(i => out.push({ lv: 'Trung bình', c: 'warn', i: 'inbox', t: `${i.title} chờ duyệt`, s: `${TYPES[i.type].code} · ${U(i.assignee).name} gửi ${fdt(i.submittedAt)}`, go: 'review/' + i.id }));
  DB.pos.filter(p => poState(p) === 'ready').forEach(p => out.push({ lv: 'Trung bình', c: 'teal', i: 'flag', t: `PO ${p.id} đủ điều kiện chốt`, s: 'Đủ kết quả các loại đánh giá', go: 'po/' + p.id }));
  DB.ins.filter(i => ['todo', 'draft', 'returned'].includes(i.status) && dayDiff(i.due) < 0).forEach(i => out.push({ lv: 'Thấp', c: 'gray', i: 'clock', t: `${i.title} quá hạn`, s: `${U(i.assignee).name} · hạn ${fd(i.due)}`, go: 'task/' + i.id }));
  mergeSuggestions().forEach(({ i, mc }) => out.push({ lv: 'Thấp', c: 'warn', i: 'layers', t: `Đề xuất gộp ${TYPES[i.type].code} · ${fd(i.due)} · ${i.factory}`, s: `${i.id} + ${[...mc.forms.map(j => j.id), ...mc.pos.map(x => 'PO ' + x.id)].join(', ')}`, go: 'merge/' + i.id }));
  DB.pos.filter(p => poState(p) === 'planning').forEach(p => out.push({ lv: 'Thấp', c: 'violet', i: 'calendar', t: `PO ${p.id} chưa lập kế hoạch kiểm`, s: `${p.lines.length} PO Line · đồng bộ ${fdt(p.syncedAt)}`, go: 'po/' + p.id }));
  return out;
}
function alertRow(a) {
  return `<div class="li" style="align-items:flex-start;background:color-mix(in srgb,var(--red-soft) 50%,transparent)"><span class="ico tone-red">${ic('zap')}</span><div class="body"><div class="title"><span class="trunc">${esc(a.title)}</span>${pill('Critical', 'bad')}</div><div class="meta"><span>${esc(a.text)}</span></div><div class="meta"><span>PO ${a.pos.join(', ')}</span><span>${U(a.by).name}</span><span>${fdt(a.at)}</span><span>Phiếu ${a.ins}</span></div>
    <div class="row wrap mt12"><a class="btn btn-sm" href="#/review/${a.ins}">${ic('eye')} Xem phiếu</a><button class="btn btn-sm btn-primary" onclick="alertAct('${a.id}')">${ic('check')} Đã xem, ghi nhận</button></div></div></div>`;
}
function alertAct(id) {
  const a = DB.alerts.find(x => x.id === id); a.status = 'ack';
  addLog('ack', `Ghi nhận cảnh báo: ${a.title}`, a.pos[0]); save(); render(); toast('Đã ghi nhận cảnh báo', 'ok');
}
function pageDashboard() {
  const run = DB.pos.filter(p => !p.closed && p.cust === 'FBW'); const all = DB.pos.filter(p => !p.closed);
  const acts = actionItems(); const c = counts(); UI.wide = true;
  return `${hubHead('dashboard', 'Rủi ro sản xuất và chất lượng trên toàn bộ PO đang chạy.', `<a class="btn" href="#/sync">${ic('refresh')} Đồng bộ Base</a><a class="btn btn-primary" href="#/review">${ic('inbox')} Chờ duyệt${c.review ? ' · ' + c.review : ''}</a>`)}
  <div class="grid g4">
    <div class="card stat"><div class="lbl">${ic('package')} Số lượng hàng</div><div class="val">${num(run.reduce((a, p) => a + poQty(p), 0))}</div><div class="sub">pcs trên ${run.length} PO Fabuwood đang chạy</div></div>
    <div class="card stat"><div class="lbl">${ic('truck')} Giá trị đơn hàng</div><div class="val">${money(run.reduce((a, p) => a + p.value, 0))}</div><div class="sub">tổng giá trị PO đang chạy</div></div>
    <div class="card stat"><div class="lbl">${ic('inbox')} Phiếu chờ duyệt</div><div class="val">${c.review}</div><div class="sub">${DB.ins.filter(i => ['todo', 'draft'].includes(i.status)).length} phiếu đang trong lịch kiểm</div></div>
    <div class="card stat"><div class="lbl">${ic('zap')} Cảnh báo Critical</div><div class="val" style="color:${c.alerts ? 'var(--red)' : 'inherit'}">${c.alerts}</div><div class="sub">chưa ghi nhận · ${DB.alerts.length} cảnh báo tổng</div></div>
  </div>
  <div class="grid g-side mt16">
    <div class="card"><div class="card-h"><div class="ttl"><h2>Tiến độ PO và trạng thái QC</h2><p>Thanh: sản lượng theo nhóm công đoạn (P1). Dòng dưới: kết quả từng loại đánh giá trong kế hoạch.</p></div></div>
      <div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>PO</th>${STAGES.map(s => `<th>${s.name}</th>`).join('')}<th>ETD</th><th>Rủi ro</th><th><span class="sr">Thao tác</span></th></tr></thead><tbody>
      ${all.map(p => { const r = risk(p); return `<tr class="click" onclick="go('po/${p.id}')"><td class="nw"><b>${p.id}</b><div class="t-xs muted">${p.cust} · ${p.factory}</div></td>${STAGES.map(s => `<td style="min-width:96px">${bar(stagePct(p, s.k), p.bottleneck && p.bottleneck.g === s.k ? 'var(--red-fill)' : stagePct(p, s.k) >= 100 ? 'var(--green-fill)' : null)}</td>`).join('')}<td class="nw num">${fd(p.etd)}</td><td>${pill(r[0], r[1])}</td><td><button class="icon-btn sm" aria-label="Xem nhanh" onclick="event.stopPropagation();poDrawer('${p.id}')">${ic('eye')}</button></td></tr>
        <tr class="click" onclick="go('po/${p.id}')"><td colspan="${STAGES.length + 4}" style="padding-top:0"><div class="row wrap">${p.plan.map(t => typeChip(p, t)).join('')}${p.bottleneck ? `<span class="t-xs" style="color:var(--red)">${ic('alert', '', 'width:12px;height:12px;vertical-align:-2px')} ${esc(p.bottleneck.note)}</span>` : ''}</div></td></tr>`; }).join('')}
      </tbody></table></div></div>
    <div class="card"><div class="card-h"><div class="ttl"><h2>Cần hành động</h2><p>${acts.length} việc tồn đọng</p></div></div><div class="list">${acts.length ? acts.slice(0, 9).map(a => a.alert ? alertRow(a.alert) : `<a class="li" href="#/${a.go}"><span class="ico sm tone-${{ bad: 'red', warn: 'amber', teal: 'teal', violet: 'violet', gray: 'gray' }[a.c]}">${ic(a.i, '', 'width:14px;height:14px')}</span><div class="body"><div class="title t-sm"><span class="trunc">${esc(a.t)}</span></div><div class="meta"><span class="trunc" style="max-width:260px">${esc(a.s)}</span></div></div></a>`).join('') : empty('Không có việc tồn đọng', '', 'checkc')}</div></div>
  </div>`;
}
function poDrawer(id) {
  const p = PO(id);
  openModal({ drawer: true, title: `PO ${p.id}`, sub: `${p.customer} · ${p.series} · ${p.color}`,
    body: `<div class="stack"><div class="kv-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${kv('Số lượng', num(poQty(p)) + ' pcs')}${kv('Giá trị', money(p.value))}${kv('ETD', fd(p.etd))}${kv('Xưởng', p.factory + (p.finisher && p.finisher !== p.factory ? ' → ' + p.finisher : ''))}</div>
    <div class="sep" style="margin:0"></div><b>Kế hoạch đánh giá</b><div class="stack-8">${p.plan.map(t => `<div class="row between"><span class="t-sm">${TYPES[t].code} · ${TYPES[t].name}</span>${pill(TS_UI[typeState(p, t).state][0], TS_UI[typeState(p, t).state][1])}</div>`).join('')}</div>
    <div class="sep" style="margin:0"></div><b>Sản lượng theo công đoạn</b>${STAGES.map(s => `<div><div class="row between t-sm mt4"><span>${s.name}</span></div>${bar(stagePct(p, s.k), p.bottleneck && p.bottleneck.g === s.k ? 'var(--red-fill)' : null)}</div>`).join('')}</div>`,
    foot: `<button class="btn" onclick="closeModal()">Đóng</button><a class="btn btn-primary" href="#/po/${p.id}">Mở chi tiết PO</a>` });
}

/* ---------------- SYNC (01–03, E2) ---------------- */
function pageSync() {
  const errs = DB.syncLog.filter(s => !s.ok && !s.resolved); const last = DB.syncLog[0];
  return `${pageHead('Đồng bộ Base Service', 'PO, PO Line, mã hàng, số lượng và xưởng được đồng bộ tự động khi Base phát sinh hoặc cập nhật PO.', `<button class="btn btn-primary" id="syncBtn" onclick="syncNow()">${ic('refresh')} Đồng bộ ngay</button>`)}
  <div class="grid g4"><div class="card stat"><div class="lbl">${ic('database')} Kết nối Base</div><div class="val" style="font-size:18px;line-height:36px;color:var(--green)">Hoạt động</div><div class="sub">Webhook + quét định kỳ 15 phút</div></div>
    <div class="card stat"><div class="lbl">${ic('clock')} Lần gần nhất</div><div class="val" style="font-size:18px;line-height:36px">${last ? fdt(last.at) : '—'}</div><div class="sub">${last ? 'PO ' + last.po : ''}</div></div>
    <div class="card stat"><div class="lbl">${ic('checkc')} PO hợp lệ đã lưu</div><div class="val">${DB.pos.length}</div><div class="sub">${DB.pos.reduce((a, p) => a + p.lines.length, 0)} PO Line</div></div>
    <div class="card stat"><div class="lbl">${ic('alert')} Lỗi chờ bổ sung</div><div class="val" style="color:${errs.length ? 'var(--red)' : 'inherit'}">${errs.length}</div><div class="sub">PO chưa được tạo trong QC</div></div></div>
  ${errs.map(s => `<div class="card mt16" style="border-color:color-mix(in srgb,var(--red) 30%,var(--line))"><div class="card-h"><span class="ico tone-red">${ic('alert')}</span><div class="ttl"><h2>PO ${s.po} — dữ liệu không hợp lệ (bước 02)</h2><p>Base gửi sự kiện ${s.type === 'create' ? 'tạo mới' : 'cập nhật'} lúc ${fdt(s.at)} · hệ thống không lưu PO</p></div>${pill(s.requested ? 'Đã yêu cầu bổ sung' : 'Chưa xử lý', s.requested ? 'warn' : 'bad')}</div>
    <div class="card-b grid g-main" style="gap:24px"><div class="stack-8">${s.issues.map(x => `<div class="row t-sm">${ic('xc', '', 'color:var(--red)')}<span>${x}</span></div>`).join('')}${s.requested ? `<div class="mt8">${banner('warn', 'clock', `Đã gửi yêu cầu bổ sung lúc ${fdt(s.requested)}`, 'Sau khi Base cập nhật đủ dữ liệu, bấm “Đồng bộ lại”.')}</div>` : ''}</div>
    <div class="stack-8"><button class="btn btn-block" ${s.requested ? 'disabled' : ''} onclick="requestFix('${s.id}')">${ic('send')} Yêu cầu bổ sung dữ liệu</button><button class="btn btn-primary btn-block" id="re-${s.id}" onclick="resync('${s.id}')">${ic('refresh')} Đồng bộ lại</button></div></div></div>`).join('')}
  <div class="card mt16"><div class="card-h"><div class="ttl"><h2>Nhật ký đồng bộ</h2><p>Mỗi sự kiện từ Base được kiểm tra hợp lệ trước khi lưu PO (bước 03).</p></div></div><div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>Thời gian</th><th>PO</th><th>Sự kiện</th><th>Nội dung</th><th>Kết quả</th></tr></thead><tbody>
    ${DB.syncLog.map(s => `<tr ${s.ok && PO(s.po) ? `class="click" onclick="go('po/${s.po}')"` : ''}><td class="nw num">${fdt(s.at)}</td><td class="nw fw6">${s.po}</td><td>${pill(s.type === 'create' ? 'Tạo mới' : 'Cập nhật', s.type === 'create' ? 'info' : 'gray')}</td><td>${esc(s.ok ? s.note : s.issues.join(' · '))}</td><td>${s.ok ? pill('Đã lưu', 'ok') : s.resolved ? pill('Đã xử lý', 'teal') : pill('Lỗi dữ liệu', 'bad')}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function syncNow() {
  const b = document.getElementById('syncBtn'); b.disabled = true; b.innerHTML = `${ic('refresh', 'spin')} Đang đồng bộ…`;
  setTimeout(() => { const p = DB.baseQueue.shift(); if (!p) { toast('Không có thay đổi mới từ Base', 'info'); render(); return; }
    p.syncedAt = nowISO(); DB.pos.unshift(p); DB.syncLog.unshift({ id: genId('sy', 'SY-'), at: nowISO(), po: p.id, type: 'create', ok: true, note: `${p.lines.length} PO Line · ${num(poQty(p))} pcs · ${p.factory}` });
    addLog('sync', `Đồng bộ PO mới ${p.id} từ Base`, p.id); save(); render(); toast(`Đã lưu PO ${p.id} — ${p.lines.length} PO Line`, 'ok'); }, 1200);
}
function requestFix(id) { const s = DB.syncLog.find(x => x.id === id); s.requested = nowISO(); addLog('sync_req', `Yêu cầu bổ sung dữ liệu PO ${s.po}`, s.po); save(); render(); toast('Đã gửi yêu cầu bổ sung tới Sales / Base', 'ok'); }
function resync(id) {
  const s = DB.syncLog.find(x => x.id === id); const b = document.getElementById('re-' + id); b.disabled = true; b.innerHTML = `${ic('refresh', 'spin')} Đang đồng bộ…`;
  setTimeout(() => {
    if (!s.requested) { s.resolved = true; DB.syncLog.unshift({ ...s, id: genId('sy', 'SY-'), at: nowISO(), resolved: false }); save(); render(); toast('Vẫn thiếu dữ liệu — cần yêu cầu bổ sung trên Base trước', 'bad'); return; }
    s.resolved = true; const p = s.payload; p.syncedAt = nowISO(); DB.pos.unshift(p);
    DB.syncLog.unshift({ id: genId('sy', 'SY-'), at: nowISO(), po: p.id, type: 'create', ok: true, note: `Đồng bộ lại thành công · ${p.lines.length} PO Line` });
    addLog('sync', `Đồng bộ lại PO ${p.id} thành công`, p.id); save(); render(); toast(`PO ${p.id} đã hợp lệ và được lưu`, 'ok');
  }, 1200);
}

/* ---------------- PO LIST ---------------- */
function pagePOs() {
  const tabs = [['planning', 'Chờ lập kế hoạch', p => poState(p) === 'planning'], ['active', 'Đang chạy', p => !p.closed], ['ready', 'Sẵn sàng chốt', p => poState(p) === 'ready'], ['closed', 'Đã chốt', p => p.closed]];
  const sg = mergeSuggestions(); tabs.push(['merge', 'Đề xuất gộp phiếu', null]);
  const cur = tabs.find(t => t[0] === UI.poTab) || tabs[0]; const list = cur[2] ? DB.pos.filter(cur[2]) : [];
  return `${pageHead('Purchase Orders', 'PO đồng bộ từ Base. Mỗi PO có kế hoạch gồm nhiều loại đánh giá theo mẫu phiếu của VHG.', `<a class="btn" href="#/sync">${ic('refresh')} Đồng bộ Base</a>`)}
  <div class="card"><div class="tabs" style="padding:0 20px">${tabs.map(t => `<button class="${t[0] === cur[0] ? 'on' : ''}" onclick="UI.poTab='${t[0]}';render()">${t[1]} <span class="n"${t[0] === 'merge' && sg.length ? ' style="background:var(--amber-soft,var(--surface-3));color:var(--amber)"' : ''}>${t[2] ? DB.pos.filter(t[2]).length : sg.length}</span></button>`).join('')}</div>
  ${cur[0] === 'merge' ? mergeList(sg) : `<div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>PO</th><th>Khách hàng · dòng hàng</th><th>Xưởng</th><th class="r">Số lượng</th><th>ETD</th><th>Kế hoạch đánh giá</th><th>Trạng thái</th></tr></thead><tbody>
  ${list.length ? list.map(p => `<tr class="click" onclick="go('po/${p.id}')"><td class="nw"><b>${p.id}</b><div class="t-xs muted">${p.lines.length} PO Line</div></td><td>${p.customer}<div class="t-xs muted">${p.series} · ${p.color}</div></td><td class="nw">${p.factory}</td><td class="r nw">${num(poQty(p))}</td><td class="nw num">${fd(p.etd)}</td><td><div class="row wrap">${p.plan.map(t => typeChip(p, t)).join('')}</div></td><td>${psPill(p)}</td></tr>`).join('') : `<tr><td colspan="7">${empty('Không có PO', '', 'box')}</td></tr>`}</tbody></table></div>`}</div>`;
}
/* các nhóm phiếu có thể gộp (cùng loại · cùng ngày · cùng nơi kiểm) — kể cả khi Lead đã bấm "Bỏ qua" */
function mergeSuggestions() {
  const g = new Map();
  DB.ins.filter(i => i.kind === 'qc' && i.status === 'todo' && !i.codes).forEach(i => {
    const mc = mergeCands(i); if (!mc.forms.length && !mc.pos.length) return;
    const k = i.type + '|' + fd(i.due) + '|' + i.factory; const o = g.get(k); if (!o || (i.createdAt || '') > (o.i.createdAt || '')) g.set(k, { i, mc });
  });
  return [...g.values()].sort((a, b) => a.i.due.localeCompare(b.i.due));
}
function mergeList(sg) {
  if (!sg.length) return empty('Không có đề xuất gộp', 'Không có phiếu cùng loại, cùng ngày, cùng nơi kiểm cần gộp.', 'checkc');
  return `<div class="list">${sg.map(({ i, mc }) => { const T = TYPES[i.type]; const ids = [i.id, ...mc.forms.map(j => j.id)]; const pos = [...new Set([...i.pos, ...mc.forms.flatMap(j => j.pos), ...mc.pos.map(x => x.id)])];
    return `<a class="li" href="#/merge/${i.id}"><span class="ico tone-amber">${ic('layers')}</span><div class="body"><div class="title"><span class="trunc">${T.code} · ${T.name} · ${fd(i.due)} · ${i.factory}</span></div>
    <div class="meta"><span>Phiếu ${ids.join(', ')}</span><span>PO ${pos.join(', ')}</span>${mc.pos.length ? `<span>${mc.pos.length} PO chưa có phiếu</span>` : ''}</div></div>
    <div class="side">${pill(pos.length + ' PO → 1 phiếu', 'warn')}<small>${relDay(i.due).t}</small></div></a>`; }).join('')}</div>`;
}

/* ---------------- PO DETAIL (04–07, 23–26) ---------------- */
function reuseCandidate(p, t) {
  if ((p.reuse || {})[t] || DB.ins.some(i => i.type === t && i.kind === 'qc' && i.pos.includes(p.id))) return null;
  if (t === 'PLY' && p.plyPO) return DB.ins.find(i => i.type === 'PLY' && i.status === 'approved' && i.pos.includes(p.plyPO));
  if (t === 'PIG') return DB.ins.find(i => i.type === 'PIG' && i.status === 'approved' && i.color === p.color);
  return null;
}
function poStepper(p) {
  return `<div class="stepper">${STAGES.map(s => { const pct = stagePct(p, s.k); const bn = p.bottleneck && p.bottleneck.g === s.k; const cls = bn ? 'blk' : pct >= 100 ? 'done' : pct > 0 ? 'cur' : '';
    return `<div class="step ${cls}"><span class="dot">${ic(bn ? 'alert' : pct >= 100 ? 'check' : s.icon, '', 'width:14px;height:14px')}</span><b>${s.name}</b><small>${pct}%</small></div>`; }).join('')}</div>`;
}
function pagePO(id) {
  const p = PO(id); if (!p) throw 0; const chk = poCheck(p); const st = poState(p); UI.wide = true;
  const reps = DB.reports.filter(r => r.po === p.id);
  const acts = st === 'closed' ? `<button class="btn btn-primary" onclick="exportPOModal('${p.id}')">${ic('file')} Xuất phiên bản mới</button>` : `<button class="btn ${st === 'ready' ? '' : 'btn-primary'}" onclick="planModal('${p.id}')">${ic('plus')} Lập phiếu kiểm</button>${st === 'ready' ? `<button class="btn btn-primary" onclick="closePO('${p.id}')">${ic('flag')} Chốt PO</button>` : ''}`;
  return `${pageHead(`PO ${p.id} ${psPill(p)}`, `${p.customer} · ${p.series} · màu ${p.color} · ${p.factory}${p.finisher && p.finisher !== p.factory ? ' → ' + p.finisher : ''} · ${p.cont}`, acts, 'pos')}<div class="stack">
  ${st === 'ready' ? banner('teal', 'checkc', 'PO đã đủ kết quả và không còn điều kiện chặn (bước 24)', 'Kiểm tra tổng hợp rồi chốt trạng thái PO để xuất báo cáo.', `<button class="btn btn-primary btn-sm" onclick="closePO('${p.id}')">Chốt PO</button>`) : ''}
  ${st === 'planning' ? banner('info', 'info', 'PO mới đồng bộ — chưa có phiếu kiểm', 'Lập phiếu cho từng loại đánh giá trong kế hoạch, hoặc dùng lại kết quả đã có (plywood cùng lô, mẫu màu đã ký).') : ''}
  ${st === 'closed' ? banner('ok', 'flag', `PO đã chốt ${fdt(p.closed.at)}`, 'Báo cáo PO được lưu theo phiên bản.') : ''}
  <div class="card"><div class="card-b"><div class="kv-grid">${kv('Số lượng', num(poQty(p)) + ' pcs')}${kv('Giá trị', money(p.value))}${kv('ETD', fd(p.etd))}${kv('Tiến độ', poPct(p) + '%')}${kv('Plywood từ PO', p.plyPO || '—')}${kv('Đồng bộ Base', fdt(p.syncedAt))}</div><div class="sep"></div>${poStepper(p)}</div></div>
  <div class="grid g-main"><div class="stack">
    <div class="card"><div class="card-h"><div class="ttl"><h2>Kế hoạch đánh giá</h2><p>Bước 05–08 · mỗi loại có thể có nhiều phiên kiểm, một phiên có thể gộp nhiều PO.</p></div></div>${ZONES.map(z => `<div class="sec-h">${ic(z.k === 'raw' ? 'box' : 'droplet', '', 'width:14px;height:14px')}<span>${z.name}</span><span class="muted t-xs" style="margin-left:auto;font-weight:500">${z.types.map(t => TYPES[t].code).join(' → ')}</span></div><div class="list">${z.types.map(t => planRow(p, t)).join('')}</div>`).join('')}</div>
    <div class="card"><div class="card-h"><div class="ttl"><h2>PO Line và kết quả hàng trắng</h2><p>Bước 23 · kết quả đã duyệt tự liên kết với PO Line cùng mã hàng.</p></div></div><div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>#</th><th>Mã hàng</th><th>Chi tiết</th><th class="r">SL</th>${p.plan.includes('WW') ? '<th>11A Hàng trắng</th>' : ''}${p.plan.includes('DIR') ? '<th>11C Daily</th>' : ''}</tr></thead><tbody>
      ${p.lines.map(l => `<tr><td class="muted">${l.ln}</td><td class="nw fw6">${l.code}</td><td>${l.part}</td><td class="r">${num(l.qty)}</td>${p.plan.includes('WW') ? `<td>${lineWW(p, l)}</td>` : ''}${p.plan.includes('DIR') ? `<td>${lineDIR(p, l)}</td>` : ''}</tr>`).join('')}</tbody></table></div></div>
  </div><div class="stack">
    <div class="card"><div class="card-h"><div class="ttl"><h2>Điều kiện chốt PO</h2><p>Bước 24</p></div></div><div class="card-b stack-8">${chk.conds.map(c => `<div class="row" style="align-items:flex-start">${ic(c.ok ? 'checkc' : 'xc', '', `color:var(--${c.ok ? 'green' : 'red'});margin-top:2px`)}<div><div class="t-sm fw5">${c.t}</div>${!c.ok && c.sub ? `<div class="t-xs muted">${c.sub}</div>` : ''}</div></div>`).join('')}${st === 'closed' ? '' : `<button class="btn ${chk.ready ? 'btn-primary' : ''} btn-block mt8" ${chk.ready ? '' : 'disabled'} onclick="closePO('${p.id}')">${ic('flag')} Chốt PO & xuất báo cáo</button>`}</div></div>
    <div class="card"><div class="card-h"><div class="ttl"><h2>Báo cáo PO</h2><p>Bước 26 · lưu phiên bản</p></div></div><div class="list">${reps.length ? reps.slice().reverse().map(r => `<a class="li" href="#/report/po/${r.id}">${ic('file', '', 'color:var(--primary)')}<div class="body"><div class="title t-sm">${r.ver} <span class="muted fw5">${fdt(r.at)}</span></div><div class="meta"><span>${esc(r.note)}</span></div></div></a>`).join('') : `<div class="card-b t-sm muted">Chưa có. Báo cáo được tạo khi chốt PO.</div>`}</div></div>
  </div></div></div>`;
}
function lineWW(p, l) {
  for (const i of DB.ins.filter(i => i.type === 'WW' && i.pos.includes(p.id) && i.data)) { const it = i.data.items.find(x => x.po === p.id && x.code === l.code && x.part === l.part); if (!it) continue; const k = wwKL(it);
    if (k === 'P' || k === 'F' || i.status === 'approved') return `<a class="pill ${k === 'P' ? 'ok' : k === 'F' ? 'bad' : k === 'NA' ? 'gray' : 'info'}" href="#/${isLead() ? 'report/ins' : 'task'}/${i.id}">${k === 'P' ? 'Passed' : k === 'F' ? 'Không đạt' : k === 'NA' ? 'N/A' : 'Đang kiểm'} · ${i.id}</a>`; }
  const open = DB.ins.find(i => i.type === 'WW' && i.pos.includes(p.id) && i.status !== 'approved' && (!i.codes || i.codes.includes(l.code)));
  return open ? pill(IS[insState(open)][0] + ' · ' + open.id, IS[insState(open)][1]) : '<span class="muted">—</span>';
}
function lineDIR(p, l) { const ss = DB.ins.filter(i => i.type === 'DIR' && i.data && i.data.rows.some(r => r.po === p.id && r.code === l.code)); if (!ss.length) return '<span class="muted">—</span>'; const r = ss.at(-1).data.rows.find(r => r.po === p.id && r.code === l.code); return `<span class="t-sm">${ss.length} phiên · lần cuối ${r.qi} kiểm / ${+r.rj ? `<b style="color:var(--red)">${r.rj} reject</b>` : '0 reject'}</span>`; }
function planRow(p, t) {
  const T = TYPES[t];
  if (!p.plan.includes(t)) return `<div class="li locked"><span class="ico tone-gray">${ic(T.icon)}</span><div class="body"><div class="title"><span class="trunc">${T.code} · ${T.name}</span></div><div class="meta"><span>Không nằm trong kế hoạch của PO này</span></div></div>${p.closed ? '' : `<button class="btn btn-sm btn-ghost" onclick="PO('${p.id}').plan.push('${t}');PO('${p.id}').plan.sort((a,b)=>TYPE_ORDER.indexOf(a)-TYPE_ORDER.indexOf(b));save();render()">${ic('plus')} Thêm</button>`}</div>`;
  const s = typeState(p, t); const u = TS_UI[s.state]; const cand = reuseCandidate(p, t);
  const tone = { ok: 'green', warn: 'amber', info: 'blue', teal: 'teal', gray: 'gray' }[u[1]];
  const blk = s.list.filter(i => blockedBy(i)).map(i => blockedBy(i)).flat();
  return `<div class="li" style="align-items:flex-start"><span class="ico tone-${tone}">${ic(T.icon)}</span><div class="body"><div class="title"><span class="trunc">${T.code} · ${T.name}</span>${pill(u[0], u[1])}</div>${T.nodoc ? '' : `<div class="meta"><span>${T.doc}</span></div>`}
    ${s.state === 'reused' ? `<div class="meta"><span>${ic('link', '', 'width:12px;height:12px;vertical-align:-2px')} Dùng lại <a class="link" href="#/report/ins/${s.from.id}">${s.from.title}</a> (${s.from.id})</span></div>` : ''}
    ${s.list.length ? `<div class="row wrap mt8">${s.list.map(i => `<a class="tag" href="#/${i.status === 'submitted' ? 'review' : i.status === 'approved' ? 'report/ins' : 'task'}/${i.id}">${i.id}${i.type === 'DIR' ? ' · ' + fd(i.due).slice(0, 5) : ''} · ${U(i.assignee).name} · ${IS[insState(i)][0]}</a>`).join('')}</div>` : ''}
    ${blk.length ? `<div class="meta mt4"><span>${ic('hourglass', '', 'width:12px;height:12px;vertical-align:-2px')} Chờ ${[...new Set(blk.map(b => TYPES[b.type].short))].join(', ')} được duyệt (bước 08)</span></div>` : ''}
    ${s.state === 'partial' ? `<div class="meta mt4" style="color:var(--amber)"><span>Còn mã hàng chưa có kết quả — lập phiên kiểm bù.</span></div>` : ''}
    ${cand ? `<div class="mt8">${banner('teal', 'repeat', 'Có kết quả hợp lệ để dùng lại (bước 06)', `${cand.title} · ${cand.id} · duyệt ${fd(cand.review.at)}`, `<button class="btn btn-sm btn-primary" onclick="useResult('${p.id}','${t}','${cand.id}')">Dùng lại</button>`)}</div>` : ''}</div>
    ${p.closed || s.state === 'reused' ? '' : `<button class="btn btn-sm" onclick="planModal('${p.id}','${t}')">${ic('plus')} Phiếu</button>`}</div>`;
}
function useResult(pid, t, iid) { const p = PO(pid); p.reuse = p.reuse || {}; p.reuse[t] = iid; addLog('reuse', `Dùng lại ${iid} cho ${TYPES[t].name}`, pid); save(); render(); toast(`Đã liên kết kết quả ${iid} với PO ${pid}`, 'ok'); }

/* lập phiếu kiểm (A7) */
function planModal(pid, t) {
  const p = PO(pid); t = t || p.plan.find(x => ['none', 'partial'].includes(typeState(p, x).state)) || p.plan[0];
  const places = [...new Set([p.factory, p.finisher, ...DB.cat.places.filter(x => x.active).map(x => x.name)].filter(Boolean))];
  openModal({ title: 'Lập phiếu kiểm', sub: `Bước 07 · PO ${pid} · ${p.customer}`, size: 'lg', body: `<div class="stack">
    <div class="grid g2"><label class="field"><span>Loại đánh giá / mẫu phiếu</span><select class="sel" id="pm-t" onchange="planHint('${pid}')">${p.plan.map(x => `<option value="${x}" ${x === t ? 'selected' : ''}>${TYPES[x].code} · ${TYPES[x].name} — ${TYPES[x].doc}</option>`).join('')}</select></label>
      <label class="field"><span>Nơi kiểm</span><select class="sel" id="pm-f">${places.map(x => `<option>${x}</option>`).join('')}</select></label>
      <label class="field"><span>Người kiểm chính</span><select class="sel" id="pm-a">${activeQC().map(u => `<option value="${u.id}">${u.name} — ${u.title}</option>`).join('')}</select></label>
      <label class="field"><span>Ngày kiểm</span><input class="inp" type="date" id="pm-d" onchange="planHint('${pid}')" value="${new Date(Date.now() + DAY).toISOString().slice(0, 10)}"></label></div>
    <label class="field"><span>Ghi chú cho QC</span><input class="inp" id="pm-n" placeholder="VD: Kiểm bù các mã chưa kiểm do chất hàng trước"></label>
    <div id="pm-hint"></div></div>`,
    foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" id="pm-ok" onclick="createIns('${pid}')">${ic('plus')} Tạo phiếu & giao việc</button>` });
  planHint(pid);
}
/* 11C là báo cáo theo ngày: mỗi PO chỉ 1 phiếu cho mỗi ngày kiểm */
function dupDaily(pos, t, day) { if (t !== 'DIR' || !day) return null; const k = fd(day + 'T09:00:00'); return DB.ins.find(i => i.type === 'DIR' && i.kind === 'qc' && i.pos.some(x => pos.includes(x)) && fd(i.due) === k) || null; }
const pmPOs = pid => [pid, ...[...document.querySelectorAll('.pm-po:checked')].map(x => x.value)];
function planHint(pid) {
  const p = PO(pid); const t = document.getElementById('pm-t').value; const cand = reuseCandidate(p, t); let h = '';
  const dup = dupDaily(pmPOs(pid), t, document.getElementById('pm-d').value); const cb = document.getElementById('pm-ok'); if (cb) cb.disabled = !!dup;
  if (dup) h += banner('bad', 'alert', `Đã có phiếu ${dup.id} ngày ${fd(dup.due)}`, `11C là báo cáo theo ngày — mỗi PO chỉ một phiếu cho mỗi ngày kiểm (${dup.pos.map(x => 'PO ' + x).join(', ')} · ${U(dup.assignee).name}). Chọn ngày khác hoặc mở phiếu đã có.`, `<a class="btn btn-sm" href="#/${isLead() && dup.status === 'approved' ? 'report/ins' : 'task'}/${dup.id}" onclick="closeModal()">Mở ${dup.id}</a>`);
  if (cand) h += banner('teal', 'repeat', `Có thể dùng lại ${cand.id}`, `${cand.title} — đã duyệt ${fd(cand.review.at)}. Không cần tạo phiên kiểm mới.`, `<button class="btn btn-sm btn-primary" onclick="closeModal();useResult('${pid}','${t}','${cand.id}')">Dùng lại</button>`);
  const miss = (PREREQ[t] || []).filter(x => p.plan.includes(x) && !['done', 'reused'].includes(typeState(p, x).state));
  h += `<div class="mt8">${miss.length ? banner('warn', 'hourglass', `Phiếu tiên quyết chưa duyệt: ${miss.map(x => TYPES[x].code + ' ' + TYPES[x].short).join(', ')}`, 'Phiếu sẽ ở trạng thái “Chờ phiếu trước” và tự mở khi các phiếu này được duyệt (bước 08).') : banner('ok', 'checkc', 'Đủ điều kiện kiểm', 'QC nhận việc ngay sau khi tạo.')}</div>`;
  document.getElementById('pm-hint').innerHTML = h;
}
function createIns(pid) {
  const t = document.getElementById('pm-t').value; const pos = pmPOs(pid);
  const dup = dupDaily(pos, t, document.getElementById('pm-d').value); if (dup) { toast(`Đã có phiếu ${dup.id} ngày ${fd(dup.due)} cho PO này`, 'bad'); return; }
  const i = { id: `${t}-${++DB.seq.ins}`, type: t, kind: 'qc', title: `${TYPES[t].name} · PO ${pos.join(' + ')}`, pos, factory: document.getElementById('pm-f').value, assignee: document.getElementById('pm-a').value, team: [],
    due: new Date(document.getElementById('pm-d').value + 'T09:00:00').toISOString(), status: 'todo', priority: 'normal', note: document.getElementById('pm-n').value.trim(), createdBy: ME.id, createdAt: nowISO(), data: null };
  if (t === 'PIG') { i.color = PO(pid).color; i.data = JSON.parse(JSON.stringify(INS('PIG-DOVE').data)); Object.assign(i.data, { steps: PIG_STEPS.map(() => ({ ok: false, date: '' })), xr: {}, sec: {}, kcma: KCMA.map(() => ({ r: '', note: '' })), conclusion: '', note: '' }); i.data.header = { ...i.data.header, color: PO(pid).color.toUpperCase(), start: fd(nowISO()) }; }
  DB.ins.push(i); addLog('task', `Lập ${i.id} (${TYPES[t].code} ${TYPES[t].short}) giao ${U(i.assignee).name}`, pid); save(); closeModal();
  const mc = mergeCands(i); if (mc.forms.length || mc.pos.length) { go('merge/' + i.id); toast(`Đã lập ${i.id} — ${mc.forms.length + mc.pos.length} đề xuất gộp PO`, 'info'); return; }
  render();
  toast(blockedBy(i) ? `Đã lập ${i.id} — chờ phiếu tiên quyết được duyệt` : `Đã lập ${i.id} và giao ${U(i.assignee).name}`, blockedBy(i) ? 'warn' : 'ok');
}
/* ---------------- ĐỀ XUẤT GỘP PO (sau khi lập phiếu) ----------------
   Gộp các phiếu cùng loại, cùng ngày kiểm, cùng nơi kiểm (chưa bắt đầu) và PO cùng loại chưa có phiếu
   vào một phiên kiểm — đúng như mẫu khách đang dùng (Daily #96: PO 48150/48151/48153; hàng trắng Cont 2: 2 PO). */
function mergeCands(i) {
  const day = fd(i.due); const p0 = PO(i.pos[0]);
  const forms = DB.ins.filter(j => j.id !== i.id && j.kind === 'qc' && j.type === i.type && j.status === 'todo' && !j.codes && fd(j.due) === day && j.factory === i.factory && j.pos.some(x => !i.pos.includes(x)));
  const taken = new Set([...i.pos, ...forms.flatMap(j => j.pos)]);
  const pos = DB.pos.filter(x => !x.closed && !taken.has(x.id) && x.plan.includes(i.type) && ['none', 'partial'].includes(typeState(x, i.type).state)
    && (i.type === 'PIG' ? x.color === p0.color : [x.factory, x.finisher].includes(i.factory) || x.factory === p0.factory));
  return { forms, pos };
}
function pageMerge(id) {
  const i = INS(id); if (!i) throw 0; const T = TYPES[i.type]; const mc = mergeCands(i);
  const row = (kind, key, title, meta, side) => `<label class="li" style="cursor:pointer"><input type="checkbox" class="mg-${kind}" value="${key}" checked style="width:18px;height:18px;margin-top:2px;accent-color:var(--primary)"><div class="body"><div class="title t-sm"><span class="trunc">${title}</span></div><div class="meta">${meta}</div></div><div class="side">${side}</div></label>`;
  const forms = mc.forms.map(j => row('f', j.id, `${esc(j.title)}`, `<span>${j.id}</span><span>PO ${j.pos.join(', ')}</span><span>${U(j.assignee).name}</span><span>${j.pos.reduce((a, x) => a + (PO(x) ? PO(x).lines.length : 0), 0)} mã</span>`, pill(IS[insState(j)][0], IS[insState(j)][1]))).join('');
  const pos = mc.pos.map(x => row('p', x.id, `PO ${x.id} · ${esc(x.customer)}`, `<span>${esc(x.series)} · ${esc(x.color)}</span><span>${x.factory}</span><span>${x.lines.length} mã · ${num(poQty(x))} pcs</span><span>ETD ${fd(x.etd)}</span>`, pill(TS_UI[typeState(x, i.type).state][0], TS_UI[typeState(x, i.type).state][1]))).join('');
  const none = !mc.forms.length && !mc.pos.length;
  return `${pageHead('Đề xuất gộp PO', `${i.id} · ${T.code} ${T.name} · ngày ${fd(i.due)} · ${i.factory}`, '', 'po/' + i.pos[0])}<div class="stack">
  ${banner('ok', 'checkc', `Đã lập ${i.id} cho PO ${i.pos.join(', ')}`, `Giao ${U(i.assignee).name} · hạn ${fd(i.due)}`)}
  ${none ? `<div class="card">${empty('Không có PO nào để gộp', 'Không có phiếu hoặc PO cùng loại, cùng ngày, cùng nơi kiểm.', 'checkc')}</div>`
    : banner('info', 'layers', 'Gộp để QC kiểm một lần trong ngày', `Các phiếu / PO dưới đây cùng loại ${T.code}, cùng ngày ${fd(i.due)} và cùng nơi kiểm ${i.factory} — gộp vào ${i.id} thành một phiên kiểm, một báo cáo (như Daily #96 gộp PO 48150 · 48151 · 48153).`)}
  ${mc.forms.length ? `<div class="card"><div class="card-h"><div class="ttl"><h2>Phiếu cùng loại trong ngày</h2><p>Phiếu được chọn sẽ gộp vào ${i.id} và không còn tồn tại riêng.</p></div></div><div class="list">${forms}</div></div>` : ''}
  ${mc.pos.length ? `<div class="card"><div class="card-h"><div class="ttl"><h2>PO cùng loại chưa có phiếu</h2><p>Thêm PO vào phiên kiểm ${i.id}.</p></div></div><div class="list">${pos}</div></div>` : ''}
  <div class="sticky-actions"><a class="btn btn-lg" href="#/po/${i.pos[0]}">${none ? 'Về PO' : 'Bỏ qua'}</a>${none ? '' : `<button class="btn btn-primary btn-lg grow" onclick="doMerge('${i.id}')">${ic('layers')} Gộp vào ${i.id}</button>`}</div></div>`;
}
function doMerge(id) {
  const i = INS(id); const fs = [...document.querySelectorAll('.mg-f:checked')].map(x => x.value); const ps = [...document.querySelectorAll('.mg-p:checked')].map(x => x.value);
  if (!fs.length && !ps.length) { toast('Chọn ít nhất một phiếu hoặc PO để gộp', 'bad'); return; }
  const auto = i.title === `${TYPES[i.type].name} · PO ${i.pos.join(' + ')}`;
  fs.forEach(fid => { const j = INS(fid); j.pos.forEach(x => { if (!i.pos.includes(x)) i.pos.push(x); }); if (j.note && !i.note.includes(j.note)) i.note = [i.note, j.note].filter(Boolean).join(' · '); DB.ins = DB.ins.filter(x => x.id !== fid); });
  ps.forEach(x => { if (!i.pos.includes(x)) i.pos.push(x); });
  if (auto) i.title = `${TYPES[i.type].name} · PO ${i.pos.join(' + ')}`;
  addLog('task', `Gộp ${[...fs, ...ps.map(x => 'PO ' + x)].join(', ')} vào ${i.id} (${TYPES[i.type].code} · ${fd(i.due)})`, i.pos[0]); save();
  go('po/' + i.pos[0]); toast(`Đã gộp vào ${i.id} · PO ${i.pos.join(', ')}`, 'ok');
}
function closePO(id) {
  const p = PO(id); if (!poCheck(p).ready) { toast('PO chưa đủ điều kiện chốt', 'bad'); return; }
  openModal({ title: `Chốt PO ${id}`, sub: 'Bước 25 — kiểm tra tổng hợp và chốt trạng thái PO', body: `<div class="stack"><div class="card"><div class="list">${p.plan.map(t => { const s = typeState(p, t); const i = s.state === 'reused' ? s.from : s.list.filter(x => x.status === 'approved').at(-1); const e = i && evalInsp(i); return `<div class="li"><span class="ico sm tone-green">${ic('check', '', 'width:14px;height:14px')}</span><div class="body"><div class="title t-sm">${TYPES[t].code} · ${TYPES[t].name}</div><div class="meta"><span>${i ? i.id + ' · ' + U(i.assignee).name : ''}${s.state === 'reused' ? ' · dùng lại' : ''}</span></div></div>${e ? pill(VERDICT[e.verdict][0], VERDICT[e.verdict][1]) : ''}</div>`; }).join('')}</div></div>
    <label class="field"><span>Ghi chú phiên bản báo cáo</span><input class="inp" id="cp-note" value="Chốt PO — ${p.plan.length}/${p.plan.length} loại đánh giá đạt"></label></div>`,
    foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="doClosePO('${id}')">${ic('flag')} Chốt PO & lưu báo cáo v1.0</button>` });
}
function doClosePO(id) { const p = PO(id); p.closed = { at: nowISO(), by: ME.id }; addLog('close', `Chốt PO ${id}`, id); const r = mkReport(id, document.getElementById('cp-note').value); save(); closeModal(); go('report/po/' + r.id); toast(`Đã chốt PO ${id} và lưu báo cáo ${r.ver}`, 'ok'); }
function mkReport(id, note) { const n = DB.reports.filter(r => r.po === id).length; const r = { id: `RPT-${id}-1.${n}`, po: id, ver: `v1.${n}`, at: nowISO(), by: ME.id, note: note || 'Cập nhật báo cáo' }; DB.reports.push(r); addLog('report', `Lưu báo cáo PO ${id} ${r.ver}`, id); return r; }
function exportPOModal(id) { openModal({ title: 'Lưu phiên bản báo cáo mới', sub: `PO ${id}`, body: `<label class="field"><span>Nội dung thay đổi</span><textarea class="ta" id="ex-note" placeholder="VD: Bổ sung kết quả trao đổi với Fabuwood"></textarea></label>`, foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="const r=mkReport('${id}',document.getElementById('ex-note').value);save();closeModal();go('report/po/'+r.id);toast('Đã lưu '+r.ver,'ok')">${ic('file')} Lưu phiên bản</button>` }); }

/* ---------------- REVIEW (19–22) ---------------- */
function pageReview() {
  const tabs = [['submitted', 'Chờ duyệt', i => i.status === 'submitted'], ['returned', 'Đã trả bổ sung', i => i.status === 'returned'], ['approved', 'Đã duyệt', i => i.status === 'approved' && i.kind === 'qc']];
  const cur = tabs.find(t => t[0] === UI.reviewTab) || tabs[0]; const list = DB.ins.filter(cur[2]).sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  return `${pageHead('Hàng chờ duyệt', 'Bước 19 — xem số liệu, ảnh và quyết định duyệt hoặc trả bổ sung.')}
  <div class="card"><div class="tabs" style="padding:0 20px">${tabs.map(t => `<button class="${t[0] === cur[0] ? 'on' : ''}" onclick="UI.reviewTab='${t[0]}';render()">${t[1]} <span class="n">${DB.ins.filter(t[2]).length}</span></button>`).join('')}</div>
  <div class="list">${list.length ? list.map(i => { const e = evalInsp(i); return `<a class="li" href="#/review/${i.id}"><span class="ico tone-teal">${ic(TYPES[i.type].icon)}</span><div class="body"><div class="title"><span class="trunc">${esc(i.title)}</span></div><div class="meta"><span>${TYPES[i.type].code} · ${TYPES[i.type].doc}</span><span>PO ${i.pos.join(', ')}</span><span>${i.factory}</span><span>${U(i.assignee).name}</span></div><div class="meta"><span>Gửi ${fdt(i.submittedAt)}</span><span>Kiểm ${num(e.insp)} / ${num(e.N)} pcs</span><span>Critical ${e.crit} · Major ${e.maj} · Minor ${e.min}${e.rej ? ' · Rejected ' + e.rej : ''}</span></div></div><div class="side">${pill(VERDICT[e.verdict][0], VERDICT[e.verdict][1])}</div></a>`; }).join('') : empty(cur[0] === 'submitted' ? 'Không có phiếu chờ duyệt' : 'Không có phiếu', '', 'inbox')}</div></div>`;
}
function insSummary(i) {
  const e = evalInsp(i); const D = i.data; const c = { PASS: 'var(--green-fill)', COND: 'var(--amber-fill)', FAIL: 'var(--red-fill)' }[e.verdict];
  let body = '';
  if (i.type === 'PLY') body = `<div class="card"><div class="card-h"><div class="ttl"><h2>REPORT PLYWOOD · ${esc(D.header.reportNo)}</h2><p>${esc(D.header.factoryFull)} · ${esc(D.header.dimension)} · ${num(D.header.qty)} pcs · lấy mẫu ${D.header.sampling} · ${esc(D.header.inspectors)}</p></div></div>
      <div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>Hạng mục</th><th>Tiêu chuẩn</th><th>Kết quả</th><th>Đánh giá</th><th>Ảnh</th></tr></thead><tbody>${PLY_CHECKS.map(ch => { const r = D.checks[ch.k] || {}; return `<tr><td>${ch.t}</td><td class="muted">${ch.spec}</td><td class="nw fw6">${esc(r.v || '—')}</td><td>${r.st ? pill(r.st, r.st === 'Pass' ? 'ok' : r.st === 'Fail' ? 'bad' : 'warn') : '—'}</td><td><div class="thumbs">${(r.ph || []).slice(0, 3).map(k => `<span class="thumb" style="${bg(k)}" onclick="viewPhoto('${k}','${esc(ch.t)}')"></span>`).join('')}</div></td></tr>`; }).join('')}</tbody></table></div></div>
    <div class="card"><div class="sec-h">Defects 缺陷</div><div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>Mô tả</th><th>Mức độ</th><th class="r">SL</th><th>Ảnh</th></tr></thead><tbody>${D.defects.map(x => `<tr><td>${esc(x.d)}</td><td>${pill(SEV[x.sev].t, SEV[x.sev].c)}</td><td class="r">${x.qty}</td><td><div class="thumbs">${(x.ph || []).map(k => `<span class="thumb" style="${bg(k)}" onclick="viewPhoto('${k}','${esc(x.d)}')"></span>`).join('')}</div></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Không có</td></tr>'}</tbody></table></div>
      ${(D.deviations || []).length ? `<div class="card-b stack-8">${D.deviations.map(x => `<div class="row t-sm" style="align-items:flex-start">${ic('alert', '', 'color:var(--amber);margin-top:2px')}<span>${esc(x)}</span></div>`).join('')}</div>` : ''}</div>
    <div class="card"><div class="sec-h">Veneer · PPS</div><div class="card-b">${gallery([...D.veneer, ...D.plies, ...(D.verify.ph || [])])}</div></div>`;
  if (i.type === 'WW') body = `<div class="card"><div class="card-h"><div class="ttl"><h2>I. Dữ liệu chung · ${D.date}</h2><p>${D.items.length} mã · Passed ${e.pass} · Không đạt ${e.fail} · N/A ${e.na}</p></div></div>
      <div class="tbl-wrap" tabindex="0"><table class="tbl compact"><thead><tr><th>#</th><th>Chi tiết</th><th>Mã sản phẩm</th><th class="r">SL SX</th><th class="r">SL kiểm</th><th>Tiêu chí không đạt</th><th>Kết luận</th><th>Diễn giải</th><th>Ảnh</th></tr></thead><tbody>${D.items.map((it, k) => { const kl = wwKL(it); return `<tr><td class="muted">${k + 1}</td><td>${it.part}</td><td class="nw fw6">${it.code}</td><td class="r">${num(it.slsx)}</td><td class="r">${kl === 'NA' ? '—' : it.slkiem}</td><td class="t-xs">${it.crit.map((x, j) => x === 'F' ? WW_CRIT[j] : '').filter(Boolean).join(', ') || '—'}</td><td>${kl === 'P' ? pill('Passed', 'ok') : kl === 'F' ? pill('Không đạt', 'bad') : kl === 'NA' ? pill('N/A', 'gray') : pill('—', 'gray')}</td><td class="t-xs">${esc(it.dg)}</td><td class="r">${Object.keys(it.ph || {}).length}</td></tr>`; }).join('')}</tbody></table></div></div>
    <div class="card"><div class="sec-h">IV. Các điểm cải tiến</div><div class="card-b">${gallery(D.improve.map(x => x.p), D.improve.map(x => x.t)) || '<span class="muted">Không có</span>'}</div></div>
    <div class="card"><div class="sec-h">III. Chất xếp — vận chuyển</div><div class="card-b">${gallery(Object.values(D.load), Object.keys(D.load).map(k => WW_LOAD[k]))}</div></div>`;
  if (i.type === 'DIR' || i.type === 'FIN') body = `<div class="card"><div class="card-h"><div class="ttl"><h2>${i.type === 'DIR' ? `Daily Inspection Report · ${D.mode}` : 'Final inspection'}</h2><p>${D.header ? `Factory ${esc(D.header.factory)} · ${esc(D.header.customer)} · màu ${esc(D.header.color)} · ${esc(D.header.supplier)}` : ''}</p></div></div>
      <div class="tbl-wrap" tabindex="0"><table class="tbl compact"><thead><tr><th>PO</th><th>Mô tả</th><th>Mã hàng</th><th class="r">SL đơn</th><th class="r">SL kiểm</th><th class="r">Critical</th><th class="r">Major</th><th class="r">Minor</th><th class="r">Rejected</th><th>Ghi chú</th></tr></thead><tbody>${D.rows.map(r => `<tr><td class="nw">PO ${r.po}</td><td>${r.desc}</td><td class="nw fw6">${r.code}</td><td class="r">${r.qo}</td><td class="r">${r.qi}</td><td class="r">${r.cr}</td><td class="r" style="${+r.ma ? 'color:var(--amber);font-weight:600' : ''}">${r.ma}</td><td class="r">${r.mi}</td><td class="r" style="${+r.rj ? 'color:var(--red);font-weight:600' : ''}">${r.rj}</td><td>${esc(r.rm)}</td></tr>`).join('')}</tbody></table></div></div>
    ${i.type === 'DIR' ? `<div class="card"><div class="sec-h">Control plan on process</div><div class="list">${DIR_CP.map((cp, k) => `<div class="li"><div class="body"><div class="title t-sm">${cp.st}</div>${D.cp[k].note ? `<div class="meta"><span style="color:var(--red)">${esc(D.cp[k].note)}</span></div>` : ''}</div>${pill(D.cp[k].r || '—', D.cp[k].r === 'OK' ? 'ok' : D.cp[k].r === 'NG' ? 'bad' : 'gray')}</div>`).join('')}</div></div>
    <div class="card"><div class="sec-h">Hình ảnh theo công đoạn ${D.material ? '· Material: ' + esc(D.material) : ''}</div><div class="card-b stack">${DIR_SECTIONS.filter(s => ((D.sec[s.k] || {}).ph || []).length).map(s => `<div class="stack-8"><b class="t-sm">${s.t}</b>${D.sec[s.k].cap ? `<span class="t-xs muted">${esc(D.sec[s.k].cap)}</span>` : ''}${gallery(D.sec[s.k].ph)}</div>`).join('')}</div></div>` : `<div class="card"><div class="sec-h">Preparation before packing</div><div class="list">${FIN_PACK.map((t, k) => `<div class="li"><div class="body t-sm">${t}</div>${pill(D.pack[k] || '—', D.pack[k] === 'OK' ? 'ok' : D.pack[k] === 'NG' ? 'bad' : 'gray')}</div>`).join('')}</div></div>`}
    <div class="card"><div class="sec-h">Pictures of defects</div><div class="card-b stack">${D.defects.map(x => `<div class="stack-8"><b class="t-sm">${esc(x.t)}</b>${gallery(x.ph)}</div>`).join('') || '<span class="muted">Không có</span>'}</div></div>`;
  if (i.type === 'PIG') { const r = D.ref['D65/10']; body = `<div class="card"><div class="card-h"><div class="ttl"><h2>${D.header.doorStyle} · ${D.header.color} — ${D.header.customer}</h2><p>${D.header.vendor} · bắt đầu ${D.header.start} · chuẩn ${D.header.standard}</p></div></div><div class="card-b row wrap">${PIG_STEPS.map((s, k) => pill(`${k + 1}. ${s[1]}`, D.steps[k].ok ? 'ok' : 'gray')).join('')}</div></div>
    <div class="card"><div class="sec-h">X-Rite D65/10 · theo mốc</div><div class="tbl-wrap" tabindex="0"><table class="mini-tbl"><thead><tr><th>Mốc</th><th>L</th><th>a</th><th>b</th><th>ΔE</th><th>Sheen</th></tr></thead><tbody>${PIG_TIMES.map((t, k) => { const x = D.xr[k] && D.xr[k]['D65/10']; const de = deltaE(x, r); return `<tr><td>${t}</td><td>${x ? x.L : '—'}</td><td>${x ? x.a : '—'}</td><td>${x ? x.b : '—'}</td><td>${isNaN(de) ? '—' : `<b style="color:var(--${de <= 1 ? 'green' : 'red'})">${de.toFixed(2)}</b>`}</td><td>${D.xr[k] && D.xr[k].sheen ? D.xr[k].sheen.join('–') : '—'}</td></tr>`; }).join('')}</tbody></table></div></div>
    <div class="card"><div class="sec-h">KCMA</div><div class="list">${KCMA.map((t, k) => `<div class="li"><div class="body"><div class="title t-sm">${t[0]}</div><div class="meta"><span>${t[1]}</span>${D.kcma[k].note ? `<span>${esc(D.kcma[k].note)}</span>` : ''}</div></div>${pill(D.kcma[k].r === 'P' ? 'Pass' : D.kcma[k].r === 'F' ? 'Fail' : 'Chờ', D.kcma[k].r === 'P' ? 'ok' : D.kcma[k].r === 'F' ? 'bad' : 'gray')}</div>`).join('')}</div></div>`; }
  return `<div class="card"><div class="card-b score"><div class="ring" style="--p:${e.score};--c:${c}" data-v="${e.score}%"></div><div style="flex:1;min-width:0"><div class="row wrap"><b>${TYPES[i.type].code} · ${TYPES[i.type].name}</b>${pill(VERDICT[e.verdict][0], VERDICT[e.verdict][1])}</div><p class="t-sm muted mt4">Kiểm ${num(e.insp)} / ${num(e.N)} pcs · Critical ${e.crit} · Major ${e.maj} · Minor ${e.min}${e.rej ? ' · Rejected ' + e.rej : ''}</p></div>${isLead() ? `<a class="btn btn-sm" href="#/report/ins/${i.id}">${ic('file')} Xem theo mẫu báo cáo</a>` : ''}</div>
    ${D.conclusion ? `<div class="card-f" style="justify-content:flex-start;flex-wrap:wrap"><span class="t-sm muted">QC tự đánh giá:</span>${pill(CONCL[D.conclusion][0], CONCL[D.conclusion][1])}<span class="t-sm">${esc(D.note || '')}</span></div>` : ''}</div>${body}`;
}
function pageReviewDetail(id) {
  const i = INS(id); if (!i || !i.data) throw 0; const e = evalInsp(i); UI.wide = true;
  const dec = i.status === 'submitted' ? `<div class="card" style="position:sticky;top:72px"><div class="card-h"><div class="ttl"><h2>Quyết định</h2><p>Bước 20</p></div></div><div class="card-b stack">
      ${banner(e.verdict === 'PASS' ? 'ok' : e.verdict === 'COND' ? 'warn' : 'bad', e.verdict === 'PASS' ? 'checkc' : 'alert', 'Hệ thống: ' + VERDICT[e.verdict][0], `Critical ${e.crit} · Major ${e.maj} · Minor ${e.min}${e.rej ? ' · Rejected ' + e.rej : ''}`)}
      <button class="btn btn-primary btn-lg btn-block" onclick="approveIns('${id}')">${ic('check')} Duyệt kết quả</button><button class="btn btn-lg btn-block btn-text-red" onclick="returnModal('${id}')">${ic('undo')} Trả bổ sung</button>
      <p class="t-xs muted">Duyệt sẽ lưu lịch sử phiên kiểm, liên kết kết quả với PO Line và cho phép xuất báo cáo theo mẫu.</p></div></div>`
    : `<div class="card"><div class="card-b stack"><div class="row between"><b>Trạng thái</b>${isPill(i)}</div>${i.review ? `<span class="t-sm muted">${i.review.decision === 'approve' ? 'Duyệt' : 'Trả bổ sung'} bởi ${U(i.review.by).name} · ${fdt(i.review.at)}</span>` : ''}${i.returnNote ? banner('bad', 'undo', 'Nội dung yêu cầu bổ sung', esc(i.returnNote)) : ''}${i.status === 'approved' ? `<a class="btn btn-block" href="#/report/ins/${i.id}">${ic('file')} Báo cáo theo mẫu</a>` : ''}${i.ncr ? `<a class="btn btn-block" href="#/ncr/${i.ncr}">${ic('alert')} ${i.ncr}</a>` : ''}</div></div>`;
  return `${pageHead(esc(i.title), `${i.id} · ${U(i.assignee).name} gửi ${fdt(i.submittedAt)} · PO ${i.pos.join(', ')}`, '', 'work')}<div class="grid g-main"><div class="stack">${insSummary(i)}</div><div class="stack">${dec}</div></div>`;
}
function pageInsView(id) {
  const i = INS(id); if (!i) throw 0;
  if (i.kind === 'prod') return `${pageHead(esc(i.title), `${U(i.assignee).name} · hạn ${fd(i.due)}`, isPill(i), 'work')}<div class="card">${prodSteps(insPOs(i)[0], false)}</div>`;
  if (i.data && ['submitted', 'approved', 'returned'].includes(i.status)) return pageReviewDetail(id);
  const b = blockedBy(i);
  return `${pageHead(esc(i.title), `${i.id} · ${U(i.assignee).name} · hạn ${fd(i.due)}`, isPill(i), 'work')}<div class="stack">${b ? banner('warn', 'hourglass', 'Chờ phiếu tiên quyết được duyệt', b.map(x => `${TYPES[x.type].name} — PO ${x.po}`).join('<br>')) : banner('info', 'info', i.status === 'draft' ? 'QC đang thực hiện phiếu' : 'QC chưa bắt đầu kiểm', `Hạn ${fd(i.due)} · ${relDay(i.due).t}`)}${ctxCard(i)}${i.data && i.type === 'PIG' ? insSummary(i) : ''}</div>`;
}
function approveIns(id) {
  const i = INS(id); const e = evalInsp(i); i.status = 'approved'; i.review = { by: ME.id, at: nowISO(), decision: 'approve' };
  if (i.type === 'PIG') { i.data.steps[9] = { ok: true, date: fd(nowISO()) }; i.data.approval.signed = true; i.data.header.completion = fd(nowISO()); insPOs(i).forEach(p => { if (p.bottleneck && p.bottleneck.g === 'PAINT' && /mẫu màu/.test(p.bottleneck.note)) p.bottleneck = null; }); }
  addLog('approve', `Duyệt ${i.id} (${TYPES[i.type].code} ${TYPES[i.type].short}) — ${VERDICT[e.verdict][0]}`, i.pos[0]); save();
  linkDone(id);
}
function linkDone(id) {
  const i = INS(id); render(); toast(`Đã duyệt ${i.id} · liên kết kết quả với PO ${i.pos.join(', ')}`, 'ok');
  const unl = DB.ins.filter(x => x.status === 'todo' && x.kind === 'qc' && !blockedBy(x) && x.pos.some(p => i.pos.includes(p)) && x.id !== id && (PREREQ[x.type] || []).includes(i.type));
  if (unl.length) setTimeout(() => toast(`Đã mở khóa ${unl.map(x => x.id).join(', ')} (bước 08)`, 'info'), 400);
  insPOs(i).filter(p => poState(p) === 'ready').forEach(p => setTimeout(() => toast(`PO ${p.id} đủ kết quả — sẵn sàng chốt`, 'info'), 800));
}
function returnModal(id) {
  const i = INS(id); const e = evalInsp(i);
  openModal({ title: `Trả bổ sung ${i.id}`, sub: 'QC nhận lại phiếu, bổ sung và gửi lại', body: `<div class="stack"><label class="field"><span>Nội dung yêu cầu bổ sung</span><textarea class="ta" id="rt-note" placeholder="VD: Chụp thêm ảnh cận cảnh lỗi hairline, đo lại độ bóng 3 điểm…"></textarea></label>
    ${e.miss.length ? `<div class="field"><span>Mục hệ thống ghi nhận còn thiếu</span><div class="stack-8">${e.miss.slice(0, 6).map(m => `<div class="row t-sm">${ic('info', 'muted')}${esc(m.t)}</div>`).join('')}</div></div>` : ''}</div>`,
    foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-danger" onclick="doReturn('${id}')">${ic('undo')} Trả bổ sung</button>` });
}
function doReturn(id) {
  const i = INS(id); const note = document.getElementById('rt-note').value.trim(); if (!note) { document.getElementById('rt-note').classList.add('err'); toast('Nhập nội dung yêu cầu bổ sung', 'bad'); return; }
  i.status = 'returned'; i.returnNote = note; i.review = { by: ME.id, at: nowISO(), decision: 'return' };
  addLog('return', `Trả bổ sung ${i.id}: ${note}`, i.pos[0]); save(); closeModal(); go('work'); toast(`Đã trả ${i.id} cho ${U(i.assignee).name}`, 'warn');
}

/* ---------------- HISTORY ---------------- */
function pageHistory() {
  let list = DB.log;
  if (ME.role === 'qc') list = list.filter(l => l.who === ME.id);
  const q = UI.histQ.toLowerCase(); if (q) list = list.filter(l => (l.t + l.po + U(l.who).name).toLowerCase().includes(q));
  const groups = {}; list.forEach(l => { const k = fd(l.at); (groups[k] = groups[k] || []).push(l); });
  const KI = { approve: ['checkc', 'green'], submit: ['send', 'blue'], return: ['undo', 'red'], hold: ['pause', 'red'], ncr: ['alert', 'amber'], fix: ['wrench', 'amber'], close: ['flag', 'green'], close_ncr: ['shield', 'green'], sync: ['refresh', 'teal'], sync_err: ['refresh', 'red'], alert: ['zap', 'red'], task: ['plus', 'violet'], report: ['file', 'teal'], reuse: ['repeat', 'teal'], recheck: ['repeat', 'amber'], prod: ['activity', 'blue'] };
  return `${pageHead(isLead() ? 'Nhật ký hoạt động' : 'Lịch sử', 'Audit trail cho đồng bộ, kế hoạch, phiên kiểm, duyệt, cảnh báo và báo cáo.')}
  <div class="search" style="width:min(400px,100%);margin-bottom:16px">${ic('search')}<input placeholder="Lọc theo PO, nội dung, người thực hiện…" value="${esc(UI.histQ)}" oninput="UI.histQ=this.value;clearTimeout(window.__hq);window.__hq=setTimeout(()=>{render();const s=document.querySelector('.content .search input');s.focus();s.setSelectionRange(s.value.length,s.value.length)},250)"></div>
  <div class="stack">${Object.keys(groups).length ? Object.entries(groups).map(([k, ls]) => `<div class="card"><div class="sec-h">${k}</div><div class="list">${ls.map(l => { const x = KI[l.k] || ['info', 'gray']; return `<div class="li"><span class="ico sm tone-${x[1]}">${ic(x[0], '', 'width:14px;height:14px')}</span><div class="body"><div class="t-sm">${esc(l.t)}</div><div class="meta"><span>${U(l.who).name}</span><span>${fdt(l.at).split(' ')[1]}</span>${l.po ? `<span>PO ${l.po}</span>` : ''}</div></div></div>`; }).join('')}</div></div>`).join('') : empty('Chưa có hoạt động', '', 'history')}</div>`;
}
