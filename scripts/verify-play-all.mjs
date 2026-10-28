import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
function fn(js,name){
 const start=js.indexOf(`function ${name}(`);assert(start>=0,`${name}: all-step playback missing`);
 let i=js.indexOf('{',start),depth=1;for(i++;depth;i++){if(js[i]==='{')depth++;if(js[i]==='}')depth--;}
 return js.slice(start,i);
}
for(const id of ['care-bed','smart-toilet','smoke-alarm','accessible-shower']){
 const js=readFileSync(`models/${id}.js`,'utf8'),scene=(await import(`../models/${id}.js`)).createScene();
 const steps=scene.steps.map((s,i,a)=>({...s,from:s.from??i/a.length,to:s.to??(i+1)/a.length}));
 const pbs=(scene.buttons||[]).map((b,i)=>({...b,from:steps[i].from,to:steps[i].to}));
 const c=createContext({steps,pbs,cycle:scene.cycle,SPEEDS:[1,.5,.25,2],allButtons:[],allStatus:{},wrap:{dataset:{}},syncButtons(){},resetView(){}});
 runInContext('let allPlayback=false,allFinished=false,playing=false,u=0,uAbs=0,expl=1,expT=1,viewHold=true,camGoal={},focusGoal={},lastViewKey="",lastStep=0,pinned={},curSeg=null,mode="buttons",speedIx=0;const done=new Set();'+['cancelAll','startAll','advanceAll','syncAll'].map(n=>fn(js,n)).join('\n'),c);
 const get=x=>runInContext(x,c);get('startAll()');assert(get('playing && allPlayback && u===0 && expl===0'));
 get('advanceAll(.5);playing=false');const paused=get('u');get('advanceAll(10)');assert.equal(get('u'),paused,'pause must hold');get('playing=true');
 get('startAll();advanceAll(.2);startAll()');assert.equal(get('u'),0,'repeated selection restarts one timeline');
 const visited=new Set();for(let n=0;n<2000&&get('playing');n++){get('advanceAll(.05)');visited.add(steps.findIndex(s=>get('u')>=s.from&&get('u')<s.to));}
 assert.deepEqual([...visited].sort(),steps.map((_,i)=>i),`${id}: all steps must play`);
 assert(get('!playing&&!allPlayback&&allFinished&&u===.9999'),`${id}: finish once without wrapping`);
 const end=get('u');get('advanceAll(100)');assert.equal(get('u'),end);
 if(pbs.length)assert.equal(get('done.size'),pbs.length);
 get('startAll();advanceAll(.5);cancelAll()');assert(get('!allPlayback&&!allFinished'));get('playing=false');const canceled=get('u');get('advanceAll(2)');assert.equal(get('u'),canceled);
 assert(js.includes('allPlayback,allFinished'),'snapshot must include playback intent');
 assert(js.includes('allPlayback=!!s.allPlayback;allFinished=!!s.allFinished'),'restore preserves pending sequence while paused');
 for(const name of ['setU','setExplosion'])assert(fn(js,name).includes('cancelAll()'),`${name} cancels sequence`);
 if(pbs.length)for(const name of ['press','setMode'])assert(fn(js,name).includes('cancelAll()'),`${name} cancels sequence`);
 assert(js.includes('if(allPlayback) advanceAll(dt);'),'uses existing RAF, no competing timer');
 assert(!/setInterval\(/.test(js));assert(js.includes("'全选'"));
 console.log(`PASS ${id}: ${steps.length} ordered steps, pause/resume, restart, cancel, one-shot completion`);
}
