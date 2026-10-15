import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const port = process.env.MORRISON_PORT || 8765;
const url = 'http://127.0.0.1:' + port + '/?v=smoke-' + Date.now();
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const context = await browser.newContext({locale:'es-CL',serviceWorkers:'block'});
const page = await context.newPage();
const errors = [];
page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(url+'#proyectos',{waitUntil:'networkidle'});
  await page.locator('#page-proyectos h1').waitFor();
  assert.equal(await page.locator('#page-proyectos h1').innerText(),'Proyectos');
  const seeded=await page.locator('#projectList .project-card').count();
  assert.ok(seeded>=5,'Se esperaban los cinco proyectos locales, recibidos: '+seeded);
  await page.locator('#projectName').fill('Proyecto de prueba');
  await page.locator('#projectForm button[type=submit]').click();
  assert.ok(await page.locator('#projectList').innerText().then(t=>t.includes('Proyecto de prueba')));

  await page.locator('[data-page="agenda"]').click();
  await page.locator('#taskName').fill('Comprobar MORRISON');
  await page.locator('#taskForm button[type=submit]').click();
  assert.ok((await page.locator('#taskList').innerText()).includes('Comprobar MORRISON'));

  await page.locator('[data-page="economia"]').click();
  await page.locator('#mrr-desc').fill('Prueba de ingreso');
  await page.locator('#mrr-amount').fill('25000');
  await page.locator('#mrr-finance-form button[type=submit]').click();
  assert.ok((await page.locator('#mrr-income').innerText()).includes('25.000'));

  await page.reload({waitUntil:'networkidle'});
  await page.locator('[data-page="economia"]').click();
  assert.ok((await page.locator('#mrr-income').innerText()).includes('25.000'),'No persistió ingreso');
  await page.locator('[data-page="proyectos"]').click();
  assert.ok((await page.locator('#projectList').innerText()).includes('Proyecto de prueba'),'No persistió proyecto');
  await page.locator('[data-page="agenda"]').click();
  assert.ok((await page.locator('#taskList').innerText()).includes('Comprobar MORRISON'),'No persistió tarea');

  await page.locator('[data-page="automatizaciones"]').click();
  assert.ok(await page.locator('#mrr-gh-check').isVisible(),'Sin botón de comprobación GitHub');
  assert.equal((await page.locator('#statN8n').innerText()).toLowerCase(),'pendiente','n8n no debe simular conexión');
  assert.deepEqual(errors,[],'Errores JavaScript en navegador');
  console.log(JSON.stringify({result:'OK',seededProjects:seeded,addedProject:true,persistedTask:true,persistedEconomy:true,githubMonitoring:true,n8nNotSimulated:true,jsErrors:0}));
} finally { await browser.close(); }