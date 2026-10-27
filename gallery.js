import {items,resolveItem,neighbor} from './gallery-catalog.js';
const $=s=>document.querySelector(s),tabs=[...document.querySelectorAll('[data-item]')],host=$('#model-host');
let current=null,frame=null,loadTimer=null,loadController=null;
function render(item,{historyMode='none',focus=false}={}){
 if(current?.id===item.id)return;
 clearTimeout(loadTimer);loadController?.abort();
 // Removing the browsing context stops its animation, timers and input state.
 if(frame){frame.contentWindow?.postMessage({type:'agingbuy:pause'},'*');frame.remove();}
 current=item;
 tabs.forEach(b=>{const selected=b.dataset.item===item.id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
 $('#item-name').textContent=item.name;$('#item-scope').textContent=item.scope;
 $('#product-summary').innerHTML=item.summary;
 $('#item-counter').textContent=`${String(items.indexOf(item)+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
 $('#gallery-status').textContent=`当前：${item.name}，第 ${items.indexOf(item)+1} 项，共 ${items.length} 项。`;
 $('#full-experience').href=item.src;$('#full-experience').setAttribute('aria-label',`打开${item.name}完整体验`);
 $('#model-panel').setAttribute('aria-labelledby','tab-'+item.id);
 [...document.querySelectorAll('.focus-list article')].forEach((article,i)=>{article.querySelector('h3').textContent=item.focus[i][0];article.querySelector('p').textContent=item.focus[i][1];});
 frame=document.createElement('iframe');frame.title=item.name+' · '+item.scope;frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.dataset.modelSrc=item.src;frame.style.height=item.id==='care-bed'?'660px':'740px';
 const loading=document.createElement('p');loading.className='model-loading';loading.setAttribute('role','status');loading.textContent='正在加载'+item.name+'图鉴…';
 frame.onload=e=>{if(e.currentTarget!==frame||!frame.hasAttribute('srcdoc'))return;clearTimeout(loadTimer);loading.remove();};
 host.replaceChildren(loading,frame);host.dataset.item=item.id;
 const controller=new AbortController();loadController=controller;
 fetch(item.src,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.text();}).then(html=>{if(controller.signal.aborted||loadController!==controller)return;frame.srcdoc=html;}).catch(error=>{if(controller.signal.aborted)return;loading.textContent='图鉴下载未完成，请切换后重试，或打开完整体验。';const link=document.createElement('a');link.href=item.src;link.textContent='打开完整体验';loading.appendChild(link);});
 loadTimer=setTimeout(()=>{if(!loading.isConnected)return;loading.textContent='模型加载较慢。';const retry=document.createElement('button');retry.textContent='重试';retry.onclick=()=>{current=null;render(item);};loading.appendChild(retry);const direct=document.createElement('a');direct.href=item.src;direct.textContent='打开完整体验';loading.appendChild(direct);},12000);
 if(historyMode!=='none'){
  const url=new URL(location.href);url.searchParams.set('item',item.id);
  history[historyMode==='replace'?'replaceState':'pushState']({item:item.id},'',url);
 }
 if(focus)$('#tab-'+item.id).focus();
 document.title='AgingBuy · '+item.name;
}
tabs.forEach(b=>{
 b.onclick=()=>render(resolveItem(b.dataset.item),{historyMode:'push'});
 b.onkeydown=e=>{
  if(e.altKey||e.ctrlKey||e.metaKey)return;
  const key=e.key;if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;e.preventDefault();
  const next=key==='Home'?items[0]:key==='End'?items[items.length-1]:neighbor(current.id,key==='ArrowRight'?1:-1);
  render(next,{historyMode:'push',focus:true});
 };
});
$('#previous-item').onclick=()=>render(neighbor(current.id,-1),{historyMode:'push'});
$('#next-item').onclick=()=>render(neighbor(current.id,1),{historyMode:'push'});
addEventListener('popstate',()=>render(resolveItem(new URLSearchParams(location.search).get('item'))));
addEventListener('message',e=>{
 if(!frame||e.source!==frame.contentWindow||e.data?.type!=='agingbuy:model-size')return;
 const height=Number(e.data.height);if(Number.isFinite(height)&&height>0)frame.style.height=Math.min(1400,Math.max(580,height+8))+'px';
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)frame?.contentWindow?.postMessage({type:'agingbuy:pause'},'*');});
const requested=new URLSearchParams(location.search).get('item');
render(resolveItem(requested),{historyMode:requested&&!items.some(x=>x.id===requested)?'replace':'none'});
