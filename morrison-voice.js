/* MORRISON 1.4.1 — Corrección de diálogo y cancelación de micrófono.
   Comandos y respuestas LOCALES; preguntas generales se entregan a ChatGPT por separado.
   No requiere credenciales ni API de pago. */
(()=>{'use strict';
 const B=window.MORRISON_BRIDGE;
 const home=document.querySelector('#page-inicio .hero-copy .button-row');
 const hero=document.querySelector('#page-inicio .hero');
 if(!B||!home||!hero)return;
 const css=document.createElement('style');
 css.textContent=`
 #mrr-talk{min-width:205px;min-height:52px;font-size:14px;font-weight:750;background:linear-gradient(120deg,#0692d7,#145cae);color:#fff;border:1px solid #5ed8ff;box-shadow:0 0 25px #11b6f730}
 #mrr-talk.mrr-recording{background:linear-gradient(120deg,#913446,#df4660);border-color:#ffb2bf;animation:mrr-pulse 1.35s infinite alternate}
 @keyframes mrr-pulse{to{box-shadow:0 0 10px #ff587950}}
 .mrr-voice-card{padding:18px 21px;margin-top:15px;border:1px solid #286486;border-radius:15px;background:linear-gradient(140deg,#0d293d,#081726)}
 .mrr-voice-title{font-weight:800;color:#c7f3ff;font-size:15px;margin-bottom:8px}
 .mrr-voice-help{font-size:12px;color:#9abbd0;line-height:1.55;margin:7px 0}
 .mrr-voice-controls{display:flex;align-items:stretch;gap:9px;flex-wrap:wrap;margin-top:12px}
 .mrr-voice-controls input{flex:1 1 210px;min-width:0;background:#061624;border:1px solid #325771;color:#f4fbff;border-radius:9px;min-height:43px;padding:10px;font-size:14px}
 .mrr-voice-feedback{font-size:13px;min-height:22px;line-height:1.55;margin:10px 0 0;white-space:pre-wrap}
 .mrr-voice-feedback[data-kind=answer]{color:#aff1d9}
 .mrr-voice-feedback[data-kind=info]{color:#afd1e8}
 .mrr-voice-feedback[data-kind=error]{color:#ffb6bb}
 .mrr-voice-footer{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}
 @media(max-width:740px){#mrr-talk{width:100%;min-height:56px}.mrr-voice-card{padding:16px}.mrr-voice-controls .btn{width:100%}}
 `;
 document.head.append(css);
 const button=document.createElement('button');
 button.id='mrr-talk';button.type='button';button.className='btn primary';
 button.textContent='🎙 Hablar con MORRISON';
 home.prepend(button);
 const panel=document.createElement('div');panel.className='mrr-voice-card';panel.id='mrr-voice-card';
 panel.innerHTML=`<div class="mrr-voice-title">◉ Conversación rápida</div>
 <p class="mrr-voice-help">Toca el micrófono y habla sin decir «Morrison», o escribe una pregunta. Puedo consultar tus tareas y proyectos, abrir secciones y guardar tareas con confirmación.</p>
 <form id="mrr-talk-form" class="mrr-voice-controls"><label for="mrr-talk-text" class="sr-only" style="position:absolute;left:-10000px">Pregunta o comando</label>
 <input id="mrr-talk-text" type="text" maxlength="300" placeholder="Ej.: ¿Qué tareas pendientes tengo?" autocomplete="off">
 <button type="submit" class="btn primary">Consultar</button></form>
 <p id="mrr-talk-status" class="mrr-voice-feedback" data-kind="info" role="status" aria-live="polite">Micrófono apagado. Solo escucha cuando pulsas el botón.</p>
 <p id="mrr-talk-answer" class="mrr-voice-feedback" data-kind="answer" aria-live="polite"></p>
 <div class="mrr-voice-footer">
 <button id="mrr-talk-copy" type="button" class="btn secondary">Copiar pregunta</button>
 <a id="mrr-talk-chatgpt" class="btn secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">💬 Preguntas abiertas en ChatGPT ↗</a></div>
 <p class="mrr-voice-help">Puedo conversar sobre tareas y proyectos guardados. Para preguntas generales, abre ChatGPT y usa su micrófono. La IA todavía funciona en una aplicación separada.</p>`;
 hero.insertAdjacentElement('afterend',panel);
 const $=id=>document.getElementById(id);
 let current=null,listening=false;
 const inform=(s,kind='info')=>{$('mrr-talk-status').textContent=s;$('mrr-talk-status').dataset.kind=kind};
 const answer=s=>{$('mrr-talk-answer').textContent=s;if(typeof B.speak==='function')B.speak(s)};
 function stop(abort=true){
   // Al terminar de reconocer una frase, NO abortar la sesión: Android envía un
   // evento "aborted" tardío que podría borrar una respuesta correcta.
   listening=false;button.classList.remove('mrr-recording');button.textContent='🎙 Hablar con MORRISON';
   if(current){
     const old=current;current=null;
     old.onresult=null;old.onerror=null;old.onend=null;
     if(abort){try{old.abort()}catch(_){}}
   }
 }
 const norm=t=>String(t||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?¡!.,:;]+/g,' ').replace(/\s+/g,' ').trim();
 const dateNow=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 function execute(raw){
   const text=String(raw||'').trim().slice(0,300);if(!text){inform('Escribe una consulta o toca el micrófono.','error');return}
   $('mrr-talk-text').value=text;
   const t=norm(text).replace(/^(morrison|oye morrison)\s+/,'');
   const data=B.getData();
   const tasks=Array.isArray(data.tasks)?data.tasks.filter(x=>!x.done):[];
   const projects=Array.isArray(data.projects)?data.projects:[];
   if(/^(?:hola|holi|buenos dias|buenas tardes|buenas noches|hey|oye)(?:\s+(?:morrison|como estas|como estamos|como vamos|que tal|que haces|estas ahi))?$/.test(t)||/^(?:como estas|como estamos|como vamos|que tal|estas ahi|hola como estas|hola como estamos)$/.test(t)){
     answer('¡Hola! Aquí estoy y listo para ayudarte. En este teléfono tienes '+tasks.length+' tarea'+(tasks.length===1?'':'s')+' pendiente'+(tasks.length===1?'':'s')+'. Puedes preguntarme por tus tareas, tus proyectos o pedirme que abra una sección.');
     inform('Saludo respondido en el dispositivo.');return;
   }
   if(/^(?:que puedes hacer|que sabes hacer|ayuda|necesito ayuda|como funciona|que puedo preguntarte)$/.test(t)){
     answer('Puedo revisar tus tareas y proyectos guardados, decirte la hora, crear una tarea si la confirmas y abrir secciones. Para preguntas generales tienes el acceso a ChatGPT.');
     inform('Estas son mis funciones locales disponibles.');return;
   }
   if(/\b(que|cuantas?|mostrar|dime|listar|ver|tengo|pendientes|proximas)\b/.test(t)&&/\b(tareas|pendientes|agenda)\b/.test(t)){
     const today=/\b(hoy|dia)\b/.test(t);
     const found=today?tasks.filter(x=>x.date===dateNow()):tasks;
     const names=found.slice(0,4).map(x=>x.name);
     answer(found.length?(today?'Tareas para hoy: ':'Tienes '+found.length+' tareas pendientes. ') + names.join('; ')+(found.length>4?'; y otras más.':'.'):(today?'No tienes tareas con fecha de hoy registradas.':'No tienes tareas pendientes registradas.'));
     inform('Consulté únicamente tu agenda guardada en este dispositivo.');return;
   }
   if(/\b(cuantos|cuantas|que|ver|listar|mostrar|mis|tengo)\b/.test(t)&&/\b(proyectos|proyecto)\b/.test(t)){
     answer(projects.length?'Tienes '+projects.length+' proyectos guardados: '+projects.slice(0,4).map(x=>x.name).join('; ')+(projects.length>4?'; y otros.':'.'):'No tienes proyectos guardados en este dispositivo.');
     inform('Consulté únicamente tu lista local de proyectos.');return;
   }
   if(/\b(que hora|dime la hora|hora es)\b/.test(t)){
     answer('La hora de tu dispositivo es '+new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})+'.');inform('Hora local del teléfono.');return;
   }
   const task=t.match(/^(?:crea|crear|agrega|agregar|anade|anadir|apunta|anota)(?: una)? tarea(?: de| para| que diga)?\s+(.{3,160})$/);
   if(task){
     const title=task[1].trim();if(confirm('¿Guardar esta tarea SOLO en este dispositivo?\n'+title)){
       if(B.addTask(title)){answer('Tarea guardada: '+title+'.');inform('Cambio local confirmado.');}
       else{inform('No pude guardar esa tarea.','error')}
     }else{inform('No guardé ninguna tarea.')}
     return;
   }
   const page=t.match(/\b(?:abre|abrir|muestra|mostrar|ir a|ve a)\b\s+(?:la|las|los|mis|el)?\s*(agenda|tareas|proyectos|notas|memoria|economia|finanzas|automatizaciones|ajustes|inicio|hogar|investigacion)\b/);
   if(page){
     const map={tareas:'agenda',memoria:'notas',finanzas:'economia'};
     const dest=map[page[1]]||page[1];B.show(dest);
     answer('Abriendo '+page[1]+'.');inform('Sección abierta en MORRISON.');return;
   }
   inform('Pregunta reconocida. MORRISON aún no puede razonar sobre temas generales en esta pantalla.');
   $('mrr-talk-answer').textContent='Para responder esa pregunta con inteligencia artificial, pulsa «Copiar pregunta» y «Preguntas abiertas en ChatGPT». También puedes hablar en el modo de voz de ChatGPT.';
 }
 $('mrr-talk-form').onsubmit=e=>{e.preventDefault();stop();execute($('mrr-talk-text').value)};
 button.onclick=()=>{
   if(listening){stop();inform('Micrófono detenido.');return}
   const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
   if(!Recognition){inform('Este navegador no admite reconocimiento de voz. Puedes escribir tu pregunta o usar ChatGPT en modo voz.','error');$('mrr-talk-text').focus();return}
   try{
     const r=new Recognition();current=r;r.lang='es-CL';r.continuous=false;r.interimResults=false;r.maxAlternatives=1;
     r.onresult=e=>{
       const raw=e.results?.[0]?.[0]?.transcript||'';
       stop(false);
       if(raw){execute(raw);inform('Escuché: '+raw+'. Consulta procesada.');}
       else{inform('No pude reconocer lo que dijiste. Prueba otra vez.','error')}
     };
     r.onerror=e=>{
       if(current!==r)return;
       const code=e?.error||'desconocido';
       stop(false);
       if(code==='aborted'){inform('Escucha detenida. Pulsa de nuevo el micrófono para hablar.');return}
       const message=code==='not-allowed'||code==='service-not-allowed'
         ?'Micrófono sin permiso. Autoriza el acceso en los ajustes del navegador.'
         :code==='no-speech'?'No detecté tu voz. Acércate al teléfono y vuelve a pulsar el micrófono.'
         :code==='network'?'No hay servicio de reconocimiento de voz. Revisa internet o escribe tu pregunta.'
         :'No pude escuchar: '+code+'. También puedes escribir la pregunta.';
       inform(message,'error');
     };
     r.onend=()=>{if(current===r){stop(false);inform('Escucha finalizada sin transcripción. Vuelve a intentarlo.')}};
     listening=true;button.classList.add('mrr-recording');button.textContent='■ Detener escucha';inform('Escuchando… habla ahora. Solo usaré tu voz durante esta consulta.');
     r.start();
   }catch(e){stop();inform('No se pudo iniciar el micrófono: '+String(e.message||e),'error')}
 };
 $('mrr-talk-copy').onclick=async()=>{
   const q=$('mrr-talk-text').value.trim();if(!q){inform('Primero dicta o escribe una pregunta.','error');return}
   try{await navigator.clipboard.writeText(q);inform('Pregunta copiada. Abre ChatGPT y pégala allí.')}
   catch{inform('No se pudo copiar automáticamente. Mantén pulsado el texto y selecciona Copiar.','error');$('mrr-talk-text').focus();$('mrr-talk-text').select()}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&listening){stop();inform('Micrófono detenido al salir de MORRISON.')}});
})();
