# API contracts (consumer copy)

**Source of truth:** [`mikekyle/book_core` `api-contracts.md`](https://github.com/mikekyle/book_core/blob/master/api-contracts.md).

This frontend only uses **read** endpoints.

## Used by book_shelf

### `GET /api/v1/visual-shelf`

Query: `layout=pca_1_2|pca_2_3|pca_3_4|umap`, optional format / physical filters.

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

### `GET /api/v1/books/{id}`

Detail panel.

### `GET /api/v1/projections/meta`

Labels and variance explained for layout toggles.

## Never call from this repo

Any `POST` / ingest / admin route. No `BOOK_CORE_API_TOKEN` in the SPA.
