# API contracts (consumer copy)

**Source of truth:** [`mikekyle/book_core` `api-contracts.md`](https://github.com/mikekyle/book_core/blob/master/api-contracts.md).

This frontend only uses **read** endpoints. Live OpenAPI: `{API_BASE}/docs`.

## Used by book_shelf

### `GET /api/v1/visual-shelf`

Query: `layout=pca_1_2|pca_2_3|pca_3_4|umap` (default `pca_1_2`), optional `format=kindle|physical|other`, optional `include_physical=true|false`.

```json
{
  "id": "uuid",
  "title": "Fermat's Last Theorem",
  "authors": ["Simon Singh"],
  "format": "kindle",
  "cover_url": "https://...",
  "cluster_label": null,
  "x": 0.412,
  "y": -0.891,
  "pca_variance": {"pc1": 0.18, "pc2": 0.11}
}
```

`pca_variance` keys follow the selected pair (`pc1`/`pc2`, `pc2`/`pc3`, or `pc3`/`pc4`). Omitted for UMAP.

### `GET /api/v1/books/{id}`

Detail panel. Live fields used by the SPA:

- `title`, `authors`, `format`, `cover_url`, `description`, `tags`
- `location_label` (SPA maps this to `location`)
- `umap_x` / `umap_y` (detail does not return layout `x`/`y`; unused by the panel)

### `GET /api/v1/projections/meta`

Live shape (adapted in `src/api.ts` → labeled toggle options):

```json
{
  "pca_n_components": 12,
  "pca_variance_explained": [0.038, 0.029, 0.025, 0.021],
  "layouts": ["pca_1_2", "pca_2_3", "pca_3_4", "umap"],
  "umap_params": {"min_dist": 0.1, "n_neighbors": 15, "n_components": 2},
  "book_count": 352,
  "computed_at": "2026-07-19T10:52:52.984282Z"
}
```

The SPA maps each PCA layout to its variance pair (e.g. `pca_1_2` → `pc1`/`pc2` from indices 0/1).

## Never call from this repo

Any `POST` / ingest / admin route. No `BOOK_CORE_API_TOKEN` in the SPA.
