/* =====================================================================
   TRUNG TÂM BÁO CÁO (chỉ Lead / quản lý) — xem theo đúng mẫu KH, xuất file
   ===================================================================== */
const ck = ok => ok ? '✔' : 'x';
const pfMark = st => `<span class="pf">${['Pass', 'Pending', 'Fail'].map(s => `<span>${st === s ? '☑' : '☐'}${s}</span>`).join('')}</span>`;
const ph = (k, cls = '') => `<div class="ph ${cls}" style="${k ? bg(k) : ''}"></div>`;

function pageReports() {
  const types = [['all', 'Tất cả'], ...TYPE_ORDER.map(t => [t, `${TYPES[t].code} ${TYPES[t].short}`]), ['po', 'Báo cáo PO']];
  const cur = UI.repType; const q = UI.repQ.toLowerCase();
  let rows = '';
  if (cur === 'po') {
    const pos = DB.pos.filter(p => DB.reports.some(r => r.po === p.id) || poState(p) === 'ready');
    rows = `<div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>PO</th><th>Khách hàng</th><th>Trạng thái</th><th>Phiên bản</th><th><span class="sr">Thao tác</span></th></tr></thead><tbody>${pos.map(p => { const rs = DB.reports.filter(r => r.po === p.id); return `<tr><td class="nw fw6">PO ${p.id}</td><td>${p.customer}<div class="t-xs muted">${p.series}</div></td><td>${psPill(p)}</td><td>${rs.map(r => `<a class="tag" href="#/report/po/${r.id}">${r.ver} · ${fd(r.at)}</a>`).join(' ') || '<span class="muted">—</span>'}</td><td class="r">${rs.length ? `<button class="btn btn-sm" onclick="exportPO('${rs.at(-1).id}')">${ic('download')} Excel</button>` : `<a class="btn btn-sm btn-primary" href="#/po/${p.id}">Chốt PO</a>`}</td></tr>`; }).join('')}</tbody></table></div>`;
  } else {
    let list = DB.ins.filter(i => i.kind === 'qc' && i.data && ['approved', 'submitted'].includes(i.status) && (cur === 'all' || i.type === cur));
    if (q) list = list.filter(i => (i.id + i.title + i.pos.join(' ') + i.factory).toLowerCase().includes(q));
    list.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
    rows = `<div class="tbl-wrap" tabindex="0"><table class="tbl"><thead><tr><th>Báo cáo</th><th>Mẫu</th><th>PO</th><th>Nơi kiểm</th><th>QC</th><th>Ngày</th><th>Kết quả</th><th><span class="sr">Thao tác</span></th></tr></thead><tbody>${list.length ? list.map(i => { const e = evalInsp(i); return `<tr class="click" onclick="go('report/ins/${i.id}')"><td><b>${esc(i.title)}</b><div class="t-xs muted">${i.id}${i.status === 'submitted' ? ' · chờ duyệt' : ''}</div></td><td class="nw">${TYPES[i.type].code} · ${TYPES[i.type].doc}</td><td>${i.pos.join(', ')}</td><td class="nw">${i.factory}</td><td class="nw">${U(i.assignee).name}</td><td class="nw num">${fd(i.submittedAt)}</td><td>${pill(VERDICT[e.verdict][0], VERDICT[e.verdict][1])}</td><td class="r"><button class="btn btn-sm" onclick="event.stopPropagation();exportIns('${i.id}')">${ic('download')} ${TYPES[i.type].fmt === 'docx' ? 'Word' : 'Excel'}</button></td></tr>`; }).join('') : `<tr><td colspan="8">${empty('Chưa có báo cáo', '', 'file')}</td></tr>`}</tbody></table></div>`;
  }
  return `${hubHead('reports', 'Báo cáo theo đúng mẫu VHG đang dùng — xem trực tiếp, xuất Excel / Word hoặc in PDF.')}
  <div class="grid g4" style="margin-bottom:16px">${TYPE_ORDER.slice(0, 4).map(t => { const n = DB.ins.filter(i => i.type === t && i.kind === 'qc' && i.status === 'approved').length; return `<button class="card stat" style="text-align:left" onclick="UI.repType='${t}';render()"><div class="lbl">${ic(TYPES[t].icon)} ${TYPES[t].code} · ${TYPES[t].short}</div><div class="val">${n}</div><div class="sub">${TYPES[t].doc} · xuất ${TYPES[t].fmt === 'docx' ? 'Word' : 'Excel'}</div></button>`; }).join('')}</div>
  <div class="card"><div class="tabs" style="padding:0 20px">${types.map(t => `<button class="${t[0] === cur ? 'on' : ''}" onclick="UI.repType='${t[0]}';render()">${t[1]}</button>`).join('')}</div>
    ${cur !== 'po' ? `<div class="card-b tight" style="border-bottom:1px solid var(--line)"><div class="search" style="width:min(360px,100%)">${ic('search')}<input placeholder="Tìm theo PO, xưởng, mã báo cáo…" value="${esc(UI.repQ)}" oninput="UI.repQ=this.value;clearTimeout(window.__rq);window.__rq=setTimeout(()=>{render();const s=document.querySelector('.content .card .search input');s.focus();s.setSelectionRange(s.value.length,s.value.length)},250)"></div></div>` : ''}${rows}</div>`;
}

