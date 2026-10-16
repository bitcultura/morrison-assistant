import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const port=process.env.MORRISON_PORT||8765;
const origin='http://127.0.0.1:'+port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const ctx=await browser.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    class FakeRecognition{
      lang='';continuous=false;interimResults=false;maxAlternatives=1;
      start(){
        setTimeout(()=>{
          this.onresult?.({results:[[{transcript:'Hola cómo estamos'}]]});
          // Algunos navegadores Android emiten "aborted" tarde cuando concluye.
          setTimeout(()=>this.onerror?.({error:'aborted'}),15);
        },40);
      }
      abort(){setTimeout(()=>this.onerror?.({error:'aborted'}),0)}
    }
    Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:FakeRecognition});
    Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:FakeRecognition});
  });
  await page.goto(origin+'/?v=test-'+Date.now()+'#inicio',{waitUntil:'networkidle'});
  const talk=page.locator('#mrr-talk');
  assert.ok(await talk.isVisible(),'Botón del micrófono debe verse desde Inicio');
  assert.ok((await talk.innerText()).includes('Hablar con MORRISON'));
  assert.ok(await page.locator('#mrr-talk-text').isVisible());
  await page.locator('#mrr-talk-text').fill('Cuántos proyectos tengo');
  await page.locator('#mrr-talk-form button[type=submit]').click();
  assert.match(await page.locator('#mrr-talk-answer').innerText(),/proyectos guardados/i);
  await page.locator('#mrr-talk-text').fill('Crea una tarea probar voz local');
  page.once('dialog',d=>d.accept());
  await page.locator('#mrr-talk-form button[type=submit]').click();
  assert.ok(await page.evaluate(()=>window.MORRISON_BRIDGE.getData().tasks.some(t=>t.name==='probar voz local')),'La tarea se agrega con aprobación explícita');
  await talk.click();
  await page.waitForFunction(()=>document.querySelector('#mrr-talk-text')?.value==='Hola cómo estamos',null,{timeout:9000});
  await page.waitForTimeout(150);
  assert.match(await page.locator('#mrr-talk-answer').innerText(),/aquí estoy y listo/i);
  assert.doesNotMatch(await page.locator('#mrr-talk-status').innerText(),/aborted|no pude escuchar/i,'No se debe mostrar aborted tras transcripción');
  await page.locator('#mrr-talk-text').fill('¿Qué tareas pendientes tengo?');
  await page.locator('#mrr-talk-form button[type=submit]').click();
  assert.match(await page.locator('#mrr-talk-answer').innerText(),/probar voz local/);
  await page.locator('#mrr-talk-text').fill('Qué es una supernova');
  await page.locator('#mrr-talk-form button[type=submit]').click();
  assert.match(await page.locator('#mrr-talk-answer').innerText(),/ChatGPT/);
  assert.equal(await page.locator('#mrr-talk-chatgpt').getAttribute('href'),'https://chatgpt.com/');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<4,'La portada no debe desbordarse horizontalmente en móvil: '+overflow);
  assert.deepEqual(errors,[],'Sin excepciones del navegador');
  console.log('MORRISON Voz v1.4: botón visible, consulta de proyectos, tarea confirmada, micrófono simulado, pregunta general guiada a ChatGPT, mobile sin desbordes');
  await ctx.close();
}finally{await browser.close()}
