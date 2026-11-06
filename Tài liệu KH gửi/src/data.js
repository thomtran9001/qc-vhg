/* =====================================================================
   DATA — dựng từ tài liệu KH: BM-VHGLF-02 (Woodaxis 56191, Rongpeng 55672),
   F-QTQAQCT01-03 (Hàng trắng Cont 2), Daily Inspection Report #96,
   Sample Monitoring Report – Pigment (Galaxy · Dove)
   ===================================================================== */
const DAY = 864e5;
const NOW0 = new Date(); NOW0.setHours(9, 0, 0, 0);
const d = (off, h = 9, m = 0) => { const x = new Date(NOW0.getTime() + off * DAY); x.setHours(h, m, 0, 0); return x.toISOString(); };
const at = (s, h = 9, m = 0) => { const [dd, mm, yy] = s.split('/').map(Number); return new Date(yy, mm - 1, dd, h, m).toISOString(); };

const USERS = [
  { id: 'admin1', name: 'Admin hệ thống', role: 'admin', title: 'Quản trị hệ thống', email: 'admin@vhg.vn' },
  { id: 'lead1', name: 'Mr. Tín', role: 'lead', title: 'Trưởng QA/QC', email: 'tin.qaqc@vhg.vn' },
  { id: 'qc1', name: 'D.Ly', role: 'qc', title: 'QC', email: 'ly.qc@vhg.vn' },
  { id: 'qc2', name: 'Bùi Thái Văn', role: 'qc', title: 'QC', email: 'van.bui@vhg.vn' },
  { id: 'qc3', name: 'Văn Sử', role: 'qc', title: 'QC', email: 'su.qc@vhg.vn' },
  { id: 'qc4', name: 'Thùy Yên', role: 'qc', title: 'QC', email: 'yen.qc@vhg.vn' },
];
const FACTORY_FULL = { Woodaxis: 'CAMBODIAN WOODAXIS WOOD INDUSTRY CO., LTD.', Rongpeng: 'CAMBODIAN RONGPENG WOOD INDUSTRY CO., LTD.', 'Vỹ Thành': 'Vỹ Thành', 'Xưởng #96': '#96', VHGI: 'VHGI' };

/* ---------- Loại đánh giá (mẫu phiếu của KH) ---------- */
const TYPES = {
  PLY: { code: '11B', name: 'Plywood / Nguyên liệu', short: 'Plywood', doc: 'BM-VHGLF-02', icon: 'layers', fmt: 'docx', desc: 'Kiểm plywood tại NCC: kích thước, vuông góc, độ dày, độ ẩm, độ bóng, tỷ trọng, bám dính UV, veneer, đối chiếu mẫu PPS.' },
  WW: { code: '11A', name: 'Hàng trắng hoàn thiện', short: 'White Wood', doc: 'F-QTQAQCT01-03', icon: 'box', fmt: 'xlsx', desc: 'Kiểm từng mã hàng theo 13 tiêu chí (Level II), ảnh đo thực tế, chất xếp – vận chuyển, điểm cải tiến.' },
  PIG: { code: '11D', name: 'Theo dõi mẫu màu Pigment', short: 'Sample / Color', doc: 'Sample Monitoring Report – Pigment', nodoc: 1, icon: 'droplet', fmt: 'xlsx', desc: 'Lưu trình 10 bước làm mẫu, X-Rite 3 nguồn sáng theo mốc 15 phút → 7 ngày, test KCMA, ký mẫu.' },
  DIR: { code: '11C', name: 'Báo cáo kiểm trên Chuyền', short: 'Daily Inline', doc: 'Daily Inspection Report', nodoc: 1, icon: 'activity', fmt: 'xlsx', desc: 'Kiểm trên chuyền theo ngày (Inline / Final / Re-Final): nhiều PO, Critical / Major / Minor, control plan, ảnh theo công đoạn.' },
  FIN: { code: '11E', name: 'Báo cáo kiểm Final - Đóng gói', short: 'Final / Packing', doc: 'Đề xuất — chưa có mẫu KH', icon: 'package', fmt: 'xlsx', desc: 'Kiểm final AQL trước xuất, chuẩn bị đóng gói và chất xếp container.' },
};
const TYPE_ORDER = ['PLY', 'WW', 'PIG', 'DIR', 'FIN'];
const PREREQ = { PLY: [], WW: ['PLY'], PIG: [], DIR: ['PIG'], FIN: ['DIR'] };
/* 2 vùng đánh giá độc lập: thứ tự chặn (PREREQ) chỉ áp dụng trong cùng một vùng */
const ZONES = [
  { k: 'raw', name: 'Vùng 1 · Nguyên liệu & hàng trắng', types: ['PLY', 'WW'] },
  { k: 'fin', name: 'Vùng 2 · Sơn & hoàn thiện', types: ['PIG', 'DIR', 'FIN'] },
];

/* 11A — Hàng trắng */
const WW_CRIT = ['Quy cách sản phẩm', 'Hình dáng sản phẩm', 'Quy cách lỗ khoan', 'Quy cách ngàm rãnh', 'Vị trí lỗ khoan, ngàm-rãnh-mộng', 'Kết cấu (chắc chắn)', 'Trầy xước', 'Bo cạnh (lẹm cạnh, không đều)', 'Vị trí giáp mí (hở - cao thấp)', 'Vết dao - vết nhám', 'Sứt mẻ', 'Lồi lõm', 'Khác'];
const WW_SHOTS = {
  'Cánh': ['Tổng quan mặt trước', 'Tổng quan mặt sau', 'Chiều dài', 'Chiều rộng', 'Độ dày', 'Chiều rộng đố', 'Đường kính lỗ bản lề', 'Độ sâu lỗ bản lề', 'Vị trí lỗ bản lề', 'Bo cạnh R3'],
  'Mặt hộc': ['Tổng quan mặt trước', 'Tổng quan mặt sau', 'Chiều dài', 'Chiều rộng', 'Chiều rộng đố', 'Bo cạnh R3', 'Độ cao panel - đố (bản vẽ 5.9mm)'],
};
const WW_LOAD = ['Pallet cần có tấm lót MDF', 'Trải màng foam lên bề mặt MDF', 'Chất xếp từng lớp', 'Các chồng ngăn nhau bằng foam — chồng cao 10 tấm', 'Chất xếp cao max 1.8 m', 'Quấn PE bao quanh kiện hàng', 'Bọc foam, nẹp góc cạnh, quấn PE, đai 2 dây/chiều', 'Các pallet tập trung chuẩn bị giao', 'Hàng đưa lên xe', 'Giao hàng'];

