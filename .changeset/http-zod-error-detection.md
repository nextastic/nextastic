---
'@nextastic/http': minor
---

Fix: detect zod errors by `name` and `issues` instead of `instanceof` / constructor name, so validation failures return 400 in minified builds and when the app and the package resolve different zod copies (ESM vs CJS).

Add `handleUnknownRouteError(handler)` so apps can report the errors `buildRoute` answers with `500 server_error` to an error tracker.
