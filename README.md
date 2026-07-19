# book_shelf

Interactive 2D visual bookshelf for a personal catalogue (Kindle + physical).

Part of the **book-catalog** ecosystem:

| Repo | Role |
|---|---|
| [book_core](https://github.com/mikekyle/book_core) | API + Postgres + enrichment / projections |
| **book_shelf** (this repo) | Static SPA (GitHub Pages + Oracle same-origin demo) |
| [book_bot](https://github.com/mikekyle/book_bot) | Telegram (Phase 2) |

## Status

Phase 1 SPA: pan/zoom canvas of book covers, PCA/UMAP layout toggle with variance labels, physical filter, and a click-to-open detail panel. Runs offline against local fixtures; wire it to `book_core` via `VITE_BOOK_CORE_API_BASE`.

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

Copy `.env.example` to `.env` and set `VITE_BOOK_CORE_API_BASE`:

| Value | Behaviour |
|---|---|
| _(unset)_ | Bundled fixtures (offline) |
| `http://$ORACLE_HOST:8002` | Live remote `book_core` |
| `same-origin` | Relative `/api/v1/...` (Oracle proxy / future HTTPS proxy) |

A badge in the toolbar shows `live book_core` vs `fixtures`. See [`BOOK_CORE_LIVE.md`](BOOK_CORE_LIVE.md) for port/CORS/data quirks.

## Deploy

### Live demo (Oracle, recommended today)

Same-origin nginx on **port 8003** serves the SPA and proxies `/api` to `book_core` on **8002** (no mixed content):

```bash
# Needs ORACLE_HOST, ORACLE_USER, and ~/.ssh/oracle_key (or ORACLE_SSH_KEY_FILE)
chmod +x scripts/deploy_oracle_shelf.sh
./scripts/deploy_oracle_shelf.sh
# → http://$ORACLE_HOST:8003/
```

Open TCP **8003** in OCI security lists / host iptables (the deploy script adds the iptables rule; OCI may still need a security-list update — mirror `book_core`'s `scripts/open_oci_port_8002.py` for 8003 if the port is filtered).

### GitHub Pages

Workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds and deploys on every push to `master`.

`vite.config.ts` sets `base: './'` for project-site subpaths.

**Mixed content:** Pages is HTTPS. The workflow only injects `secrets.VITE_BOOK_CORE_API_BASE` when it is HTTPS (or `same-origin`). A plain-HTTP API URL is ignored so the Pages build stays on fixtures rather than shipping a broken live client. Until `book_core` has a real HTTPS cert (domain + Let's Encrypt), use the Oracle `:8003` deploy for live data.

Optional secret:

- `VITE_BOOK_CORE_API_BASE` — HTTPS API base (or `same-origin` if you later put a Pages-compatible HTTPS reverse proxy in front)

## Agent entrypoint

Read [`CLAUDE.md`](CLAUDE.md) then [`PLANNING.md`](PLANNING.md). Consume only the read APIs documented in [`api-contracts.md`](api-contracts.md) (mirror of `book_core`). Live deploy notes: [`BOOK_CORE_LIVE.md`](BOOK_CORE_LIVE.md).

## Hosting

Public catalogue is acceptable; **never** put API write tokens or OpenRouter keys in this frontend.
