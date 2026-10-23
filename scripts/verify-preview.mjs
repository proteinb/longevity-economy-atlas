import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {resolve,dirname} from 'node:path';
const read=p=>readFileSync(p,'utf8');
const model=runInNewContext(read('model-source/model.js')+';({poseAt,advance,DEMO_DURATION})');
assert.equal(model.advance(2,10,false),2,'pause freezes time');
assert.equal(model.advance(8.99,1,true),9,'time cannot overshoot demo');
assert.equal(model.advance(2,-1,true),2,'negative delta is ignored');
assert.equal(model.poseAt(0).back,0);assert.equal(model.poseAt(9).back,0);
for(let t=0;t<=9;t+=.01){const p=model.poseAt(t);assert(Number.isFinite(p.back));assert(p.back>=0&&p.back<=Math.PI*.24+.00001);}
for(const edge of [3.6,5.4])assert(Math.abs(model.poseAt(edge-.0001).back-model.poseAt(edge+.0001).back)<.001,'continuous movement');
const pages=['index.html','atlas.html','care-bed.html'];
let links=0;
for(const page of pages){const html=read(page);assert(!html.includes('/*SCRIPT*/'));for(const match of html.matchAll(/(?:src|href)="([^"\s]+)"/g)){const url=match[1];if(/^(https?:|data:|mailto:)/.test(url))continue;const [path,hash]=url.split('#');const target=path?resolve(dirname(page),decodeURIComponent(path)):resolve(page);assert(existsSync(target),`missing ${url} in ${page}`);if(hash&&target.endsWith('.html'))assert(read(target).includes(`id="${hash}"`),`missing #${hash}`);links++;}}
const standalone=read('care-bed.html');assert(!/<script[^>]+src=/.test(standalone));assert(!/<link[^>]+(?:stylesheet|font)/.test(standalone));
console.log(`PASS: pose limits/continuity, pause, delta bounds; ${links} local links/anchors; model has no external scripts/styles.`);