function pageReportDoc(kind, id) {
  UI.wide = true;
  if (kind === 'po') {
    const r = DB.reports.find(x => x.id === id); const p = PO(r.po);
    return `${pageHead(`Báo cáo PO ${p.id} · ${r.ver}`, `${esc(r.note)} · ${fdt(r.at)} · ${U(r.by).name}`, `<button class="btn" onclick="window.print()">${ic('printer')} In / PDF</button><button class="btn btn-primary" onclick="exportPO('${r.id}')">${ic('download')} Xuất Excel</button>`, 'po/' + p.id)}<div class="paper-wrap" id="print-area">${paperPO(r)}</div>`;
  }
  const i = INS(id); if (!i || !i.data) throw 0; const T = TYPES[i.type];
  return `${pageHead(esc(i.title), `${T.code} · ${T.doc} · ${U(i.assignee).name} · ${fd(i.submittedAt)}`, `<button class="btn" onclick="window.print()">${ic('printer')} In / PDF</button><button class="btn btn-primary" onclick="exportIns('${i.id}')">${ic('download')} Xuất ${T.fmt === 'docx' ? 'Word (.docx)' : 'Excel (.xlsx)'}</button>`, 'reports')}<div class="paper-wrap" id="print-area">${paperIns(i)}</div>`;
}
function paperIns(i) { return { WW: paperWW, PLY: paperPLY, DIR: paperDIR, FIN: paperFIN, PIG: paperPIG }[i.type](i); }

