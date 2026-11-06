/* ============ ADMIN · DANH MỤC & PHÂN QUYỀN ============
   Admin có toàn quyền như Lead QC + thiết lập danh mục dùng chung.
   Danh mục lưu trong DB.cat và được áp vào các hằng số dùng chung (USERS, FACTORY_FULL, DEFECT_TYPES, TYPES). */
const ROLES = { admin: ['Admin', 'violet'], lead: ['Lead QC', 'teal'], qc: ['QC', 'info'] };
const PLACE_KINDS = ['Xưởng nội bộ', 'Xưởng gia công', 'Nhà cung cấp'];
const isLead = () => !!ME && (ME.role === 'lead' || ME.role === 'admin');
const activeQC = () => USERS.filter(u => u.role === 'qc' && u.active !== false);

function seedCat() {
  const kind = { VHGI: 'Xưởng nội bộ', 'Xưởng #96': 'Xưởng gia công', 'Vỹ Thành': 'Xưởng gia công', Woodaxis: 'Nhà cung cấp', Rongpeng: 'Nhà cung cấp' };
  return {
    users: USERS.map(u => ({ ...u, active: true })),
    places: Object.entries(FACTORY_FULL).map(([name, full]) => ({ name, full, kind: kind[name] || 'Xưởng gia công', active: true })),
    defects: DEFECT_TYPES.map(name => ({ name, sev: /Cracks|Bong/.test(name) ? 'critical' : /Sai kích thước|Lệch màu|Hairline|Pinholes/.test(name) ? 'major' : 'minor' })),
    types: Object.fromEntries(TYPE_ORDER.map(k => [k, { name: TYPES[k].name, doc: TYPES[k].doc, desc: TYPES[k].desc }])),
  };
}
/* áp danh mục đã lưu vào các hằng số dùng chung */
function applyCat() {
  if (!DB.cat) DB.cat = seedCat();
  if (!DB.cat.qcTitle) { DB.cat.users.forEach(u => { if (u.role === 'qc' && /^QC/.test(u.title || '')) u.title = 'QC'; }); DB.cat.qcTitle = 1; } /* 06/11: chức danh nhân viên QC chỉ ghi “QC” */
  if (!DB.cat.users.some(u => u.role === 'admin')) DB.cat.users.unshift({ ...USERS.find(u => u.id === 'admin1'), active: true });
  USERS.splice(0, USERS.length, ...DB.cat.users);
  Object.keys(FACTORY_FULL).forEach(k => delete FACTORY_FULL[k]); DB.cat.places.forEach(p => { FACTORY_FULL[p.name] = p.full || p.name; });
  DEFECT_TYPES.splice(0, DEFECT_TYPES.length, ...DB.cat.defects.map(d => d.name));
  TYPE_ORDER.forEach(k => Object.assign(TYPES[k], DB.cat.types[k] || {}));
}
function catSave(log) { if (log) addLog('admin', log); applyCat(); save(); render(); }

