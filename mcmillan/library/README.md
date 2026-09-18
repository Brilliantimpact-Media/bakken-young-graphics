# McMillan image library

Drop McMillan's own images in this folder and list them in `manifest.json`:

```json
{ "images": [
  { "file": "shop-winding-01.jpg",  "kind": "shop",        "tags": ["winding", "floor"] },
  { "file": "motor-psc-white.png",  "kind": "product",     "tags": ["PSC", "cutout"] },
  { "file": "team-picnic-2026.jpg", "kind": "event",       "tags": ["picnic", "50th"] }
] }
```

`kind` is one of: `product` (a motor cutout on white/transparent — placed on top of the green art),
`shop`, `team`, `event`, `application`, `other` (used as full-bleed backgrounds).
Optional `"thumb": "file-small.jpg"` for a lighter thumbnail. Keep backgrounds ≥ 1600px on the long side.