/* ---- 11A: F-QTQAQCT01-03 ---- */
const WW_COLS = [3.4, 4, 4, 9.5, 4.2, 3.3, 3.3, ...Array(13).fill(3.25), 4.3, 4.3, 3.3, 3.3, 3.3, 3.3, 3.3];
const colg = ws => `<colgroup>${ws.map(w => `<col style="width:${w}%">`).join('')}</colgroup>`;
function wwPhotoBlock(list) { // list: [[key, cap]] up to 5 → blocks 4,6,6,6,5 cols
  const spans = [4, 6, 6, 6, 5]; const L = list.concat(Array(5 - list.length).fill([null, '']));
  return `<tr>${L.map((x, k) => `<td colspan="${spans[k]}" style="padding:4px">${x[0] ? ph(x[0], 'sm') : ''}</td>`).join('')}</tr><tr>${L.map((x, k) => `<td colspan="${spans[k]}" class="cap">${esc(x[1])}</td>`).join('')}</tr>`;
}
function paperWW(i) {
  const D = i.data; const ps = insPOs(i); const N = D.items.reduce((a, it) => a + it.slsx, 0); const K = D.items.reduce((a, it) => a + (wwKL(it) === 'NA' ? 0 : it.slkiem), 0);
  const photoRows = D.items.map((it, k) => [it, k]).filter(([it]) => Object.keys(it.ph || {}).length).map(([it, k]) => { const e = Object.entries(it.ph); let h = `<tr><td colspan="27" class="b" style="border:0;padding-top:8px">${k + 1}. ${it.code.replace('DS GD ', '')}- ${it.part === 'Mặt hộc' ? 'MK' : 'DOOR'}</td></tr>`; for (let j = 0; j < e.length; j += 5) h += wwPhotoBlock(e.slice(j, j + 5).map(([c, p]) => [p, c])); return h; }).join('');
  const load = Object.entries(D.load).map(([k, p]) => [p, WW_LOAD[k]]); let loadRows = ''; for (let j = 0; j < load.length; j += 5) loadRows += wwPhotoBlock(load.slice(j, j + 5));
  let impRows = ''; for (let j = 0; j < D.improve.length; j += 5) impRows += wwPhotoBlock(D.improve.slice(j, j + 5).map(x => [x.p, x.t]));
  return `<div class="paper"><table>${colg(WW_COLS)}
  <tr><td colspan="2" rowspan="3" class="c"><img class="logo" src="${PHOTO.logo_vhg}" alt="VHG"></td><td colspan="18" rowspan="3" class="title">PHIẾU KIỂM TRA CHẤT LƯỢNG HÀNG TRẮNG HOÀN THIỆN</td><td colspan="4">Số hiệu</td><td colspan="3">F-QTQAQCT01-03</td></tr>
  <tr><td colspan="4">Lần ban hành</td><td colspan="3">01</td></tr><tr><td colspan="4">Ngày hiệu lực</td><td colspan="3">07/10/2026</td></tr>
  <tr class="noborder"><td colspan="27" style="height:8px"></td></tr>
  <tr><td colspan="5" class="hd">Ngày</td><td colspan="7">${D.date}</td><td colspan="7" class="hd">Nhà máy</td><td colspan="8">${i.factory}</td></tr>
  <tr><td colspan="5" class="hd">PO</td><td colspan="7">${i.pos.join('<br>')}</td><td colspan="7" class="hd">Số lượng đơn hàng</td><td colspan="8">${num(ps.reduce((a, p) => a + poQty(p), 0))} pcs</td></tr>
  <tr><td colspan="27" class="sec">I. DỮ LIỆU CHUNG</td></tr>
  <tr><th rowspan="2">Số thứ tự</th><th colspan="2" rowspan="2">Chi tiết</th><th rowspan="2">Tên (mã) sản phẩm/ chi tiết</th><th rowspan="2">SL Sản xuất</th><th colspan="2" rowspan="2">SL Kiểm tra (Level II)</th><th colspan="13">Nội dung kiểm tra</th><th colspan="2" rowspan="2">Kết luận</th><th colspan="5" rowspan="2">Diễn giải</th></tr>
  <tr>${WW_CRIT.map(c => `<th><div class="vert">${c}</div></th>`).join('')}</tr>
  ${D.items.map((it, k) => { const kl = wwKL(it); return `<tr><td class="c">${k + 1}</td><td colspan="2" class="c" ${it.part === 'Mặt hộc' ? 'style="background:#00b0f0"' : ''}>${it.part}</td><td>${it.code}</td><td class="c">${it.slsx}</td><td colspan="2" class="c">${kl === 'NA' ? '' : it.slkiem}</td>${it.crit.map(x => `<td class="c ${x === 'F' ? 'ng' : ''}">${x === 'P' ? '✔' : x === 'F' ? 'x' : ''}</td>`).join('')}<td colspan="2" class="c ${kl === 'F' ? 'ng' : ''}">${kl === 'P' ? 'Passed' : kl === 'F' ? 'Failed' : kl === 'NA' ? 'N/A' : ''}</td><td colspan="5">${esc(it.dg)}</td></tr>`; }).join('')}
  <tr><td colspan="4" class="b">Sum</td><td class="c b">${N}</td><td colspan="2" class="c b">${K}</td><td colspan="13"></td><td colspan="2" class="c">${VERDICT[evalInsp(i).verdict][0] === 'Đạt' ? 'Passed' : 'Passed*'}</td><td colspan="5"></td></tr>
  <tr><td colspan="27" class="sec">II. HÌNH ẢNH THỰC TẾ</td></tr>${photoRows}
  <tr><td colspan="27" class="sec">III. CHẤT XẾP- VẬN CHUYỂN</td></tr>${loadRows}
  <tr><td colspan="27" class="sec">IV. CÁC ĐIỂM CẢI TIẾN</td></tr>${impRows || '<tr><td colspan="27">Không có</td></tr>'}
  <tr class="noborder"><td colspan="27" style="height:12px"></td></tr>
  <tr class="noborder"><td colspan="18" style="white-space:pre-line;vertical-align:top"><b>Ghi chú/ Note:</b><br>${esc(D.note)}</td><td colspan="9" class="c" style="vertical-align:top">Lập bởi<br>${D.sig ? `<img class="sig" src="${PHOTO[D.sig]}" alt="">` : '<div style="height:56px"></div>'}<br><b>${U(i.assignee).name}</b></td></tr></table></div>`;
}

