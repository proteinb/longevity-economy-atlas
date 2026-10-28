import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
const ids=['care-bed','smart-toilet','smoke-alarm','accessible-shower'];const read=p=>readFileSync(p,'utf8');
const geometry=s=>JSON.stringify(s.parts.map(({id,parent,mesh,at,rot,scale,anchor})=>({id,parent,mesh,at,rot,scale,anchor})));
const results=[];
const baseline=JSON.parse(read('model-source/sketch/baseline.json'));
for(const id of ids){
 const source=read(`model-source/sketch/${id}.html`),rawScripts=[...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 assert.equal(createHash('sha256').update(source).digest('hex'),baseline.files[id].sha256,`${id}: canonical baseline changed`);
 const c=createContext({});runInContext(rawScripts.find(s=>s.includes('root.Sketch3D =')),c);c.Sketch3D.mount=(_,f)=>c.scene=f(c.Sketch3D.S,c.Sketch3D.M);runInContext(rawScripts.find(s=>s.includes("\nSketch3D.mount('#app'")),c);
 const module=await import(`../models/${id}.js`),scene=module.createScene();assert.equal(geometry(scene),geometry(c.scene),`${id}: geometry/kinematics registry changed`);
 const js=read(`models/${id}.js`);assert(!js.includes('Sketch3D.last'));assert(!js.includes('document.documentElement.dataset'));
 const before=geometry(scene);for(let n=0;n<=720;n++){const poses={};scene.animate(n/720,{u:n/720,t:n*scene.cycle/720,step:0,stepU:0,xray:0,set:(key,p)=>poses[key]=p,flow(){},view(){}});for(const p of Object.values(poses))for(const v of Object.values(p))if(Array.isArray(v))v.forEach(x=>assert(Number.isFinite(x)));}assert.equal(geometry(scene),before);
 const engine=rawScripts.find(s=>s.includes('root.Sketch3D =')),matrix=engine.slice(engine.indexOf('  const add ='),engine.indexOf('  const AXIS =')),worlds=engine.slice(engine.indexOf('    function worlds(e)'),engine.indexOf('    /* —— 取景'));
 const vectors=JSON.parse(engine.match(/const explodeVectors=(\{[^;]+\});/)[1]),parts=scene.parts.map(p=>({id:p.id,def:{...p,explode:vectors[p.id]||p.explode||[0,0,0]}})),byId=Object.fromEntries(parts.map(p=>[p.id,p]));parts.forEach(p=>p.parent=p.def.parent?byId[p.def.parent]:null);const order=[],seen=new Set();function visit(p){if(seen.has(p))return;if(p.parent)visit(p.parent);seen.add(p);order.push(p);}parts.forEach(visit);const w=createContext({order,poses:{}});runInContext('const D2R=Math.PI/180;'+matrix+worlds,w);runInContext('worlds(0)',w);const closed=JSON.stringify(parts.map(p=>p.W));for(let n=0;n<50;n++){runInContext('worlds(1);worlds(0)',w);assert.equal(JSON.stringify(parts.map(p=>p.W)),closed);}for(const t of [.25,.5,.75]){runInContext(`worlds(${t})`,w);parts.forEach(p=>p.W.forEach(x=>assert(Number.isFinite(x))));}
 const methods=js.slice(js.indexOf('    const ctl = {')+19,js.indexOf('      get u()',js.indexOf('    const ctl = {')));
 const pointer=js.slice(js.indexOf('    const ptrs ='),js.indexOf("    cv.addEventListener('pointerleave'"));
 const gesture=createContext({handlers:{},cv:{setPointerCapture(){},addEventListener(k,f){gesture.handlers[k]=f;}},stage:{getBoundingClientRect:()=>({left:0,top:0}),focus(){},classList:{add(){},remove(){}}}});
 runInContext('let yaw=0,pitch=0,zoom=1,vyaw=0,vpitch=0,camGoal=null,idle=0,pinned=null;const bake=()=>{},clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=()=>({id:"part"}),showNote=()=>{};'+pointer,gesture);
 const pt=(pointerId,clientX,clientY,type='pointerup')=>({pointerId,clientX,clientY,type});gesture.handlers.pointerdown(pt(1,10,10));gesture.handlers.pointerdown(pt(2,60,10));gesture.handlers.pointermove(pt(2,110,10));assert.equal(runInContext('zoom',gesture),2);gesture.handlers.pointercancel(pt(1,10,10,'pointercancel'));gesture.handlers.pointercancel(pt(2,110,10,'pointercancel'));assert.equal(runInContext('ptrs.size',gesture),0);gesture.handlers.pointerdown(pt(1,10,10));gesture.handlers.pointermove(pt(1,70,30));gesture.handlers.pointerup(pt(1,70,30));assert.equal(runInContext('pinned',gesture),null);gesture.handlers.pointerdown(pt(1,10,10));gesture.handlers.pointerup(pt(1,10,10));assert.equal(runInContext('pinned.id',gesture),'part');
 const st=createContext({structuredClone,URLSearchParams,visibilityHandler(){},document:{removeEventListener(){st.listenerRemoved=true;}},byId:{p:{id:'p'}},steps:[{from:0,to:.5},{from:.5,to:1}],pbs:[{id:'one'}],sizeObserver:{disconnect(){st.disconnected=true;}},lifecycle:{abort(){st.aborted=true;}},host:{replaceChildren(){st.removed=true;}},wrap:{dataset:{}},cancelAnimationFrame(){st.cancelled=true;},clearTimeout(){},syncButtons(){},showNote(){},setU(x){runInContext(`u=uAbs=${x};expl=expT=0`,st);},audit:()=>({ok:true,scope:'mock audit target'}),clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
 const prefix='let allPlayback=true,allFinished=false;function cancelAll(){};let u=.27,uAbs=.27,expl=.4,expT=.4,yaw=14,pitch=28,zoom=1.3,xray=.8,xrayT=1,labelMode=0,pinned=byId.p,playing=true,speedIx=0,focusGoal=[1,2,3],focusCur=[1,2,3],viewHold=false,camGoal=null,vyaw=0,vpitch=0,sway=0,lastStep=0,mode="buttons",done=new Set(["one"]),curSeg=pbs[0],destroyed=false,raf=1,toastT=0,reduce=true;';
 // Run the emitted snapshot/restore/destroy implementations with isolated state.
 runInContext(prefix+'const ctl={'+methods+'xray(v){xray=xrayT=v?1:0},explode(v){expl=expT=v;playing=false},play(v){playing=v}};const saved=ctl.snapshot();playing=false;u=.9;yaw=100;ctl.restore(saved);',st);
 assert.equal(runInContext('u',st),.27);assert.equal(runInContext('yaw',st),14);assert.equal(runInContext('expl',st),.4);assert.equal(runInContext('playing',st),false,'return must not restart playback');assert.equal(runInContext('allPlayback',st),true,'return preserves pending sequence for explicit continue');
 runInContext('ctl.query(new URLSearchParams("step=2&xr=1&play=0&explode=.6"))',st);assert.equal(runInContext('expl',st),.6);assert.equal(runInContext('xray',st),1);assert.equal(runInContext('playing',st),false);
 runInContext('ctl.query(new URLSearchParams("play=1"))',st);assert.equal(runInContext('playing',st),false,'reduced motion cannot autoplay from URL');
 const handler=js.match(/function setExplosion\(value,immediate=false\)\{([^}]+)\}/)[0];const reduced=createContext({reduce:true,cancelAll(){},view0:{zoom:1},syncButtons(){},clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});runInContext('let playing=true,expT=0,expl=0,labelMode=1,camGoal={},focusGoal={},zoom=2,lastViewKey="x";'+handler+';setExplosion(.6);',reduced);assert.equal(runInContext('expl',reduced),.6);assert.equal(runInContext('playing',reduced),false);
 runInContext('ctl.destroy();ctl.destroy()',st);assert(st.disconnected&&st.aborted&&st.removed&&st.cancelled&&st.listenerRemoved);
 for(const p of scene.parts)assert(/^#[0-9a-f]{6}$/i.test(p.color));
 results.push({id,parts:parts.length,geometrySha256:createHash('sha256').update(before).digest('hex'),poses:721,reversals:50});
}
for(const f of ['site.js','semantic.js','catalog.js',...ids.map(id=>'models/'+id+'.js')])assert.equal(spawnSync(process.execPath,['--check',f]).status,0,f);
const home=read('index.html');assert(!home.includes('iframe'));assert(!home.includes('interactive-model'));assert(home.includes('cards/care-bed.png'));assert(home.indexOf('id="figures"')<home.indexOf('id="sources"'));
for(const id of ids)assert(existsSync(`cards/${id}.png`),`missing real model capture ${id}`);
for(const f of ['fonts/aging-hand-subset.ttf','fonts/aging-caveat-subset.ttf','licenses/fonts/zcool-OFL.txt','licenses/fonts/caveat-OFL.txt'])assert(existsSync(f),f);
for(const [key,m]of Object.entries(JSON.parse(read('licenses/fonts/manifest.json')))){const file='fonts/'+(key==='zcool'?'aging-hand-subset.ttf':'aging-caveat-subset.ttf');assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),m.subset_sha256);}
let links=0;for(const page of ['index.html','product.html','care-bed.html','figures/smart-toilet.html','figures/smoke-alarm.html','figures/accessible-shower.html','atlas.html'])for(const m of read(page).matchAll(/(?:href|src)="([^"\s]+)"/g)){const u=m[1];if(/^(https?:|data:|mailto:)/.test(u))continue;const [raw,hash]=u.split('#'),path=decodeURIComponent(raw.split('?')[0]);const target=path==='/'?resolve('index.html'):path.startsWith('/')?resolve('.'+path):path?resolve(dirname(page),path):resolve(page);assert(existsSync(target),`${page} missing ${u}`);if(hash&&target.endsWith('.html'))assert(read(target).includes(`id="${hash}"`),`${page} missing #${hash}`);links++;}
assert(!/<iframe/i.test(read('care-bed.html')));assert(!read('site.js').includes('Sketch3D.last'));
for(const p of JSON.parse(read('content/products.json'))){assert.equal(p.points.length,3);p.sources.forEach(s=>['kind','version','date','scope','clause','status'].forEach(k=>assert(s[k])));}
console.log(`PASS ${links} local links/anchors and font hashes; Agingbuy 2.1:`,JSON.stringify(results));

await import('./verify-play-all.mjs');
