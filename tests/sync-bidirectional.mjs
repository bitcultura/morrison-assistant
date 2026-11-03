import { chromium } from 'playwright';
import assert from 'node:assert/strict';
// CI only: encrypted synthetic data and mocked Auth0/Railway; no private data.
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:'+String(process.env.MORRISON_PORT||8765);
const remote={revision:0,payload:null},sessions=[];
async function device(name){
 const context=await browser.newContext({locale:'es-CL',serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 sessions.push({name,context,errors});page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 await page.addInitScript(()=>sessionStorage.setItem('mrr-pkce',JSON.stringify({client:'client-test-123456',verifier:'test-verifier',state:'teststate',created:Date.now()})));
 await page.route('https://dev-67r1qkd7ajuaxlr0.us.auth0.com/oauth/token',async route=>route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':'*'},body:JSON.stringify({access_token:'fake-access-token',expires_in:3600})}));
 await page.route('https://bitcultura-n8n-mcp-production.up.railway.app/morrison/v1/snapshot',async route=>{
  const req=route.request(),method=req.method();
  const headers={'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'Authorization,Content-Type','access-control-allow-methods':'GET,PUT,OPTIONS'};
  if(method==='OPTIONS')return route.fulfill({status:204,headers});
  if(req.headers().authorization!=='Bearer fake-access-token')return route.fulfill({status:401,headers,body:'{}'});
  if(method==='GET')return route.fulfill({status:200,headers,body:JSON.stringify({exists:remote.revision>0,revision:remote.revision,...(remote.payload?{payload:remote.payload}:{})})});
  const body=JSON.parse(req.postData()||'{}');
  if(body.expectedRevision!==remote.revision)return route.fulfill({status:409,headers,body:JSON.stringify({error:'revision_conflict'})});
  assert.ok(body.payload?.data&& !JSON.stringify(body.payload).includes('Tarea sintética'),'Debe cifrarse todo el contenido');
  remote.revision++;remote.payload=body.payload;
  return route.fulfill({status:200,headers,body:JSON.stringify({stored:true,revision:remote.revision})});
 });
 page.on('dialog',d=>d.accept());
 await page.goto(base+'/?code=mockcode&state=teststate#automatizaciones',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('#mrr-auth-status')?.textContent?.includes('Autorizado'),null,{timeout:12000});
 await page.locator('#mrr-passphrase').fill('FraseSinteticaSegura2026!');
 return page;
}
async function add(page,title){
 await page.locator('[data-page=agenda]').click();
 await page.locator('#taskName').fill(title);
 await page.locator('#taskForm button[type=submit]').click();
 await page.locator('[data-page=automatizaciones]').click();
}
async function advance(page,revision,status){
 await page.clock.fastForward(46000);
 await page.waitForFunction(({revision,status})=>document.querySelector('#mrr-sync-status')?.textContent?.includes(status+' (revisión '+revision+')'),{revision,status},{timeout:12000});
}
const has=(p,name)=>p.evaluate(n=>window.MORRISON_BRIDGE.getData().tasks.some(t=>t.name===n),name);
try{
 const phone=await device('Galaxy A16');
 await phone.locator('#mrr-sync-check').click();
 await phone.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('No existe copia'));
 await add(phone,'Tarea sintética de origen');
 await phone.locator('#mrr-sync-up').click();
 await phone.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('revisión 1'));
 const tablet=await device('Galaxy Tab A9');
 await tablet.locator('#mrr-sync-down').click();
 await tablet.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('restaurada'));
 assert.ok(await has(tablet,'Tarea sintética de origen'));
 await phone.locator('#mrr-autosync').check();
 await tablet.locator('#mrr-autosync').check();
 await add(phone,'Tarea sintética del teléfono');
 await advance(phone,2,'Copia cifrada guardada');
 await advance(tablet,2,'Datos nuevos recibidos automáticamente');
 assert.ok(await has(tablet,'Tarea sintética del teléfono'));
 await add(tablet,'Tarea sintética de tablet');
 await advance(tablet,3,'Copia cifrada guardada');
 await advance(phone,3,'Datos nuevos recibidos automáticamente');
 assert.ok(await has(phone,'Tarea sintética de tablet'));
 await add(phone,'Tarea sintética simultánea teléfono');
 await add(tablet,'Tarea sintética simultánea tablet');
 await advance(phone,4,'Copia cifrada guardada');
 await tablet.clock.fastForward(46000);
 await tablet.waitForFunction(()=>document.querySelector('#mrr-sync-status')?.textContent?.includes('Conflicto entre equipos'),null,{timeout:12000});
 assert.equal(remote.revision,4);
 assert.ok(await has(tablet,'Tarea sintética simultánea tablet'));
 assert.ok(!(await tablet.locator('#mrr-autosync').isChecked()));
 for(const s of sessions)assert.deepEqual(s.errors,[],'Sin errores JS en '+s.name);
 console.log('MORRISON etapa 1: sincronización sintética bidireccional, cifrado y protección ante conflictos OK');
}finally{for(const s of sessions)await s.context.close();await browser.close()}