/* ---- 11B: BM-VHGLF-02 (Word) ---- */
function plyGrid(items) { // [[keys[], caption, st]]
  let h = ''; items.forEach(([keys, cap, st]) => { h += `<tr>${[0, 1, 2].map(j => `<td style="padding:4px">${keys[j] ? ph(keys[j]) : ''}</td>`).join('')}</tr><tr><td colspan="3" class="c">${esc(cap)}${st !== undefined ? '<br>' + pfMark(st) : ''}</td></tr>`; }); return h;
}
function paperPLY(i) {
  const D = i.data; const H = D.header; const e = evalInsp(i); const S = (k, l) => `<tr><td class="c" style="width:28%">${l}</td><td class="c">${esc(H[k])}</td></tr>`;
  return `<div class="paper word"><table><colgroup><col style="width:18%"><col style="width:62%"><col style="width:20%"></colgroup>
    <tr><td rowspan="3" class="c"><img class="logo" style="height:56px" src="${PHOTO.logo_vhg}" alt="VHG"></td><td rowspan="3" class="c"><div style="font-size:20px;font-weight:700">VIET HONG EXPORT - IMPORT JOINT STOCK COMPANY</div><div style="font-size:20px;font-weight:700;margin-top:8px">REPORT PLYWOOD 夹板检验报告</div><div class="b">Report number: ${esc(H.reportNo)}</div></td><td><b>Số hiệu:</b> BM-VHGLF-02</td></tr>
    <tr><td><b>Lần ban hành:</b> 01</td></tr><tr><td><b>Ngày ban hành:</b></td></tr></table>
  <table><colgroup><col style="width:27%"><col style="width:27%"><col style="width:46%"></colgroup>
    <tr><td class="c">Factory 工厂:</td><td class="c">${esc(H.factoryFull)}</td><td rowspan="8" style="vertical-align:top"><b>APPROVED PPS SAMPLE 已批准的 PPS 样品</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">${(H.pps || []).slice(0, 2).map(k => ph(k)).join('')}</div></td></tr>
    <tr><td class="c">Product Description 产品描述:</td><td class="c" style="white-space:pre-line">${esc(H.product)}</td></tr><tr><td class="c">Item Number 项目编号:</td><td class="c">${esc(H.itemNo)}</td></tr><tr><td class="c">PO Number 订单号:</td><td class="c">${i.pos.join(', ')}</td></tr><tr><td class="c">Product Dimension 产品尺寸:</td><td class="c">${esc(H.dimension)}</td></tr><tr><td class="c">Package height 包装高度</td><td class="c">${esc(H.pkg)}</td></tr><tr><td class="c">Net Weight (Kg/ Lbs) 净重:</td><td class="c">${esc(H.weight)}</td></tr><tr><td class="c">Number of orders 总订单数量:</td><td class="c">${num(H.qty)} pcs</td></tr>
    <tr><td class="c">Sampling rate 抽检数量：</td><td class="c">${H.sampling}</td><td></td></tr><tr><td class="c">QC Inspector</td><td class="c">${esc(H.inspectors)}</td><td></td></tr></table>
  <table><colgroup><col style="width:6%"><col style="width:20%"><col style="width:50%"><col style="width:24%"></colgroup><tr><th>Stt</th><th>Item</th><th>Description 描述</th><th>Note 备注</th></tr>${PLY_REQ.map((r, k) => `<tr><td class="c">${k + 1}</td><td class="c">${r.t}</td><td style="white-space:pre-line">${esc(r.d)}</td><td></td></tr>`).join('')}
    <tr><td colspan="3" style="vertical-align:top"><b><u>OVERALL ASSESSMENT 总体评估:</u></b><br>1. Dimensions 尺寸: <b>${['dimW', 'dimD', 'square', 'thick'].every(k => (D.checks[k] || {}).st === 'Pass') ? 'PASS' : 'FAIL'}</b> / Construction 结构: <b>PASS</b><br>2. Veneer 饰面 — Color and surface quality: <b>${(D.verify || {}).st === 'Fail' ? 'FAIL' : 'PASS'}</b><br>3. Moisture 水分: <b>${(D.checks.moist || {}).st === 'Pass' ? 'PASS' : 'FAIL'}</b><br>4. Gloss 光泽: <b>${(D.checks.gloss || {}).st === 'Pass' ? 'PASS' : 'FAIL'}</b> (35 ± 5%)<br>5. UV coating adhesion test 涂层附着力测试: <b>${(D.checks.adh || {}).st === 'Pass' ? 'PASS' : 'FAIL'}</b><br><i><b><u>6. Recorded Defects 记录的缺陷:</u></b></i><br>${[...(D.deviations || []), ...D.defects.map(x => `${x.d} — ${x.qty} pcs`)].map(x => '- ' + esc(x)).join('<br>')}</td><td style="vertical-align:top;white-space:pre-line"><b><u>REQUIREMENT 要求:</u></b><br><b>${esc(D.requirement)}</b></td></tr></table>
  <div class="pg" data-p="Trang 2"></div>
  <table><colgroup><col><col><col></colgroup><tr><td colspan="3" class="b">I. OVERALL INSPECTION 总观检验:</td></tr>${plyGrid(PLY_CHECKS.map(c => { const r = D.checks[c.k] || {}; return [r.ph || [], `${c.t.replace(/ — .*/, '')}: ${r.v || ''}`, r.st]; }))}
    <tr><td colspan="3" class="b">II. MATERIAL/ VENEER 材质/饰面</td></tr>${plyGrid([[D.veneer.slice(0, 3), 'Front D+ 正面 / Back D 背面'], [[...D.veneer.slice(3), ...D.plies].slice(0, 3), '7 plies 7层']])}
    <tr><td colspan="3" class="b">III. VERIFY AGAINST THE APPROVED PPS SAMPLE 对照已批准的PPS模板进行核对</td></tr>${plyGrid([[(D.verify.ph || []), 'Observe from a distance of 800–1000 mm 观察距离为 800 – 1000 毫米', D.verify.st]])}
    <tr><td colspan="3" class="b">IV. DEFECTS 缺陷:</td></tr>${plyGrid([[D.defects.flatMap(x => x.ph || []).slice(0, 3), ''], [D.defects.flatMap(x => x.ph || []).slice(3, 6), '']].filter(x => x[0].length))}<tr><td colspan="3" class="c">${D.defects.map((x, k) => `${k + 1}. ${esc(x.d)} ${x.qty} pcs`).join('<br>')}</td></tr></table>
  <table style="margin-top:16px;font-family:Arial"><tr><th>No.# Item#</th><th>Description</th><th>Item# Code</th><th>Q.ty Order</th><th>Q.ty Inspection</th><th>Criticle 严重</th><th>Major</th><th>Minor</th><th>Q.ty Reject</th></tr><tr class="c b"><td>PO ${i.pos.join(', ')}</td><td>PLYWOOD</td><td>${esc(H.itemNo)}</td><td>${H.qty}</td><td>${H.sampling}</td><td>${e.crit}</td><td>${e.maj}</td><td>${e.min}</td><td>${e.rej}</td></tr></table></div>`;
}

