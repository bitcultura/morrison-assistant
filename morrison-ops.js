/* MORRISON 1.2 — Extensiones gratuitas y locales; sin API remota de IA.
 * No expone tokens, no ejecuta workflows y no promete sincronización automática. */
(()=>{'use strict';
 const B=window.MORRISON_BRIDGE;
 if(!B){console.error('MORRISON: núcleo no disponible');return;}
 const $=id=>document.getElementById(id);
 const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n||0);
 const escape=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const KEY='morrison-v1-economia';
 const dateNow=()=>new Date().toISOString().slice(0,10);
 const MAX=5000000;
 let econ={version:1,goal:1000000000,entries:[]};
 try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.version===1&&Array.isArray(x.entries))econ={...econ,...x,entries:x.entries.slice(0,1000)}}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(econ))}catch(_){B.toast('No se pudieron guardar los datos económicos')}};
 const root=document.querySelector('.content');const nav=$('nav');
 const css=document.createElement('style');
 css.textContent='.mrr-hint{font-size:12px;color:#8da7bb;line-height:1.6}.mrr-layout{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:14px;margin:16px 0}.mrr-box{padding:18px;border:1px solid #24516a;border-radius:14px;background:#0e2133}.mrr-box small{display:block;color:#9bb6c9;margin-bottom:8px}.mrr-box strong{font-size:23px;color:#e9f7ff}.mrr-form{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));align-items:end}.mrr-form label{font-size:12px;color:#acd8ef;display:grid;gap:5px}.mrr-form input,.mrr-form select{min-width:0;width:100%;padding:12px;border:1px solid #34566d;border-radius:9px;background:#061624;color:#eafaff}.mrr-btn{border:1px solid #356c86;background:#102b40;color:#e6faff;border-radius:9px;padding:12px 14px;font:inherit;cursor:pointer}.mrr-btn.primary{background:#0b91c9;color:#fff}.mrr-btn.danger{border-color:#a54e60;color:#ffb5c1}.mrr-list{display:grid;gap:9px;margin-top:16px}.mrr-list-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px;border:1px solid #23455b;border-radius:10px}.mrr-list-item small{color:#89a8bd}.mrr-toolbar{display:flex;flex-wrap:wrap;gap:9px}.mrr-alert{padding:12px;border:1px solid #6e653c;border-radius:10px;color:#f3d499;background:#332a12aa;margin:15px 0}@media(max-width:550px){.mrr-box strong{font-size:19px}.mrr-list-item{align-items:flex-start;flex-direction:column}}';
 document.head.appendChild(css);
 const item=document.createElement('button');item.type='button';item.className='nav-link';item.dataset.page='economia';item.innerHTML='<span>◈</span> Economía';item.onclick=()=>B.show('economia');nav.appendChild(item);
 B.registerSection('economia','ECONOMÍA');
 const section=document.createElement('section');section.id='page-economia';section.className='page';
 section.innerHTML='<div class="section-intro"><div class="eyebrow">PATRIMONIO / DATOS MANUALES</div><h1>Economía personal</h1><p>Registra entradas y salidas reales, define metas y analiza tu capacidad de ahorro. Esto no es asesoría financiera ni garantiza rentabilidad.</p></div><div class="mrr-alert">Tus movimientos se guardan únicamente en este navegador SIN cifrado local. No ingreses números de cuenta, tarjetas, contraseñas ni información sensible.</div><div class="mrr-layout"><div class="mrr-box"><small>Ingresos registrados</small><strong id="mrr-income">$0</strong></div><div class="mrr-box"><small>Gastos registrados</small><strong id="mrr-expense">$0</strong></div><div class="mrr-box"><small>Balance registrado</small><strong id="mrr-net">$0</strong></div></div><div class="card panel"><div class="panel-title">Añadir movimiento</div><form class="mrr-form" id="mrr-finance-form"><label>Tipo<select id="mrr-kind"><option value="ingreso">Ingreso</option><option value="gasto">Gasto</option></select></label><label>Descripción<input id="mrr-desc" required maxlength="90" placeholder="Ej.: servicio realizado"></label><label>Monto CLP<input id="mrr-amount" type="number" step="1" min="1" max="100000000000" required></label><label>Fecha<input id="mrr-date" type="date" required></label><button class="mrr-btn primary" type="submit">Guardar movimiento</button></form><div class="mrr-list" id="mrr-entries"></div></div><div class="card panel" style="margin-top:16px"><div class="panel-title">Meta de patrimonio</div><label style="display:block;margin:12px 0">Meta en pesos chilenos (CLP) <input id="mrr-goal" type="number" min="1000" max="100000000000000" step="1000" style="width:100%;margin-top:5px" /></label><button class="mrr-btn" id="mrr-save-goal">Guardar meta</button><p class="mrr-hint" id="mrr-goal-text"></p><p class="mrr-hint">Un balance de movimientos no es patrimonio neto: faltan activos y deudas. No implica resultados futuros. MORRISON puede ayudarte a investigar oportunidades verificables, pero nunca garantiza hacerte millonario.</p></div>';
 root.appendChild(section);
 const btnSeed=document.createElement('button');btnSeed.type='button';btnSeed.id='mrr-seed';btnSeed.className='btn secondary';btnSeed.textContent='＋ Cargar nombres de proyectos conocidos';
 const projectForm=$('projectForm');projectForm?.parentElement?.insertBefore(btnSeed,projectForm?.nextSibling);
 const noteSeed=document.createElement('p');noteSeed.className='mrr-hint';noteSeed.textContent='No importa documentos ni datos privados. Comprueba los proyectos y sus avances por separado.';
 btnSeed.after(noteSeed);
 btnSeed.onclick=()=>{
   const names=['MORRISON','BitCultura','Planetario Rapa Nui','GOLD — Trading Lab','ORÁCULO — Trading Lab'];
   if(!confirm('¿Crear estos 5 nombres de proyectos en ESTE dispositivo? No se importarán documentos ni estados de avance.'))return;
   let count=0;for(const n of names)if(B.addProject(n))count++;
   B.toast(count+' proyecto(s) añadido(s). Los duplicados se omitieron.');
 };
 $('mrr-date').value=dateNow();
 const makeId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,10);
 function renderFinance(){
  const inc=econ.entries.filter(e=>e.kind==='ingreso').reduce((v,e)=>v+e.amount,0);
  const exp=econ.entries.filter(e=>e.kind==='gasto').reduce((v,e)=>v+e.amount,0);
  $('mrr-income').textContent=money(inc);$('mrr-expense').textContent=money(exp);
  $('mrr-net').textContent=money(inc-exp);$('mrr-goal').value=econ.goal;
  $('mrr-goal-text').textContent='Meta: '+money(econ.goal)+'. Balance de movimientos: '+money(inc-exp)+'. Esta cifra no incluye patrimonio inicial, activos, deudas ni impuestos.';
  const host=$('mrr-entries');host.textContent='';
  if(!econ.entries.length){const el=document.createElement('p');el.className='mrr-hint';el.textContent='Aún no hay movimientos registrados. No se han inventado cifras.';host.append(el);return}
  [...econ.entries].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,50).forEach(e=>{
    const row=document.createElement('div');row.className='mrr-list-item';const content=document.createElement('div');
    const strong=document.createElement('strong');strong.textContent=e.desc+' — '+money(e.amount);const sub=document.createElement('small');sub.textContent=e.date+' · '+(e.kind==='ingreso'?'Ingreso':'Gasto');sub.style.display='block';content.append(strong,sub);
    const del=document.createElement('button');del.className='mrr-btn danger';del.textContent='Eliminar';del.onclick=()=>{if(!confirm('¿Eliminar el movimiento «'+e.desc+'»?'))return;econ.entries=econ.entries.filter(x=>x.id!==e.id);save();renderFinance()};row.append(content,del);host.append(row)
  });
 }
 $('mrr-finance-form').onsubmit=e=>{
   e.preventDefault();const amount=Number($('mrr-amount').value),date=$('mrr-date').value,desc=$('mrr-desc').value.trim();
   if(!Number.isSafeInteger(amount)||amount<=0||amount>100000000000||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!desc){B.toast('Revisa monto, fecha y descripción');return}
   econ.entries.push({id:makeId(),kind:$('mrr-kind').value,desc:desc.slice(0,90),amount,date});
   if(econ.entries.length>1000)econ.entries=econ.entries.slice(-1000);
   save();renderFinance();$('mrr-amount').value='';$('mrr-desc').value='';B.toast('Movimiento guardado localmente');
 };
 $('mrr-save-goal').onclick=()=>{const v=Number($('mrr-goal').value);if(!Number.isSafeInteger(v)||v<1000||v>100000000000000){B.toast('Meta inválida');return}econ.goal=v;save();renderFinance();B.toast('Meta local guardada')};
 renderFinance();
 window.MORRISON_FINANCE_BRIDGE=Object.freeze({
  replaceData:next=>{
   if(!next||next.version!==1||!Array.isArray(next.entries))return false;
   const goal=Number(next.goal);
   econ={version:1,goal:Number.isSafeInteger(goal)&&goal>=1000&&goal<=100000000000000?goal:1000000000,
      entries:next.entries.slice(0,1000).filter(z=>z&&['ingreso','gasto'].includes(z.kind)&&
        Number.isSafeInteger(z.amount)&&z.amount>0&&z.amount<=100000000000&&
        typeof z.desc==='string'&&/^\\d{4}-\\d{2}-\\d{2}$/.test(z.date)).map(z=>({
          id:String(z.id||makeId()),kind:z.kind,desc:z.desc.slice(0,90),amount:z.amount,date:z.date
        }))};
   save();renderFinance();return true
  }
 });
 // Panel de actualizaciones y respaldo cifrado en Ajustes.
 const prefs=$('page-ajustes').querySelector('.two-grid');
 const card=document.createElement('div');card.className='card panel';
 card.innerHTML='<div class="panel-title">Versión, actualización y respaldo cifrado</div><p class="mrr-hint">MORRISON 1.2.0 · Actualiza el panel sin borrar tus datos locales. Tu dispositivo puede mantener una versión antigua temporalmente si está sin conexión.</p><div class="mrr-toolbar"><button class="mrr-btn primary" id="mrr-check-update">Buscar actualización</button><button class="mrr-btn" id="mrr-export-secure">Exportar respaldo cifrado</button><button class="mrr-btn" id="mrr-import-secure">Importar respaldo cifrado</button></div><input id="mrr-file" type="file" accept=".json,application/json" hidden><p class="mrr-hint" id="mrr-backup-status" role="status">Se requiere la misma contraseña en ambos dispositivos. Es una transferencia manual, no sincronización automática.</p>';
 prefs.appendChild(card);
 const status=t=>{$('mrr-backup-status').textContent=t};
 $('mrr-check-update').onclick=async()=>{
   status('Comprobando actualización...');
   try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update()}catch(_){}
   const u=new URL(location.href);u.searchParams.set('v',String(Date.now()));location.assign(u.href)
 };
 const b64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.slice(i,i+8192));return btoa(s)};
 const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 async function keyFrom(pass,salt,usage){
   const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
   return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,[usage]);
 }
 $('mrr-export-secure').onclick=async()=>{
  if(!crypto?.subtle){status('Este navegador no admite Web Crypto en este contexto HTTPS');return}
  const pass=prompt('Elige una contraseña de respaldo de AL MENOS 12 caracteres. Deberás escribirla en el otro dispositivo. No podremos recuperarla si la olvidas.');
  if(pass===null)return;if(pass.length<12){status('Usa una contraseña de 12 caracteres como mínimo');return}
  try{
   const payload=JSON.stringify({version:1,app:B.getData(),economy:econ,exportedAt:new Date().toISOString()});
   if(payload.length>MAX)throw Error('Datos demasiado grandes para este respaldo');
   const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
   const key=await keyFrom(pass,salt,'encrypt');
   const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(payload)));
   const backup=JSON.stringify({type:'MORRISON-ENCRYPTED-BACKUP-v1',kdf:'PBKDF2-SHA256',iterations:210000,salt:b64(salt),iv:b64(iv),data:b64(encrypted)});
   const blob=new Blob([backup],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='MORRISON-cifrado-'+dateNow()+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
   status('Respaldo cifrado descargado. Transfiérelo por un medio privado y NO olvides la contraseña.');
  }catch(e){status('Error al cifrar: '+e.message)}
 };
 $('mrr-import-secure').onclick=()=>$('mrr-file').click();
 $('mrr-file').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>MAX*2)throw Error('Archivo demasiado grande');
   const backup=JSON.parse(await file.text());
   if(backup.type!=='MORRISON-ENCRYPTED-BACKUP-v1'||backup.iterations!==210000)throw Error('Archivo no compatible');
   const pass=prompt('Contraseña del respaldo cifrado:');if(pass===null)return;
   const salt=unb64(backup.salt),iv=unb64(backup.iv),bytes=unb64(backup.data);
   if(salt.length!==16||iv.length!==12||bytes.length>MAX*2)throw Error('Archivo dañado');
   const key=await keyFrom(pass,salt,'decrypt');
   const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,bytes);
   const decoded=JSON.parse(new TextDecoder().decode(plain));
   if(decoded.version!==1||decoded.app?.version!==1||!Array.isArray(decoded.app.projects)||!Array.isArray(decoded.app.tasks)||!Array.isArray(decoded.app.notes))throw Error('Contenido incorrecto');
   if(!confirm('Se reemplazarán TODOS los datos locales de MORRISON en este dispositivo. ¿Continuar?'))return;
   const p=decoded.app;
   const clean={
     version:1,
     projects:p.projects.slice(0,250).filter(x=>typeof x.name==='string').map(x=>({id:makeId(),name:x.name.slice(0,80)})),
     tasks:p.tasks.slice(0,1000).filter(x=>typeof x.name==='string').map(x=>({id:makeId(),name:x.name.slice(0,160),date:String(x.date||'').slice(0,10),priority:x.priority==='alta'?'alta':'normal',done:!!x.done})),
     notes:p.notes.slice(0,500).filter(x=>typeof x.title==='string').map(x=>({id:makeId(),title:x.title.slice(0,100),body:String(x.body||'').slice(0,10000),created:Number(x.created)||Date.now()})),
     healthUrl:''
   };
   const ec=decoded.economy;let finance={version:1,goal:1000000000,entries:[]};
   if(ec?.version===1&&Array.isArray(ec.entries)){
     const goal=Number(ec.goal);if(Number.isSafeInteger(goal)&&goal>=1000&&goal<=100000000000000)finance.goal=goal;
     finance.entries=ec.entries.slice(0,1000).filter(x=>['ingreso','gasto'].includes(x.kind)&&typeof x.desc==='string'&&Number.isSafeInteger(x.amount)&&x.amount>0&&x.amount<=100000000000&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).map(x=>({id:makeId(),kind:x.kind,desc:x.desc.slice(0,90),amount:x.amount,date:x.date}));
   }
   localStorage.setItem('morrison-v1-store',JSON.stringify(clean));localStorage.setItem(KEY,JSON.stringify(finance));
   status('Respaldo descifrado e importado. Recargando...');
   location.reload();
  }catch(err){status('No se pudo importar: contraseña incorrecta o archivo inválido. '+err.message)}
  finally{e.target.value=''}
 };
 // Aviso de actualización del service worker. No interrumpe formularios ni elimina datos.
 if('serviceWorker' in navigator){
   navigator.serviceWorker.addEventListener('controllerchange',()=>{status('Nueva versión instalada. Puedes pulsar «Buscar actualización» para recargar cuando termines.')});
 }

 // Supervisión verificable de GitHub SIN tokens, sin ejecutar workflows.
 const ghSection=$('page-automatizaciones');
 const ghCard=document.createElement('div');
 ghCard.className='card panel';
 ghCard.style.marginTop='16px';
 ghCard.innerHTML='<div class="panel-title">Estado de publicación de MORRISON · GitHub</div><p class="mrr-hint">Consulta pública de solo lectura. Se mostrará el último resultado realmente devuelto por GitHub; no se simulan servidores ni se ejecutan acciones.</p><div class="mrr-toolbar"><button type="button" id="mrr-gh-check" class="mrr-btn primary">Comprobar último despliegue</button><a class="mrr-btn" rel="noopener noreferrer" target="_blank" href="https://github.com/bitcultura/morrison-assistant/actions">Ver historial en GitHub ↗</a></div><p id="mrr-gh-state" class="mrr-hint" aria-live="polite">No consultado todavía.</p>';
 ghSection?.append(ghCard);

 const n8nSetup=document.createElement('div');
 n8nSetup.className='card panel';
 n8nSetup.style.marginTop='16px';
 n8nSetup.innerHTML='<div class="panel-title">Conectar el n8n existente — instalación manual requerida</div><p class="mrr-hint">El servidor n8n ya existe en Railway, pero la conexión autorizada en ChatGPT es únicamente de lectura. Esta acción necesita importar un workflow nuevo desde el panel web; no modificaremos BitCultura.</p><div class="mrr-toolbar"><a class="mrr-btn primary" rel="noopener noreferrer" target="_blank" href="https://n8n-production-d5cb.up.railway.app/">Abrir n8n ↗</a><a class="mrr-btn" rel="noopener noreferrer" target="_blank" href="https://github.com/bitcultura/morrison-assistant/blob/main/n8n/MORRISON-health-readonly.json">Obtener workflow de prueba ↗</a></div><ol class="mrr-hint"><li>Importa el archivo JSON como workflow nuevo llamado MORRISON.</li><li>Comprueba que solo tiene GET Webhook y Respond to Webhook; no cambia datos.</li><li>Actívalo cuando hayas verificado sus nodos y copia la URL de producción HTTPS en el formulario superior.</li><li>Pulsa Probar conexión. El estado debe quedar verificado solo si hay respuesta real.</li></ol><p class="mrr-hint">No introduzcas tokens ni contraseñas en esta página.</p>';
 ghSection?.append(n8nSetup);
 const check=$('mrr-gh-check'), output=$('mrr-gh-state');
 check.onclick=async()=>{
   check.disabled=true;output.textContent='Consultando GitHub, espera...';
   try{
     const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),12000);
     let response;
     try{response=await fetch('https://api.github.com/repos/bitcultura/morrison-assistant/actions/runs?per_page=1',{headers:{Accept:'application/vnd.github+json'},cache:'no-store',signal:abort.signal})}finally{clearTimeout(timer)}
     if(!response.ok)throw Error('GitHub respondió HTTP '+response.status);
     const payload=await response.json();
     const run=Array.isArray(payload.workflow_runs)?payload.workflow_runs[0]:null;
     if(!run){output.textContent='GitHub no devolvió ejecuciones verificables.';return}
     const valid=['success','failure','cancelled','skipped','timed_out','neutral','action_required'];
     const status=valid.includes(run.conclusion)?run.conclusion:String(run.status||'desconocido');
     const timestamp=run.updated_at?new Date(run.updated_at).toLocaleString('es-CL'):'fecha no indicada';
     output.textContent='Despliegue #'+String(run.run_number||'?')+' · '+status+' · Última actualización: '+timestamp+'. Consultado: '+new Date().toLocaleString('es-CL')+'.';
   }catch(err){output.textContent='No se pudo verificar GitHub: '+String(err.message||err)+'. Revisa la conexión o abre el historial.'}
   finally{check.disabled=false}
 };

 if(location.hash==='#economia')B.show('economia');
})();