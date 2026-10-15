/* MORRISON 1.2 — network first para documentos; respaldo offline y actualizaciones seguras */
const VERSION='morrison-v1.2.0-20261015';
const FILES=['./','./index.html','./morrison-ops.js?v=120','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('morrison-')&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
     if(response.ok){const copy=response.clone();event.waitUntil(caches.open(VERSION).then(cache=>cache.put('./index.html',copy)));}
     return response;
   }).catch(()=>caches.match('./index.html')));
   return;
 }
 event.respondWith(fetch(req).then(response=>{
   if(response.ok&&['script','style','image','manifest'].includes(req.destination)){
     const copy=response.clone();event.waitUntil(caches.open(VERSION).then(cache=>cache.put(req,copy)));
   }
   return response;
 }).catch(()=>caches.match(req)));
});