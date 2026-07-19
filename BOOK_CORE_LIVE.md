# book_core live integration notes

For `book_shelf` implementers. `book_core` Phase 1 is deployed and populated.

## API base URL

```text
http://145.241.237.53:8002
```

Env for this SPA:

```bash
VITE_BOOK_CORE_API_BASE=http://145.241.237.53:8002
```

- OpenAPI / docs: `http://145.241.237.53:8002/docs`
- Health: `http://145.241.237.53:8002/health`
- Versioned reads: `http://145.241.237.53:8002/api/v1/…`

## Port / hosting quirks

- Live API is on **port 8002**, not 8000/8001 (those are already used by other apps on the same Oracle VM).
- Scheme is currently **HTTP**, not HTTPS. Other services on that host use HTTPS on 8000/8001; book_core does not yet.
- GitHub Pages is HTTPS. Calling plain HTTP from an HTTPS Pages origin will hit **mixed-content** blocking in browsers.
  - Dev on `localhost` / Vite is fine with HTTP.
  - For Pages production you will need one of: put book_core behind HTTPS, or proxy via a same-origin/HTTPS path, or temporarily develop against the API from a non-HTTPS context.
- CORS on book_core is open (`Access-Control-Allow-Origin: *`) for GET/POST/OPTIONS — browser reads are allowed once mixed-content is solved.
- OCI + host iptables already allow TCP 8002.

## Endpoints shelf should use

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/visual-shelf` | Main canvas data |
| GET | `/api/v1/books/{id}` | Detail panel |
| GET | `/api/v1/projections/meta` | Layout labels + PCA variance |

### `visual-shelf` query params

- `layout`: `pca_1_2` (default) | `pca_2_3` | `pca_3_4` | `umap`
- `format`: optional `kindle` | `physical` | `other`
- `include_physical`: bool, default `true` (set `false` to hide physical)

### Response shape (item)

Matches `api-contracts.md`: `id`, `title`, `authors[]`, `format`, `cover_url`, `cluster_label` (currently always `null`), `x`, `y`, and for PCA layouts `pca_variance` like `{"pc1": …, "pc2": …}` (keys follow the pair: pc1/pc2, pc2/pc3, or pc3/pc4).

## Data reality (as of 2026-07-19)

- ~352 Kindle books imported; **all** have cover, description, tags, embeddings, PCA (12 comps) + UMAP.
- `format` is effectively all `kindle` for now — physical filter UI can exist, but there is nothing physical yet (Phase 2 / `book_bot`).
- `cluster_label` is unused (`null`) — do not design UI that depends on clusters yet.
- Cover URLs are mostly Amazon CDN (`images-na.ssl-images-amazon.com/images/P/{ASIN}.01.LZZZZZZZ.jpg`). Hotlinking usually works; handle broken images gracefully.
- Author strings are often Kindle-export style (`"Last, First"`), not always `"First Last"`.
- Coordinates are precomputed offline — do **not** recompute PCA/UMAP in the browser. Just plot `x`/`y` for the selected layout.
- PCA variance explained values are small per component (high-dimensional embeddings); still fine to show as UI labels from `/projections/meta`.

## Auth / secrets

- Shelf reads are **public** — no Bearer token.
- **Never** ship `BOOK_CORE_API_TOKEN`, OpenRouter keys, or write endpoints in this repo.
- Ignore `/api/v1/books/import/kindle`, `/physical-books/batch`, `/search` (ingest/search; Phase 2 / CLI).

## Suggested client wiring

1. On load: `GET /api/v1/projections/meta` → build layout toggle labels.
2. Fetch `GET /api/v1/visual-shelf?layout=…` whenever layout/filter changes.
3. On cover click: `GET /api/v1/books/{id}` for description/tags/location.
4. Keep `VITE_BOOK_CORE_API_BASE` configurable; no trailing-slash assumptions beyond joining `/api/v1/...`.

Contract source of truth remains [`book_core/api-contracts.md`](https://github.com/mikekyle/book_core/blob/master/api-contracts.md) (and live OpenAPI at `/docs`).
