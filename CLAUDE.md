# book_shelf

Static visual bookshelf SPA. Pan/zoom canvas of book covers using precomputed 2D coordinates from `book_core`.

## Before coding

1. Read [`PLANNING.md`](PLANNING.md).
2. Read [`api-contracts.md`](api-contracts.md) — keep in sync with `book_core` when the API solidifies.
3. Read [`BOOK_CORE_LIVE.md`](BOOK_CORE_LIVE.md) for the deployed base URL (port 8002) and integration quirks.
4. Do **not** put secrets in the client. Read-only calls to `book_core` only.
5. Do **not** implement Telegram, enrichment, or database access here.

## Stack (intended)

- Vite + React **or** Svelte (pick one simple stack; prefer boring and small)
- HTML canvas or SVG for pan/zoom
- Deploy: GitHub Pages

## Config

Public `VITE_BOOK_CORE_API_BASE` (or equivalent) pointing at the deployed `book_core` base URL.
