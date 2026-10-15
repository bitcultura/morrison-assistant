import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:'+String(process.env.MORRISON_PORT||8765);
const sizes=[{name:'Galaxy A16',width:412,height:915},{name:'Galaxy Tab A9',width:800,height:1280}];
try{
 for(const d of sizes){
  const context=await browser.newContext({viewport:{width:d.width,height:d.height},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?v=mobile-'+Date.now()+'#automatizaciones',{waitUntil:'networkidle'});
  await page.locator('#mrr-control-center').waitFor();
  await page.locator('#mrr-gw-check').waitFor();
  await page.locator('#mrr-sync-up').waitFor();
  await page.locator('#mrr-sync-down').waitFor();
  await page.locator('#mrr-client-id').fill('abcdefgh12345678');
  await page.locator('#mrr-client-id').dispatchEvent('change');
  assert.equal(await page.evaluate(()=>localStorage.getItem('mrr-auth0-client-id-v1')),'abcdefgh12345678');
  await page.locator('#mrr-sync-check').click();
  await page.locator('#mrr-sync-status').waitFor();
  const state=await page.locator('#mrr-sync-status').innerText();
  assert.ok(/Inicia sesión Auth0/.test(state),'Sync may never claim authenticated without sign-in: '+state);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<4,'Horizontal overflow '+d.name+': '+overflow);
  if(d.width<=740)await page.locator('#menuToggle').click();
  await page.locator('[data-page=agenda]').click();
  await page.locator('#mrr-reminders').waitFor();
  await page.locator('#mrr-alert-check').click();
  assert.ok((await page.locator('#mrr-alert-status').innerText()).length>4);
  assert.deepEqual(errors,[],'JS page errors: '+errors.join('; '));
  console.log(JSON.stringify({device:d.name,mobilePassed:true,overflow,securitySignInRequired:true,reminders:true,errors:0}));
  await context.close();
 }
}finally{await browser.close()}
