/* =====================================================================
   XUẤT FILE THEO ĐÚNG MẪU KH — Excel (ExcelJS) · Word (docx)
   ===================================================================== */
const LIBS = { ExcelJS: 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js', docx: 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js' };
function loadLib(name) { if (window[name]) return Promise.resolve(window[name]); return new Promise((ok, no) => { const s = document.createElement('script'); s.src = LIBS[name]; s.onload = () => ok(window[name]); s.onerror = () => no(new Error('Không tải được thư viện ' + name + ' (cần internet)')); document.head.appendChild(s); }); }
function saveBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const fileSafe = s => s.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
async function withBusy(label, fn) { toast(label + '…', 'info'); try { await fn(); } catch (e) { console.error(e); toast(e.message || 'Xuất file thất bại', 'bad'); } }

/* ---------- Excel helpers ---------- */
const THIN = { style: 'thin', color: { argb: 'FF000000' } };
const BOX = { top: THIN, left: THIN, bottom: THIN, right: THIN };
const BLUE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
const GREY = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
function X(ws, rng, v, o = {}) {
  if (rng.includes(':')) ws.mergeCells(rng);
  const c = ws.getCell(rng.split(':')[0]); c.value = v;
  c.font = { name: 'Arial', size: o.size || 10, bold: !!o.b, color: o.color ? { argb: o.color } : undefined, italic: !!o.i };
  c.alignment = { vertical: 'middle', horizontal: o.h || 'left', wrapText: true, textRotation: o.rot || 0 };
  if (o.fill) c.fill = o.fill;
  if (o.border !== false) { const [a, b] = rng.split(':'); const s = ws.getCell(a), e = ws.getCell(b || a); for (let r = s.row; r <= e.row; r++) for (let k = s.col; k <= e.col; k++) ws.getCell(r, k).border = BOX; }
  return c;
}
const colL = n => { let s = ''; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const R = (c1, r1, c2, r2) => `${colL(c1)}${r1}:${colL(c2)}${r2 ?? r1}`;
function img(wb, ws, key, col, row, w, h) { if (!PHOTO[key]) return; const id = wb.addImage({ base64: PHOTO[key], extension: 'jpeg' }); ws.addImage(id, { tl: { col: col + 0.08, row: row - 1 + 0.06 }, ext: { width: w, height: h }, editAs: 'oneCell' }); }
function photoBlocks(wb, ws, r, list, spans, totalCols, capH = 30) { // list [[key,cap]]
  let c = 0; ws.getRow(r).height = 112; ws.getRow(r + 1).height = capH;
  spans.forEach((sp, k) => { const x = list[k]; X(ws, R(c, r, c + sp - 1), '', {}); X(ws, R(c, r + 1, c + sp - 1), x ? x[1] : '', { h: 'center', size: 9 }); if (x && x[0]) img(wb, ws, x[0], c, r, Math.min(sp * 38, 196), 140); c += sp; });
  return r + 2;
}
function sheetSetup(ws, widths, landscape = true) { ws.columns = widths.map(w => ({ width: w })); ws.pageSetup = { orientation: landscape ? 'landscape' : 'portrait', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: .3, right: .3, top: .4, bottom: .4, header: .2, footer: .2 } }; ws.views = [{ showGridLines: false }]; }

