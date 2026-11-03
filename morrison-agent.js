/* MORRISON 2.0: diálogo local y memoria elegida. IA externa: permiso explícito. */
(()=>{'use strict';
const B=window.MORRISON_BRIDGE,voice=document.getElementById('mrr-voice-card');
if(!B||!voice)return;
const $=id=>document.getElementById(id), KEY='mrr-memory-explicit-v2';
let memory=[];try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(x))memory=x.slice(0,40).filter(v=>typeof v?.text==='string').map(v=>({id:String(v.id||''),text:v.text.slice(0,220),created:String(v.created||'')}))}catch(_){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(memory))}catch(_){setStatus('No se pudo guardar la memoria.')}};
window.MORRISON_MEMORY_BRIDGE=Object.freeze({
 getBackup:()=>({version:1,items:memory.map(x=>({...x}))}),
 replaceBackup:data=>{
  if(data?.version!==1||!Array.isArray(data.items)||data.items.length>40||data.items.some(x=>!x||typeof x.text!=='string'||x.text.length>220))return false;
  memory=data.items.map(x=>({id:String(x.id||''),text:x.text,created:String(x.created||'')}));save();renderMemory();return true;
 }
});
const style=document.createElement('style');style.textContent=`
#mrr-agent{margin:15px 0;padding:17px;border:1px solid #245f83;border-radius:15px;background:#0b253a}
#mrr-agent h3{margin:0 0 7px;color:#d1f4ff}
#mrr-agent p,#mrr-agent label,#mrr-agent summary{font-size:12px;color:#adcadc;line-height:1.5}
#mrr-agent-log{max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin:12px 0;min-height:48px}
.mrr-agent-msg{max-width:95%;padding:10px 12px;border-radius:12px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.5}
.mrr-agent-msg[data-who=user]{background:#185070;align-self:flex-end}
.mrr-agent-msg[data-who=assistant]{background:#112e42;align-self:flex-start}
.mrr-agent-msg small{display:block;color:#a5bdce;margin-bottom:5px}
#mrr-agent-form,#mrr-memory-form{display:flex;gap:8px;flex-wrap:wrap}
#mrr-agent-form input,#mrr-memory-form input{flex:1 1 200px;min-width:0;padding:11px;border:1px solid #386c86;border-radius:8px;background:#071421;color:#e8f9ff}
#mrr-agent-options{display:grid;gap:9px;margin:11px 0}
#mrr-agent-options label{display:flex;gap:8px;align-items:flex-start}
#mrr-memory-list{display:grid;gap:6px;margin:8px 0}
#mrr-memory-list>div{display:flex;align-items:center;gap:8px;justify-content:space-between}
#mrr-memory-list span{font-size:12px;overflow-wrap:anywhere;color:#d9eefa}
#mrr-agent-actions{display:flex;gap:9px;flex-wrap:wrap;margin:10px 0}
@media(max-width:740px){#mrr-agent-form button{width:100%}}
`;document.head.append(style);
const box=document.createElement('div');box.id='mrr-agent';box.innerHTML=`
<h3>✦ MORRISON 2.0 · Conversación</h3>
<p>Funciones locales operativas. La IA generativa externa requiere autorización y una clave privada en Railway, nunca en el teléfono.</p>
<p id="mrr-agent-status" role="status">Modo local seguro.</p>
<div id="mrr-agent-log" role="log" aria-label="Conversación de MORRISON" aria-live="polite"></div>
<form id="mrr-agent-form"><input id="mrr-agent-input" maxlength="1200" autocomplete="off" aria-label="Pregunta para MORRISON" placeholder="Resume mis tareas pendientes"><button class="btn primary" type="submit">Preguntar</button></form>
<div id="mrr-agent-options">
<label><input type="checkbox" id="mrr-agent-speak" checked> Leer respuestas con la voz seleccionada</label>
<label><input type="checkbox" id="mrr-agent-consent"> Autorizo enviar solo las preguntas que escriba al proveedor de IA externo, cuando esté habilitado. El nivel gratuito puede usar contenido para mejorar productos. No enviar información privada.</label>
</div>
<div id="mrr-agent-actions"><button type="button" class="btn secondary" id="mrr-agent-summary">Resumen local</button><button type="button" class="btn secondary" id="mrr-agent-clear">Borrar conversación</button></div>
<details><summary>Memoria elegida (editable)</summary><p>Los recuerdos locales no están cifrados mientras usas la aplicación; los respaldos remotos sí se cifran. No guardes contraseñas o tokens.</p>
<form id="mrr-memory-form"><input id="mrr-memory-text" maxlength="220" aria-label="Nuevo recuerdo" placeholder="Ej.: Prefiero respuestas breves"><button class="btn secondary" type="submit">Recordar</button></form>
<div id="mrr-memory-list"></div></details>
<p>El historial de esta conversación solo vive durante la sesión; no se guarda automáticamente.</p>
`;voice.insertAdjacentElement('afterend',box);
const log=$('mrr-agent-log');let turns=[],busy=false;
const setStatus=s=>$('mrr-agent-status').textContent=s;
function msg(who,text){const d=document.createElement('div'),t=document.createElement('small'),s=document.createElement('span');d.className='mrr-agent-msg';d.dataset.who=who;t.textContent=who==='user'?'Tú':'MORRISON';s.textContent=text;d.append(t,s);log.append(d);while(log.childElementCount>24)log.firstElementChild.remove();log.scrollTop=log.scrollHeight}
function speak(s){if($('mrr-agent-speak').checked)B.speak?.(s.slice(0,550))}
function renderMemory(){const list=$('mrr-memory-list');if(!list)return;list.textContent='';for(const m of memory){const row=document.createElement('div'),s=document.createElement('span'),b=document.createElement('button');s.textContent=m.text;b.type='button';b.className='btn secondary';b.textContent='Eliminar';b.onclick=()=>{if(confirm('¿Borrar este recuerdo?')){memory=memory.filter(x=>x.id!==m.id);save();renderMemory()}};row.append(s,b);list.append(row)}}
renderMemory();
const norm=s=>String(s).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?¡!.,:;]+/g,' ').replace(/\s+/g,' ').trim();
const unsafe=s=>/(contrase[nñ]a|password|api.?key|token|clave secreta|numero de cuenta|tarjeta bancaria)/i.test(s);
function local(q){
 const n=norm(q).replace(/^(oye )?morrison\s*/,'');const d=B.getData(),tasks=d.tasks.filter(x=>!x.done);
 if(/^(resume|resumen|resumeme|que tengo pendiente|mis pendientes|como van mis asuntos)/.test(n))return 'Tienes '+tasks.length+' tareas pendientes y '+d.projects.length+' proyectos.'+(tasks.length?'\n'+tasks.slice(0,5).map(x=>'• '+x.name).join('\n'):'')+'\nFuente: datos locales.';
 if(/^(que recuerdas|mis recuerdos|que sabes de mi)/.test(n))return memory.length?'Recuerdos elegidos:\n'+memory.map((m,i)=>(i+1)+'. '+m.text).join('\n'):'No has guardado recuerdos.';
 if(/^(lista|muestra|dime|que|cuantas|cuantos|mis).*(tareas|pendientes)/.test(n))return tasks.length?'Tareas:\n'+tasks.slice(0,10).map(x=>'• '+x.name).join('\n'):'No hay tareas pendientes.';
 if(/^(lista|muestra|dime|que|cuantas|cuantos|mis).*(proyectos)/.test(n))return d.projects.length?'Proyectos:\n'+d.projects.slice(0,12).map(x=>'• '+x.name).join('\n'):'No hay proyectos.';
 if(/^(abre|muestra|ve a)\s+(la |el |mis )?(agenda|proyectos|notas|memoria|investigacion|automatizaciones|economia|ajustes|inicio)/.test(n)){const m=n.match(/(agenda|proyectos|notas|memoria|investigacion|automatizaciones|economia|ajustes|inicio)/)[1];B.show(m==='memoria'?'notas':m);return 'Abriendo '+m+'.'}
 const task=n.match(/^(crea|agrega|anade|registrar|registra)\s+(una )?tarea\s+(.{3,160})$/);
 if(task){const original=String(q).replace(/^(?:oye\\s+)?morrison[,\\s.:-]*/i,'').match(/^(?:crea|agrega|añade|anade|registrar|registra)\\s+(?:una\\s+)?tarea\\s+(.{3,160})$/i);const title=(original?.[1]||task[3]).trim();if(!confirm('¿Guardar tarea en este dispositivo?\\n'+title))return 'No se guardó la tarea.';return B.addTask(title)?'Tarea guardada: '+title+'.':'No pude guardarla.'}
 if(/^(hola|buenos dias|buenas tardes|buenas noches|como estas)$/.test(n))return 'Aquí estoy. Pídeme un resumen de pendientes o revisar proyectos.';
 return null;
}
async function ask(question,say){
 const q=String(question||'').trim().slice(0,1200);if(!q||busy)return;
 msg('user',q);$('mrr-agent-input').value='';
 let answer=local(q);
 if(answer!==null){msg('assistant',answer);setStatus('Respuesta local, sin enviar datos.');say?say(answer):speak(answer);return}
 if(unsafe(q)){answer='No transmitiré claves, tokens o contraseñas. Reformula sin información sensible.';msg('assistant',answer);setStatus('Solicitud protegida.');say?say(answer):speak(answer);return}
 if(!$('mrr-agent-consent').checked){answer='La IA externa requiere tu autorización. Puedo seguir respondiendo sobre tus tareas, proyectos y recuerdos locales.';msg('assistant',answer);setStatus('IA externa no autorizada.');say?say(answer):speak(answer);return}
 const bridge=window.MORRISON_CHAT_BRIDGE;
 if(!bridge?.ready?.()){answer='Debes iniciar sesión Auth0 en Automatizaciones; además el proveedor debe estar habilitado en Railway.';msg('assistant',answer);setStatus('Acceso externo no preparado.');say?say(answer):speak(answer);return}
 busy=true;setStatus('Consultando proveedor externo autorizado…');
 try{
  const response=await bridge.ask([...turns.slice(-6),{role:'user',text:q}]);
  if(typeof response.text!=='string'||!response.text.trim())throw Error('empty');
  answer=response.text;turns=[...turns.slice(-6),{role:'user',text:q},{role:'model',text:answer}].slice(-8);
  msg('assistant',answer);setStatus('Modelo: '+String(response.model||'externo')+'. Cupo restante: '+String(response.remaining??'?'));say?say(answer):speak(answer);
 }catch(e){
  answer=/HTTP 429/.test(String(e))?'Cuota gratuita agotada, sin pagos.':'Motor externo deshabilitado o no disponible; tus herramientas locales siguen funcionando.';
  msg('assistant',answer);setStatus(answer);
 }finally{busy=false}
}
$('mrr-agent-form').onsubmit=e=>{e.preventDefault();ask($('mrr-agent-input').value)};
$('mrr-agent-summary').onclick=()=>ask('Morrison, resume mis pendientes');
$('mrr-agent-clear').onclick=()=>{turns=[];log.textContent='';setStatus('Conversación de esta sesión borrada.')};
$('mrr-memory-form').onsubmit=e=>{
 e.preventDefault();const value=$('mrr-memory-text').value.trim();
 if(!value||value.length>220||memory.length>=40||unsafe(value)){setStatus('No pude guardar el recuerdo; revisa longitud, límite y privacidad.');return}
 if(!confirm('¿Guardar recuerdo en almacenamiento local NO cifrado?\n'+value))return;
 memory.push({id:'m'+Date.now()+Math.random().toString(36).slice(2),text:value,created:new Date().toISOString()});
 $('mrr-memory-text').value='';save();renderMemory();setStatus('Recuerdo guardado con tu aprobación.');
};
window.MORRISON_AGENT=Object.freeze({
 handleVoice(q,reply){
  const n=norm(q).replace(/^(oye )?morrison\s*/,'');
  if(!/^(resume|resumen|resumeme|que tengo pendiente|mis pendientes|como van mis asuntos|que recuerdas|mis recuerdos|que sabes de mi|lista|muestra|dime|cuantas|cuantos|crea|agrega|anade|registrar|registra|abre|ve a)/.test(n)&&!$('mrr-agent-consent').checked)return false;
  ask(q,reply);return true;
 },
 ask:q=>ask(q)
});
})();