import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {items,resolveItem,neighbor} from '../gallery-catalog.js';
class Element{
 constructor(){this.dataset={};this.style={};this.attrs={};this.children=[];this.contentWindow={postMessage(){}};this.isConnected=false;}
 setAttribute(k,v){this.attrs[k]=String(v);}hasAttribute(k){return k in this.attrs;}
 set srcdoc(v){this.html=v;this.setAttribute('srcdoc','');}
 appendChild(el){this.children.push(el);el.isConnected=true;return el;}
 replaceChildren(...els){this.children.forEach(x=>x.isConnected=false);this.children=els;els.forEach(x=>x.isConnected=true);}
 remove(){this.removed=true;this.isConnected=false;}focus(){}
 querySelector(){return new Element();}
}
const nodes=new Map(),get=s=>{if(!nodes.has(s))nodes.set(s,new Element());return nodes.get(s);};
const tabs=items.map(item=>{const el=new Element();el.dataset.item=item.id;return el;});
const requests=[],timers=new Map();let serial=0;
const context={items,resolveItem,neighbor,URL,URLSearchParams,AbortController,location:{href:'https://www.agingbuy.com/',search:''},history:{pushState(){},replaceState(){}},document:{querySelector:get,querySelectorAll:s=>s==='[data-item]'?tabs:Array.from({length:3},()=>new Element()),createElement:()=>new Element(),addEventListener(){}},addEventListener(){},setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id),fetch:(url,options)=>new Promise(resolve=>requests.push({url,options,resolve}))};
runInNewContext(readFileSync('gallery.js','utf8').replace(/^import[^\n]+\n/,''),context);
assert.equal(requests.length,1);const host=get('#model-host'),firstFrame=host.children[1],oldLoad=firstFrame.onload;
tabs[1].onclick();assert(requests[0].options.signal.aborted);assert(firstFrame.removed);assert.equal(host.children.length,2);const current=host.children[1];
requests[0].resolve({ok:true,text:async()=>'<p>stale</p>'});requests[1].resolve({ok:true,text:async()=>'<p>current</p>'});
await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve));
assert.equal(firstFrame.html,undefined);assert.equal(current.html,'<p>current</p>');
oldLoad({currentTarget:firstFrame});assert.equal(timers.size,1,'stale load must not clear current timer');
current.onload({currentTarget:current});assert.equal(timers.size,0);assert.equal(host.children[0].isConnected,false);
assert.equal(current.attrs.sandbox,'allow-scripts');assert.equal(host.children.filter(x=>x.html).length,1);
console.log('PASS: abort obsolete download, reject stale content/load, retain single sandboxed model, clear loading state.');
