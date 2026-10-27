#!/usr/bin/env python3
"""Publish the editable derivative of the user's Sketch3D nursing-bed source."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'model-source'
html=(SOURCE/'nursing-bed.html').read_text()
assert 'Sketch3D.mount' in html and 'id=\'explode-range\'' in html
assert '未经实物核验' in html and 'fonts.googleapis.com' not in html
(ROOT/'care-bed.html').write_text(html)
print(f'Built care-bed.html: {len(html.encode()):,} bytes, user Sketch3D derivative; offline assets inlined')
