const revision=new URL(import.meta.url).searchParams.get('v')||'2.1';
import {products} from './catalog.js?v=475b0e8df0a5';
const main=document.querySelector('main');let controller=null,generation=0,templates=null,saved=null,current=null;
const originalHome=location.pathname==='/'||location.pathname.endsWith('/index.html')?main.innerHTML:null;
function cleanup(){generation++;controller?.destroy();controller=null;saved=null;}
async function model(p){
 const ticket=++generation,host=document.querySelector('#model-host');current=p;host.dataset.item=p.id;
 try{
  const module=await import('./models/'+p.id+'.js?v='+encodeURIComponent(revision));if(ticket!==generation)return;
  const slot=document.createElement('div');slot.id='interactive-model';const shadow=slot.attachShadow({mode:'open'}),target=document.createElement('div');shadow.appendChild(target);
  host.appendChild(slot);controller=module.mount(target);host.querySelector('.model-poster')?.remove();host.querySelector('.load-status')?.remove();
  host.dataset.ready='true';const audit=controller.query(new URLSearchParams(location.search));if(audit)showAudit(audit);
  const ret=document.querySelector('#return-view'),message=document.querySelector('#state-message');
  document.querySelectorAll('[data-inspect]').forEach(b=>b.onclick=()=>{if(!saved)saved=controller.snapshot();controller.inspect(p.points[Number(b.dataset.inspect)]);ret.hidden=false;message.textContent='已定位示意部件；动画暂停。';host.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  ret.onclick=()=>{if(saved){controller.restore(saved);saved=null;ret.hidden=true;message.textContent='已返回原视图，保持暂停；可自行继续播放。';}};
  document.querySelector('#run-audit').onclick=()=>{try{showAudit(controller.audit());}catch(e){document.querySelector('#audit-result').textContent='工具检查未完成：'+e.message;}};
 }catch(e){if(ticket!==generation)return;controller?.destroy();controller=null;host.querySelector('#interactive-model')?.remove();const s=host.querySelector('.load-status');s.textContent='交互暂未加载，可继续看静态图与文字。';const retry=document.createElement('button');retry.textContent='重试交互';retry.onclick=()=>location.reload();s.appendChild(retry);host.dataset.error=e.message;}
}
function showAudit(r){document.querySelector('#audit-result').textContent=JSON.stringify({...r,notice:'仅限工具覆盖范围，不是实物认证；仍需人工复核。'},null,2);}
async function navigate(p,{history=true}={}){
 cleanup();const ticket=generation;
 if(!templates){const r=await fetch('/detail-templates.json',{cache:'no-cache'});if(!r.ok)throw Error('详情文本不可用');templates=await r.json();}
 if(ticket!==generation)return;main.innerHTML=templates[p.id];document.title=p.name+' · AgingBuy';if(history){window.history.pushState({},'',p.path);main.scrollIntoView({block:'start',behavior:'auto'});}await model(p);
}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target)return;if(a.dataset.product){e.preventDefault();navigate(products.find(p=>p.id===a.dataset.product)).catch(()=>location.href=a.href);}else if(a.hasAttribute('data-home')&&originalHome){e.preventDefault();cleanup();current=null;main.innerHTML=originalHome;const hash=['#figures','#sources'].includes(a.hash)?a.hash:'';history.pushState({},'','/'+hash);document.title='AgingBuy · 把照护放回生活';(hash?document.querySelector(hash):main).scrollIntoView({block:'start',behavior:'auto'});}});
addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('item');const p=products.find(p=>p.id===id||p.path===location.pathname);if(p)navigate(p,{history:false});else if(originalHome){cleanup();main.innerHTML=originalHome;current=null;}else location.reload();});
addEventListener('pagehide',cleanup);
addEventListener('pageshow',e=>{if(e.persisted&&current)navigate(current,{history:false}).catch(()=>location.reload());});
const query=new URLSearchParams(location.search),initial=products.find(p=>p.id===(query.get('item')||document.body.dataset.product));
if(initial){if(document.body.dataset.product===initial.id&&!query.get('item'))model(initial);else navigate(initial,{history:false}).catch(()=>location.replace(initial.path));}
