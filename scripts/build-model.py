#!/usr/bin/env python3
"""Build the active 2.1 model modules and progressive static site."""
from pathlib import Path
import runpy
ROOT=Path(__file__).resolve().parents[1]
for name in ['build-sketch.py','build-site.py']:
    runpy.run_path(str(ROOT/'scripts'/name),run_name='__main__')
