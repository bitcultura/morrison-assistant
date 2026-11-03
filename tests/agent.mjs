import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:'+String(process.env.MORRISON_PORT||8765);
try{
  const ctx=await browser.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.goto(base+'/?test=agent-'+Date.now()+'#inicio',{waitUntil:'networkidle'});
  assert.ok(await page.locator('#mrr-agent').isVisible(),'Panel conversacional visible en Inicio');
  assert.ok(await page.locator('#mrr-agent-consent').isVisible(),'Consentimiento informado visible');
  assert.ok(await page.evaluate(()=>!!window.MORRISON_MEMORY_BRIDGE&&!!window.MORRISON_AGENT),'Puentes disponibles');

  const send=async text=>{await page.locator('#mrr-agent-input').fill(text);await page.locator('#mrr-agent-form button[type=submit]').click()};
  await send('Morrison, resume mis pendientes');
  assert.match(await page.locator('#mrr-agent-log').innerText(),/tareas pendientes.*proyectos/i);
  assert.match(await page.locator('#mrr-agent-status').innerText(),/sin enviar datos/i);

  await page.locator('#mrr-memory-text').fill('Prefiero respuestas breves');
  await page.locator('#mrr-memory-form button[type=submit]').click();
  assert.match(await page.locator('#mrr-memory-list').innerText(),/Prefiero respuestas breves/);
  await send('Morrison, que recuerdas');
  assert.match(await page.locator('#mrr-agent-log').innerText(),/Prefiero respuestas breves/);
  const mem=await page.evaluate(()=>window.MORRISON_MEMORY_BRIDGE.getBackup());
  assert.equal(mem.items.length,1,'Memoria guardada solo tras confirmación');
  assert.equal(mem.items[0].text,'Prefiero respuestas breves');

  await page.locator('#mrr-memory-text').fill('Mi token secreto 123');
  await page.locator('#mrr-memory-form button[type=submit]').click();
  assert.equal((await page.evaluate(()=>window.MORRISON_MEMORY_BRIDGE.getBackup())).items.length,1,'No almacenar secretos comunes');

  await send('Redacta un cuento para mí');
  assert.match(await page.locator('#mrr-agent-status').innerText(),/IA externa no autorizada/);
  await page.locator('#mrr-agent-consent').check();
  await send('Redacta un cuento para mí');
  assert.match(await page.locator('#mrr-agent-log').innerText(),/Debes iniciar sesión Auth0/);
  await send('Morrison, crea tarea revisión de MORRISON');
  assert.ok(await page.evaluate(()=>window.MORRISON_BRIDGE.getData().tasks.some(t=>t.name==='revisión de morrison')));
  assert.deepEqual(errors,[],'Sin errores del navegador');

  await page.locator('#mrr-memory-list button').click();
  assert.equal((await page.evaluate(()=>window.MORRISON_MEMORY_BRIDGE.getBackup())).items.length,0);
  await page.locator('#mrr-agent-clear').click();
  assert.equal((await page.locator('#mrr-agent-log').innerText()).trim(),'','Borrado de conversación de sesión');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<4,'El panel no desborda en Galaxy A16: '+overflow);
  console.log('MORRISON agente 2.0: resumen local, consentimiento, memoria, privacidad, acción confirmada y layout móvil OK');
  await ctx.close();
}finally{await browser.close()}