/* ---------- 11A Hàng trắng — F-QTQAQCT01-03 ---------- */
function xlsWW(wb, i, name) {
  const D = i.data; const ws = wb.addWorksheet(name || 'BÁO CÁO- FINAL HÀNG TRẮNG');
  sheetSetup(ws, [7.4, 7.3, 7.6, 18, 8, 5.4, 5.4, ...Array(13).fill(5.6), 7.5, 7.5, 6.4, 6.4, 6.4, 6.4, 6.4]);
  X(ws, 'A1:B3', ''); img(wb, ws, 'logo_vhg', 0, 1, 90, 44);
  X(ws, 'C1:T3', 'PHIẾU KIỂM TRA CHẤT LƯỢNG HÀNG TRẮNG HOÀN THIỆN', { b: 1, size: 16, h: 'center' });
  [['Số hiệu', 'F-QTQAQCT01-03'], ['Lần ban hành', '01'], ['Ngày hiệu lực', '07/10/2026']].forEach(([a, b], k) => { X(ws, `U${k + 1}:X${k + 1}`, a); X(ws, `Y${k + 1}:AA${k + 1}`, b); });
  X(ws, 'A5:E5', 'Ngày', { b: 1, fill: BLUE }); X(ws, 'F5:L5', D.date); X(ws, 'M5:S5', 'Nhà máy', { b: 1, fill: BLUE }); X(ws, 'T5:AA5', i.factory);
  X(ws, 'A6:E6', 'PO', { b: 1, fill: BLUE }); X(ws, 'F6:L6', i.pos.join('\n')); X(ws, 'M6:S6', 'Số lượng đơn hàng', { b: 1, fill: BLUE }); X(ws, 'T6:AA6', num(insPOs(i).reduce((a, p) => a + poQty(p), 0)) + ' pcs'); ws.getRow(6).height = 30;
  X(ws, 'A8:AA8', 'I. DỮ LIỆU CHUNG', { b: 1, border: false });
  X(ws, 'A9:A12', 'Số thứ tự', { b: 1, h: 'center' }); X(ws, 'B9:C12', 'Chi tiết', { b: 1, h: 'center' }); X(ws, 'D9:D12', 'Tên (mã) sản phẩm/ chi tiết', { b: 1, h: 'center' }); X(ws, 'E9:E12', 'SL Sản xuất', { b: 1, h: 'center' }); X(ws, 'F9:G12', 'SL Kiểm tra (Level II)', { b: 1, h: 'center' });
  X(ws, 'H9:T9', 'Nội dung kiểm tra', { b: 1, h: 'center' }); WW_CRIT.forEach((c, k) => X(ws, R(7 + k, 10, 7 + k, 12), c, { h: 'center', rot: 90, size: 9 }));
  X(ws, 'U9:V12', 'Kết luận', { b: 1, h: 'center' }); X(ws, 'W9:AA12', 'Diễn giải', { b: 1, h: 'center' }); ws.getRow(10).height = 40; ws.getRow(11).height = 40; ws.getRow(12).height = 40;
  let r = 13;
  D.items.forEach((it, k) => { const kl = wwKL(it);
    X(ws, `A${r}`, k + 1, { h: 'center' }); X(ws, `B${r}:C${r}`, it.part, { h: 'center', fill: it.part === 'Mặt hộc' ? BLUE : undefined }); X(ws, `D${r}`, it.code); X(ws, `E${r}`, it.slsx, { h: 'center' }); X(ws, `F${r}:G${r}`, kl === 'NA' ? '' : it.slkiem, { h: 'center' });
    it.crit.forEach((x, j) => X(ws, `${colL(7 + j)}${r}`, x === 'P' ? '✔' : x === 'F' ? 'x' : '', { h: 'center', color: x === 'F' ? 'FFC00000' : undefined, b: x === 'F' }));
    X(ws, `U${r}:V${r}`, kl === 'P' ? 'Passed' : kl === 'F' ? 'Failed' : kl === 'NA' ? 'N/A' : '', { h: 'center', color: kl === 'F' ? 'FFC00000' : undefined }); X(ws, `W${r}:AA${r}`, it.dg); r++; });
  X(ws, `A${r}:D${r}`, 'Sum', { b: 1 }); X(ws, `E${r}`, D.items.reduce((a, x) => a + x.slsx, 0), { b: 1, h: 'center' }); X(ws, `F${r}:G${r}`, D.items.reduce((a, x) => a + (wwKL(x) === 'NA' ? 0 : x.slkiem), 0), { b: 1, h: 'center' }); X(ws, `H${r}:T${r}`, ''); X(ws, `U${r}:V${r}`, 'Passed', { h: 'center' }); X(ws, `W${r}:AA${r}`, ''); r += 2;
  const SP = [4, 6, 6, 6, 5];
  X(ws, `A${r}:AA${r}`, 'II. HÌNH ẢNH THỰC TẾ', { b: 1, border: false }); r++;
  D.items.forEach((it, k) => { const e = Object.entries(it.ph || {}); if (!e.length) return; X(ws, `A${r}:AA${r}`, `${k + 1}. ${it.code.replace('DS GD ', '')}- ${it.part === 'Mặt hộc' ? 'MK' : 'DOOR'}`, { b: 1, border: false }); r++; for (let j = 0; j < e.length; j += 5) r = photoBlocks(wb, ws, r, e.slice(j, j + 5).map(([c, p]) => [p, c]), SP); });
  X(ws, `A${r}:AA${r}`, 'III. CHẤT XẾP- VẬN CHUYỂN', { b: 1, border: false }); r++;
  const ld = Object.entries(D.load).map(([k, p]) => [p, WW_LOAD[k]]); for (let j = 0; j < ld.length; j += 5) r = photoBlocks(wb, ws, r, ld.slice(j, j + 5), SP);
  X(ws, `A${r}:AA${r}`, 'IV. CÁC ĐIỂM CẢI TIẾN', { b: 1, border: false }); r++;
  for (let j = 0; j < D.improve.length; j += 5) r = photoBlocks(wb, ws, r, D.improve.slice(j, j + 5).map(x => [x.p, x.t]), SP, 27, 40);
  r++; X(ws, `A${r}:K${r}`, 'Ghi chú/ Note:', { b: 1, border: false }); X(ws, `V${r}:AA${r}`, 'Lập bởi', { h: 'center', border: false });
  X(ws, `A${r + 1}:T${r + 4}`, D.note, { border: false }); ws.getRow(r + 1).height = 30; if (D.sig) img(wb, ws, D.sig, 22, r + 1, 110, 50); X(ws, `V${r + 4}:AA${r + 4}`, U(i.assignee).name, { h: 'center', b: 1, border: false });
  return ws;
}