/* 11B — Plywood */
const PLY_REQ = [
  { t: 'Material 材料', d: 'Core construction: 7 plies. Requirement: No delamination, no core voids, no dirt, no stains, no mold or insect damage. Mixed wood species are acceptable, but eucalyptus is not allowed. No core overlap or gaps.\n芯板结构：7层。要求：无分层、无芯板空洞、无污物、无污渍、无霉变或虫蛀。允许混合树种，但不得使用桉木。芯板无重叠或缝隙。' },
  { t: 'Veneer 木皮', d: 'Birch veneer. No core exposure after veneering. No dents, scratches, pressure marks, bumps, blisters, bubbles, delamination, or veneer peeling. No signs of live insect infestation.\n桦木单板。贴面后无芯材外露。无凹痕、划痕、压痕、凸起、鼓包、气泡、分层或单板脱落现象。无活体昆虫侵害迹象' },
  { t: 'Moisture 水分', d: 'Requirement: 8% - 10%   要求：8% - 10%' },
];
const PLY_CHECKS = [
  { k: 'dimW', t: 'Dimension check 尺寸检查 — Chiều dài', spec: '2440 ±2 mm', ps: 'ply_dim' },
  { k: 'dimD', t: 'Dimension check 尺寸检查 — Chiều rộng', spec: '1220 ±2 mm', ps: 'ply_dim' },
  { k: 'square', t: 'Squareness check 垂直度检查', spec: 'Lệch đường chéo ≤ 2 mm', ps: 'ply_square' },
  { k: 'thick', t: 'Thickness check 厚度检查', spec: '12 mm ±0.3', ps: 'ply_thick' },
  { k: 'moist', t: 'Moisture check 湿度检查', spec: '8% – 10%', ps: 'ply_moist' },
  { k: 'gloss', t: 'Gloss check 光泽检查', spec: '35 ± 5%', ps: 'ply_gloss' },
  { k: 'density', t: 'Density check 密度检查', spec: '≥ 700 kg/m³', ps: 'ply_density' },
  { k: 'adh', t: 'Adhesion test 附着力测试 (UV)', spec: '4B – 5B', ps: 'ply_adhesion' },
];

/* 11C — Daily Inspection Report */
const DIR_CP = [
  { st: 'Rough Mill (cutting, sawing, planing, gluing, distressing…)', pts: 'Material used · quality of material · select color · MC% · laminate · glue', crit: 'Verify material with master sample. Reject non-conforming materials: dead knots, blue stain, water mark, sap gum… MC% ≤ 10%.', smp: '5% pcs mỗi chi tiết chính' },
  { st: 'Machining (drilling, shaping, routering) · Assembly', pts: 'Measure dimensions · tenon / mortise · squareness · scan 4 sides · grooves', crit: 'MC% ≤ 10%, ưu tiên 6–9%.', smp: '5% pcs mỗi chi tiết chính' },
  { st: 'Sanding', pts: 'Sanding A, B surfaces · check joints · check grooves', crit: 'Must be smooth. No sanding marks, glue marks. All edges sanded radius per master sample.', smp: '5% pcs mỗi chi tiết chính' },
  { st: 'Finishing stage', pts: 'Matching color with MCP · sheen / gloss · X-Rite values', crit: 'Approved color panel. All components match color and gloss (DF vs door frame…).', smp: 'Random check mỗi chi tiết chính' },
  { st: 'Preparation before packing', pts: 'Carton layout · PO sticker · hardware bag / blister · desiccant bag · law label · packing material', crit: 'Approved carton layout; standard hardware bag, desiccant, law label; MTL packing test or in-house test report.', smp: 'Random check mỗi chi tiết chính' },
];
const DIR_SECTIONS = [
  { k: 'moist', t: 'Moisture content inspection', ps: 'moist' },
  { k: 'dim', t: 'Glue application and dimension inspection', ps: 'dim' },
  { k: 'finish', t: 'Finish inspection', ps: 'line' },
  { k: 'primer', t: 'AC primer application on the production line', ps: 'line' },
  { k: 'topcoat', t: 'AC topcoat application on the production line', ps: 'line' },
  { k: 'color', t: 'Color comparison with the master sample', ps: 'color' },
  { k: 'sheen', t: 'Sheen inspection', ps: 'sheen' },
];

