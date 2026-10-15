import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:'+String(process.env.MORRISON_PORT||8765);
const store={revision:0,payload:null};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(){
 const context=await browser.newContext({locale:'es-CL',serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('mrr-pkce',JSON.stringify({client:'client-123456789',verifier:'test-pkce-verifier',state:'teststate',created:Date.now()})));
 await page.route('https://dev-67r1qkd7ajuaxlr0.us.auth0.com/oauth/token',async route=>{
  await route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'content-type'},body:JSON.stringify({access_token:'mock-access-token',expires_in:3600})});
 });
 await page.route('https://bitcultura-n8n-mcp-production.up.railway.app/morrison/v1/snapshot',async route=>{
  const req=route.request(),headers={'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'Authorization,Content-Type','access-control-allow-methods':'GET,PUT,OPTIONS'};
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  if(req.method()==='GET'){await route.fulfill({status:200,headers,body:JSON.stringify({exists:store.revision>0,revision:store.revision,...(store.payload?{payload:store.payload}:{})})});return}
  const body=JSON.parse(req.postData()||'{}');
  if(req.method()!=='PUT'||req.headers().authorization!=='Bearer mock-access-token'){await route.fulfill({status:401,headers,body:'{}'});return}
  if(body.expectedRevision!==store.revision){await route.fulfill({status:409,headers,body:JSON.stringify({error:'revision_conflict'})});return}
  assert.ok(body.payload?.data&&!JSON.stringify(body.payload).includes('Prueba remota cifrada'));
  store.payload=body.payload;store.revision++;
  await route.fulfill({status:200,headers,body:JSON.stringify({stored:true,revision:store.revision})});
 });
 page.on('dialog',d=>d.accept());
 await page.goto(base+'/?code=mockcode&state=teststate#automatizaciones',{waitUntil:'networkidle'});
 await page.locator('#mrr-auth-status').waitFor();
 await page.waitForFunction(()=>document.querySelector('#mrr-auth-status')?.textContent?.includes('Autorizado'),{timeout:15000});
 return {page,context,errors};
}
try{
 const first=await connect();
 await first.page.locator('#mrr-passphrase').fill('FraseMuySegura2026!deMorrison');
 await first.page.locator('#mrr-sync-check').click();
 await first.page.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('No existe copia'));
 await first.page.locator('[data-page=proyectos]').click();
 await first.page.locator('#projectName').fill('Prueba remota cifrada');
 await first.page.locator('#projectForm button[type=submit]').click();
 await first.page.locator('[data-page=automatizaciones]').click();
 await first.page.locator('#mrr-sync-up').click();
 await first.page.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('Copia cifrada guardada'));
 assert.equal(store.revision,1);
 const second=await connect();
 await second.page.locator('#mrr-passphrase').fill('FraseMuySegura2026!deMorrison');
 await second.page.locator('#mrr-sync-down').click();
 await second.page.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('Copia remota restaurada'));
 assert.ok((await second.page.evaluate(()=>window.MORRISON_BRIDGE.getData().projects)).some(x=>x.name==='Prueba remota cifrada'));
 await first.page.locator('[data-page=proyectos]').click();
 await first.page.locator('#projectName').fill('Edición uno');
 await first.page.locator('#projectForm button[type=submit]').click();
 await first.page.locator('[data-page=automatizaciones]').click();
 await first.page.locator('#mrr-sync-up').click();
 await first.page.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('revisión 2'));
 assert.equal(store.revision,2);
 await second.page.locator('[data-page=proyectos]').click();
 await second.page.locator('#projectName').fill('Edición dos sin sincronizar');
 await second.page.locator('#projectForm button[type=submit]').click();
 await second.page.locator('[data-page=automatizaciones]').click();
 await second.page.locator('#mrr-sync-up').click();
 await second.page.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('Conflicto'));
 assert.equal(store.revision,2,'Conflicto no debe sobreescribir remoto');
 assert.deepEqual(first.errors,[]);
 assert.deepEqual(second.errors,[]);
 console.log('MORRISON crypto sync simulated: encrypted upload, decrypt second device, optimistic conflict preserved, no JS errors');
 await first.context.close();await second.context.close();
}finally{await browser.close()}