/* ---------- 11C / 11E Daily ---------- */
function xlsDIR(wb, i, name) {
  const D = i.data; const H = D.header || {}; const fin = i.type === 'FIN'; const ws = wb.addWorksheet(name || 'Daily Report');
  sheetSetup(ws, [13, 12, 10, 10, 10, 13, 13, 11, 10, 10, 13, 16]);
  X(ws, 'A1:C3', ''); img(wb, ws, 'logo_vhg', 0, 1, 110, 50);
  X(ws, 'D1:L2', fin ? 'Final Inspection & Packing Report / Báo cáo kiểm Final - Đóng gói' : 'During Inline Report / Baó Caó kiểm trên Chuyền', { b: 1, size: 14, h: 'center' });
  X(ws, 'D3:L3', ['Inline', 'Final', 'Re-Final'].map(m => `${(fin ? 'Final' : D.mode) === m ? '☑' : '☐'} ${m}`).join('        '), { h: 'center' });
  const hd = [['FACTORY (NHÀ MÁY)', H.factory || i.factory, 'DATE (NGÀY)', fd(i.submittedAt || i.due)], ['CUSTOMER (KHÁCH HÀNG)', H.customer || insPOs(i)[0].customer, 'COLOR CODE / Mã Màu', H.color || insPOs(i)[0].color.toUpperCase()], ['Collection Range', H.collection || '', 'FINISHING SUPPLIERS', H.supplier || 'VVT'], ['', '', 'REPORTED BY', H.reportedBy || U(i.assignee).name], ['', '', 'REVIEW/ APPROVED BY', H.approvedBy || 'Mr. Tin']];
  hd.forEach((x, k) => { const r = 5 + k; X(ws, `A${r}:B${r}`, x[0], { b: 1 }); X(ws, `C${r}:E${r}`, x[1]); X(ws, `F${r}:G${r}`, x[2], { b: 1 }); X(ws, `H${r}:L${r}`, x[3]); });
  let r = 11; ['No.# Item#', 'Description / Mô tả', '', 'Item# Code', '', 'Q.ty Order/ Số lượng đơn hàng', 'Q.ty Inspection S.lượng kiểm', 'Criticle Nghiêm Trọng', 'Major Lỗi nặng', 'Minor Lỗi nhẹ', 'Q.ty Rejected/SL Từ chối', 'Remark / Ghi chú'].forEach((t, k) => { if (k === 2 || k === 4) return; X(ws, k === 1 ? `B${r}:C${r}` : k === 3 ? `D${r}:E${r}` : `${colL(k)}${r}`, t, { b: 1, h: 'center', fill: GREY }); }); ws.getRow(r).height = 42; r++;
  D.rows.forEach(x => { X(ws, `A${r}`, 'PO ' + x.po, { h: 'center' }); X(ws, `B${r}:C${r}`, x.desc, { h: 'center' }); X(ws, `D${r}:E${r}`, x.code, { h: 'center' }); [x.qo, x.qi, x.cr, x.ma, x.mi, x.rj].forEach((v, k) => X(ws, `${colL(5 + k)}${r}`, +v, { h: 'center', color: (k === 3 || k === 5) && +v ? 'FFC00000' : undefined, b: (k === 3 || k === 5) && +v })); X(ws, `L${r}`, x.rm, { h: 'center' }); r++; });
  const S = dirSum(D.rows); X(ws, `A${r}:E${r}`, 'Total', { b: 1, h: 'center' }); [S.qo, S.qi, S.cr, S.ma, S.mi, S.rj].forEach((v, k) => X(ws, `${colL(5 + k)}${r}`, v, { b: 1, h: 'center' })); X(ws, `L${r}`, ''); r += 2;
  if (!fin) {
    X(ws, `A${r}:L${r}`, 'Cotrol Plan on Process', { b: 1, border: false }); r++;
    X(ws, `A${r}:B${r}`, 'Stage- Công Đoạn', { b: 1, fill: GREY }); X(ws, `C${r}:F${r}`, 'Inspection Point-Mục cần Kiểm', { b: 1, fill: GREY }); X(ws, `G${r}:I${r}`, 'Criteria/Tiêu Chuẩn', { b: 1, fill: GREY }); X(ws, `J${r}:K${r}`, 'Sampling Plan/ S.Lượng kiểm', { b: 1, fill: GREY }); X(ws, `L${r}`, 'Result', { b: 1, fill: GREY, h: 'center' }); r++;
    DIR_CP.forEach((c, k) => { X(ws, `A${r}:B${r}`, c.st); X(ws, `C${r}:F${r}`, c.pts); X(ws, `G${r}:I${r}`, c.crit); X(ws, `J${r}:K${r}`, c.smp); X(ws, `L${r}`, (D.cp[k].r || '') + (D.cp[k].note ? '\n' + D.cp[k].note : ''), { h: 'center', b: 1, color: D.cp[k].r === 'NG' ? 'FFC00000' : 'FF137A3C' }); ws.getRow(r).height = 54; r++; });
    X(ws, `A${r}:C${r}`, 'Material used', { b: 1 }); X(ws, `D${r}:L${r}`, D.material); r += 2;
    DIR_SECTIONS.filter(s => ((D.sec[s.k] || {}).ph || []).length).forEach(s => { X(ws, `A${r}:L${r}`, s.t, { b: 1, border: false }); r++; if (D.sec[s.k].cap) { X(ws, `A${r}:L${r}`, D.sec[s.k].cap); r++; } const ks = D.sec[s.k].ph; for (let j = 0; j < ks.length; j += 4) r = photoBlocks(wb, ws, r, ks.slice(j, j + 4).map(k => [k, '']), [3, 3, 3, 3], 12, 4); });
  } else {
    X(ws, `A${r}:L${r}`, 'Preparation before packing', { b: 1, border: false }); r++;
    FIN_PACK.forEach((t, k) => { X(ws, `A${r}:J${r}`, t); X(ws, `K${r}:L${r}`, D.pack[k] || '', { h: 'center', b: 1, color: D.pack[k] === 'NG' ? 'FFC00000' : 'FF137A3C' }); r++; }); r++;
    X(ws, `A${r}:L${r}`, 'Chất xếp - vận chuyển', { b: 1, border: false }); r++; const ld = Object.entries(D.load).map(([k, p]) => [p, WW_LOAD[k]]); for (let j = 0; j < ld.length; j += 4) r = photoBlocks(wb, ws, r, ld.slice(j, j + 4), [3, 3, 3, 3]);
  }
  X(ws, `A${r}:L${r}`, 'Pictures of defects found during the inspection.', { b: 1, border: false }); r++;
  D.defects.forEach(x => { for (let j = 0; j < x.ph.length; j += 4) r = photoBlocks(wb, ws, r, x.ph.slice(j, j + 4).map(k => [k, '']), [3, 3, 3, 3], 12, 4); X(ws, `A${r}:L${r}`, x.t, { b: 1, h: 'center' }); r += 2; });
  return ws;
}

