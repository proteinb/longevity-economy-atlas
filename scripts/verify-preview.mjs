import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {resolve,dirname} from 'node:path';
const read=p=>readFileSync(p,'utf8');
const pages=['index.html','atlas.html','care-bed.html'];
let links=0;
for(const page of pages){const html=read(page);assert(!html.includes('/*SCRIPT*/'));for(const match of html.matchAll(/(?:src|href)="([^"\s]+)"/g)){const url=match[1];if(/^(https?:|data:|mailto:)/.test(url))continue;const [rawPath,hash]=url.split('#');const path=rawPath.split('?')[0];const target=path?resolve(dirname(page),decodeURIComponent(path)):resolve(page);assert(existsSync(target),`missing ${url} in ${page}`);if(hash&&target.endsWith('.html'))assert(read(target).includes(`id="${hash}"`),`missing #${hash}`);links++;}}
const standalone=read('care-bed.html');assert(!/<script[^>]+src=/.test(standalone));assert(!/<link[^>]+(?:stylesheet|font)/.test(standalone));
console.log(`PASS: ${links} local links/anchors; model has no external scripts/styles.`);