/* ----- trang ----- */
function pageAdmin() {
  const C = DB.cat;
  const tabs = [['users', 'Người dùng & phân quyền', 'users', C.users.length], ['places', 'Nơi kiểm / Xưởng', 'factory', C.places.length], ['types', 'Loại đánh giá & mẫu phiếu', 'clipboard', TYPE_ORDER.length], ['defects', 'Danh mục lỗi', 'alert', C.defects.length]];
  const cur = tabs.find(t => t[0] === UI.adminTab) || tabs[0];
  const body = { users: adminUsers, places: adminPlaces, types: adminTypes, defects: adminDefects }[cur[0]]();
  return `${pageHead('Danh mục & phân quyền', 'Chỉ Admin thấy trang này. Thay đổi áp dụng ngay cho toàn bộ người dùng.')}
  <div class="tabs" style="margin:-8px 0 16px">${tabs.map(t => `<button class="${t[0] === cur[0] ? 'on' : ''}" onclick="UI.adminTab='${t[0]}';render()">${ic(t[2], '', 'width:16px;height:16px')} ${t[1]} <span class="n">${t[3]}</span></button>`).join('')}</div>${body}`;
}
const onOff = (on, fn) => `<button class="tgl ${on ? 'on' : ''}" role="switch" aria-checked="${on}" onclick="event.stopPropagation();${fn}"><span></span></button>`;
const cardH = (t, s, acts = '') => `<div class="card-h"><div class="ttl"><h2>${t}</h2><p>${s}</p></div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;

/* 1. Người dùng */
function adminUsers() {
  const C = DB.cat; const yes = ic('check', '', 'width:16px;height:16px;color:var(--green)'), no = '<span class="muted">—</span>';
  const PERM = [
    ['Xem PO, lập kế hoạch, tạo & gộp phiếu', 1, 1, 0], ['Duyệt / trả bổ sung phiếu', 1, 1, 0], ['Nhận & ghi nhận cảnh báo Critical', 1, 1, 0],
    ['Chốt PO, xuất báo cáo', 1, 1, 0], ['Tổng quan & Báo cáo, Nhật ký, Đồng bộ Base', 1, 1, 0],
    ['Làm phiếu được giao, gửi cảnh báo Critical', 0, 0, 1], ['Danh mục: người dùng, nơi kiểm, loại đánh giá, lỗi', 1, 0, 0],
  ];
  return `<div class="stack"><div class="card">${cardH('Người dùng', 'Tài khoản đăng nhập và vai trò. Tài khoản tắt không đăng nhập được và không được giao phiếu mới.', `<button class="btn btn-primary btn-sm" onclick="userModal()">${ic('plus')} Thêm người dùng</button>`)}
    <div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>Họ tên</th><th>Email</th><th>Chức danh</th><th>Vai trò</th><th class="r">Phiếu đang giao</th><th>Hoạt động</th><th></th></tr></thead><tbody>
    ${C.users.map(u => { const n = DB.ins.filter(i => i.assignee === u.id && i.status !== 'approved').length; const me = u.id === ME.id;
      return `<tr class="${u.active === false ? 'off' : ''}"><td class="nw"><div class="row" style="gap:10px"><span class="avatar sm">${initials(u.name)}</span><b>${esc(u.name)}</b>${me ? pill('Bạn', 'gray', 1) : ''}</div></td><td class="nw muted">${esc(u.email)}</td><td>${esc(u.title)}</td><td>${pill(ROLES[u.role][0], ROLES[u.role][1])}</td><td class="r">${n || '<span class="muted">0</span>'}</td>
      <td>${me ? '<span class="t-xs muted">—</span>' : onOff(u.active !== false, `toggleUser('${u.id}')`)}</td><td class="r"><button class="btn btn-sm" onclick="userModal('${u.id}')">${ic('edit')} Sửa</button></td></tr>`; }).join('')}</tbody></table></div></div>
  <div class="card">${cardH('Quyền theo vai trò', 'Quyền gắn với vai trò, không cấu hình riêng từng người. Muốn đổi quyền của ai, đổi vai trò của người đó.')}
    <div class="tbl-wrap" tabindex="0"><table class="tbl perm"><thead><tr><th>Chức năng</th><th class="c">Admin</th><th class="c">Lead QC</th><th class="c">QC</th></tr></thead><tbody>
    ${PERM.map(r => `<tr><td>${r[0]}</td>${[1, 2, 3].map(k => `<td class="c">${r[k] ? yes : no}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>`;
}
function userModal(id) {
  const u = id ? DB.cat.users.find(x => x.id === id) : { name: '', email: '', title: '', role: 'qc' }; const me = id === ME.id;
  openModal({ title: id ? 'Sửa người dùng' : 'Thêm người dùng', sub: id ? esc(u.email) : 'Tài khoản mới đăng nhập bằng email công ty', body: `<div class="stack">
    <div class="grid g2"><label class="field"><span>Họ tên</span><input class="inp" id="u-n" value="${esc(u.name)}"></label><label class="field"><span>Email</span><input class="inp" id="u-e" type="email" value="${esc(u.email)}"></label>
    <label class="field"><span>Chức danh</span><input class="inp" id="u-t" value="${esc(u.title)}" placeholder="VD: QC chuyền · Xưởng #96"></label>
    <label class="field"><span>Vai trò</span><select class="sel" id="u-r" ${me ? 'disabled' : ''}>${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></label></div>
    ${me ? banner('info', 'info', 'Không thể tự đổi vai trò của mình', 'Nhờ một Admin khác nếu cần.') : ''}</div>`,
    foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="saveUser('${id || ''}')">${ic('check')} Lưu</button>` });
}
function saveUser(id) {
  const v = k => document.getElementById(k).value.trim(); const name = v('u-n'), email = v('u-e').toLowerCase();
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) { toast('Nhập họ tên và email hợp lệ', 'bad'); return; }
  if (DB.cat.users.some(x => x.email.toLowerCase() === email && x.id !== id)) { toast('Email đã được dùng cho tài khoản khác', 'bad'); return; }
  if (id) { const u = DB.cat.users.find(x => x.id === id); Object.assign(u, { name, email, title: v('u-t') }); if (id !== ME.id) u.role = v('u-r'); }
  else DB.cat.users.push({ id: 'u' + Date.now().toString(36), name, email, title: v('u-t'), role: v('u-r'), active: true });
  closeModal(); catSave(`${id ? 'Sửa' : 'Thêm'} người dùng ${name} (${ROLES[v('u-r')][0]})`); toast(`Đã lưu ${name}`, 'ok');
}
function toggleUser(id) {
  const u = DB.cat.users.find(x => x.id === id); if (id === ME.id) return;
  if (u.active !== false && u.role === 'admin' && DB.cat.users.filter(x => x.role === 'admin' && x.active !== false).length < 2) { toast('Phải còn ít nhất một Admin đang hoạt động', 'bad'); return; }
  u.active = u.active === false; catSave(`${u.active ? 'Bật' : 'Tắt'} tài khoản ${u.name}`); toast(u.active ? `Đã bật ${u.name}` : `Đã tắt ${u.name} — không đăng nhập được nữa`, u.active ? 'ok' : 'warn');
}