/* ---------- 11D Pigment ---------- */
function xlsPIG(wb, i, name) {
  const D = i.data; const H = D.header; const ws = wb.addWorksheet(name || ('REPORT- ' + H.color).slice(0, 31));
  sheetSetup(ws, [9, 9, 9, 9, 9, 9, ...Array(19).fill(5.8), 8]);
  X(ws, 'A1:D2', ''); img(wb, ws, 'logo_vhg', 0, 1, 110, 46);
  X(ws, 'E1:V2', 'SAMPLE MONITORING REPORT- PIGMENT\nBÁO CÁO THEO DÕI MẪU MÀU PIGMENT', { b: 1, size: 14, h: 'center' }); X(ws, 'W1:Z2', ''); img(wb, ws, 'logo_xrite', 22, 1, 110, 34); ws.getRow(1).height = 26; ws.getRow(2).height = 26;
  [['Start Date/ Ngày bắt đầu', H.start, 'Door style/ Kiểu cửa', H.doorStyle, 'Customer/ Khách hàng', H.customer], ['Completion Date/ Ngày hoàn thiện', H.completion, 'Color/ Màu', H.color, 'Prepared by/ Lập bỡi', H.preparedBy], ['Vendor name/ Tên nhà cung cấp', H.vendor, 'Code Product/ Mã sản phẩm', H.code, '', '']].forEach((x, k) => { const r = 3 + k; X(ws, `A${r}:D${r}`, x[0], { fill: BLUE, b: 1 }); X(ws, `E${r}:H${r}`, x[1]); X(ws, `I${r}:L${r}`, x[2], { fill: x[2] ? BLUE : undefined, b: 1 }); X(ws, `M${r}:P${r}`, x[3]); X(ws, `Q${r}:T${r}`, x[4], { fill: x[4] ? BLUE : undefined, b: 1 }); X(ws, `U${r}:Z${r}`, x[5]); });
  let r = 7; X(ws, `A${r}:Z${r}`, 'SAMPLE MAKING PROCESS CONTROL FLOW\nLƯU TRÌNH KIỂM SOÁT QUÁ TRÌNH LÀM MẪU', { b: 1, h: 'center' }); ws.getRow(r).height = 30; r++;
  X(ws, `A${r}:F${r}`, 'No./ Stt', { b: 1 }); PIG_STEPS.forEach((s, k) => X(ws, R(6 + k * 2, r, 7 + k * 2), k + 1, { b: 1, h: 'center' })); r++;
  X(ws, `A${r}:F${r}`, 'Process\nBước', { b: 1 }); PIG_STEPS.forEach((s, k) => X(ws, R(6 + k * 2, r, 7 + k * 2), `${s[0]}\n${s[1]}`, { h: 'center', size: 8 })); ws.getRow(r).height = 56; r++;
  X(ws, `A${r}:F${r}`, 'Status', { b: 1 }); D.steps.forEach((s, k) => X(ws, R(6 + k * 2, r, 7 + k * 2), s.ok ? 'OK\n' + s.date : '', { h: 'center', size: 8, b: s.ok, color: 'FF137A3C' })); ws.getRow(r).height = 30; r++;
  X(ws, `A${r}:F${r}`, 'Remarks\nLưu ý', { b: 1 }); PIG_STEPS.forEach((s, k) => X(ws, R(6 + k * 2, r, 7 + k * 2), s[2], { size: 8 })); ws.getRow(r).height = 64; r += 2;
  const sec = sc => { X(ws, `A${r}:Z${r}`, sc.t.toUpperCase(), { b: 1, fill: BLUE }); r++; ['Date\nNgày', 'Check by\nNgười kiểm tra', 'Requirement\nYêu cầu', 'Result\nKết quả', 'Evaluation\nĐánh giá'].forEach((t, k) => X(ws, [`A${r}:B${r}`, `C${r}:D${r}`, `E${r}:N${r}`, `O${r}:R${r}`, `S${r}:U${r}`][k], t, { b: 1, h: 'center' })); X(ws, `V${r}:Z${r}`, 'Actual Photos\nHình ảnh thực tế', { b: 1, h: 'center' }); ws.getRow(r).height = 28; r++;
    sc.rows.forEach((x, k) => { const v = (D.sec[sc.k] || [])[k] || {}; X(ws, `A${r}:B${r}`, H.start); X(ws, `C${r}:D${r}`, sc.when); X(ws, `E${r}:N${r}`, `${x[0]}: ${x[1]}`); X(ws, `O${r}:R${r}`, v.v != null && v.v !== '' ? `${v.v}${x[2] && x[2] !== 'sel' ? ' ' + x[2] : ''}` : '', { h: 'center' }); X(ws, `S${r}:U${r}`, v.r === 'P' ? 'OK' : v.r === 'F' ? 'NG' : '', { h: 'center', b: 1, color: v.r === 'F' ? 'FFC00000' : 'FF137A3C' }); X(ws, `V${r}:Z${r}`, ''); r++; }); r++; };
  PIG_SEC.slice(0, 4).forEach(sec);
  X(ws, `A${r}:Z${r}`, `3. X-RITE COLOR VALUES & SHEEN / GIÁ TRỊ X-RITE VÀ ĐỘ BÓNG — Fabuwood Color Standard: ${H.standard} · Master #${H.masterNo} · Process sheet: ${H.processSheet} · Substrate: ${H.substrate}`, { b: 1 }); r++;
  X(ws, `A${r}:A${r + 1}`, 'Location\nNhà máy', { b: 1, h: 'center' }); X(ws, `B${r}:B${r + 1}`, 'Date', { b: 1, h: 'center' }); X(ws, `C${r}:C${r + 1}`, 'Waiting Time\nThời gian chờ', { b: 1, h: 'center' });
  X(ws, `D${r}:J${r}`, 'D65/10', { b: 1, h: 'center' }); X(ws, `K${r}:Q${r}`, 'F02/10', { b: 1, h: 'center' }); X(ws, `R${r}:X${r}`, 'A10', { b: 1, h: 'center' }); X(ws, `Y${r}:Y${r + 1}`, 'Sheen\nMin-Max', { b: 1, h: 'center' }); X(ws, `Z${r}:Z${r + 1}`, 'Xrite no.', { b: 1, h: 'center' }); r++;
  ILLUM.forEach((_, g) => ['L', 'a', 'b', 'ΔL', 'Δa', 'Δb', 'ΔE'].forEach((t, k) => X(ws, `${colL(3 + g * 7 + k)}${r}`, t, { b: 1, h: 'center' }))); r++;
  X(ws, `A${r}:C${r}`, 'Standard', { b: 1, fill: GREY }); ILLUM.forEach((il, g) => ['L', 'a', 'b'].forEach((c, k) => X(ws, `${colL(3 + g * 7 + k)}${r}`, D.ref[il][c], { h: 'center', fill: GREY }))); ILLUM.forEach((_, g) => [3, 4, 5, 6].forEach(k => X(ws, `${colL(3 + g * 7 + k)}${r}`, '', { fill: GREY }))); X(ws, `Y${r}:Z${r}`, '', { fill: GREY }); r++;
  PIG_TIMES.forEach((t, k) => { const x = D.xr[k]; X(ws, `A${r}`, 'VHGI'); X(ws, `B${r}`, x ? fd(x.date) : ''); X(ws, `C${r}`, t);
    ILLUM.forEach((il, g) => { const m = x && x[il]; const rf = D.ref[il]; const vals = m ? [m.L, m.a, m.b, +(m.L - rf.L).toFixed(2), +(m.a - rf.a).toFixed(2), +(m.b - rf.b).toFixed(2), +deltaE(m, rf).toFixed(2)] : Array(7).fill(''); vals.forEach((v, j) => X(ws, `${colL(3 + g * 7 + j)}${r}`, v, { h: 'center', b: j === 6 && v !== '', color: j === 6 && v > 1 ? 'FFC00000' : undefined })); });
    X(ws, `Y${r}`, x && x.sheen ? x.sheen.join('-') : '', { h: 'center' }); X(ws, `Z${r}`, x ? x.xrite || '' : '', { size: 8 }); r++; }); r++;
  sec(PIG_SEC[4]);
  X(ws, `A${r}:Z${r}`, 'VI. Appendix – KCMA Test Requirements (Paint Supplier to Perform Testing and Submit Test Report)\nPHỤ LỤC TIÊU CHÍ TEST KCMA (NCC sơn Test và cung cấp báo cáo test)', { b: 1, fill: BLUE }); ws.getRow(r).height = 30; r++;
  X(ws, `A${r}`, 'No.\nStt', { b: 1, h: 'center' }); X(ws, `B${r}:F${r}`, 'TEST CRITERIA\nTIÊU CHÍ', { b: 1, h: 'center' }); X(ws, `G${r}:P${r}`, 'TEST METHOD\nPHƯƠNG PHÁP TEST', { b: 1, h: 'center' }); X(ws, `Q${r}:V${r}`, 'REQUIREMENTS\nYÊU CẦU', { b: 1, h: 'center' }); X(ws, `W${r}:Z${r}`, 'RESULT\nKẾT QUẢ', { b: 1, h: 'center' }); r++;
  KCMA.forEach((t, k) => { X(ws, `A${r}`, k + 1, { h: 'center' }); X(ws, `B${r}:F${r}`, t[0]); X(ws, `G${r}:P${r}`, t[1]); X(ws, `Q${r}:V${r}`, t[2]); X(ws, `W${r}:Z${r}`, (D.kcma[k].r === 'P' ? 'PASS' : D.kcma[k].r === 'F' ? 'FAIL' : '') + (D.kcma[k].note ? '\n' + D.kcma[k].note : ''), { h: 'center', b: 1, color: D.kcma[k].r === 'F' ? 'FFC00000' : 'FF137A3C' }); ws.getRow(r).height = 36; r++; }); r++;
  X(ws, `A${r}:Z${r}`, 'Sau khi tất cả các yêu cầu đều ĐẠT thì thông tin cho Fabuwood ký mẫu.' + (D.approval.signed ? ' — ĐÃ KÝ MẪU ' + H.completion : ''), { b: 1, border: false });
  return ws;
}