/* 11D — Pigment */
const PIG_STEPS = [
  ['White wood', 'Hàng trắng', 'Check 100%'],
  ['Submit the painting process', 'NCC sơn cung cấp quy trình sơn', 'Quy trình được ký và đóng mộc bởi công ty sơn'],
  ['UV center panel and rails', 'UV panel và đố', 'Ngoại quan 100% · bám dính, độ dày, X-Rite 10–20%'],
  ['Primer', 'Sơn lót', 'Ngoại quan 100% · bám dính, độ dày, X-Rite 1 pc'],
  ['Finish one sample first', 'Sơn bóng thử trước 1 mẫu', 'Theo dõi màu – bóng, đạt mới sơn hết các mẫu còn lại'],
  ['Top coat', 'Sơn bóng', 'Ngoại quan 100% · bóng, độ dày · bám dính 1 pc · X-Rite · phòng đèn'],
  ['Daily color & gloss monitoring', 'Theo dõi màu – độ bóng mỗi ngày', '7–10 mẫu · so với mẫu ở bước 5 · sau 7 ngày'],
  ['Check finish goods', 'Đánh giá sản phẩm hoàn thiện', 'Check 100% · báo QC Fabuwood trước khi gửi test KCMA'],
  ['Test KCMA', 'Test KCMA (nếu KH yêu cầu)', '4 pcs · sau 200h'],
  ['Sample approval', 'Ký mẫu', '7 pcs'],
];
const PIG_SEC = [
  { k: 'ww', t: 'I. White wood (Hàng trắng)', when: 'QC Staff', rows: [['Moisture / Độ ẩm', '7–10%', '%', 7, 10], ['Dimensions (as per drawing) / Quy cách', 'Theo bản vẽ'], ['Profile (as per drawing) / Hình dạng', 'Theo bản vẽ'], ['Sturdy construction / Kết cấu chắc chắn', 'Chắc chắn'], ['Appearance / Ngoại quan', 'Theo TCCL']] },
  { k: 'uv', t: 'II. UV coating (Lót UV)', when: 'Cuối chuyền UV', rows: [['Adhesion — Center panel', '4B–5B', 'sel'], ['Adhesion — Rail', '4B–5B', 'sel'], ['Dry coating thickness', '2.2–3 mils', 'mil', 2.2, 3]] },
  { k: 'primer', t: 'III. Primer / Base coat (Sơn lót AC)', when: 'Sau 1.5h / 24h', rows: [['Adhesion (sau 24h)', '4B–5B', 'sel'], ['Dry coating thickness (sau 1.5h)', '3.5–4.5 mil', 'mil', 3.5, 4.5], ['Dry coating thickness (sau 24h)', '3.5–4.5 mil', 'mil', 3.5, 4.5]] },
  { k: 'top', t: 'IV. Topcoat (Hoàn thiện bóng AC)', when: 'Sau 1.5h / 24h', rows: [['Adhesion (sau 24h)', '4B–5B', 'sel'], ['Dry coating thickness (sau 1.5h)', '4.5–7 mil', 'mil', 4.5, 7], ['Dry coating thickness (sau 24h)', '4.5–7 mil', 'mil', 4.5, 7]] },
  { k: 'fg', t: 'V. Finished goods (Sản phẩm hoàn thiện)', when: 'QA-QC · Customer', rows: [['Moisture / Độ ẩm', '7–10%', '%', 7, 10], ['Dimensions (as per drawing)', 'Theo bản vẽ'], ['Profile (as per drawing)', 'Theo bản vẽ'], ['Sturdy construction', 'Chắc chắn'], ['Sheen / Độ bóng', '30 ± 5 GU', 'GU', 25, 35], ['Adhesion / Bám dính', '4B–5B', 'sel'], ['Coating thickness / Độ dày sơn', '4.5–7 mils', 'mil', 4.5, 7], ['Color shift — as per master', 'ΔE ≤ 1.0'], ['Appearance — as per quality standards', 'Theo TCCL']] },
];
const PIG_TIMES = ['After 15 min', 'After 12h', 'After 1 day', 'After 2 day', 'After 3 day', 'After 4 day', 'After 5 day', 'After 6 day', 'After 7 day'];
const ILLUM = ['D65/10', 'F02/10', 'A10'];
const KCMA = [
  ['Adhesion / Bám dính', 'ASTM D3359-17 / EN ISO 2409:2020', '4B–5B'],
  ['Dry film thickness / Độ dày màng sơn', 'ASTM D6132-97 · PosiTector', '4.5–7 mils'],
  ['Gloss / Độ bóng', 'ASTM 523-14 · góc 60°', 'Theo yêu cầu từng màu'],
  ['Yellowing / UV resistance', 'QUV UVA-351 · 50°C · 0.45 W/m² · 200h', 'Màu đạt, ΔE trong dung sai, bóng đạt'],
  ['Shrinkage & heat resistance — KCMA 9.2', '120°F ±5 · 70% RH · 24h', 'Không đổi màu, phồng, nứt, bong'],
  ['Hot & cold check — KCMA 9.3', '120°F/70% RH 1h ↔ −5°F 1h · 5 chu kỳ', 'Không đổi màu, phồng, nứt, bong'],
  ['Chemical resistance — KCMA 9.4', 'Giấm, chanh, cam, nho, ketchup, cà phê, dầu ô liu, vodka, xà phòng 24h · mù tạt 1h', 'Không ố, không bạc màu, không phồng'],
  ['Detergent & water — KCMA 9.5', 'Palmolive 0.5% · bọt biển #8 · 24h', 'Không đổi màu, phồng, bong'],
  ['MEK resistance', '100 chu kỳ chà MEK', 'Không mờ màng, không dính sơn trên giẻ'],
];

/* 11E — Final / Packing (đề xuất) */
const FIN_PACK = ['Carton layout đúng bản duyệt', 'PO sticker / shipping mark đúng PO, SKU', 'Hardware bag / blister đủ, dán kín', 'Desiccant bag (gói hút ẩm)', 'Law label', 'Vật liệu đóng gói: foam, nẹp góc, PE', 'Số kiện khớp packing list', 'Drop test / MTL packing test'];

const DEFECT_TYPES = ['Hairline', 'Pinholes', 'Cracks', 'Bo cạnh không đạt R3', 'Chà nhám chưa đạt', 'Cao thấp đố – panel', 'Cấn móp', 'Xước nhám', 'Lệch màu', 'Bóng không đạt', 'Bong / tách lớp', 'Mắt chết vượt chuẩn', 'Đốm đen bề mặt', 'Sai kích thước', 'Khác'];
const SEV = { critical: { t: 'Critical', vn: 'Nghiêm trọng', c: 'bad' }, major: { t: 'Major', vn: 'Lỗi nặng', c: 'warn' }, minor: { t: 'Minor', vn: 'Lỗi nhẹ', c: 'gray' } };

const STAGES = [
  { k: 'RML', name: 'RML', icon: 'layers' }, { k: 'WW', name: 'White Wood', icon: 'box' }, { k: 'PAINT', name: 'Paint', icon: 'droplet' }, { k: 'FIN', name: 'Finishing', icon: 'wrench' }, { k: 'PACK', name: 'Packing', icon: 'package' },
];
const STAGE = Object.fromEntries(STAGES.map(s => [s.k, s]));
const PROD_STEPS = [
  { g: 'RML', t: 'Xác nhận mẫu, mẫu màu', s: 'Gate đầu vào · approved sample' }, { g: 'RML', t: 'Thu mua hàng về', s: 'NVL, linh kiện, plywood đã về' },
  { g: 'WW', t: 'Gia công / cutting', s: 'Cắt, soi, khoan theo bản vẽ' }, { g: 'WW', t: 'Hoàn thiện hàng trắng', s: 'Gate trước khi chuyển sơn' },
  { g: 'PAINT', t: 'UV / sơn lót AC', s: 'Theo quy trình sơn VVT' }, { g: 'PAINT', t: 'Sơn bóng topcoat', s: 'Theo mẫu màu đã ký' }, { g: 'PAINT', t: 'Sơn sửa màu', s: 'Hàng lệch màu / phải sửa' },
  { g: 'FIN', t: 'Lắp ráp hoàn thiện', s: 'Khung, cửa, hộc kéo' }, { g: 'FIN', t: 'Lắp hardware', s: 'Bản lề, ray, tay nắm' },
  { g: 'PACK', t: 'Đóng gói', s: 'Gate cuối · sẵn sàng loading' },
];

