# book_shelf

Interactive 2D visual bookshelf for a personal catalogue (Kindle + physical).

Part of the **book-catalog** ecosystem:

| Repo | Role |
|---|---|
| [book_core](https://github.com/mikekyle/book_core) | API + Postgres + enrichment / projections |
| **book_shelf** (this repo) | Static SPA on GitHub Pages |
| [book_bot](https://github.com/mikekyle/book_bot) | Telegram (Phase 2) |

## Status

Phase 1 SPA scaffolded: pan/zoom canvas of book covers, PCA/UMAP layout toggle with variance labels, physical filter, and a click-to-open detail panel. Runs offline against local fixtures; wire it to `book_core` via `VITE_BOOK_CORE_API_BASE`.

## Development

Requires Node 20+ and `pnpm`.

```bash
pnpm install
pnpm dev        # start Vite dev server (http://localhost:5173)
pnpm lint       # oxlint
pnpm typecheck  # tsc -b
pnpm test       # vitest
pnpm build      # type-check + production build to dist/
```

Copy `.env.example` to `.env` and set `VITE_BOOK_CORE_API_BASE` to a deployed `book_core` base URL to use live data. When unset, the app serves bundled fixtures so it is fully explorable offline (a badge in the toolbar shows `live book_core` vs `fixtures`).

## Deploy (GitHub Pages)

`vite.config.ts` sets `base: './'`, so the production build works from a Pages project subpath. Build with `pnpm build` and publish the `dist/` directory (e.g. via a Pages action or `gh-pages`). Note: `book_core` is currently HTTP-only, so a live HTTPS Pages origin will hit mixed-content blocking until `book_core` is served over HTTPS or proxied.

## Agent entrypoint

Read [`CLAUDE.md`](CLAUDE.md) then [`PLANNING.md`](PLANNING.md). Consume only the read APIs documented in [`api-contracts.md`](api-contracts.md) (mirror of `book_core`).

## Hosting

GitHub Pages. Public catalogue is acceptable; **never** put API write tokens or OpenRouter keys in this frontend.