/* 2. Nơi kiểm / Xưởng */
function adminPlaces() {
  return `<div class="card">${cardH('Nơi kiểm / Xưởng', 'Danh sách nơi QC đến kiểm. Nơi đang bật hiện trong ô “Nơi kiểm” khi lập phiếu; tên đầy đủ in trên báo cáo.', `<button class="btn btn-primary btn-sm" onclick="placeModal()">${ic('plus')} Thêm nơi kiểm</button>`)}
    <div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>Tên ngắn</th><th>Tên đầy đủ (in trên báo cáo)</th><th>Loại</th><th class="r">PO đang chạy</th><th>Đang dùng</th><th></th></tr></thead><tbody>
    ${DB.cat.places.map((p, k) => { const n = DB.pos.filter(x => !x.closed && [x.factory, x.finisher].includes(p.name)).length;
      return `<tr class="${p.active ? '' : 'off'}"><td class="nw"><b>${esc(p.name)}</b></td><td>${esc(p.full)}</td><td class="nw">${esc(p.kind)}</td><td class="r">${n || '<span class="muted">0</span>'}</td><td>${onOff(p.active, `togglePlace(${k})`)}</td><td class="r"><button class="btn btn-sm" onclick="placeModal(${k})">${ic('edit')} Sửa</button></td></tr>`; }).join('')}</tbody></table></div></div>`;
}
function placeModal(k) {
  const p = k === undefined ? { name: '', full: '', kind: PLACE_KINDS[1] } : DB.cat.places[k];
  openModal({ title: k === undefined ? 'Thêm nơi kiểm' : 'Sửa nơi kiểm', body: `<div class="stack"><div class="grid g2">
    <label class="field"><span>Tên ngắn</span><input class="inp" id="pl-n" value="${esc(p.name)}" ${k !== undefined ? 'readonly' : ''} placeholder="VD: Xưởng #97"></label>
    <label class="field"><span>Loại</span><select class="sel" id="pl-k">${PLACE_KINDS.map(x => `<option ${x === p.kind ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
    <label class="field"><span>Tên đầy đủ (in trên báo cáo)</span><input class="inp" id="pl-f" value="${esc(p.full)}" placeholder="VD: CÔNG TY TNHH …"></label>
    ${k !== undefined ? '<p class="t-sm muted">Tên ngắn không đổi được vì PO đồng bộ từ Base đang dùng tên này.</p>' : ''}</div>`,
    foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="savePlace(${k === undefined ? '' : k})">${ic('check')} Lưu</button>` });
}
function savePlace(k) {
  const name = document.getElementById('pl-n').value.trim(), full = document.getElementById('pl-f').value.trim(), kind = document.getElementById('pl-k').value;
  if (!name) { toast('Nhập tên nơi kiểm', 'bad'); return; }
  if (k === undefined) { if (DB.cat.places.some(p => p.name.toLowerCase() === name.toLowerCase())) { toast('Nơi kiểm đã có trong danh mục', 'bad'); return; } DB.cat.places.push({ name, full: full || name, kind, active: true }); }
  else Object.assign(DB.cat.places[k], { full: full || name, kind });
  closeModal(); catSave(`${k === undefined ? 'Thêm' : 'Sửa'} nơi kiểm ${name}`); toast(`Đã lưu ${name}`, 'ok');
}
function togglePlace(k) { const p = DB.cat.places[k]; p.active = !p.active; catSave(`${p.active ? 'Bật' : 'Tắt'} nơi kiểm ${p.name}`); }

/* 3. Loại đánh giá */
function adminTypes() {
  return `<div class="card">${cardH('Loại đánh giá & mẫu phiếu', 'Tên hiển thị và mẫu phiếu của 5 loại đánh giá. Thứ tự chờ giữa các loại cố định theo quy trình.')}
    <div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>Mã</th><th>Tên phiếu</th><th>Mẫu phiếu</th><th>Vùng</th><th>Phải chờ</th><th class="r">Phiếu đã lập</th><th></th></tr></thead><tbody>
    ${TYPE_ORDER.map(k => { const T = TYPES[k]; const z = ZONES.find(x => x.types.includes(k));
      return `<tr><td class="nw"><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="ico sm tone-teal">${ic(T.icon, '', 'width:14px;height:14px')}</span><b>${T.code}</b></div></td><td><b>${esc(T.name)}</b><div class="t-xs muted">${esc(T.desc)}</div></td><td>${esc(T.doc)}</td><td class="nw">${z.name.split('·')[0].trim()}</td>
      <td class="nw">${PREREQ[k].length ? PREREQ[k].map(x => TYPES[x].code).join(', ') : '<span class="muted">—</span>'}</td><td class="r">${DB.ins.filter(i => i.type === k).length}</td><td class="r"><button class="btn btn-sm" onclick="typeModal('${k}')">${ic('edit')} Sửa</button></td></tr>`; }).join('')}</tbody></table></div></div>`;
}
function typeModal(k) {
  const T = TYPES[k];
  openModal({ title: `Sửa loại đánh giá ${T.code}`, sub: 'Đổi tên hiển thị không ảnh hưởng phiếu đã lập', body: `<div class="stack">
    <label class="field"><span>Tên phiếu</span><input class="inp" id="ty-n" value="${esc(T.name)}"></label>
    <label class="field"><span>Mẫu phiếu / số hiệu biểu mẫu</span><input class="inp" id="ty-d" value="${esc(T.doc)}"></label>
    <label class="field"><span>Mô tả nội dung kiểm</span><textarea class="ta" id="ty-s">${esc(T.desc)}</textarea></label></div>`,
    foot: `<button class="btn" onclick="closeModal()">Hủy</button><button class="btn btn-primary" onclick="saveType('${k}')">${ic('check')} Lưu</button>` });
}
function saveType(k) {
  const v = id => document.getElementById(id).value.trim(); if (!v('ty-n')) { toast('Nhập tên phiếu', 'bad'); return; }
  DB.cat.types[k] = { name: v('ty-n'), doc: v('ty-d'), desc: v('ty-s') }; closeModal(); catSave(`Sửa loại đánh giá ${TYPES[k].code}`); toast(`Đã lưu ${TYPES[k].code}`, 'ok');
}

/* 4. Danh mục lỗi */
function adminDefects() {
  const C = DB.cat;
  return `<div class="card">${cardH('Danh mục lỗi', 'Gợi ý khi QC ghi lỗi trong phiếu. Mức lỗi mặc định được chọn sẵn, QC vẫn đổi được khi ghi nhận.')}
    <div class="card-b" style="border-bottom:1px solid var(--line)"><div class="row wrap" style="gap:8px"><input class="inp" id="df-new" placeholder="Tên lỗi mới, VD: Nứt chân mộng" style="flex:1;min-width:200px" onkeydown="if(event.key==='Enter')addDefectCat()">
      <select class="sel" id="df-sev" style="width:auto">${Object.entries(SEV).map(([k, s]) => `<option value="${k}" ${k === 'minor' ? 'selected' : ''}>${s.t} · ${s.vn}</option>`).join('')}</select><button class="btn btn-primary" onclick="addDefectCat()">${ic('plus')} Thêm</button></div></div>
    <div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th style="width:48px">#</th><th>Tên lỗi</th><th>Mức lỗi mặc định</th><th></th></tr></thead><tbody>
    ${C.defects.map((d, k) => `<tr><td class="muted">${k + 1}</td><td><b>${esc(d.name)}</b></td><td><select class="sel" style="width:auto;height:32px" onchange="setDefectSev(${k},this.value)">${Object.entries(SEV).map(([s, x]) => `<option value="${s}" ${d.sev === s ? 'selected' : ''}>${x.t} · ${x.vn}</option>`).join('')}</select></td>
      <td class="r"><button class="btn btn-sm" aria-label="Xóa" onclick="delDefect(${k})">${ic('trash')} Xóa</button></td></tr>`).join('')}</tbody></table></div></div>`;
}
function addDefectCat() {
  const el = document.getElementById('df-new'); const name = el.value.trim(); if (!name) { el.focus(); return; }
  if (DB.cat.defects.some(d => d.name.toLowerCase() === name.toLowerCase())) { toast('Lỗi này đã có trong danh mục', 'bad'); return; }
  DB.cat.defects.push({ name, sev: document.getElementById('df-sev').value }); catSave(`Thêm lỗi “${name}” vào danh mục`); toast(`Đã thêm “${name}”`, 'ok');
}
function setDefectSev(k, s) { const d = DB.cat.defects[k]; d.sev = s; catSave(`Đổi mức lỗi “${d.name}” → ${SEV[s].t}`); }
function delDefect(k) { const d = DB.cat.defects[k]; confirmBox('Xóa lỗi khỏi danh mục?', `“${esc(d.name)}” không còn được gợi ý khi ghi lỗi. Phiếu đã ghi lỗi này vẫn giữ nguyên.`, 'Xóa', 'btn-danger', () => { DB.cat.defects.splice(k, 1); catSave(`Xóa lỗi “${d.name}” khỏi danh mục`); toast('Đã xóa', 'ok'); }); }
/* chọn sẵn mức lỗi mặc định theo danh mục khi QC chọn tên lỗi */
function defSevPick(v) { const d = DB.cat.defects.find(x => x.name === v.trim()); if (d) document.querySelectorAll('#df-sev button').forEach(b => b.classList.toggle('on', b.dataset.v === d.sev)); }
