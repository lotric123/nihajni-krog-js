```markdown
# nihajni-krog-js

JavaScript port of parts of the original "nihajni krog" WinForms app:
- Inducalc.js: port of the C# Inducalc class (inductance formulas, skin depth, resonance)
- app.js + index.html: simple UI to compute resonance, inductances and skin depth

Licence: original code is GPL (as per Claudio Girardi). This port keeps same licensing intent - include appropriate GPL notice if you redistribute.

How to run:
1. Serve the folder (static) — e.g. `npx http-server .` or open index.html via a static server.
2. Use the UI to compute values. The skin depth uses indices matching the original C# material list.

Notes:
- This is a port of numerical formulas; results should be validated against the original app if exact parity is required.
```