/* ---------- PO summary ---------- */
function xlsPOSummary(wb, rp) {
  const p = PO(rp.po); const ws = wb.addWorksheet('Tổng hợp PO'); sheetSetup(ws, [26, 34, 16, 14, 14, 14, 18]);
  X(ws, 'A1:A2', ''); img(wb, ws, 'logo_vhg', 0, 1, 120, 50); X(ws, 'B1:G1', 'BÁO CÁO CHẤT LƯỢNG PURCHASE ORDER', { b: 1, size: 14, h: 'center' }); X(ws, 'B2:G2', `PO ${p.id} · ${rp.ver} · ${fdt(rp.at)}`, { h: 'center' }); ws.getRow(1).height = 28; ws.getRow(2).height = 24;
  [['PO', p.id, 'Khách hàng', p.customer], ['Dòng hàng / màu', `${p.series} · ${p.color}`, 'Xưởng', p.factory], ['Số lượng', `${num(poQty(p))} pcs · ${p.lines.length} PO Line`, 'Trạng thái', p.closed ? 'Đã chốt ' + fdt(p.closed.at) : 'Đang chạy']].forEach((x, k) => { const r = 4 + k; X(ws, `A${r}`, x[0], { b: 1, fill: BLUE }); X(ws, `B${r}:C${r}`, x[1]); X(ws, `D${r}`, x[2], { b: 1, fill: BLUE }); X(ws, `E${r}:G${r}`, x[3]); });
  let r = 8; ['Loại đánh giá / mẫu', 'Phiên kiểm', 'QC', 'Ngày duyệt', 'Kiểm / SL', 'Lỗi C/M/m', 'Kết luận'].forEach((t, k) => X(ws, `${colL(k)}${r}`, t, { b: 1, fill: GREY, h: 'center' })); r++;
  poLinked(p).forEach(x => { const e = x.i && evalInsp(x.i); [`${TYPES[x.t].code} · ${TYPES[x.t].name}\n${TYPES[x.t].doc}`, x.i ? `${x.i.title} (${x.i.id})${x.s.state === 'reused' ? ' — dùng lại' : ''}` : '—', x.i ? U(x.i.assignee).name : '', x.i ? fd(x.i.review.at) : '', e ? `${e.insp} / ${e.N}` : '', e ? `${e.crit}/${e.maj}/${e.min}` : '', e ? VERDICT[e.verdict][0] : ''].forEach((v, k) => X(ws, `${colL(k)}${r}`, v, { h: k > 1 ? 'center' : 'left' })); ws.getRow(r).height = 32; r++; });
  r++; X(ws, `A${r}:G${r}`, 'LỊCH SỬ PHIÊN BẢN', { b: 1, border: false }); r++; DB.reports.filter(x => x.po === p.id).forEach(x => { X(ws, `A${r}`, x.ver); X(ws, `B${r}`, fdt(x.at)); X(ws, `C${r}`, U(x.by).name); X(ws, `D${r}:G${r}`, x.note); r++; });
}

