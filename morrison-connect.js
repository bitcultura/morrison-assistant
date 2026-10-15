/* MORRISON 1.3 — avisos locales y centro de conexiones.
   Funciona sin API OpenAI. No envía datos privados sin autorización explícita. */
(()=>{'use strict';
 const B=window.MORRISON_BRIDGE,$=id=>document.getElementById(id);
 if(!B || !$('page-ajustes') || !$('page-automatizaciones'))return;
 const GATEWAY='https://bitcultura-n8n-mcp-production.up.railway.app';
 const AUTH_DOMAIN='https://dev-67r1qkd7ajuaxlr0.us.auth0.com';
 const APP_ORIGIN=location.origin;
 const clientKey='mrr-auth0-client-id-v1',SYNC_FLAG='mrr-autosync-v1';
 const btn=(id,label)=>'<button type="button" class="mrr-btn" id="'+id+'">'+label+'</button>';
 const sec=document.createElement('div');sec.className='card panel';sec.id='mrr-control-center';sec.style.marginTop='16px';
 sec.innerHTML='<div class="panel-title">MORRISON — Centro de control seguro</div>'+
 '<p class="mrr-hint">Conexión de salud con Railway y n8n (sin credenciales). Sincronización privada opcional mediante Auth0 y datos cifrados en este equipo.</p>'+
 '<div class="mrr-toolbar">'+btn('mrr-gw-check','Comprobar conexión')+'</div>'+
 '<p class="mrr-hint" id="mrr-gw-status" role="status">No verificado.</p>'+
 '<label class="mrr-hint" for="mrr-client-id">Auth0 Client ID de una aplicación tipo Single Page Application (identificador público, NO secreto)</label>'+
 '<input id="mrr-client-id" type="text" maxlength="180" style="width:100%;padding:10px;margin:5px 0 12px;background:#061624;color:#fff;border:1px solid #34566d;border-radius:8px" placeholder="Client ID público de Auth0">'+
 '<div class="mrr-toolbar">'+btn('mrr-auth','Iniciar sesión Auth0')+btn('mrr-logout','Cerrar sesión')+'</div>'+
 '<p class="mrr-hint" id="mrr-auth-status">Sin iniciar sesión.</p>'+
 '<label class="mrr-hint" for="mrr-passphrase">Frase de cifrado para sincronización (mínimo 12 caracteres; igual en ambos dispositivos)</label>'+
 '<input type="password" id="mrr-passphrase" minlength="12" autocomplete="new-password" style="width:100%;padding:10px;margin:5px 0 12px;background:#061624;color:#fff;border:1px solid #34566d;border-radius:8px" placeholder="No se guarda en el navegador ni servidor">'+
 '<div class="mrr-toolbar">'+btn('mrr-sync-check','Consultar respaldo remoto')+btn('mrr-sync-up','Subir copia cifrada')+btn('mrr-sync-down','Restaurar copia remota')+'</div>'+
 '<label class="mrr-hint"><input type="checkbox" id="mrr-autosync"> Sincronizar automáticamente al editar, solo con sesión abierta y sin conflictos</label>'+
 '<p class="mrr-hint" id="mrr-sync-status" role="status">No conectado. Para configurar Auth0 debes registrar la URL de esta aplicación como Allowed Callback URL y Allowed Web Origin.</p>'+
 '<p class="mrr-hint">La sincronización nunca sobrescribe cambios simultáneos: ante un conflicto se detiene y requiere tu decisión. Sin sesión iniciada los datos permanecen locales. La escucha con pantalla apagada y las notificaciones push permanentes no están disponibles en esta PWA.</p>';
 $('page-automatizaciones').append(sec);

 // Voz local configurable; el timbre masculino depende de las voces instaladas en Android.
 const voiceBox=document.createElement('div');voiceBox.className='card panel';voiceBox.id='mrr-voice-settings';voiceBox.style.marginTop='16px';
 voiceBox.innerHTML='<div class="panel-title">Voz MORRISON · Navegador</div><p class="mrr-hint">Elige una voz de español instalada. No usa servicios de IA ni permite escucha con pantalla apagada.</p><select id="mrr-voice-pick" aria-label="Voces disponibles" style="width:100%;padding:10px;background:#061624;color:white;border:1px solid #34566d;border-radius:8px"></select><div class="mrr-toolbar">'+btn('mrr-voice-test','Probar voz elegida')+'</div><p class="mrr-hint" id="mrr-voice-status">Las voces dependen del sistema Android.</p>';
 $('page-ajustes').append(voiceBox);
 const voices=()=>typeof speechSynthesis!=='undefined'?speechSynthesis.getVoices():[];
 const fillVoices=()=>{
  const sel=$('mrr-voice-pick');if(!sel)return;
  const available=voices().filter(v=>(v.lang||'').toLowerCase().startsWith('es'));
  const old=localStorage.getItem('mrr-voice-name')||'';
  sel.textContent='';for(const v of available){const op=document.createElement('option');op.value=v.name;op.textContent=v.name+' ('+v.lang+')';sel.append(op)}
  if(available.some(x=>x.name===old))sel.value=old;
  status('mrr-voice-status',available.length?available.length+' voz/ces de español disponibles. El tono depende del dispositivo.':'Este navegador todavía no ha cargado voces en español.');
 };
 if('speechSynthesis' in window){fillVoices();speechSynthesis.addEventListener?.('voiceschanged',fillVoices);}
 $('mrr-voice-pick').onchange=()=>localStorage.setItem('mrr-voice-name',$('mrr-voice-pick').value);
 $('mrr-voice-test').onclick=()=>{
  if(!('speechSynthesis' in window)){status('mrr-voice-status','Síntesis de voz no compatible.');return}
  const name=$('mrr-voice-pick').value,voice=voices().find(v=>v.name===name);
  if(!voice){status('mrr-voice-status','Selecciona una voz disponible.');return}
  localStorage.setItem('mrr-voice-name',name);
  const u=new SpeechSynthesisUtterance('Hola. Soy Morrison. Sistema de voz listo para operar en primer plano.');
  u.voice=voice;u.lang=voice.lang;u.rate=.93;u.pitch=.84;speechSynthesis.cancel();speechSynthesis.speak(u);
 };
 // El hogar inteligente requiere una plataforma realmente instalada; jamás incrustar tokens.
 const home=document.createElement('div');home.className='card panel';home.id='mrr-home-adapter';home.style.marginTop='16px';
 home.innerHTML='<div class="panel-title">Dispositivos inteligentes — preparación segura</div>'+
 '<p class="mrr-hint">Abre el panel HTTPS de Home Assistant u otro controlador local compatible, si ya lo tienes. No se envían órdenes ni se almacenan credenciales.</p>'+
 '<label class="mrr-hint" for="mrr-home-url">Dirección HTTPS del panel de tu controlador (sin usuario ni token)</label>'+
 '<input id="mrr-home-url" type="url" placeholder="https://mi-controlador.example/" style="width:100%;padding:10px;background:#061624;color:white;border:1px solid #34566d;border-radius:8px">'+
 '<div class="mrr-toolbar">'+btn('mrr-home-open','Abrir controlador')+'</div>'+
 '<p class="mrr-hint" id="mrr-home-status">Sin dispositivos enlazados ni comandos habilitados.</p>';
 $('page-hogar').append(home);
 $('mrr-home-url').value=localStorage.getItem('mrr-home-url')||'';
 $('mrr-home-open').onclick=()=>{
  try{
   const u=new URL($('mrr-home-url').value.trim());
   if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||!u.hostname.includes('.'))throw Error('Usa una URL HTTPS del controlador sin parámetros ni credenciales');
   localStorage.setItem('mrr-home-url',u.origin+u.pathname);
   window.open(u.origin+u.pathname,'_blank','noopener,noreferrer');
   status('mrr-home-status','Se abrió el controlador externo. MORRISON no ha ejecutado acciones.');
  }catch(e){status('mrr-home-status','Dirección inválida: '+e.message)}
 };

 const alert=document.createElement('div');alert.className='card panel';alert.id='mrr-reminders';alert.style.marginTop='16px';
 alert.innerHTML='<div class="panel-title">Avisos de agenda — dispositivo actual</div>'+
 '<p class="mrr-hint">Comprueba tareas con fecha de hoy o vencidas. El aviso del navegador funciona mientras MORRISON está abierto; no promete notificaciones con la app cerrada.</p>'+
 '<div class="mrr-toolbar">'+btn('mrr-alert-check','Revisar tareas pendientes')+btn('mrr-alert-enable','Permitir notificaciones')+'</div>'+
 '<p class="mrr-hint" id="mrr-alert-status" role="status">Sin comprobar.</p>';
 $('page-agenda').append(alert);
 const status=(id,s)=>{if($(id))$(id).textContent=s};
 let access='',expires=0,knownRevision=null,localSnapshot='',autoBusy=false,autoEnabled=localStorage.getItem(SYNC_FLAG)==='yes',keyMemory='';
 $('mrr-client-id').value=localStorage.getItem(clientKey)||'';
 $('mrr-autosync').checked=autoEnabled;
 $('mrr-client-id').onchange=()=>{
  const x=$('mrr-client-id').value.trim();
  if(x&&!/^[A-Za-z0-9_-]{8,180}$/.test(x)){status('mrr-auth-status','Client ID inválido');return;}
  if(x)localStorage.setItem(clientKey,x);else localStorage.removeItem(clientKey);
 };
 async function getJSON(url,init={},timeout=12000){
  const ctr=new AbortController(),timer=setTimeout(()=>ctr.abort(),timeout);
  try{const res=await fetch(url,{cache:'no-store',credentials:'omit',redirect:'error',...init,signal:ctr.signal});
   const data=await res.json().catch(()=>({}));
   if(!res.ok){const err=new Error(res.status===409?'conflict':'HTTP '+res.status);err.status=res.status;throw err;}
   return data;
  }finally{clearTimeout(timer)}
 }
 $('mrr-gw-check').onclick=async()=>{status('mrr-gw-status','Consultando servidor...');try{
  const obj=await getJSON(GATEWAY+'/morrison/v1/health',{method:'GET'});
  if(obj.system!=='MORRISON'||obj.status!=='ready'||obj.readonly!==true)throw Error('Respuesta inválida');
  status('mrr-gw-status','Railway y n8n verificados por el servidor · '+new Date().toLocaleString('es-CL')+'. No confirma workflows activos.');
 }catch(e){status('mrr-gw-status','No disponible: '+e.message)}};
 const randB64=arr=>{let s='';for(const c of arr)s+=String.fromCharCode(c);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
 const sha256=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
 const callback=APP_ORIGIN+location.pathname;
 $('mrr-auth').onclick=async()=>{
  const client=$('mrr-client-id').value.trim();
  if(!/^[A-Za-z0-9_-]{8,180}$/.test(client)){status('mrr-auth-status','Introduce primero el Client ID público de tu aplicación Auth0 SPA.');return}
  if(!crypto?.subtle){status('mrr-auth-status','OAuth PKCE requiere HTTPS y WebCrypto.');return}
  const verifier=randB64(crypto.getRandomValues(new Uint8Array(32))),state=randB64(crypto.getRandomValues(new Uint8Array(20)));
  sessionStorage.setItem('mrr-pkce',JSON.stringify({verifier,state,client,created:Date.now()}));
  const u=new URL('/authorize',AUTH_DOMAIN);
  u.searchParams.set('client_id',client);u.searchParams.set('response_type','code');
  u.searchParams.set('scope','openid profile read:workflows');u.searchParams.set('audience',GATEWAY);
  u.searchParams.set('redirect_uri',callback);u.searchParams.set('code_challenge_method','S256');u.searchParams.set('code_challenge',randB64(await sha256(verifier)));u.searchParams.set('state',state);
  location.assign(u.href);
 };
 async function finishAuth(){
  const u=new URL(location.href);
  const hasResult=u.searchParams.has('code')||u.searchParams.has('error');
  if(!hasResult)return;
  const code=u.searchParams.get('code'),state=u.searchParams.get('state'),err=u.searchParams.get('error');
  u.searchParams.delete('code');u.searchParams.delete('state');u.searchParams.delete('error');u.searchParams.delete('error_description');
  history.replaceState(null,'',u.pathname+u.search+(u.hash||'#automatizaciones'));
  if(err){status('mrr-auth-status','Auth0 rechazó la autorización: '+err);return}
  let saved;try{saved=JSON.parse(sessionStorage.getItem('mrr-pkce')||'null');}catch{}
  sessionStorage.removeItem('mrr-pkce');
  if(!code||!saved||state!==saved.state||Date.now()-saved.created>600000){status('mrr-auth-status','Inicio de sesión expirado o verificación PKCE inválida.');return}
  try{
   const body=new URLSearchParams({grant_type:'authorization_code',client_id:saved.client,code_verifier:saved.verifier,code,redirect_uri:callback});
   const v=await getJSON(AUTH_DOMAIN+'/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});
   if(!v.access_token||!Number(v.expires_in))throw Error('Sin token válido');
   access=v.access_token;expires=Date.now()+Math.min(Number(v.expires_in),3600)*1000-30000;
   status('mrr-auth-status','Autorizado en este dispositivo. Token solo en memoria; vuelve a iniciar sesión al recargar.');
   B.show('automatizaciones');
  }catch(e){status('mrr-auth-status','Error de token: '+e.message+'. Revisa Allowed Web Origins y Callback URLs de Auth0.')}
 }
 $('mrr-logout').onclick=()=>{access='';expires=0;keyMemory='';knownRevision=null;localSnapshot='';$('mrr-passphrase').value='';status('mrr-auth-status','Sesión local cerrada.');status('mrr-sync-status','Sincronización detenida.');};
 const authorized=()=>{if(!access||Date.now()>=expires){access='';throw Error('Inicia sesión Auth0 de nuevo');}return {Authorization:'Bearer '+access}};
 const payload=()=>({version:1,app:B.getData(),economy:JSON.parse(localStorage.getItem('morrison-v1-economia')||'null')});
 const snapString=()=>JSON.stringify(payload());
 const b64=arr=>{let s='';for(const c of arr)s+=String.fromCharCode(c);return btoa(s)};
 const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const derive=async(pass,salt,usage)=>{const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,[usage])};
 async function encrypt(str,pass){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await derive(pass,salt,'encrypt');return {version:1,salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(str))))}};
 async function decrypt(item,pass){if(item?.version!==1||typeof item?.data!=='string')throw Error('Formato incompatible');const salt=unb64(item.salt),iv=unb64(item.iv),data=unb64(item.data);if(salt.length!==16||iv.length!==12||data.length>1000000)throw Error('Archivo cifrado inválido');const key=await derive(pass,salt,'decrypt');return new TextDecoder('utf-8',{fatal:true}).decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data))};
 const pass=()=>{const v=$('mrr-passphrase').value;if(v.length<12)throw Error('Introduce una frase de cifrado de 12 caracteres o más');keyMemory=v;return v};
 const remote=()=>GATEWAY+'/morrison/v1/snapshot';
 async function inspect(){const x=await getJSON(remote(),{headers:authorized()});knownRevision=Number(x.revision)||0;status('mrr-sync-status',x.exists?'Existe copia cifrada remota (revisión '+knownRevision+'). No se han descargado datos todavía.':'No existe copia remota. Puedes subir la primera copia cifrada.');return x}
 $('mrr-sync-check').onclick=async()=>{try{await inspect()}catch(e){status('mrr-sync-status','No se pudo consultar: '+e.message)}};
 async function sendCurrent(force=false){
  const phrase=pass();
  if(knownRevision===null)throw Error('Pulsa primero «Consultar respaldo remoto»');
  const text=snapString();
  if(text.length>650000)throw Error('Datos demasiado grandes');
  if(!force && localSnapshot && localSnapshot===text)return;
  const encrypted=await encrypt(text,phrase);
  const x=await getJSON(remote(),{method:'PUT',headers:{...authorized(),'Content-Type':'application/json'},body:JSON.stringify({expectedRevision:knownRevision,payload:encrypted})});
  knownRevision=x.revision;localSnapshot=text;
  status('mrr-sync-status','Copia cifrada guardada (revisión '+knownRevision+'). No se envió la contraseña.');
 }
 $('mrr-sync-up').onclick=async()=>{try{
  if(knownRevision===null)await inspect();
  if(!confirm('¿Subir un respaldo CIFRADO de este dispositivo? Si cambió el remoto, se rechazará para evitar pérdida de datos.'))return;
  await sendCurrent(true)
 }catch(e){status('mrr-sync-status',e.status===409?'Conflicto: el remoto cambió. No se sobrescribió nada. Revisa ambos equipos.':'No se pudo subir: '+e.message)}};
 function applyRemote(raw,revision){
  const data=JSON.parse(raw);
  if(data.version!==1||!data.app||!Array.isArray(data.app.projects)||!Array.isArray(data.app.tasks)||!Array.isArray(data.app.notes))throw Error('Respaldo remoto incompatible');
  if(!B.replaceData?.(data.app))throw Error('La aplicación no aceptó el respaldo');
  if(data.economy&&data.economy.version===1&&Array.isArray(data.economy.entries)){
   if(!window.MORRISON_FINANCE_BRIDGE?.replaceData?.(data.economy))throw Error('El módulo de economía no aceptó el respaldo');
  }
  knownRevision=Number(revision)||0;localSnapshot=snapString();
 }
 async function receive(){
  const phrase=pass(),x=await getJSON(remote(),{headers:authorized()});
  if(!x.exists)throw Error('No hay copia remota');
  const raw=await decrypt(x.payload,phrase);
  if(!confirm('¿REEMPLAZAR los datos locales de este dispositivo con el respaldo remoto descifrado? Haz un respaldo local antes de continuar.'))return;
  applyRemote(raw,x.revision);
  status('mrr-sync-status','Copia remota restaurada y panel actualizado (revisión '+knownRevision+').');
 }
 $('mrr-sync-down').onclick=async()=>{try{await receive()}catch(e){status('mrr-sync-status','No se pudo restaurar: '+e.message)}};
 $('mrr-autosync').onchange=()=>{autoEnabled=$('mrr-autosync').checked;localStorage.setItem(SYNC_FLAG,autoEnabled?'yes':'no');status('mrr-sync-status',autoEnabled?'Auto-sync preparado. Requiere sesión, frase de cifrado y comprobación inicial; se detendrá ante cambios remotos.':'Sincronización automática desactivada.')};
 async function tick(){
  if(!autoEnabled||document.hidden||autoBusy||!access||Date.now()>expires||!keyMemory||knownRevision===null||!localSnapshot)return;
  autoBusy=true;
  try{
   const local=snapString(),server=await getJSON(remote(),{headers:authorized()});
   if(Number(server.revision)!==knownRevision){
    if(local!==localSnapshot){
      autoEnabled=false;$('mrr-autosync').checked=false;localStorage.setItem(SYNC_FLAG,'no');
      status('mrr-sync-status','Conflicto entre equipos: ambos cambiaron. Sincronización detenida sin sobrescribir datos.');return;
    }
    if(!server.exists){autoEnabled=false;$('mrr-autosync').checked=false;localStorage.setItem(SYNC_FLAG,'no');status('mrr-sync-status','El respaldo remoto ya no existe.');return;}
    const raw=await decrypt(server.payload,keyMemory);
    applyRemote(raw,server.revision);
    status('mrr-sync-status','Datos nuevos recibidos automáticamente (revisión '+knownRevision+').');
   }else if(local!==localSnapshot){await sendCurrent()}
  }catch(e){autoEnabled=false;$('mrr-autosync').checked=false;localStorage.setItem(SYNC_FLAG,'no');status('mrr-sync-status','Sincronización pausada por seguridad: '+e.message);}
  finally{autoBusy=false}
 }
 setInterval(tick,45000);
 const today=()=>new Date().toLocaleDateString('en-CA');
 function due(){const now=today();return B.getData().tasks.filter(t=>!t.done&&/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')&&t.date<=now)}
 $('mrr-alert-check').onclick=()=>{const tasks=due();status('mrr-alert-status',tasks.length?tasks.length+' tarea(s) para hoy o vencidas: '+tasks.slice(0,5).map(t=>t.name).join(' · '):'No hay tareas vencidas con fecha.');if(tasks.length&&typeof B.speak==='function')B.speak('Tienes '+tasks.length+' tareas pendientes con fecha vencida o de hoy.')};
 $('mrr-alert-enable').onclick=async()=>{if(!('Notification' in window)){status('mrr-alert-status','El navegador no admite notificaciones.');return}const result=await Notification.requestPermission();status('mrr-alert-status',result==='granted'?'Notificaciones permitidas mientras MORRISON está abierto.':'No se concedieron permisos.');};
 function checkAlerts(){if(document.hidden||!('Notification' in window)||Notification.permission!=='granted')return;const tasks=due();if(!tasks.length)return;const stamp=today(),key='mrr-alerted-'+stamp;try{if(localStorage.getItem(key)==='yes')return;new Notification('MORRISON · Agenda',{body:tasks.length+' tarea(s) por revisar',tag:'morrison-agenda'});localStorage.setItem(key,'yes')}catch(_){}}
 setInterval(checkAlerts,60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkAlerts()});
 if($('healthUrl')&&!$('healthUrl').value)$('healthUrl').value=GATEWAY+'/morrison/v1/health';
 finishAuth().catch(e=>status('mrr-auth-status','Error de autorización: '+e.message));
})();
