import { describe, expect, it } from 'vitest'
import { getBook, getProjectionMeta, getShelf, isLiveApi } from './api'
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
