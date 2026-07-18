# book_shelf — Planning

## Big idea

A satisfying visual “win”: an interactive plane of book covers for the personal library, with layout modes that expose different cuts of high-dimensional taste/content space. Physical and Kindle books share the same space; physical can be filtered.

## Depends on

`book_core` Phase 1 read APIs (`GET /api/v1/visual-shelf`, book detail, projection meta). This repo does not compute embeddings or PCA/UMAP.

## Phase 1 UI

- Pan / zoom canvas (or SVG space) of covers
- Layout mode toggle:
  - PCA `1×2` (default), `2×3`, `3×4`
  - UMAP (single layout)
- Show PCA variance % when in PCA modes (from projection meta)
- Format filter: physical on/off (and later kindle on/off)
- Click book → simple detail panel (title, authors, description, location if present)
- Custom background nice-to-have; not required for v1
- Manual drag-into-sections is **out of scope** (auto layout only)

## Non-goals

- Auth / user accounts (public GH Pages is fine)
- Write paths, photo upload, search chat
- Reimplementing clustering in the browser
- Sale notifications

## Agent instructions

- Scaffold a minimal Vite app; wire to `book_core` with a configurable API base URL.
- Use mock/fixture JSON only if the API is not up yet; prefer real endpoints once available.
- Keep visuals intentional but avoid overbuilt dashboard chrome — one composition, one job.
- Document GH Pages deploy steps in README when the app exists.
- Copy contract updates from `book_core/api-contracts.md` when they change.
