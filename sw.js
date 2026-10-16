/* MORRISON 1.2.1 — actualización en línea primero, sin borrar datos locales */
const VERSION='morrison-v1.4.1-20261015';
const STATIC=['./','./index.html','./morrison-ops.js?v=120','./morrison-connect.js?v=130','./morrison-voice.js?v=141','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(STATIC)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const keys=await caches.keys();
   await Promise.all(keys.filter(k=>k.startsWith('morrison-')&&k!==VERSION).map(k=>caches.delete(k)));
   await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
   try{
     const response=await fetch(req,req.mode==='navigate'?{cache:'no-store'}:{});
     if(response.ok){
       const cache=await caches.open(VERSION);
       await cache.put(req.mode==='navigate'?'./index.html':req,response.clone());
     }
     return response;
   }catch(_){
     const cached=await caches.match(req.mode==='navigate'?'./index.html':req);
     return cached||Response.error();
   }
 })());
});