#!/usr/bin/env python3
"""Rebuild the offline care-bed figure using only checked-in local sources."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'model-source'
template=(SOURCE/'page.html').read_text()
assert template.count('/*STYLE*/')==template.count('/*SCRIPT*/')==1
script='\n;\n'.join((SOURCE/name).read_text() for name in ['runtime.js','model.js','app.js']).replace('</script','<\\/script').replace('</SCRIPT','<\\/SCRIPT')
html=template.replace('/*STYLE*/',(SOURCE/'style.css').read_text()).replace('/*SCRIPT*/',script)
(ROOT/'care-bed.html').write_text(html)
print(f'Built care-bed.html: {len(html.encode()):,} bytes, offline assets inlined')
