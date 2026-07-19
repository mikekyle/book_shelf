import { describe, expect, it } from 'vitest'
import {
  getBook,
  getProjectionMeta,
  getShelf,
  isLiveApi,
  normalizeProjectionMeta,
} from './api'
import { fixtureShelf } from './fixtures'

describe('book_shelf api (fixtures mode)', () => {
  it('runs in fixtures mode when no API base is configured', () => {
    expect(isLiveApi).toBe(false)
  })

  it('returns shelf items with coordinates for a PCA layout', async () => {
    const items = await getShelf({ layout: 'pca_1_2' })
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(typeof item.x).toBe('number')
      expect(typeof item.y).toBe('number')
      expect(item.pca_variance).toBeDefined()
    }
  })

  it('gives different coordinates per layout', async () => {
    const pca = await getShelf({ layout: 'pca_1_2' })
    const umap = await getShelf({ layout: 'umap' })
    expect(pca[0].x).not.toBe(umap[0].x)
    // UMAP layout carries no PCA variance.
    expect(umap[0].pca_variance).toBeUndefined()
  })

  it('exposes projection meta with all four layouts', async () => {
    const meta = await getProjectionMeta()
    const modes = meta.layouts.map((l) => l.mode)
    expect(modes).toEqual(['pca_1_2', 'pca_2_3', 'pca_3_4', 'umap'])
  })

  it('fetches book detail with description and tags', async () => {
    const first = fixtureShelf('pca_1_2')[0]
    const book = await getBook(first.id)
    expect(book?.id).toBe(first.id)
    expect(book?.description).toBeTruthy()
    expect(Array.isArray(book?.tags)).toBe(true)
  })
})

describe('normalizeProjectionMeta (live book_core shape)', () => {
  const raw = {
    pca_n_components: 12,
    pca_variance_explained: [0.038, 0.029, 0.025, 0.021],
    layouts: ['pca_1_2', 'pca_2_3', 'pca_3_4', 'umap'],
    book_count: 352,
  }

  it('labels every layout and maps the right variance pair per PCA layout', () => {
    const meta = normalizeProjectionMeta(raw)
    expect(meta.layouts.map((l) => l.mode)).toEqual([
      'pca_1_2',
      'pca_2_3',
      'pca_3_4',
      'umap',
    ])
    const byMode = Object.fromEntries(meta.layouts.map((l) => [l.mode, l]))
    expect(byMode.pca_1_2.label).toBe('PCA 1×2')
    expect(byMode.pca_1_2.variance).toEqual({ pc1: 0.038, pc2: 0.029 })
    expect(byMode.pca_2_3.variance).toEqual({ pc2: 0.029, pc3: 0.025 })
    expect(byMode.pca_3_4.variance).toEqual({ pc3: 0.025, pc4: 0.021 })
    // UMAP carries no PCA variance.
    expect(byMode.umap.variance).toBeUndefined()
  })

  it('drops unknown layout names and tolerates a missing variance array', () => {
    const meta = normalizeProjectionMeta({ layouts: ['pca_1_2', 'bogus'] })
    expect(meta.layouts.map((l) => l.mode)).toEqual(['pca_1_2'])
    expect(meta.layouts[0].variance).toBeUndefined()
  })
})
