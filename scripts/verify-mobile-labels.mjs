import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
for(const path of ['care-bed.html','figures/smart-toilet.html','figures/smoke-alarm.html','figures/accessible-shower.html']){
 const html=readFileSync(path,'utf8'),scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const engine=scripts.find(s=>s.includes('root.Sketch3D =')),ctx=createContext({});runInContext(engine,ctx);
 ctx.Sketch3D.mount=(_,make)=>ctx.scene=make(ctx.Sketch3D.S,ctx.Sketch3D.M);
 runInContext(scripts.find(s=>s.includes("\nSketch3D.mount('#app'")),ctx);
 const labeled=ctx.scene.parts.filter(p=>p.label);assert(labeled.length>0);
 assert(engine.includes('wrap.insertBefore(partPanel,stage.nextSibling)'),'name key must be immediately after drawing');
 assert(html.includes('.sk.compact .sk-part-name{display:block'));
 assert(html.includes('min-height:44px'));
 assert(!engine.includes('new IntersectionObserver'),'sandbox intersection cannot blank the drawing');
 const fn=engine.slice(engine.indexOf('    function showNote(P)'),engine.indexOf('\n    }',engine.indexOf('    function showNote(P)'))+6);
 const state=createContext({partName:{dataset:{}},caption:{appendChild(){},innerHTML:''},el:(_a,_b,text)=>({text,style:{setProperty(){}}}),css:()=>'',mixc:()=>[],WHITE:[],lastStep:0,document:{createTextNode:x=>x}});
 runInContext(fn,state);
 labeled.forEach((p,i)=>{state.P={...p,no:i+1,base:[],def:p};runInContext('showNote(P)',state);assert.equal(state.partName.textContent,`${i+1} · ${p.label}`);assert.equal(state.partName.dataset.partId,p.id);});
 state.P={id:'child',def:{},parent:{id:'parent',label:'父部件',no:1,def:{}}};runInContext('showNote(P)',state);assert.equal(state.partName.textContent,'1 · 父部件');
 console.log(`PASS: ${path}: ${labeled.length} Chinese names match numbered parts; non-hover name card; adjacent key; unnamed child fallback.`);
}
