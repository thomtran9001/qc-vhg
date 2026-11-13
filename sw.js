// VHG QC PWA — service worker: lưu sẵn vỏ app để mở được khi mất sóng.
// Đổi VERSION mỗi lần phát hành để máy tải bản mới.
const VERSION = 'vhg-qc-v1';
const SHELL = ['./vhg-qc.html', './manifest.webmanifest', './pwa/icon-192.png', './pwa/icon-512.png', './pwa/icon-maskable-512.png', './pwa/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // API sau này: luôn đi mạng, không cache (dữ liệu nghiệp vụ đi qua hàng đợi đồng bộ trong app).
  if (url.pathname.includes('/api/')) return;
  // Trang: mạng trước, mất sóng thì dùng bản đã lưu.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('./vhg-qc.html', c)); return r; })
      .catch(() => caches.match('./vhg-qc.html')));
    return;
  }
  // Tài nguyên tĩnh (cả font Google): cache trước, cập nhật nền.
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});

// Đồng bộ nền (Chrome Android): app đăng ký tag 'vhg-outbox' khi có phiếu chờ gửi.
self.addEventListener('sync', e => {
  if (e.tag === 'vhg-outbox') {
    e.waitUntil(self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage({ type: 'flush-outbox' }))));
  }
});
