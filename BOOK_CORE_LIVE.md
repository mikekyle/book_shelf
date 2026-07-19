# book_core live integration notes

For `book_shelf` implementers. `book_core` Phase 1 is deployed and populated on the Oracle ARM VM.

## API base URL

Live API listens on **host port 8002** (HTTP). Set locally:

```bash
# Remote API (dev / cloud agent)
VITE_BOOK_CORE_API_BASE=http://$ORACLE_HOST:8002

# Same-origin (Oracle nginx proxy on port 8003 — preferred live demo)
VITE_BOOK_CORE_API_BASE=same-origin
```

- OpenAPI / docs: `http://$ORACLE_HOST:8002/docs`
- Health: `http://$ORACLE_HOST:8002/health`
- Versioned reads: `http://$ORACLE_HOST:8002/api/v1/…`
- Live shelf (SPA + API proxy): `http://$ORACLE_HOST:8003/`

`$ORACLE_HOST` is the Oracle VM public IP (available as the `ORACLE_HOST` cloud-agent secret). Do not commit the raw IP if you can avoid it; prefer env / Actions secrets.

## Port / hosting quirks

- Live API is on **port 8002**, not 8000/8001 (those are already used by other apps on the same Oracle VM).
- Scheme is currently **HTTP**, not HTTPS. Sibling apps on 8000/8001 use self-signed TLS; a self-signed cert does **not** unlock GitHub Pages (browsers reject untrusted certs the same way they block mixed content).
- GitHub Pages is HTTPS. Calling plain HTTP from an HTTPS Pages origin will hit **mixed-content** blocking.
  - Dev on `localhost` / Vite is fine with HTTP.
  - The Oracle **same-origin** deploy on port 8003 (static SPA + `/api` proxy) is the working live path today.
  - For Pages + live data you need a real domain pointed at the VM and a Let's Encrypt (or similar) cert on book_core — see README.
- CORS on book_core is open (`Access-Control-Allow-Origin: *`) for GET/POST/OPTIONS.
- OCI + host iptables already allow TCP 8002; TCP **8003** must also be open for the shelf proxy.
- ICMP `ping` to the host is filtered — use TCP/`curl` to judge reachability.

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

## Data reality (as of 2026-07-19)

- ~352 Kindle books imported; **all** have cover, description, tags, embeddings, PCA (12 comps) + UMAP.
- `format` is effectively all `kindle` for now — physical filter UI can exist, but there is nothing physical yet (Phase 2 / `book_bot`).
- `cluster_label` is unused (`null`) — do not design UI that depends on clusters yet.
- Cover URLs are mostly Amazon CDN (`images-na.ssl-images-amazon.com/images/P/{ASIN}.01.LZZZZZZZ.jpg`). Hotlinking usually works; the canvas keeps a coloured rect under the image as fallback.
- Author strings are often Kindle-export style (`"Last, First"`), not always `"First Last"`.
- Coordinates are precomputed offline — do **not** recompute PCA/UMAP in the browser.
- PCA variance explained values are small per component (high-dimensional embeddings); still fine to show as UI labels from `/projections/meta`.
- Live `/projections/meta` returns string `layouts` + flat `pca_variance_explained`; `src/api.ts` normalizes that for the toggle UI. Live `books/{id}` uses `location_label` (mapped to `location`).

## Auth / secrets

- Shelf reads are **public** — no Bearer token.
- **Never** ship `BOOK_CORE_API_TOKEN`, OpenRouter keys, or write endpoints in this repo.
- Ignore `/api/v1/books/import/kindle`, `/physical-books/batch`, `/search` (ingest/search; Phase 2 / CLI).

## Suggested client wiring

1. On load: `GET /api/v1/projections/meta` → build layout toggle labels.
2. Fetch `GET /api/v1/visual-shelf?layout=…` whenever layout/filter changes.
3. On cover click: `GET /api/v1/books/{id}` for description/tags/location.
4. Keep `VITE_BOOK_CORE_API_BASE` configurable; use `same-origin` when behind the Oracle proxy.

Contract source of truth remains [`book_core/api-contracts.md`](https://github.com/mikekyle/book_core/blob/master/api-contracts.md) (and live OpenAPI at `/docs`).
