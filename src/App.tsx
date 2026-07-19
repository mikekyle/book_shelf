import { useEffect, useMemo, useState } from 'react'
import './index.css'
import { getProjectionMeta, getShelf, isLiveApi } from './api'
import { Shelf } from './Shelf'
import { DetailPanel } from './DetailPanel'
import type { LayoutMode, ProjectionMeta, ShelfItem } from './types'

function VarianceBadge({ meta, layout }: { meta: ProjectionMeta | null; layout: LayoutMode }) {
  const variance = meta?.layouts.find((l) => l.mode === layout)?.variance
  if (!variance) return null
  const parts = Object.entries(variance).map(
    ([k, v]) => `${k.toUpperCase()} ${(v * 100).toFixed(0)}%`,
  )
  return <span className="variance">Variance explained: {parts.join(' · ')}</span>
}

export default function App() {
  const [meta, setMeta] = useState<ProjectionMeta | null>(null)
  const [layout, setLayout] = useState<LayoutMode>('pca_1_2')
  const [includePhysical, setIncludePhysical] = useState(true)
  const [items, setItems] = useState<ShelfItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    getProjectionMeta().then(setMeta)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getShelf({ layout, includePhysical })
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [layout, includePhysical])

  const layoutButtons = useMemo(
    () =>
      meta?.layouts ?? [
        { mode: 'pca_1_2' as LayoutMode, label: 'PCA 1×2' },
        { mode: 'pca_2_3' as LayoutMode, label: 'PCA 2×3' },
        { mode: 'pca_3_4' as LayoutMode, label: 'PCA 3×4' },
        { mode: 'umap' as LayoutMode, label: 'UMAP' },
      ],
    [meta],
  )

  return (
    <div className="app">
      <header className="toolbar">
        <div className="brand">
          <h1>book_shelf</h1>
          <span className={isLiveApi ? 'source live' : 'source fixtures'}>
            {isLiveApi ? 'live book_core' : 'fixtures'}
          </span>
        </div>
        <div className="layouts">
          {layoutButtons.map((l) => (
            <button
              type="button"
              key={l.mode}
              className={l.mode === layout ? 'layout active' : 'layout'}
              onClick={() => setLayout(l.mode)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <label className="filter">
          <input
            type="checkbox"
            checked={includePhysical}
            onChange={(e) => setIncludePhysical(e.target.checked)}
          />
          Include physical
        </label>
        <VarianceBadge meta={meta} layout={layout} />
        <span className="count">{items.length} books</span>
      </header>

      <main className="stage">
        {loading ? (
          <div className="stage-status">Loading shelf…</div>
        ) : items.length === 0 ? (
          <div className="stage-status">No books to show.</div>
        ) : (
          <Shelf items={items} selectedId={selectedId} onSelect={setSelectedId} />
        )}
        <DetailPanel bookId={selectedId} onClose={() => setSelectedId(null)} />
      </main>
    </div>
  )
}