/* ---------- entry points ---------- */
async function exportIns(id) {
  const i = INS(id);
  if (TYPES[i.type].fmt === 'docx') return withBusy('Đang tạo file Word', () => docxPLY(i));
  return withBusy('Đang tạo file Excel', async () => {
    await loadLib('ExcelJS'); const wb = new ExcelJS.Workbook(); wb.creator = 'VHG QC'; wb.created = new Date();
    ({ WW: xlsWW, DIR: xlsDIR, FIN: xlsDIR, PIG: xlsPIG }[i.type])(wb, i);
    const buf = await wb.xlsx.writeBuffer();
    const nm = { WW: () => `QC REPORT HÀNG TRẮNG - ${i.title}`, DIR: () => `${i.factory} - Daily Inspection Report ${fd(i.submittedAt || i.due).replace(/\//g, '')}`, FIN: () => `FINAL PACKING REPORT - PO ${i.pos.join('-')}`, PIG: () => `QC REPORT - ${i.data.header.vendor} ${i.data.header.color}` }[i.type]();
    saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileSafe(nm) + '.xlsx'); toast('Đã xuất file Excel theo mẫu ' + TYPES[i.type].doc, 'ok');
  });
}
async function exportPO(rid) {
  const rp = DB.reports.find(x => x.id === rid); const p = PO(rp.po);
  return withBusy('Đang tạo báo cáo PO', async () => {
    await loadLib('ExcelJS'); const wb = new ExcelJS.Workbook(); wb.creator = 'VHG QC'; xlsPOSummary(wb, rp);
    poLinked(p).filter(x => x.i && x.i.type !== 'PLY').forEach(x => ({ WW: xlsWW, DIR: xlsDIR, FIN: xlsDIR, PIG: xlsPIG }[x.t])(wb, x.i, `${TYPES[x.t].code} ${x.i.id}`.slice(0, 31)));
    poLinked(p).filter(x => x.i && x.i.type === 'PLY').forEach(x => xlsPLYlite(wb, x.i));
    const buf = await wb.xlsx.writeBuffer(); saveBlob(new Blob([buf]), fileSafe(`QC REPORT PO ${p.id} ${rp.ver}`) + '.xlsx'); toast('Đã xuất báo cáo PO ' + rp.ver, 'ok');
  });
}
function xlsPLYlite(wb, i) {
  const D = i.data; const e = evalInsp(i); const ws = wb.addWorksheet(`11B ${i.id}`.slice(0, 31)); sheetSetup(ws, [30, 30, 18, 14, 40]);
  X(ws, 'A1:E1', `REPORT PLYWOOD · ${D.header.reportNo} · BM-VHGLF-02`, { b: 1, size: 13, h: 'center' }); let r = 3;
  [['Factory', D.header.factoryFull], ['Product', D.header.product], ['PO', i.pos.join(', ')], ['Dimension', D.header.dimension], ['Qty order / Sampling', `${D.header.qty} / ${D.header.sampling}`], ['QC Inspector', D.header.inspectors]].forEach(x => { X(ws, `A${r}`, x[0], { b: 1, fill: BLUE }); X(ws, `B${r}:E${r}`, x[1]); r++; }); r++;
  ['Hạng mục', 'Tiêu chuẩn', 'Kết quả', 'Đánh giá', 'Ghi chú'].forEach((t, k) => X(ws, `${colL(k)}${r}`, t, { b: 1, fill: GREY })); r++;
  PLY_CHECKS.forEach(c => { const x = D.checks[c.k] || {}; X(ws, `A${r}`, c.t); X(ws, `B${r}`, c.spec); X(ws, `C${r}`, x.v || ''); X(ws, `D${r}`, x.st || '', { b: 1, h: 'center' }); X(ws, `E${r}`, ''); r++; }); r++;
  D.defects.forEach(x => { X(ws, `A${r}:C${r}`, x.d); X(ws, `D${r}`, SEV[x.sev].t); X(ws, `E${r}`, x.qty + ' pcs'); r++; });
  X(ws, `A${r}`, 'Critical / Major / Minor / Reject', { b: 1 }); X(ws, `B${r}:E${r}`, `${e.crit} / ${e.maj} / ${e.min} / ${e.rej}`);
}

