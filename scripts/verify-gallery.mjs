import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
import {items,resolveItem,neighbor} from '../gallery-catalog.js';
assert.equal(items.length,4);assert.equal(new Set(items.map(x=>x.id)).size,4);
assert.equal(resolveItem('../../outside.html').id,'care-bed');
assert.equal(neighbor('care-bed',-1).id,'accessible-shower');
assert.equal(neighbor('accessible-shower',1).id,'care-bed');
for(const item of items){assert(existsSync(item.src));assert.equal(item.focus.length,3);}
for(const item of items.slice(1)){
 const s=readFileSync(item.src,'utf8');
 assert(s.includes("connect-src 'none'"));assert(s.includes("default-src 'none'"));
 assert(s.includes('autoplay: false, sway: false'));assert(!s.includes('fonts.googleapis.com'));
 assert(s.includes('标准、参数与安全效果未核验'));assert(s.includes('agingbuy:pause'));
 for(const [,script] of s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new Script(script,{filename:item.src});
}
const html=readFileSync('index.html','utf8');assert.equal((html.match(/role="tabpanel"/g)||[]).length,1);assert(!/<iframe/.test(html));
console.log('PASS: 4 known items, URL fallback/wrap, imported JS syntax, no autoplay/fonts, network isolation, single panel.');
