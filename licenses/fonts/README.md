# Self-hosted font subsets

ZCOOL KuaiLe and Caveat are distributed under SIL Open Font License 1.1. The original notices and full licenses are retained alongside this file. Source: the `ofl/zcoolkuaile` and `ofl/caveat` directories of https://github.com/google/fonts (retrieved 2026-10-28).

`fonts/aging-hand-subset.ttf` and `fonts/aging-caveat-subset.ttf` are local subsets generated using FontTools 4.68.0 from official font files. They include the combined character set in `fonts/characters.txt`, collected from all four canonical scenes, website copy, controls and units. Manifest records original and subset SHA256 and missing codepoints.

The Chinese font supplies Chinese text; Caveat supplies Latin text and numerals. The combined fonts do not contain `℃ ← → ↗ ⌀ ─ ✓`; these symbols retain the system/KaiTi fallback. `font-display: swap` keeps text visible if a font cannot load. No Google Fonts request occurs at runtime. Fonts do not change product geometry or numeric values.
