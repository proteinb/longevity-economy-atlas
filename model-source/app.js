const {THREE,createViewer}=ColorAnatomy;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function boot(){
const host=$('#stage'),v=createViewer(host);
v.renderer.domElement.setAttribute('aria-label','护理床三维交互示意；拖动或方向键旋转，加减键缩放');
v.controls.target.set(0,1.9,0);v.view('home');v.controls.addEventListener('change',()=>{document.documentElement.dataset.camera=v.camera.position.toArray().map(n=>n.toFixed(3)).join(',');document.documentElement.dataset.zoom=String(v.camera.zoom);});
const state={time:0,running:false,shell:'closed',selected:null,labels:true,explode:0,target:0};
const descriptions={home:['家居外观','木色围板与轻盈配色，是本次外观探索的方向。材质为视觉示意。'],back:['活动靠背','靠背抬起与放平仅演示交互。转轴、角度和动作速度不代表真实产品。'],remote:['手控器','用页面按钮体验动作。手控器只画外形占位，未指定真实按键和控制逻辑。'],surface:['清洁表面','平整表面与少缝隙是待验证的设计目标；未验证材质、拆洗方式或消毒兼容性。']};
Object.assign(descriptions,{head:['床头围板','外观围板的概念拆解，不代表真实装配顺序。'],foot:['床尾围板','外观围板示意。'],rail:['侧扶栏','侧扶栏外形示意，未核验防护效果。'],wheels:['脚轮','脚轮外形示意，未核验制动结构。'],pillow:['枕垫','软垫外形示意。'],leg:['腿部软垫','分段软垫示意，未核验材质。']});
const extra=Object.fromEntries(['head','foot','rail','wheels','pillow','leg'].map(id=>[id,v.part(id,descriptions[id])]));
const home=v.part('home',descriptions.home),back=v.part('back',descriptions.back),remote=v.part('remote',descriptions.remote),surface=v.part('surface',descriptions.surface);
const box=(w,h,d,c,g,p)=>v.solid(new THREE.BoxGeometry(w,h,d),c,g,p);
const cylinder=(r,h,c,g,p)=>v.solid(new THREE.CylinderGeometry(r,r,h,24),c,g,p);
// Only exterior forms and a generic support deck. No inferred internal mechanism.
box(8.2,.35,4.1,'#a6d8ca',home,[0,1.35,0]);
for(const x of [-3.35,3.35])for(const z of [-1.5,1.5]){
 box(.22,.75,.22,'#8dafa8',home,[x,.8,z]);
 const wheel=cylinder(.25,.17,'#617579',extra.wheels,[x,.29,z]);wheel.rotation.x=Math.PI/2;
}
box(.24,2.35,4.15,'#dfbd8d',extra.head,[-4.12,2.05,0]);
box(.24,1.45,4.15,'#dfbd8d',extra.foot,[4.12,1.6,0]);
for(const z of [-2.04,2.04])box(7.95,.42,.15,'#e9cfaa',home,[0,1.5,z]);
// Segmented exterior mattress and deck rotate together from one pose.
back.position.set(-.7,1.72,0);
box(3.25,.12,3.9,'#bad4cd',back,[-1.625,0,0]);
const backPad=box(3.25,.38,3.72,'#9bcabc',back,[-1.625,.25,0]);
box(1.4,.12,3.9,'#bad4cd',home,[0,1.72,0]);
const seatPad=box(1.35,.38,3.72,'#b2ddce',surface,[0,1.97,0]);
box(3.25,.12,3.9,'#bad4cd',home,[2.325,1.72,0]);
const legPad=box(3.15,.38,3.72,'#b2ddce',extra.leg,[2.3,1.97,0]);
back.add(extra.pillow);
const pillow=box(.88,.19,2.8,'#f4ead6',extra.pillow,[-2.5,.54,0]);
// Illustrative side support bar, with no asserted safety effect.
for(const z of [-2.08,2.08]){box(2.8,.18,.16,'#d7e8df',extra.rail,[-.55,2.6,z]);for(const x of [-1.8,.7])box(.12,.73,.12,'#d7e8df',extra.rail,[x,2.18,z]);}
const handset=box(.51,.85,.20,'#ef9171',remote,[.85,2.23,2.22]);handset.rotation.z=.12;
const cord=new THREE.CatmullRomCurve3([new THREE.Vector3(.85,1.8,2.22),new THREE.Vector3(.9,1,2.25),new THREE.Vector3(1.25,1.25,2)]);
v.solid(new THREE.TubeGeometry(cord,20,.025,6,false),'#617579',remote);
function anchor(g,p){const a=new THREE.Object3D();a.position.set(...p);g.add(a);return a;}
v.tag('home','底架',anchor(home,[4.25,2.2,.5]),[15,-45]);
v.tag('back','活动靠背',anchor(back,[-2,.5,1]),[-90,-55]);
v.tag('remote','手控器',anchor(remote,[.85,2.7,2.3]),[20,-30]);
v.tag('surface','清洁表面',anchor(surface,[2.5,2.2,1.1]),[18,18]);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshBasicMaterial({color:'#bed1c7',transparent:true,opacity:.3,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(4.6,2.3,1);shadow.position.set(0,.01,0);v.scene.add(shadow);
for(const id of Object.keys(extra)){v.tag(id,descriptions[id][0],anchor(extra[id],{head:[-4.2,3,0],foot:[4.2,2.2,0],rail:[-.5,2.6,2],wheels:[3.35,.3,-1.5],pillow:[-2.5,.7,0],leg:[2.3,2.2,0]}[id]),[12,-24]);}
const assemblies={home,back,remote,surface,...extra};const bases=Object.fromEntries(Object.entries(assemblies).map(([id,g])=>[id,g.position.toArray()]));
let lastFit=1;
function applyExplosion(){const fit=1/(1+.6*state.explode);v.camera.zoom*=fit/lastFit;lastFit=fit;v.controls.minZoom=.35;v.controls.target.y=1.9+.4*state.explode;v.camera.updateProjectionMatrix();for(const [id,g] of Object.entries(assemblies))g.position.fromArray(explodedPosition(bases[id],EXPLODE_VECTORS[id],state.explode));document.documentElement.dataset.explode=state.explode.toFixed(4);document.documentElement.dataset.transforms=JSON.stringify(Object.fromEntries(Object.entries(assemblies).map(([id,g])=>[id,g.position.toArray()])));}
function inspectView(mode){lastFit=1;v.view(mode);applyExplosion();}
const pads=[backPad,seatPad,legPad,pillow];
function shell(mode){state.shell=mode;const ghost=mode==='ghost';for(const mesh of pads){mesh.material.transparent=ghost;mesh.material.opacity=ghost?.16:1;mesh.material.depthWrite=!ghost;mesh.material.needsUpdate=true;mesh.userData.outline.visible=!ghost;mesh.userData.ink.material.opacity=ghost?.08:.72;}$$('[data-shell]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shell===mode)));$('#shell-note').textContent=ghost?'仅淡化软垫，露出通用承托面；内部传动尚未验证。':'未验证：内部传动、实际按键、尺寸及安全性能。';v.invalidate();}
function select(id){if(!descriptions[id])return;state.selected=id;$('#detail-body').textContent=descriptions[id][1];$$('[data-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.select===id)));sync();}
v.onSelect(select);$$('[data-select]').forEach(b=>b.onclick=()=>select(b.dataset.select));
$$('[data-shell]').forEach(b=>b.onclick=()=>shell(b.dataset.shell));$$('[data-view]').forEach(b=>b.onclick=()=>inspectView(b.dataset.view));
function sync(){document.documentElement.dataset.selected=state.selected||'';applyExplosion();$('#explode').textContent=state.target>0?'合拢':'一键爆炸';$('#explode').setAttribute('aria-pressed',String(state.target>0));$('#explode-range').value=String(Math.round(state.explode*100));$('#explode-value').textContent=Math.round(state.explode*100)+'%';document.documentElement.dataset.time=state.time.toFixed(4);document.documentElement.dataset.running=String(state.running);const pose=poseAt(state.time);back.rotation.z=-pose.back;const active=state.running?['back','remote']:[];v.setActivity(active,state.selected);$$('[data-select]').forEach(b=>b.dataset.active=String(active.includes(b.dataset.select)));$('#play').textContent=state.running?'暂停示意':'播放动作示意';$('#play').setAttribute('aria-pressed',String(state.running));$('#live-status').textContent=state.time===0?'平放 · 选择部件，看看设计关注点。':pose.phase+(state.running?' · 靠背与手控器同时高亮':' · 已暂停');v.invalidate();}
function setExplosion(n){state.running=false;state.target=Math.max(0,Math.min(1,n));if(matchMedia('(prefers-reduced-motion: reduce)').matches)state.explode=state.target;sync();}
$('#explode').onclick=()=>setExplosion(state.target>0?0:1);$('#explode-range').oninput=e=>{setExplosion(Number(e.target.value)/100);state.explode=state.target;sync();};
$('#play').onclick=()=>{if(state.explode>0||state.target>0){state.explode=state.target=0;}if(state.time>=DEMO_DURATION)state.time=0;state.running=!state.running;sync();};
$('#step').onclick=()=>{state.explode=state.target=0;state.running=false;state.time=state.time>=DEMO_DURATION?0:Math.min(DEMO_DURATION,state.time+.6);sync();};
$('#reset').onclick=()=>{Object.assign(state,{time:0,running:false,selected:null,labels:true,explode:0,target:0});$('#labels').checked=true;v.setLabels(true);inspectView('home');shell('closed');$$('[data-select]').forEach(b=>b.setAttribute('aria-pressed','false'));$('#detail-body').textContent='概念外形与动作示意，不代表具体在售产品。';sync();};
$('#labels').onchange=e=>{state.labels=e.target.checked;v.setLabels(state.labels);};$('#zoom-in').onclick=()=>v.zoom(1.15);$('#zoom-out').onclick=()=>v.zoom(1/1.15);
addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='agingbuy:pause'){state.running=false;state.target=state.explode;sync();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.running=false;sync();}});matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{state.running=false;sync();});
let last=performance.now();sync();
function tick(now){const dt=(now-last)/1000;last=now;if(Math.abs(state.explode-state.target)>.0001){state.explode+=Math.sign(state.target-state.explode)*Math.min(Math.abs(state.target-state.explode),Math.min(dt,.1)*1.8);sync();}if(state.running&&!document.hidden){state.time=advance(state.time,dt,true);if(state.time>=DEMO_DURATION)state.running=false;sync();}v.render(state.running||state.explode!==state.target);requestAnimationFrame(tick);}requestAnimationFrame(tick);
const sendSize=()=>parent.postMessage({type:'agingbuy:model-size',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(sendSize).observe(document.body);sendSize();
window.__bedDemo={state,viewer:v,snapshot:()=>({...state,pose:poseAt(state.time),camera:v.camera.position.toArray(),active:[...v.parts].filter(([,p])=>p.active).map(([id])=>id)})};document.documentElement.dataset.ready='true';
}
try{boot();}catch(error){console.error(error);$('#stage').innerHTML='<div class="fallback"><h2>暂时无法显示三维模型</h2><p>设计关注：家居外观、手控操作与清洁表面。此内容为概念示意。</p></div>';$$('button,input').forEach(b=>b.disabled=true);document.documentElement.dataset.ready='error';}