/* ---- 11C: Daily Inspection Report ---- */
function photoGrid4(keys, h = '') { let s = ''; for (let j = 0; j < keys.length; j += 4) s += `<tr>${[0, 1, 2, 3].map(x => `<td colspan="3" style="padding:4px">${keys[j + x] ? ph(keys[j + x], 'sm') : ''}</td>`).join('')}</tr>`; return s; }
function dirHeader(i, title, mode) {
  const D = i.data; const H = D.header || {};
  return `<tr><td colspan="3" rowspan="2" class="c"><img class="logo" src="${PHOTO.logo_vhg}" alt="VHG"></td><td colspan="9" class="title" style="font-size:16px">${title}</td></tr>
  <tr><td colspan="9" class="c">${['Inline', 'Final', 'Re-Final'].map(m => `${mode === m ? '☑' : '☐'} ${m}`).join('&emsp;&emsp;')}</td></tr>
  <tr><td colspan="2" class="b">FACTORY (NHÀ MÁY)</td><td colspan="3">${esc(H.factory || i.factory)}</td><td colspan="2" class="b">DATE (NGÀY)</td><td colspan="5">${fd(i.submittedAt || i.due)}</td></tr>
  <tr><td colspan="2" class="b">CUSTOMER (KHÁCH HÀNG)</td><td colspan="3">${esc(H.customer || insPOs(i)[0].customer)}</td><td colspan="2" class="b">COLOR CODE / Mã Màu</td><td colspan="5">${esc(H.color || insPOs(i)[0].color.toUpperCase())}</td></tr>
  <tr><td colspan="2" class="b">Collection Range</td><td colspan="3">${esc(H.collection || '')}</td><td colspan="2" class="b">FINISHING SUPPLIERS</td><td colspan="5">${esc(H.supplier || 'VVT')}</td></tr>
  <tr><td colspan="5"></td><td colspan="2" class="b">REPORTED BY</td><td colspan="5">${esc(H.reportedBy || U(i.assignee).name)}</td></tr>
  <tr><td colspan="5"></td><td colspan="2" class="b">REVIEW/ APPROVED BY</td><td colspan="5">${esc(H.approvedBy || 'Mr. Tin')}${i.status === 'approved' ? ' ✔' : ''}</td></tr>`;
}
function dirRowsTbl(i) {
  const D = i.data; const S = dirSum(D.rows);
  return `<tr><th>No.# Item#</th><th colspan="2">Description / Mô tả</th><th colspan="2">Item# Code</th><th>Q.ty Order/ Số lượng đơn hàng</th><th>Q.ty Inspection S.lượng kiểm</th><th>Criticle Nghiêm Trọng</th><th>Major Lỗi nặng</th><th>Minor Lỗi nhẹ</th><th>Q.ty Rejected/ SL Từ chối</th><th>Remark / Ghi chú</th></tr>
  ${D.rows.map(r => `<tr class="c"><td>PO ${r.po}</td><td colspan="2">${r.desc}</td><td colspan="2">${r.code}</td><td>${r.qo}</td><td>${r.qi}</td><td>${r.cr}</td><td class="${+r.ma ? 'ng' : ''}">${r.ma}</td><td>${r.mi}</td><td class="${+r.rj ? 'ng' : ''}">${r.rj}</td><td>${esc(r.rm)}</td></tr>`).join('')}
  <tr class="c b"><td colspan="5">Total</td><td>${S.qo}</td><td>${S.qi}</td><td>${S.cr}</td><td>${S.ma}</td><td>${S.mi}</td><td>${S.rj}</td><td></td></tr>`;
}
function paperDIR(i) {
  const D = i.data;
  return `<div class="paper"><table>${colg(Array(12).fill(100 / 12))}${dirHeader(i, 'During Inline Report / Báo Cáo kiểm trên Chuyền', D.mode)}
  <tr class="noborder"><td colspan="12" style="height:8px"></td></tr>${dirRowsTbl(i)}
  <tr><td colspan="12" class="sec">Control Plan on Process</td></tr><tr><th colspan="2">Stage - Công Đoạn</th><th colspan="3">Inspection Point - Mục cần Kiểm</th><th colspan="4">Criteria / Tiêu Chuẩn</th><th colspan="2">Sampling Plan / S.Lượng kiểm</th><th>Result</th></tr>
  ${DIR_CP.map((c, k) => `<tr><td colspan="2">${c.st}</td><td colspan="3">${c.pts}</td><td colspan="4">${c.crit}</td><td colspan="2">${c.smp}</td><td class="c ${D.cp[k].r === 'NG' ? 'ng' : 'ok'}">${D.cp[k].r || ''}${D.cp[k].note ? `<div style="font-weight:400;font-size:10px">${esc(D.cp[k].note)}</div>` : ''}</td></tr>`).join('')}
  <tr><td colspan="3" class="b">Material used</td><td colspan="9">${esc(D.material)}</td></tr>
  ${DIR_SECTIONS.filter(s => ((D.sec[s.k] || {}).ph || []).length).map(s => `<tr><td colspan="12" class="sec">${s.t}</td></tr>${D.sec[s.k].cap ? `<tr><td colspan="12">${esc(D.sec[s.k].cap)}</td></tr>` : ''}${photoGrid4(D.sec[s.k].ph)}`).join('')}
  <tr><td colspan="12" class="sec">Pictures of defects found during the inspection.</td></tr>${D.defects.map(x => `${photoGrid4(x.ph)}<tr><td colspan="12" class="c b">${esc(x.t)}</td></tr>`).join('') || '<tr><td colspan="12">None</td></tr>'}</table></div>`;
}
function paperFIN(i) {
  const D = i.data;
  return `<div class="paper"><table>${colg(Array(12).fill(100 / 12))}${dirHeader(i, 'Final Inspection & Packing Report / Báo cáo kiểm Final - Đóng gói', 'Final')}<tr class="noborder"><td colspan="12" style="height:8px"></td></tr>${dirRowsTbl(i)}
  <tr><td colspan="12" class="sec">Preparation before packing</td></tr>${FIN_PACK.map((t, k) => `<tr><td colspan="10">${t}</td><td colspan="2" class="c ${D.pack[k] === 'NG' ? 'ng' : 'ok'}">${D.pack[k] || ''}</td></tr>`).join('')}
  <tr><td colspan="12" class="sec">Chất xếp - vận chuyển</td></tr>${photoGrid4(Object.values(D.load))}
  <tr><td colspan="12" class="sec">Pictures of defects</td></tr>${D.defects.map(x => `${photoGrid4(x.ph)}<tr><td colspan="12" class="c b">${esc(x.t)}</td></tr>`).join('') || '<tr><td colspan="12">None</td></tr>'}</table></div>`;
}

