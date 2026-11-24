const CACHE_NAME = "sheriff-game-v1.11";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

// ติดตั้งและเก็บไฟล์โครงสร้างหลักไว้ในเครื่อง
// เก็บทีละไฟล์ ถ้าไฟล์ใดหาไม่เจอ (เช่น ชื่อไฟล์พิมพ์เล็ก/ใหญ่ไม่ตรง) จะข้ามไฟล์นั้นแทนที่จะล้มทั้งชุด
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

// ล้างแคชเวอร์ชันเก่าเมื่อมีการอัปเดตเกม
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ดึงข้อมูลจากเครือข่ายเป็นหลัก เพื่อไม่ให้ข้อมูล Firebase ค้าง
// คำขอไปยังโดเมนอื่น (Firebase, ผู้ให้บริการ TURN ฯลฯ) ปล่อยผ่านโดยไม่ยุ่ง
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
