# MuAPI client and model catalog

## Where the code lives

- `packages/studio/src/models.js` — **single source of truth** for the model catalog (~23k lines).
- `src/lib/models.js` — a one-line re-export (`export * from "studio/src/models.js"`) so the
  Electron/Vite build's `../lib/models` imports keep resolving. Never add models here.
- `src/lib/muapi.js` and `packages/studio/src/muapi.js` — the `MuapiClient` class.
- `packages/studio/src/utils/generationLifecycle.js` — `pollForGenerationResult`,
  `appendGenerationRefundNotice`.

## MuapiClient

```js
import { MuapiClient } from './lib/muapi.js';
const client = new MuapiClient();
```

`baseUrl` is `''` in Vite dev (so requests go through the Next.js proxy routes) and
`https://api.muapi.ai` otherwise. Requests are built as `${baseUrl}/api/v1/${endpoint}` where
`endpoint` comes from the model definition, falling back to the raw model id.

Methods:

| Method | Purpose |
|---|---|
| `getKey()` | `window.__MUAPI_KEY__` → `localStorage.muapi_key`; throws `API Key missing. Please set it in Settings.` |
| `generateImage(params)` | t2i when no `image_url`, i2i when present |
| `generateVideo(params)` | t2v / i2v, same switch |
| `processLipSync(params)` | image+audio or video+audio |
| `uploadFile(file)` | uploads a reference asset, returns a hosted URL |
| `pollForResult(requestId, key, maxAttempts = 60, interval = 2000)` | ~2 min ceiling by default |
| `getDimensionsFromAR(ar)` | aspect-ratio string → pixel dimensions |

Generation is **asynchronous**: submit, receive a `request_id`, then poll. Long video jobs can
exceed the 60×2s default — raise `maxAttempts` rather than shortening the interval.

## Model catalog shape

Models are grouped into exported arrays by modality:

`t2iModels`, `i2iModels`, `t2vModels`, `i2vModels`, `v2vModels`, `lipsyncModels`,
`recastModels`, `audioModels`.

Each entry carries `id`, `name`, `endpoint`, and an `inputs` object describing every parameter
as a JSON-Schema-like record (`type`, `title`, `description`, `enum`, `examples`). The UI
renders its controls from `inputs` — an `aspect_ratio` with an `enum` produces the aspect-ratio
picker, and so on.

Lookup and capability helpers (all keyed by model id):

```js
getModelById, getVideoModelById, getI2IModelById, getI2VModelById,
getV2VModelById, getLipSyncModelById, getRecastModelById, getAudioModelById

getAspectRatiosForModel / ...ForVideoModel / ...ForI2IModel / ...ForI2VModel / ...ForRecastModel
getSelectableAspectRatiosForModel / ...ForI2IModel
getResolutionsForModel / ...ForVideoModel / ...ForI2IModel / ...ForI2VModel / ...ForLipSyncModel
getDurationsForModel / getDurationsForI2VModel
getQualityFieldForModel / getQualityFieldForI2IModel
getMaxImagesForI2IModel / getMaxImagesForI2VModel
getEffectsForI2IModel / getEffectsForI2VModel (+ getDefaultEffect... variants)
```

`imageLipSyncModels` and `videoLipSyncModels` are pre-filtered views of `lipsyncModels` on
`category === 'image' | 'video'`.

## Adding a model

Append the entry to the correct array in `packages/studio/src/models.js` with an accurate
`endpoint` and `inputs`, then `npm run build:studio`. The controls follow from the metadata —
no component changes should be needed. `models_dump.json` at the repo root is a raw catalog
dump, useful for cross-checking endpoint names.

## Server-side proxy routes

`app/api/` holds catch-all routes that forward to MuAPI and handle uploads:

```
app/api/api/v1/[[...path]]/route.js       generic MuAPI passthrough
app/api/v1/get_upload_url/route.js        presigned upload URL
app/api/v1/upload-binary/route.js         binary upload
app/api/upload-binary/route.js
app/api/agents/[[...path]]/route.js       Open-Poe-AI agents
app/api/workflow/[[...path]]/route.js     Vibe-Workflow
app/api/v1/creative-agent/[[...path]]/route.js
app/api/app/[[...path]]/route.js
```

These exist so the browser is not blocked by CORS and so uploads can be streamed; the API key
still travels from the client.
