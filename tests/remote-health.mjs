import assert from 'node:assert/strict';
const base='https://bitcultura-n8n-mcp-production.up.railway.app';
const get=async (p,opts={})=>{
 const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),12000);
 try{return await fetch(base+p,{signal:ac.signal,redirect:'error',...opts})}finally{clearTimeout(timer)}
};
let res,err;
for(let i=0;i<3;i++){
 try{res=await get('/morrison/v1/health');if(res.ok)break;err=new Error('health status '+res.status);}
 catch(e){err=e}
 await new Promise(r=>setTimeout(r,1500));
}
assert.ok(res?.ok,'MORRISON public health failed: '+err);
const h=await res.json();
assert.equal(h.system,'MORRISON');assert.equal(h.status,'ready');assert.equal(h.readonly,true);
res=await get('/morrison/v1/snapshot');
assert.equal(res.status,401,'Snapshot must require OAuth');
res=await get('/morrison/v1/snapshot',{method:'OPTIONS',headers:{Origin:'https://bitcultura.github.io','Access-Control-Request-Method':'PUT','Access-Control-Request-Headers':'authorization,content-type'}});
assert.equal(res.status,204);assert.equal(res.headers.get('access-control-allow-origin'),'https://bitcultura.github.io');
res=await get('/morrison/v1/health',{headers:{Origin:'https://evil.example'}});
assert.equal(res.status,403,'Unknown origins must be rejected');
console.log('MORRISON gateway: public health true, sync protected by JWT, exact-origin CORS, unsafe origins blocked');