/* ============ AQL ISO 2859-1 · General Level II · Normal ============ */
const AQL_TABLE = [[8, 'A', 2, 0, 0], [15, 'B', 3, 0, 0], [25, 'C', 5, 0, 0], [50, 'D', 8, 0, 1], [90, 'E', 13, 1, 1], [150, 'F', 20, 1, 2], [280, 'G', 32, 2, 3], [500, 'H', 50, 3, 5], [1200, 'J', 80, 5, 7], [3200, 'K', 125, 7, 10], [1e9, 'L', 200, 10, 14]];
function aql(N) { const r = AQL_TABLE.find(x => N <= x[0]); return { code: r[1], n: Math.min(r[2], N), acMaj: r[3], acMin: r[4], N }; }

/* ============ SEED ============ */
const pick = (cat, n, off = 0) => { const s = PSET[cat] || []; return Array.from({ length: n }, (_, i) => s[(i + off) % s.length]); };

function seedDB() {
  const L = (code, part, qty, desc) => ({ code, part, qty, desc: desc || (part === 'Mặt hộc' ? 'Mặt hộc (drawer front)' : 'Cánh (door)') });
  const ln = arr => arr.map((x, i) => ({ ln: i + 1, ...x, sku: x.code + (x.part === 'Mặt hộc' ? ' · MK' : '') }));
  const pos = [
    { id: '4200017234', customer: 'Fabuwood', cust: 'FBW', series: 'Galaxy (DS GD)', color: 'Dove', factory: 'Vỹ Thành', finisher: 'VHGI', paint: 'VVT', unit: 'pcs', value: 186400, etd: at('12/12/2026'), cont: 'Cont 2', plyPO: '55672',
      plan: ['PLY', 'WW', 'PIG', 'DIR', 'FIN'], syncedAt: at('02/09/2026', 8), hold: false,
      lines: ln([L('DS GD B15', 'Cánh', 150), L('DS GD B15', 'Mặt hộc', 150), L('DS GD B24', 'Cánh', 560), L('DS GD B24', 'Mặt hộc', 280), L('DS GD B30', 'Cánh', 660), L('DS GD B30', 'Mặt hộc', 330), L('DS GD BLB48/51', 'Cánh', 40), L('DS GD BLB48/51', 'Mặt hộc', 40), L('DS GD DB21-MK1', 'Mặt hộc', 200), L('DS GD DB21-MK2', 'Mặt hộc', 100), L('DS GD DB36-2', 'Mặt hộc', 80), L('DS GD TP30', 'Cánh', 240), L('GD WP-BASE', 'Cánh', 310)]),
      progress: [100, 100, 100, 100, 62, 18, 0, 0, 0, 0], bottleneck: { g: 'PAINT', pcs: 0, note: 'Chờ ký mẫu màu Dove trước khi sơn đại trà' } },
    { id: '4200017236', customer: 'Fabuwood', cust: 'FBW', series: 'Galaxy (DS GD)', color: 'Dove', factory: 'Vỹ Thành', finisher: 'VHGI', paint: 'VVT', unit: 'pcs', value: 142900, etd: at('18/12/2026'), cont: 'Cont 2', plyPO: '55672',
      plan: ['PLY', 'WW', 'PIG', 'DIR', 'FIN'], syncedAt: at('02/09/2026', 8), hold: false,
      lines: ln([L('DS GD W1542', 'Cánh', 100), L('DS GD W1842', 'Cánh', 120), L('DS GD W2142', 'Cánh', 80), L('DS GD W2418', 'Cánh', 80), L('DS GD W2430', 'Cánh', 320), L('DS GD W2742', 'Cánh', 220), L('DS GD W3015', 'Cánh', 160), L('DS GD W3024', 'Cánh', 160), L('DS GD W3036', 'Cánh', 580), L('DS GD W3318', 'Cánh', 200), L('DS GD W3624', 'Cánh', 320), L('DS GD WBC3630', 'Cánh', 40), L('DS GD WDC2442', 'Cánh', 60)]),
      progress: [100, 100, 100, 88, 55, 12, 0, 0, 0, 0], bottleneck: { g: 'WW', pcs: 300, note: '3 mã W1542 / W1842 / W2418 chưa kiểm hàng trắng (chất hàng trước)' } },
    { id: '48150', customer: 'Fabuwood', cust: 'FBW', series: 'AF Timber (Frame)', color: 'Timber', factory: 'Xưởng #96', finisher: 'Xưởng #96', paint: 'VVT', unit: 'pcs', value: 61200, etd: at('20/11/2026'), cont: 'Cont 1',
      plan: ['DIR', 'FIN'], syncedAt: at('10/10/2026', 8), hold: false,
      lines: ln([L('AF TIMBER DB24', 'Frame', 140, 'Frame'), L('AF TIMBER DB18', 'Frame', 120, 'Frame'), L('AF TIMBER B33', 'Frame', 100, 'Frame'), L('AF TIMBER B15', 'Frame', 100, 'Frame'), L('AF TIMBER B09FD', 'Frame', 110, 'Frame')]),
      progress: [100, 100, 100, 100, 100, 96, 14, 40, 20, 0], bottleneck: { g: 'PAINT', pcs: 13, note: 'Hairline, pinholes sau topcoat — 13/60 pcs mẫu' } },
    { id: '48151', customer: 'Fabuwood', cust: 'FBW', series: 'DS GTI (Door)', color: 'Timber', factory: 'Xưởng #96', finisher: 'Xưởng #96', paint: 'VVT', unit: 'pcs', value: 4900, etd: at('20/11/2026'), cont: 'Cont 1',
      plan: ['DIR', 'FIN'], syncedAt: at('10/10/2026', 8), hold: false,
      lines: ln([L('DS GTI VSD30', 'Door', 28, 'Door')]), progress: [100, 100, 100, 100, 100, 100, 0, 100, 90, 40], bottleneck: null },
    { id: '48153', customer: 'Fabuwood', cust: 'FBW', series: 'DS GTR (Door)', color: 'Timber', factory: 'Xưởng #96', finisher: 'Xưởng #96', paint: 'VVT', unit: 'pcs', value: 9100, etd: at('20/11/2026'), cont: 'Cont 1',
      plan: ['DIR', 'FIN'], syncedAt: at('10/10/2026', 8), hold: false,
      lines: ln([L('DS GTR DB18', 'Door', 56, 'Door')]), progress: [100, 100, 100, 100, 100, 100, 0, 90, 70, 20], bottleneck: null },
    { id: '56191', customer: 'Woodaxis (NCC)', cust: 'WAX', series: 'Plywood 1/2" · 2 side UV clear', color: 'Birch D+', factory: 'Woodaxis', unit: 'pcs', value: 30450, etd: at('15/11/2026'), cont: 'Lô 1',
      plan: ['PLY'], syncedAt: at('20/10/2026', 8), hold: false,
      lines: ln([{ code: 'PLY-BIRCH-D+ 2440x1220x12', part: 'Plywood', qty: 1050, desc: 'Plywood Panel – Veneer Birch D+ · W2440×D1220×H12 · 2 side UV clear' }]), progress: [100, 100, 0, 0, 0, 0, 0, 0, 0, 0], bottleneck: null },
    { id: '55672', customer: 'Rongpeng (NCC)', cust: 'RPG', series: 'Plywood 1/2" · UV clear', color: 'Birch D+', factory: 'Rongpeng', unit: 'pcs', value: 30450, etd: at('30/09/2026'), cont: 'Lô 1',
      plan: ['PLY'], syncedAt: at('01/09/2026', 8), hold: false, closed: { at: at('24/09/2026', 16), by: 'lead1' },
      lines: ln([{ code: 'PLY-BIRCH-D+ 2443x1223x12', part: 'Plywood', qty: 1050, desc: 'Plywood Panel – Veneer Birch D+ · W2443×D1223×H12' }]), progress: [100, 100, 0, 0, 0, 0, 0, 0, 0, 0], bottleneck: null },
  ];
  const lines = id => pos.find(p => p.id === id).lines;

  /* ---- 11B Woodaxis 56191 (submitted, chờ duyệt) ---- */
  const plyW = {
    header: { reportNo: 'VHGLF 31102026', factoryFull: FACTORY_FULL.Woodaxis, product: 'Plywood Panel - Veneer Birch D+\n胶合板-桦木饰面', itemNo: 'Plywood 1/2": 2 side UV clear', dimension: 'W2440 x D1220 x H12 mm', pkg: 'Pallet height 栈板高度 ≤ 915mm', weight: '27 kg / 59.5 lbs', qty: 1050, sampling: 300, inspectors: 'Mr Ngọc, Thùy Yên', pps: ['wa_01', 'wa_02'] },
    checks: { dimW: { v: 'W2440 mm', st: 'Pass', ph: ['wa_03', 'wa_04', 'wa_05'] }, dimD: { v: 'W1220 mm', st: 'Pass', ph: ['wa_10'] }, square: { v: 'Đạt', st: 'Pass', ph: ['wa_07', 'wa_09', 'wa_06'] }, thick: { v: '12.15 – 12.24 mm', st: 'Pass', ph: ['wa_11', 'wa_12', 'wa_13', 'wa_14'] }, moist: { v: '8.3 – 10%', st: 'Pass', ph: ['wa_21', 'wa_22', 'wa_15'] }, gloss: { v: '33.4% – 35.9%', st: 'Pass', ph: ['wa_16', 'wa_17', 'wa_18'] }, density: { v: '755 kg/m³', st: 'Pass', ph: ['wa_19', 'wa_20'] }, adh: { v: '5B', st: 'Pass', ph: ['wa_23'] } },
    veneer: ['wa_24', 'wa_25', 'wa_26', 'wa_29', 'wa_30'], plies: ['wa_34', 'wa_35'], verify: { st: 'Pass', ph: ['wa_37', 'wa_38', 'wa_39'] },
    defects: [
      { d: 'Veneer peeling / delamination at both ends 木皮板两端出现起皮、脱胶现象', qty: 4, sev: 'major', ph: ['wa_43', 'wa_41'] },
      { d: 'Uneven repair and filling at wood knots 木材节疤处的修补和填补不平整', qty: 4, sev: 'major', ph: ['wa_44', 'wa_46'] },
      { d: 'Black spots on the panel surface 板材表面出现黑色斑点', qty: 4, sev: 'minor', ph: ['wa_47', 'wa_42'] },
    ],
    deviations: ['Dead knots exceeding the standard – surface B (Standard: 2 knots, max Ø7 mm / Actual: 2 knots Ø9 mm) 死结数量超过标准', 'UV coating on both sides (Requirement: 1 side) 双面UV涂层（要求：单面）'],
    requirement: 'Discuss the actual status of the order with the customer.\n与客户讨论订单的实际状态', rej: 0, conclusion: 'cond', note: '',
  };
  /* ---- 11B Rongpeng 55672 (đã duyệt, PO đã chốt) ---- */
  const plyR = {
    header: { reportNo: 'VHGLF 22092026', factoryFull: FACTORY_FULL.Rongpeng, product: 'Plywood Panel - Veneer Birch D+\n胶合板-桦木饰面', itemNo: 'Plywood 1/2" UV clear', dimension: 'W2443 x D1223 x H12 mm', pkg: 'Pallet height 栈板高度 ≤ 915mm', weight: '27 kg / 59.5 lbs', qty: 1050, sampling: 525, inspectors: 'Văn Sử, Thùy Yên, Mr. Kent', pps: ['rp_23', 'rp_26'] },
    checks: { dimW: { v: 'W2452 mm', st: 'Pass', ph: ['rp_03', 'rp_35'] }, dimD: { v: 'W1232 mm', st: 'Pass', ph: ['rp_37'] }, square: { v: 'Đạt', st: 'Pass', ph: ['rp_34', 'rp_36'] }, thick: { v: '11.8 – 12 mm', st: 'Pass', ph: ['rp_04', 'rp_05', 'rp_06'] }, moist: { v: '9.2 – 9.3%', st: 'Pass', ph: ['rp_08', 'rp_09'] }, gloss: { v: '30.3% – 39.9%', st: 'Pass', ph: ['rp_10', 'rp_11'] }, density: { v: '760 kg/m³', st: 'Pass', ph: ['rp_15', 'rp_16'] }, adh: { v: '5B', st: 'Pass', ph: ['rp_12', 'rp_14'] } },
    veneer: ['rp_17', 'rp_18', 'rp_19'], plies: ['rp_21', 'rp_22'], verify: { st: 'Pass', ph: ['rp_23', 'rp_26'] },
    defects: [{ d: 'Defects Dent 凹痕 — requested factory repair and recheck', qty: 4, sev: 'major', ph: ['rp_27', 'rp_29'] }, { d: 'Defects putty 腻子 — requested factory repair and recheck', qty: 2, sev: 'minor', ph: ['rp_33'] }],
    deviations: ['Dead knots exceeding the standard – surface B (Standard: 2 knots, max Ø7 mm / Actual: 2 knots Ø9 mm)', 'UV coating on both sides (Requirement: 1 side)'],
    requirement: 'Discuss the actual status of the order with the customer.\n与客户讨论订单的实际状态', rej: 0, conclusion: 'cond', note: '',
  };

  /* ---- 11A Hàng trắng Cont 2 (đã duyệt) ---- */
  const naCodes = ['DS GD W1542', 'DS GD W1842', 'DS GD W2418'];
  const wwItems = [...lines('4200017234'), ...lines('4200017236')].map((l, i) => {
    const na = naCodes.includes(l.code);
    const shots = WW_SHOTS[l.part === 'Mặt hộc' ? 'Mặt hộc' : 'Cánh'];
    return { po: i < 13 ? '4200017234' : '4200017236', ln: l.ln, code: l.code, part: l.part, slsx: l.qty, slkiem: na ? 0 : aql(l.qty).n,
      crit: na ? WW_CRIT.map(() => '') : WW_CRIT.map((_, k) => k === 12 ? '' : 'P'), kl: na ? 'NA' : 'P', dg: na ? 'Chưa kiểm tra do chất hàng từ trước' : '',
      ph: na ? {} : Object.fromEntries(shots.slice(0, 5).map((s, k) => [s, PSET.dim[(i * 3 + k) % PSET.dim.length]])) };
  });
  const ww = { date: '15-16/09/2026', items: wwItems, load: Object.fromEntries(WW_LOAD.map((s, i) => [i, PSET.load[i % PSET.load.length]])),
    improve: [
      ['Bo cạnh không đạt (bản vẽ yêu cầu R3)', 'dl_82'], ['Bo cạnh không đạt (bản vẽ yêu cầu R3)', 'dl_83'], ['Định hình tấm trung tâm sai làm khe hở lắp ráp mặt kéo lớn và không đều', 'dl_36'],
      ['Chà nhám chưa đạt — còn nguyên vết bóng UV (rủi ro bám dính)', 'dl_85'], ['Chà nhám mất lớp lót — lộ nền', 'dl_86'], ['Mặt hộc cao thấp đố — tấm trung tâm lớn từ 6.4–6.8 mm (bản vẽ 5.9 mm)', 'dl_38'],
      ['Cạnh xước nhám', 'dl_87'], ['Cấn móp', 'dl_88'], ['Xước nhám — thô', 'dl_84'], ['Chà nhám không kỹ lộ vết trám trét', 'dl_90']].map(([t, p]) => ({ t, p })),
    note: '* Đánh dấu ✔ nếu ĐẠT và x nếu KHÔNG ĐẠT\n* Các điểm cần cải tiến đã thống nhất với VỸ THÀNH và sẽ khắc phục cho các đợt sau (từ Cont 2)\n* Ưu tiên chất xếp đồng bộ để dễ dàng kiểm đếm và giao nhận\n* Sản phẩm chuyển về VHGI thực hiện công đoạn lót AC và sơn bóng, tiếp tục theo dõi chất lượng đến lúc xuất hàng',
    conclusion: 'cond', sig: 'sig_van' };

  /* ---- 11C Daily #96 (submitted) ---- */
  const dirRows = [
    { po: '48151', desc: 'Door', code: 'DS GTI VSD30', qo: 28, qi: 12, cr: 0, ma: 0, mi: 0, rj: 0, rm: 'Inline' },
    { po: '48153', desc: 'Door', code: 'DS GTR DB18', qo: 56, qi: 12, cr: 0, ma: 0, mi: 0, rj: 0, rm: 'Inline' },
    { po: '48150', desc: 'Frame', code: 'AF TIMBER DB24', qo: 140, qi: 12, cr: 0, ma: 3, mi: 0, rj: 3, rm: 'Inline' },
    { po: '48150', desc: 'Frame', code: 'AF TIMBER DB18', qo: 120, qi: 12, cr: 0, ma: 3, mi: 0, rj: 3, rm: 'Inline' },
    { po: '48150', desc: 'Frame', code: 'AF TIMBER B33', qo: 100, qi: 12, cr: 0, ma: 2, mi: 0, rj: 2, rm: 'Inline' },
    { po: '48150', desc: 'Frame', code: 'AF TIMBER B15', qo: 100, qi: 12, cr: 0, ma: 2, mi: 0, rj: 2, rm: 'Inline' },
    { po: '48150', desc: 'Frame', code: 'AF TIMBER B09FD', qo: 110, qi: 12, cr: 0, ma: 3, mi: 0, rj: 3, rm: 'Inline' },
  ];
  const dir96 = { mode: 'Inline', header: { factory: '#96', customer: 'Fabuwood', collection: 'Door', color: 'TIMBER', supplier: 'VVT', reportedBy: 'D.Ly', approvedBy: 'Mr. Tin' }, rows: dirRows, material: 'Birch, White Oak',
    cp: DIR_CP.map((_, i) => ({ r: i === 3 ? 'NG' : 'OK', note: i === 3 ? 'Hairline, pinholes trên frame AF TIMBER sau topcoat' : '' })),
    sec: { moist: { cap: 'PO 48151 DS GTI, PO 48153 DS GTR', ph: pick('moist', 4) }, dim: { cap: 'PO 48151 DS GTI VSD30, PO 48153 DS GTR DB18 · PO 48150 AF TIMBER DB24 / DB18', ph: pick('dim', 8) }, finish: { cap: 'PO 48150 AF TIMBER', ph: pick('line', 4) }, primer: { cap: 'PO 48150 AF TIMBER', ph: pick('line', 4, 4) }, topcoat: { cap: 'PO 48150 AF TIMBER', ph: pick('line', 4, 8) }, color: { cap: 'PO 48150 AF TIMBER · so với master sample', ph: pick('color', 8) }, sheen: { cap: 'Đo bóng 60°', ph: pick('sheen', 6) } },
    defects: [
      { t: 'PO 48150 AF TIMBER DB24 — Hairline, Pinholes 3/12 Pcs', ph: ['dl_79', 'dl_80', 'dl_81'] }, { t: 'PO 48150 AF TIMBER DB18 — Cracks, Pinholes 3/12 Pcs', ph: ['dl_82', 'dl_83', 'dl_84'] },
      { t: 'PO 48150 AF TIMBER B33 — Hairline, Pinholes 2/12 Pcs', ph: ['dl_85', 'dl_86'] }, { t: 'PO 48150 AF TIMBER B15 — Hairline 2/12 Pcs', ph: ['dl_87', 'dl_88'] }, { t: 'PO 48150 AF TIMBER B09FD — Hairline, Pinholes 3/12 Pcs', ph: ['dl_90', 'dl_79'] }],
    conclusion: 'fail', note: 'Frame AF TIMBER (PO 48150) có hairline/pinholes sau topcoat 13/60 pcs mẫu — cần xưởng #96 xử lý chà sửa, sơn lại và kiểm lại toàn lô.' };

  /* ---- 11D Pigment Galaxy · Dove (đang theo dõi, mốc 7 ngày hôm nay) ---- */
  const REF = { 'D65/10': { L: 78.42, a: 1.12, b: 6.85 }, 'F02/10': { L: 78.91, a: 0.38, b: 7.62 }, 'A10': { L: 79.64, a: 2.31, b: 8.44 } };
  const drift = [[.05, .02, .04], [.12, .03, .07], [.18, .05, .1], [.22, .06, .13], [.26, .07, .15], [.29, .08, .18], [.31, .08, .2], [.33, .09, .21]];
  const xr = {}; drift.forEach((dv, i) => { xr[i] = { by: 'D.Ly', date: i < 2 ? at('28/10/2026', i ? 21 : 9) : d(-(9 - i)), sheen: [29 + (i % 3), 32 + (i % 2)], xrite: 'Ci64 #VHG-02' }; ILLUM.forEach((il, k) => { const r = REF[il]; xr[i][il] = { L: +(r.L - dv[0] * (1 + k * .1)).toFixed(2), a: +(r.a + dv[1]).toFixed(2), b: +(r.b + dv[2] * (1 + k * .05)).toFixed(2) }; }); });
  const pig = { header: { start: '13/10/2026', completion: '', vendor: 'Uylan (door trial)', doorStyle: 'GALAXY', color: 'DOVE', code: 'DS GD', customer: 'FABUWOOD', preparedBy: 'D.Ly', standard: 'FBW DOVE', masterNo: '01', processSheet: 'VVT-PS-DOVE-01', substrate: 'Birch · MDF panel', created: '20/10/2026' },
    steps: PIG_STEPS.map((_, i) => ({ ok: i < 7, date: ['13/10/2026', '14/10/2026', '20/10/2026', '22/10/2026', '24/10/2026', '28/10/2026', '28/10 → 04/11', '', '', ''][i] })),
    sec: { ww: [{ v: 8.6, r: 'P' }, { r: 'P' }, { r: 'P' }, { r: 'P' }, { r: 'P' }], uv: [{ v: '5B', r: 'P' }, { v: '5B', r: 'P' }, { v: 2.6, r: 'P' }], primer: [{ v: '5B', r: 'P' }, { v: 4.1, r: 'P' }, { v: 3.9, r: 'P' }], top: [{ v: '5B', r: 'P' }, { v: 6.2, r: 'P' }, { v: 5.8, r: 'P' }], fg: [] },
    ref: REF, xr, kcma: KCMA.map((_, i) => ({ r: i < 3 ? 'P' : '', note: i < 3 ? 'VVT lab report #K-2610-118' : '' })),
    approval: { qty: 7, signed: false }, photos: { label: ['uy_03'], color: pick('color', 3, 2), sheen: pick('sheen', 2) }, conclusion: '', note: '' };

  const I = o => Object.assign({ kind: 'qc', status: 'todo', team: [], createdBy: 'lead1', createdAt: d(-2), priority: 'normal' }, o);
  const ins = [
    I({ id: 'PLY-55672', type: 'PLY', title: 'Plywood Rongpeng · PO 55672', pos: ['55672'], factory: 'Rongpeng', assignee: 'qc3', team: ['qc3', 'qc4'], due: at('22/09/2026'), status: 'approved', data: plyR, createdAt: at('18/09/2026'), submittedAt: at('22/09/2026', 17), review: { by: 'lead1', at: at('23/09/2026', 9), decision: 'approve' } }),
    I({ id: 'WW-C2', type: 'WW', title: 'Hàng trắng hoàn thiện · Cont 2', pos: ['4200017234', '4200017236'], factory: 'Vỹ Thành', assignee: 'qc2', due: at('16/09/2026'), status: 'approved', data: ww, createdAt: at('12/09/2026'), submittedAt: at('16/09/2026', 18), review: { by: 'lead1', at: at('17/09/2026', 10), decision: 'approve' }, ncr: 'NCR-2609-03' }),
    I({ id: 'WW-C2B', type: 'WW', title: 'Kiểm bù 3 mã W1542 · W1842 · W2418', pos: ['4200017236'], codes: naCodes, factory: 'VHGI', assignee: 'qc2', due: d(0), priority: 'high', status: 'todo', createdAt: d(-1),
      note: '3 mã chưa kiểm tại Vỹ Thành do chất hàng từ trước — kiểm tại VHGI trước khi lót AC.' }),
    I({ id: 'PIG-DOVE', type: 'PIG', title: 'Mẫu màu Galaxy · Dove (Uylan door trial)', pos: ['4200017234', '4200017236'], factory: 'VHGI', assignee: 'qc1', due: d(0), status: 'draft', data: pig, createdAt: at('13/10/2026'), color: 'Dove' }),
    I({ id: 'DIR-96-0311', type: 'DIR', title: 'Daily Inline #96 · 03/11', pos: ['48150', '48151', '48153'], factory: 'Xưởng #96', assignee: 'qc1', due: d(-1), status: 'submitted', data: dir96, createdAt: d(-2), submittedAt: d(-1, 17, 20) }),
    I({ id: 'DIR-96-0411', type: 'DIR', title: 'Daily Inline #96 · hôm nay', pos: ['48150', '48151', '48153'], factory: 'Xưởng #96', assignee: 'qc1', due: d(0), status: 'todo', createdAt: d(-1), recur: 'daily' }),
    I({ id: 'DIR-VHGI-01', type: 'DIR', title: 'Daily Inline VHGI · lót AC Galaxy Dove', pos: ['4200017234'], factory: 'VHGI', assignee: 'qc1', due: d(1), status: 'todo', createdAt: d(-1), recur: 'daily' }),
    I({ id: 'PLY-56191', type: 'PLY', title: 'Plywood Woodaxis · PO 56191', pos: ['56191'], factory: 'Woodaxis', assignee: 'qc4', team: ['qc4'], due: d(-4), status: 'submitted', data: plyW, createdAt: d(-8), submittedAt: d(-3, 16) }),
    I({ id: 'FIN-48151', type: 'FIN', title: 'Final / Packing · PO 48151 · 48153', pos: ['48151', '48153'], factory: 'Xưởng #96', assignee: 'qc1', due: d(3), status: 'todo', createdAt: d(-1) }),
    I({ id: 'PC-2001', kind: 'prod', type: 'PC', title: 'Cập nhật tiến độ PO 4200017234', pos: ['4200017234'], factory: 'VHGI', assignee: 'qc3', due: d(0), status: 'todo' }),
  ];


  const syncLog = [
    { id: 'SY-08', at: d(0, 6, 10), po: '4200017240', type: 'create', ok: false, issues: ['PO Line #3 (DS GD B36): thiếu số lượng', 'PO Line #5 (DS GD W3030): thiếu số lượng', 'Trường "Xưởng sản xuất" trống'],
      payload: { id: '4200017240', customer: 'Fabuwood', cust: 'FBW', series: 'Galaxy (DS GD)', color: 'Dove', factory: 'Vỹ Thành', finisher: 'VHGI', paint: 'VVT', unit: 'pcs', value: 98600, etd: d(55), cont: 'Cont 3', plyPO: '56191', plan: ['PLY', 'WW', 'PIG', 'DIR', 'FIN'],
        lines: [{ ln: 1, code: 'DS GD B18', part: 'Cánh', qty: 300, sku: 'DS GD B18' }, { ln: 2, code: 'DS GD B18', part: 'Mặt hộc', qty: 300, sku: 'DS GD B18 · MK' }, { ln: 3, code: 'DS GD B36', part: 'Cánh', qty: 240, sku: 'DS GD B36' }, { ln: 4, code: 'DS GD W3042', part: 'Cánh', qty: 260, sku: 'DS GD W3042' }, { ln: 5, code: 'DS GD W3030', part: 'Cánh', qty: 220, sku: 'DS GD W3030' }],
        progress: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0], bottleneck: null } },
    { id: 'SY-07', at: d(-1, 6, 5), po: '48150', type: 'update', ok: true, note: 'Cập nhật ETD 20/11/2026' },
    { id: 'SY-06', at: at('20/10/2026', 8), po: '56191', type: 'create', ok: true, note: '1 PO Line · 1.050 pcs plywood Birch D+' },
    { id: 'SY-05', at: at('10/10/2026', 8), po: '48150', type: 'create', ok: true, note: '5 PO Line · 570 pcs frame AF Timber' },
    { id: 'SY-04', at: at('10/10/2026', 8), po: '48151', type: 'create', ok: true, note: '1 PO Line · 28 pcs' },
    { id: 'SY-03', at: at('10/10/2026', 8), po: '48153', type: 'create', ok: true, note: '1 PO Line · 56 pcs' },
    { id: 'SY-02', at: at('02/09/2026', 8), po: '4200017234', type: 'create', ok: true, note: '13 PO Line · 3.140 pcs' },
    { id: 'SY-01', at: at('02/09/2026', 8), po: '4200017236', type: 'create', ok: true, note: '13 PO Line · 2.440 pcs' },
  ];
  const baseQueue = [{ id: '4200017241', customer: 'Fabuwood', cust: 'FBW', series: 'Galaxy (DS GD)', color: 'Dove', factory: 'Vỹ Thành', finisher: 'VHGI', paint: 'VVT', unit: 'pcs', value: 121500, etd: d(62), cont: 'Cont 3', plyPO: '56191', plan: ['PLY', 'WW', 'PIG', 'DIR', 'FIN'],
    lines: [{ ln: 1, code: 'DS GD B21', part: 'Cánh', qty: 420, sku: 'DS GD B21' }, { ln: 2, code: 'DS GD B21', part: 'Mặt hộc', qty: 420, sku: 'DS GD B21 · MK' }, { ln: 3, code: 'DS GD W3036', part: 'Cánh', qty: 500, sku: 'DS GD W3036' }, { ln: 4, code: 'DS GD WDC2442', part: 'Cánh', qty: 120, sku: 'DS GD WDC2442' }],
    progress: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0], bottleneck: null }];
  const reports = [
    { id: 'RPT-55672-1.0', po: '55672', ver: 'v1.0', at: at('24/09/2026', 16), by: 'lead1', note: 'Chốt PO — plywood đạt có điều kiện, dent/putty đã sửa' },
    { id: 'RPT-55672-1.1', po: '55672', ver: 'v1.1', at: at('26/09/2026', 10), by: 'lead1', note: 'Bổ sung kết quả trao đổi với Fabuwood về UV 2 mặt' },
  ];
  const log = [
    { at: d(0, 6, 10), who: 'system', po: '4200017240', k: 'sync_err', t: 'Đồng bộ thất bại: thiếu số lượng PO Line #3, #5' },
    { at: d(-1, 17, 20), who: 'qc1', po: '48150', k: 'submit', t: 'Gửi Daily Inspection Report #96 (DIR-96-0311) — 13 pcs rejected' },
    { at: d(-1, 9), who: 'qc1', po: '4200017234', k: 'prod', t: 'Đo X-Rite mốc 6 ngày mẫu Dove — ΔE 0.38' },
    { at: d(-3, 16), who: 'qc4', po: '56191', k: 'submit', t: 'Gửi báo cáo plywood Woodaxis PO 56191 (BM-VHGLF-02)' },
    { at: at('17/09/2026', 10), who: 'lead1', po: '4200017234', k: 'approve', t: 'Duyệt phiếu hàng trắng Cont 2 (WW-C2) — 23/26 mã Passed, 3 mã N/A' },
    { at: at('24/09/2026', 16), who: 'lead1', po: '55672', k: 'close', t: 'Chốt PO 55672 và xuất báo cáo v1.0' },
  ];
  return { v: 6, pos, ins, alerts: [], syncLog, baseQueue, reports, log, online: true, outbox: [], seq: { ins: 100, al: 0, sy: 9 } };
}