/* ---- 11D: Sample monitoring report – Pigment ---- */
function paperPIG(i) {
  const D = i.data; const H = D.header;
  const secTbl = sec => `<tr><td colspan="26" class="sec" style="background:#00b0f0;border:1px solid #000">${sec.t.toUpperCase()}</td></tr><tr><th colspan="3">Date / Ngày</th><th colspan="3">Check by / Người kiểm tra</th><th colspan="8">Requirement / Yêu cầu</th><th colspan="4">Result / Kết quả</th><th colspan="3">Evaluation / Đánh giá</th><th colspan="5">Actual photos</th></tr>
    ${sec.rows.map((r, k) => { const v = (D.sec[sec.k] || [])[k] || {}; return `<tr><td colspan="3">${H.start}</td><td colspan="3">${sec.when}</td><td colspan="8">${r[0]}: ${r[1]}</td><td colspan="4" class="c">${v.v ?? ''}${r[2] && r[2] !== 'sel' && v.v !== undefined && v.v !== '' ? ' ' + r[2] : ''}</td><td colspan="3" class="c ${v.r === 'F' ? 'ng' : 'ok'}">${v.r === 'P' ? 'OK' : v.r === 'F' ? 'NG' : ''}</td><td colspan="5"></td></tr>`; }).join('')}`;
  const xrRows = PIG_TIMES.map((t, k) => { const x = D.xr[k]; return `<tr class="c"><td colspan="2">VHGI</td><td colspan="2">${x ? fd(x.date) : ''}</td><td colspan="2">${t}</td>${ILLUM.map(il => { const m = x && x[il]; const r = D.ref[il]; const de = deltaE(m, r); return m ? `<td>${m.L}</td><td>${m.a}</td><td>${m.b}</td><td>${(m.L - r.L).toFixed(2)}</td><td>${(m.a - r.a).toFixed(2)}</td><td>${(m.b - r.b).toFixed(2)}</td>${il === 'D65/10' ? `<td class="${de > 1 ? 'ng' : 'ok'}">${de.toFixed(2)}</td>` : ''}` : `<td></td><td></td><td></td><td></td><td></td><td></td>${il === 'D65/10' ? '<td></td>' : ''}`; }).join('')}<td>${x && x.sheen ? x.sheen.join('-') : ''}</td></tr>`; }).join('');
  return `<div class="paper" style="font-size:10px"><table>${colg(Array(26).fill(100 / 26))}
  <tr><td colspan="4" rowspan="2" class="c"><img class="logo" src="${PHOTO.logo_vhg}" alt="VHG"></td><td colspan="18" rowspan="2" class="title" style="font-size:15px">SAMPLE MONITORING REPORT- PIGMENT<br>BÁO CÁO THEO DÕI MẪU MÀU PIGMENT</td><td colspan="4" rowspan="2" class="c"><img class="logo" src="${PHOTO.logo_xrite}" alt="X-Rite" style="height:28px"></td></tr><tr></tr>
  <tr><td colspan="5" class="hd">Start Date/ Ngày bắt đầu</td><td colspan="4">${H.start}</td><td colspan="4" class="hd">Door style/ Kiểu cửa</td><td colspan="4">${H.doorStyle}</td><td colspan="4" class="hd">Customer/ Khách hàng</td><td colspan="5">${H.customer}</td></tr>
  <tr><td colspan="5" class="hd">Completion Date/ Ngày hoàn thiện</td><td colspan="4">${H.completion}</td><td colspan="4" class="hd">Color/ Màu</td><td colspan="4">${H.color}</td><td colspan="4" class="hd">Prepared by/ Lập bởi</td><td colspan="5">${H.preparedBy}</td></tr>
  <tr><td colspan="5" class="hd">Vendor name/ Tên NCC</td><td colspan="4">${H.vendor}</td><td colspan="4" class="hd">Code Product/ Mã SP</td><td colspan="4">${H.code}</td><td colspan="9"></td></tr>
  <tr><td colspan="26" class="sec">SAMPLE MAKING PROCESS CONTROL FLOW / LƯU TRÌNH KIỂM SOÁT QUÁ TRÌNH LÀM MẪU</td></tr>
  <tr><th colspan="6">No./ Stt</th>${PIG_STEPS.map((_, k) => `<th colspan="2">${k + 1}</th>`).join('')}</tr>
  <tr><td colspan="6" class="b">Process / Bước</td>${PIG_STEPS.map(s => `<td colspan="2" class="c" style="font-size:9px">${s[0]}<br>${s[1]}</td>`).join('')}</tr>
  <tr><td colspan="6" class="b">Status</td>${D.steps.map(s => `<td colspan="2" class="c ${s.ok ? 'ok' : ''}">${s.ok ? 'OK' : ''}<div style="font-weight:400;font-size:9px">${s.date}</div></td>`).join('')}</tr>
  <tr><td colspan="6" class="b">Remarks / Lưu ý</td>${PIG_STEPS.map(s => `<td colspan="2" style="font-size:9px">${s[2]}</td>`).join('')}</tr>
  ${PIG_SEC.slice(0, 4).map(secTbl).join('')}
  <tr><td colspan="26" class="sec">3. X-RITE COLOR VALUES & SHEEN / GIÁ TRỊ X-RITE VÀ ĐỘ BÓNG — Fabuwood Color Standard: ${H.standard} · Master Color Standard #: ${H.masterNo} · Process sheet: ${H.processSheet} · Substrate: ${H.substrate}</td></tr>
  <tr><th colspan="2" rowspan="2">Location</th><th colspan="2" rowspan="2">Date</th><th colspan="2" rowspan="2">Waiting time</th><th colspan="7">D65/10</th><th colspan="6">F02/10</th><th colspan="6">A10</th><th rowspan="2">Sheen</th></tr>
  <tr><th>L</th><th>a</th><th>b</th><th>ΔL</th><th>Δa</th><th>Δb</th><th>ΔE</th><th>L</th><th>a</th><th>b</th><th>ΔL</th><th>Δa</th><th>Δb</th><th>L</th><th>a</th><th>b</th><th>ΔL</th><th>Δa</th><th>Δb</th></tr>
  <tr class="c" style="background:#f2f2f2"><td colspan="6" class="b">Standard</td>${ILLUM.map(il => `<td>${D.ref[il].L}</td><td>${D.ref[il].a}</td><td>${D.ref[il].b}</td><td></td><td></td><td></td>${il === 'D65/10' ? '<td></td>' : ''}`).join('')}<td></td></tr>${xrRows}
  ${secTbl(PIG_SEC[4])}
  <tr><td colspan="26" class="sec" style="background:#00b0f0;border:1px solid #000">VI. APPENDIX – KCMA TEST REQUIREMENTS / PHỤ LỤC TIÊU CHÍ TEST KCMA</td></tr>
  <tr><th>No.</th><th colspan="6">Test criteria / Tiêu chí</th><th colspan="9">Test method / Phương pháp</th><th colspan="6">Requirements / Yêu cầu</th><th colspan="4">Result / Kết quả</th></tr>
  ${KCMA.map((t, k) => `<tr><td class="c">${k + 1}</td><td colspan="6">${t[0]}</td><td colspan="9">${t[1]}</td><td colspan="6">${t[2]}</td><td colspan="4" class="c ${D.kcma[k].r === 'F' ? 'ng' : 'ok'}">${D.kcma[k].r === 'P' ? 'PASS' : D.kcma[k].r === 'F' ? 'FAIL' : ''}<div style="font-weight:400;font-size:9px">${esc(D.kcma[k].note || '')}</div></td></tr>`).join('')}
  <tr><td colspan="26" class="b" style="border:0;padding-top:8px">Sau khi tất cả các yêu cầu đều ĐẠT thì thông tin cho Fabuwood ký mẫu.${D.approval.signed ? ' — ĐÃ KÝ MẪU ' + D.header.completion : ''}</td></tr></table></div>`;
}

