// Read-only client for book_core. Never sends write requests or tokens.
// When VITE_BOOK_CORE_API_BASE is unset (or a request fails) we fall back to
// local fixtures so the SPA is fully explorable offline.

import { fixtureBook, fixtureProjectionMeta, fixtureShelf } from './fixtures'
import type {
  BookDetail,
  BookFormat,
  LayoutMode,
  ProjectionMeta,
  RawProjectionMeta,
  ShelfItem,
} from './types'

const LAYOUT_LABELS: Record<LayoutMode, string> = {
  pca_1_2: 'PCA 1×2',
  pca_2_3: 'PCA 2×3',
  pca_3_4: 'PCA 3×4',
  umap: 'UMAP',
}

// Which entries of `pca_variance_explained` back each PCA layout (0-indexed).
const PCA_PAIR: Partial<Record<LayoutMode, [number, number]>> = {
  pca_1_2: [0, 1],
  pca_2_3: [1, 2],
  pca_3_4: [2, 3],
}

const KNOWN_LAYOUTS = Object.keys(LAYOUT_LABELS) as LayoutMode[]

// book_core returns `layouts` as bare strings plus a flat variance array.
// Adapt it into the labeled, per-pair shape the toggle UI expects.
export function normalizeProjectionMeta(raw: RawProjectionMeta): ProjectionMeta {
  const variances = raw.pca_variance_explained ?? []
  const layouts = (raw.layouts ?? [])
    .filter((m): m is LayoutMode => (KNOWN_LAYOUTS as string[]).includes(m))
    .map((mode) => {
      const pair = PCA_PAIR[mode]
      const variance =
        pair && variances[pair[0]] != null && variances[pair[1]] != null
          ? {
              [`pc${pair[0] + 1}`]: variances[pair[0]],
              [`pc${pair[1] + 1}`]: variances[pair[1]],
            }
          : undefined
      return { mode, label: LAYOUT_LABELS[mode], ...(variance ? { variance } : {}) }
    })
  return { layouts }
}

const API_BASE = (import.meta.env.VITE_BOOK_CORE_API_BASE ?? '').replace(
  /\/+$/,
  '',
)

export const isLiveApi = API_BASE.length > 0

export interface ShelfQuery {
  layout: LayoutMode
  format?: 'kindle' | 'physical' | 'other'
  includePhysical?: boolean
}

function url(path: string, params?: Record<string, string>): string {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return `${API_BASE}/api/v1${path}${qs}`
}

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const res = await fetch(url(path, params), { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return (await res.json()) as T
}

export async function getProjectionMeta(): Promise<ProjectionMeta> {
  if (!isLiveApi) return fixtureProjectionMeta
  try {
    const raw = await getJson<RawProjectionMeta>('/projections/meta')
    return normalizeProjectionMeta(raw)
  } catch (err) {
    console.warn('projections/meta failed, using fixtures', err)
    return fixtureProjectionMeta
  }
}

export async function getShelf(query: ShelfQuery): Promise<ShelfItem[]> {
  if (!isLiveApi) return fixtureShelf(query.layout)
  try {
    const params: Record<string, string> = { layout: query.layout }
    if (query.format) params.format = query.format
    if (query.includePhysical === false) params.include_physical = 'false'
    return await getJson<ShelfItem[]>('/visual-shelf', params)
  } catch (err) {
    console.warn('visual-shelf failed, using fixtures', err)
    return fixtureShelf(query.layout)
  }
}

export async function getBook(id: string): Promise<BookDetail | undefined> {
  if (!isLiveApi) return fixtureBook(id)
  try {
    const raw = await getJson<Record<string, unknown>>(
      `/books/${encodeURIComponent(id)}`,
    )
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      authors: Array.isArray(raw.authors) ? (raw.authors as string[]) : [],
      format: (raw.format as BookFormat) ?? 'other',
      cover_url: (raw.cover_url as string) ?? null,
      cluster_label: (raw.cluster_label as string) ?? null,
      // Detail endpoint carries umap coords, not the layout x/y (unused here).
      x: Number(raw.umap_x ?? 0),
      y: Number(raw.umap_y ?? 0),
      description: (raw.description as string) ?? null,
      tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
      // book_core names this `location_label`.
      location: (raw.location_label as string) ?? (raw.location as string) ?? null,
    }
  } catch (err) {
    console.warn('book detail failed, using fixtures', err)
    return fixtureBook(id)
  }
}
