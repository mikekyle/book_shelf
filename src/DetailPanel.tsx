import { useEffect, useState } from 'react'
import { getBook } from './api'
import type { BookDetail } from './types'

export interface DetailPanelProps {
  bookId: string | null
  onClose: () => void
}

export function DetailPanel({ bookId, onClose }: DetailPanelProps) {
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!bookId) {
      setBook(null)
      return
    }
    let cancelled = false
    setLoading(true)
    getBook(bookId)
      .then((b) => {
        if (!cancelled) setBook(b ?? null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [bookId])

  if (!bookId) return null

  return (
    <aside className="detail-panel" aria-label="Book detail">
      <button type="button" className="detail-close" onClick={onClose} aria-label="Close detail">
        ×
      </button>
      {loading && <p className="detail-loading">Loading…</p>}
      {!loading && !book && <p className="detail-loading">Not found.</p>}
      {book && (
        <div className="detail-body">
          <h2>{book.title}</h2>
          <p className="detail-authors">{book.authors.join(', ')}</p>
          <p className="detail-format">
            <span className="chip">{book.format}</span>
            {book.location && <span className="chip">{book.location}</span>}
          </p>
          {book.description && <p className="detail-description">{book.description}</p>}
          {book.tags && book.tags.length > 0 && (
            <div className="detail-tags">
              {book.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
