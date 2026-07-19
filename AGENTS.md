# AGENTS

Start with [`CLAUDE.md`](CLAUDE.md), [`PLANNING.md`](PLANNING.md), [`api-contracts.md`](api-contracts.md), and [`BOOK_CORE_LIVE.md`](BOOK_CORE_LIVE.md).

## Cursor Cloud specific instructions

Stack: Vite 8 + React 19 + TypeScript, linted by `oxlint`, tested by Vitest (jsdom). Package manager is `pnpm` (see `packageManager`/lockfile).

Standard commands are defined in `package.json` scripts: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. The update script already runs `pnpm install`.

Non-obvious things worth knowing:

- The dev server runs fully offline. When `VITE_BOOK_CORE_API_BASE` is unset, the app serves local fixtures (`src/fixtures.ts`) via `src/api.ts`; each API call also falls back to fixtures on network error. A green/amber badge in the toolbar shows `live book_core` vs `fixtures`. To develop against the real backend, set `VITE_BOOK_CORE_API_BASE` in `.env` and restart `pnpm dev`. It defaults to `fixtures` here only because that env var is unset, not because of any network block.
- Set `VITE_BOOK_CORE_API_BASE=same-origin` (or `/` / `.`) for relative `/api/v1/...` fetches — used by the Oracle nginx proxy on port 8003.
- The live `book_core` API (HTTP, port 8002, not 8000/8001) IS reachable from the cloud VM over TCP and CORS is open (`access-control-allow-origin: *`), serving ~352 real books. Note ICMP `ping` to that host is filtered (100% loss), so don't use ping to judge reachability — test TCP/`curl` instead. The one real caveat is GitHub Pages: because book_core is plain HTTP, calling it from an HTTPS Pages origin triggers browser mixed-content blocking (fine on `localhost` dev; use `./scripts/deploy_oracle_shelf.sh` for a working live URL).
- Contract drift handled in `src/api.ts`: live `/api/v1/projections/meta` returns `layouts` as strings plus `pca_variance_explained` (12 floats) and `book_count`, so `normalizeProjectionMeta` maps it to the `{mode,label,variance}[]` shape the toggle UI needs (per-pair variance: pca_1_2→pc1/pc2, etc.). Live `books/{id}` uses `location_label` (mapped to `location`) and returns `umap_x/umap_y` rather than layout `x/y`; `getBook` adapts these. `visual-shelf` matches the contract directly. Keep these adapters in sync if `book_core` changes, and update `api-contracts.md` to match reality.
- Vite and Vitest config are intentionally split: `vite.config.ts` (imports `defineConfig` from `vite`, Vite 8 types) and `vitest.config.ts` (imports from `vitest/config`, which bundles Vite 7 types). Do not merge the `test` block back into `vite.config.ts` — the version skew makes `tsc -b` fail on plugin/`test` typing.
- `vite.config.ts` sets `base: './'` so the built SPA works from a GitHub Pages project subpath. Do not hardcode absolute asset paths.
- Pages CI is `.github/workflows/pages.yml`. It only injects an HTTPS (or same-origin) `VITE_BOOK_CORE_API_BASE` secret; HTTP URLs are ignored to avoid shipping a mixed-content client.
- This app must never call write/ingest endpoints or embed any `book_core` token / OpenRouter key (read-only public SPA).
- Oracle SSH: `ORACLE_HOST` / `ORACLE_USER` / `ORACLE_SSH_KEY` secrets. The key may be stored as a single line — rewrite PEM newlines before `ssh -i`.
