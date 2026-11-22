const CACHE_NAME = "sheriff-game-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

// ติดตั้งและเก็บไฟล์โครงสร้างหลักไว้ในเครื่อง
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
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
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});