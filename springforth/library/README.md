# Spring Forth image library

Drop Spring Forth's photos here and list them in `manifest.json`:

```json
{ "images": [
  { "file": "studio-chess.jpg", "kind": "classroom", "tags": ["chess", "studio"] },
  { "file": "picnic-2026.jpg",  "kind": "event",     "tags": ["picnic"], "group": "picnic-2026" }
] }
```

`kind` is one of: `classroom`, `students`, `outdoor`, `event`, `team`, `other`.
Optional `"thumb"` for a lighter thumbnail, and `"group"` so two crops of the same shot
never land in one collage. Keep the long side at 1600px or more.
