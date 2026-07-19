// Read-only client for book_core. Never sends write requests or tokens.
// When VITE_BOOK_CORE_API_BASE is unset (or a request fails) we fall back to
// local fixtures so the SPA is fully explorable offline.

import { fixtureBook, fixtureProjectionMeta, fixtureShelf } from './fixtures'
import type {
  BookDetail,
  LayoutMode,
  ProjectionMeta,
  ShelfItem,
} from './types'

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
    return await getJson<ProjectionMeta>('/projections/meta')
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
    return await getJson<BookDetail>(`/books/${encodeURIComponent(id)}`)
  } catch (err) {
    console.warn('book detail failed, using fixtures', err)
    return fixtureBook(id)
  }
}
