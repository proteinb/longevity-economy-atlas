import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,createContext,runInContext} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const bed=runInNewContext(read('model-source/model.js')+';({explodedPosition,EXPLODE_VECTORS})');
for(const vector of Object.values(bed.EXPLODE_VECTORS)){
 const base=[1.25,-2,3.5];for(let i=0;i<1000;i++){
  assert.deepEqual([...bed.explodedPosition(base,vector,0)],base);
  assert.deepEqual([...bed.explodedPosition(base,vector,1)],base.map((n,j)=>n+vector[j]));
 }assert.deepEqual([...bed.explodedPosition(base,vector,.5)],base.map((n,j)=>n+vector[j]*.5));
}
for(const name of ['smart-toilet','smoke-alarm','accessible-shower']){
 const html=read(`figures/${name}.html`),scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const context=createContext({});runInContext(scripts[0],context);
 context.Sketch3D.mount=(_target,make)=>{context.scene=make(context.Sketch3D.S,context.Sketch3D.M);};
 runInContext(scripts[1],context);
 const vectors=JSON.parse(html.match(/const explodeVectors=(\{[^;]+\});/)[1]);
 for(const id of Object.keys(vectors))assert(context.scene.parts.some(p=>p.id===id),`${name}: missing ${id}`);
 const engine=scripts[0],matrix=engine.slice(engine.indexOf('  const add ='),engine.indexOf('  const AXIS ='));
 const worlds=engine.slice(engine.indexOf('    function worlds(e)'),engine.indexOf('    /* —— 取景'));
 const parts=context.scene.parts.map(p=>({id:p.id,def:{...p,explode:vectors[p.id]||[0,0,0]}}));
 const ctx=createContext({order:parts,poses:{}});runInContext('const D2R=Math.PI/180;'+matrix+worlds,ctx);
 runInContext('worlds(0)',ctx);const baseline=JSON.stringify(parts.map(p=>p.W));
 for(let i=0;i<50;i++){runInContext('worlds(1);worlds(0)',ctx);assert.equal(JSON.stringify(parts.map(p=>p.W)),baseline,`${name}: drift`);}
 runInContext('worlds(.5)',ctx);assert.notEqual(JSON.stringify(parts.map(p=>p.W)),baseline);
 // Exercise the actual reduced-motion handler without a browser or a real iPhone claim.
 const set=engine.match(/function setExplosion\(value,immediate=false\)\{([^}]+)\}/)[0];
 const reduced=runInNewContext(`let playing=true,expT=0,expl=0,labelMode=1,camGoal={},focusGoal={},zoom=2,lastViewKey='x';const view0={zoom:1},reduce=true,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),syncButtons=()=>{};${set};setExplosion(.7);({playing,expl,expT,labelMode})`);
 assert.equal(reduced.playing,false);assert.equal(reduced.expl,.7);assert.equal(reduced.expT,.7);
 const pointerCode=engine.slice(engine.indexOf('    const ptrs ='),engine.indexOf("    cv.addEventListener('pointerleave'"));
 const gesture=createContext({handlers:{},cv:{setPointerCapture() {},addEventListener(k,f){gesture.handlers[k]=f;}},stage:{getBoundingClientRect:()=>({left:0,top:0}),focus(){},classList:{add(){},remove(){}}}});
 runInContext('let drag=0,yaw=0,pitch=0,zoom=1,vyaw=0,vpitch=0,camGoal=null,idle=0,pinned=null;const bake=()=>{},clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),pick=()=>({id:"part"}),showNote=()=>{};'+pointerCode,gesture);
 const point=(pointerId,clientX,clientY,type='pointerup')=>({pointerId,clientX,clientY,type});
 gesture.handlers.pointerdown(point(1,20,20));gesture.handlers.pointerdown(point(2,70,20));gesture.handlers.pointermove(point(2,120,20));
 assert.equal(runInContext('zoom',gesture),2,'two-pointer pinch zoom');
 gesture.handlers.pointercancel(point(1,20,20,'pointercancel'));gesture.handlers.pointercancel(point(2,120,20,'pointercancel'));
 assert.equal(runInContext('ptrs.size',gesture),0);assert.equal(runInContext('pinned',gesture),null);
 gesture.handlers.pointerdown(point(1,20,20));gesture.handlers.pointermove(point(1,80,40));gesture.handlers.pointerup(point(1,80,40));assert.equal(runInContext('pinned',gesture),null,'drag must not select');
 gesture.handlers.pointerdown(point(1,20,20));gesture.handlers.pointerup(point(1,20,20));assert.equal(runInContext('pinned.id',gesture),'part','tap selects');
}
const gallery=read('gallery.js');assert(!gallery.includes('items.at('));
const handler=gallery.match(/b.onkeydown=(e=>\{[\s\S]*?)\n \};/)[1]+'\n }';
const items=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];items.at=undefined;
const ctx={items,current:items[0],neighbor:()=>items[1],render:x=>{ctx.selected=x.id;}};
runInNewContext('const keydown='+handler+';keydown({key:"End",preventDefault(){}})',ctx);assert.equal(ctx.selected,'d');
console.log('PASS: real geometry registries; 1,000 bed reversals / 50 matrix reversals per imported model; half offsets; reduced-motion immediate state; legacy End key.');