/* ---- Báo cáo PO ---- */
function poLinked(p) { return p.plan.map(t => { const s = typeState(p, t); return { t, s, i: s.state === 'reused' ? s.from : s.list.filter(x => x.status === 'approved').at(-1) }; }); }
function paperPO(r) {
  const p = PO(r.po); const L = poLinked(p);
  return `<div class="paper"><table>${colg(Array(12).fill(100 / 12))}
  <tr><td colspan="3" rowspan="2" class="c"><img class="logo" src="${PHOTO.logo_vhg}" alt="VHG"></td><td colspan="9" class="title">BÁO CÁO CHẤT LƯỢNG PURCHASE ORDER</td></tr><tr><td colspan="9" class="c">PO ${p.id} · ${r.ver} · ${fdt(r.at)}</td></tr>
  <tr><td colspan="2" class="hd">PO</td><td colspan="4">${p.id}</td><td colspan="2" class="hd">Khách hàng</td><td colspan="4">${p.customer}</td></tr>
  <tr><td colspan="2" class="hd">Dòng hàng / màu</td><td colspan="4">${p.series} · ${p.color}</td><td colspan="2" class="hd">Xưởng</td><td colspan="4">${p.factory}${p.finisher && p.finisher !== p.factory ? ' → ' + p.finisher : ''}</td></tr>
  <tr><td colspan="2" class="hd">Số lượng</td><td colspan="4">${num(poQty(p))} pcs · ${p.lines.length} PO Line</td><td colspan="2" class="hd">Trạng thái</td><td colspan="4">${p.closed ? 'Đã chốt ' + fdt(p.closed.at) : 'Đang chạy'}</td></tr>
  <tr><td colspan="12" class="sec">KẾT QUẢ THEO LOẠI ĐÁNH GIÁ</td></tr><tr><th colspan="3">Loại / mẫu phiếu</th><th colspan="3">Phiên kiểm</th><th colspan="2">QC</th><th>Ngày duyệt</th><th>Kiểm / SL</th><th>Lỗi C/M/m</th><th>Kết luận</th></tr>
  ${L.map(x => { const e = x.i && evalInsp(x.i); return `<tr><td colspan="3">${TYPES[x.t].code} · ${TYPES[x.t].name}<br><span style="color:#666">${TYPES[x.t].doc}</span></td><td colspan="3">${x.i ? x.i.title + ' (' + x.i.id + ')' + (x.s.state === 'reused' ? ' — dùng lại' : '') : '—'}</td><td colspan="2">${x.i ? U(x.i.assignee).name : ''}</td><td class="c">${x.i ? fd(x.i.review.at) : ''}</td><td class="c">${e ? `${num(e.insp)} / ${num(e.N)}` : ''}</td><td class="c">${e ? `${e.crit}/${e.maj}/${e.min}` : ''}</td><td class="c ${e && e.verdict === 'FAIL' ? 'ng' : 'ok'}">${e ? VERDICT[e.verdict][0] : ''}</td></tr>`; }).join('')}
  <tr><td colspan="12" class="sec">LỊCH SỬ PHIÊN BẢN</td></tr><tr><th colspan="2">Phiên bản</th><th colspan="3">Thời gian</th><th colspan="2">Người xuất</th><th colspan="5">Ghi chú</th></tr>${DB.reports.filter(x => x.po === p.id).map(x => `<tr><td colspan="2">${x.ver}</td><td colspan="3">${fdt(x.at)}</td><td colspan="2">${U(x.by).name}</td><td colspan="5">${esc(x.note)}</td></tr>`).join('')}
  <tr class="noborder"><td colspan="4" class="c" style="padding-top:24px">QA/QC Lead<br><br><br><b>${U(r.by).name}</b></td><td colspan="4" class="c" style="padding-top:24px">QA Manager</td><td colspan="4" class="c" style="padding-top:24px">Customer / Inspector</td></tr></table></div>
  ${L.filter(x => x.i).map(x => `<div class="pg" data-p="${TYPES[x.t].code} · ${x.i.id}"></div>${paperIns(x.i)}`).join('')}`;
}