/* ---------- 11B Word — BM-VHGLF-02 ---------- */
const b64u8 = d => { const s = atob(d.split(',')[1]); const u = new Uint8Array(s.length); for (let k = 0; k < s.length; k++) u[k] = s.charCodeAt(k); return u; };
async function docxPLY(i) {
  await loadLib('docx'); const Dx = window.docx; const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ImageRun, AlignmentType, VerticalAlign, BorderStyle, PageOrientation } = Dx;
  const D = i.data; const H = D.header; const e = evalInsp(i);
  const B = { style: BorderStyle.SINGLE, size: 6, color: '000000' }; const borders = { top: B, bottom: B, left: B, right: B };
  const T = (t, o = {}) => new Paragraph({ alignment: o.c ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 20, after: 20 }, children: String(t ?? '').split('\n').flatMap((ln, k) => [...(k ? [new TextRun({ break: 1 })] : []), new TextRun({ text: ln, bold: !!o.b, size: o.s || 20, font: 'Times New Roman', underline: o.u ? {} : undefined, italics: !!o.i })]) });
  const IMG = (k, w = 210, h = 158) => PHOTO[k] ? new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: b64u8(PHOTO[k]), transformation: { width: w, height: h } })] }) : T('');
  const C = (children, o = {}) => new TableCell({ children: Array.isArray(children) ? children : [children], columnSpan: o.span, rowSpan: o.rows, verticalAlign: VerticalAlign.CENTER, borders, width: o.w ? { size: o.w, type: WidthType.PERCENTAGE } : undefined, margins: { top: 40, bottom: 40, left: 80, right: 80 } });
  const tbl = rows => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
  const pfTxt = st => new Paragraph({ alignment: AlignmentType.CENTER, children: ['Pass', 'Pending', 'Fail'].map(s => new TextRun({ text: `${st === s ? '☑' : '☐'}${s}   `, bold: true, color: '1F5F7A', size: 20, font: 'Times New Roman' })) });
  const grid = (keys, cap, st) => { const rows = []; for (let j = 0; j < Math.max(keys.length, 1); j += 3) rows.push(new TableRow({ children: [0, 1, 2].map(x => C(keys[j + x] ? IMG(keys[j + x]) : T(''), { w: 33 })) })); rows.push(new TableRow({ children: [C([T(cap, { c: 1 }), ...(st !== undefined ? [pfTxt(st)] : [])], { span: 3 })] })); return rows; };
  const head = tbl([
    new TableRow({ children: [C(IMG('logo_vhg', 120, 46), { rows: 3, w: 18 }), C([T('VIET HONG EXPORT - IMPORT JOINT STOCK COMPANY', { b: 1, s: 30, c: 1 }), T('REPORT PLYWOOD 夹板检验报告', { b: 1, s: 30, c: 1 }), T('Report number: ' + H.reportNo, { b: 1, c: 1 })], { rows: 3, w: 62 }), C(T('Số hiệu: BM-VHGLF-02', { b: 1 }), { w: 20 })] }),
    new TableRow({ children: [C(T('Lần ban hành: 01', { b: 1 }))] }), new TableRow({ children: [C(T('Ngày ban hành:', { b: 1 }))] })]);
  const info = [['Factory 工厂:', H.factoryFull], ['Product Description 产品描述:', H.product], ['Item Number 项目编号:', H.itemNo], ['PO Number 订单号:', i.pos.join(', ')], ['Product Dimension 产品尺寸:', H.dimension], ['Package height 包装高度', H.pkg], ['Net Weight (Kg/ Lbs) 净重 (kg/lbs):', H.weight], ['Number of orders 总订单数量:', num(H.qty) + ' pcs'], ['Sampling rate 抽检数量：', String(H.sampling)], ['QC Inspector', H.inspectors]];
  const infoT = tbl(info.map((x, k) => new TableRow({ children: [C(T(x[0], { c: 1 }), { w: 27 }), C(T(x[1], { c: 1 }), { w: 27 }), ...(k === 0 ? [C([T('APPROVED PPS SAMPLE 已批准的 PPS 样品', { b: 1 }), new Paragraph({ alignment: AlignmentType.CENTER, children: (H.pps || []).slice(0, 2).flatMap(k2 => PHOTO[k2] ? [new ImageRun({ data: b64u8(PHOTO[k2]), transformation: { width: 200, height: 150 } }), new TextRun('  ')] : []) })], { rows: info.length, w: 46 })] : [])] })));
  const req = tbl([new TableRow({ children: ['Stt', 'Item', 'Description 描述', 'Note 备注'].map((t, k) => C(T(t, { b: 1, c: 1 }), { w: [6, 20, 50, 24][k] })) }), ...PLY_REQ.map((r, k) => new TableRow({ children: [C(T(k + 1, { c: 1 })), C(T(r.t, { c: 1 })), C(T(r.d)), C(T(''))] })),
    new TableRow({ children: [C([T('OVERALL ASSESSMENT 总体评估:', { b: 1, u: 1 }), T(`1. Dimensions 尺寸: ${['dimW', 'dimD', 'square', 'thick'].every(k => (D.checks[k] || {}).st === 'Pass') ? 'PASS' : 'FAIL'} / Construction 结构: PASS / No delamination observed 未见分层现象`), T(`2. Veneer 饰面 Color and surface quality: ${(D.verify || {}).st === 'Fail' ? 'FAIL' : 'PASS'}.`), T(`3. Moisture 水分: ${(D.checks.moist || {}).st === 'Pass' ? 'PASS' : 'FAIL'}`), T(`4. Gloss 光泽: ${(D.checks.gloss || {}).st === 'Pass' ? 'PASS' : 'FAIL'} (35 ± 5%)`), T(`5. UV coating adhesion test 涂层附着力测试: ${(D.checks.adh || {}).st === 'Pass' ? 'PASS' : 'FAIL'}.`), T('6. Recorded Defects 记录的缺陷:', { b: 1, i: 1, u: 1 }), ...[...(D.deviations || []), ...D.defects.map(x => `${x.d} — ${x.qty} pcs`)].map(x => T('- ' + x))], { span: 3 }), C([T('REQUIREMENT 要求:', { b: 1, u: 1 }), T(D.requirement, { b: 1 })])] })]);
  const body = tbl([
    new TableRow({ children: [C(T('I.  OVERALL INSPECTION 总观检验:', { b: 1 }), { span: 3 })] }), ...PLY_CHECKS.flatMap(c => { const r = D.checks[c.k] || {}; return grid(r.ph || [], `${c.t.replace(/ — .*/, '')}: ${r.v || ''}`, r.st); }),
    new TableRow({ children: [C(T('II.  MATERIAL/ VENEER 材质/饰面', { b: 1 }), { span: 3 })] }), ...grid(D.veneer.slice(0, 3), 'Front D+ 正面 / Back D 背面'), ...grid([...D.veneer.slice(3), ...D.plies].slice(0, 3), '7 plies 7层'),
    new TableRow({ children: [C(T('III.  VERIFY AGAINST THE APPROVED PPS SAMPLE 对照已批准的PPS模板进行核对', { b: 1 }), { span: 3 })] }), ...grid(D.verify.ph || [], 'Observe from a distance of 800–1000 mm 观察距离为 800 – 1000 毫米', D.verify.st),
    new TableRow({ children: [C(T('IV.  DEFECTS 缺陷:', { b: 1 }), { span: 3 })] }), ...grid(D.defects.flatMap(x => x.ph || []).slice(0, 6), D.defects.map((x, k) => `${k + 1}. ${x.d} ${x.qty} pcs`).join('\n'))]);
  const sum = tbl([new TableRow({ children: ['No.# Item#', 'Description', 'Item# Code', 'Q.ty Order', 'Q.ty Inspection', 'Criticle 严重', 'Major', 'Minor', 'Q.ty Reject'].map(t => C(T(t, { b: 1, c: 1 }))) }), new TableRow({ children: ['PO ' + i.pos.join(', '), 'PLYWOOD', H.itemNo, H.qty, H.sampling, e.crit, e.maj, e.min, e.rej].map(t => C(T(t, { b: 1, c: 1 }))) })]);
  const doc = new Document({ sections: [{ properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 12240, height: 15840 }, margin: { top: 500, bottom: 500, left: 500, right: 500 } } }, children: [head, infoT, req, new Paragraph({ pageBreakBefore: true, children: [] }), body, T(''), sum] }] });
  const blob = await Packer.toBlob(doc); saveBlob(blob, fileSafe(`REPORT - ${i.factory.toUpperCase()} - PLYWOOD PO.${i.pos.join('-')} - ${fd(i.submittedAt || nowISO()).replace(/\//g, '')}`) + '.docx'); toast('Đã xuất file Word theo mẫu BM-VHGLF-02', 'ok');
}
