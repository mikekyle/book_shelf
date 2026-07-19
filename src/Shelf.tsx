import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import type { ShelfItem } from './types'
import { coverCounterScale } from './zoomCovers'

// World-space dimensions the normalized layout is projected into.
const WORLD_W = 1200
const WORLD_H = 800
const COVER_W = 84
const COVER_H = 120
const PADDING = 80

interface Transform {
  x: number
  y: number
  k: number
}

const MIN_K = 0.4
const MAX_K = 8

function coverColor(id: string): string {
  // Deterministic pleasant hue from the id so covers are distinguishable
  // even without a real cover image.
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360
  return `hsl(${hash}, 52%, 42%)`
}

function displayAuthor(authors: string[]): string {
  const first = authors[0] ?? 'Unknown'
  // Kindle exports are often "Last, First"; show "First Last" when possible.
  const parts = first.split(',').map((p) => p.trim())
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : first
}

interface Placed extends ShelfItem {
  wx: number
  wy: number
}

export interface ShelfProps {
  items: ShelfItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function Shelf({ items, selectedId, onSelect }: ShelfProps) {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 })
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  )
  // Tracks whether the current pointer gesture moved far enough to count as a
  // pan. Used to suppress the click-to-select that would otherwise fire at the
  // end of a drag. We avoid setPointerCapture because capturing the pointer
  // retargets the trailing click to the <svg>, which would swallow cover clicks.
  const movedRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  const placed = useMemo<Placed[]>(() => {
    if (items.length === 0) return []
    const xs = items.map((i) => i.x)
    const ys = items.map((i) => i.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const spanX = maxX - minX || 1
    const spanY = maxY - minY || 1
    return items.map((i) => ({
      ...i,
      wx: PADDING + ((i.x - minX) / spanX) * (WORLD_W - 2 * PADDING),
      // Invert y so larger values render towards the top, like a chart.
      wy: PADDING + ((maxY - i.y) / spanY) * (WORLD_H - 2 * PADDING),
    }))
  }, [items])

  // Reset the view whenever the underlying layout changes.
  useEffect(() => {
    setTransform({ x: 0, y: 0, k: 1 })
  }, [items])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: transform.x,
        origY: transform.y,
      }
      movedRef.current = false
      setDragging(true)
    },
    [transform.x, transform.y],
  )

  const onPointerMove = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    // Only treat the gesture as a pan once it clears a small threshold, so a
    // steady click still selects the book underneath it.
    if (!movedRef.current && Math.hypot(dx, dy) < 4) return
    movedRef.current = true
    setTransform((t) => ({ ...t, x: d.origX + dx, y: d.origY + dy }))
  }, [])

  const endDrag = useCallback(() => {
    dragRef.current = null
    setDragging(false)
  }, [])

  const onWheel = useCallback((e: ReactWheelEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    setTransform((t) => {
      const factor = Math.exp(-e.deltaY * 0.0015)
      const k = Math.min(MAX_K, Math.max(MIN_K, t.k * factor))
      const scale = k / t.k
      // Zoom around the cursor position.
      return {
        k,
        x: px - (px - t.x) * scale,
        y: py - (py - t.y) * scale,
      }
    })
  }, [])

  const zoomBy = useCallback((factor: number) => {
    setTransform((t) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, t.k * factor))
      const scale = k / t.k
      const cx = WORLD_W / 2
      const cy = WORLD_H / 2
      return { k, x: cx - (cx - t.x) * scale, y: cy - (cy - t.y) * scale }
    })
  }, [])

  const reset = useCallback(() => setTransform({ x: 0, y: 0, k: 1 }), [])

  const invK = coverCounterScale(transform.k)

  return (
    <div className="shelf">
      <svg
        ref={svgRef}
        className={dragging ? 'shelf-svg grabbing' : 'shelf-svg'}
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onWheel={onWheel}
        role="application"
        aria-label="Book shelf canvas"
      >
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
          {placed.map((b) => {
            const selected = b.id === selectedId
            // Translate to the book's layout point, then counter-scale so the
            // cover glyph stays ~constant on screen while neighbours spread.
            const coverTransform =
              invK === 1
                ? `translate(${b.wx - COVER_W / 2} ${b.wy - COVER_H / 2})`
                : `translate(${b.wx} ${b.wy}) scale(${invK}) translate(${-COVER_W / 2} ${-COVER_H / 2})`
            return (
              <g
                key={b.id}
                transform={coverTransform}
                className="cover"
                onClick={(e) => {
                  e.stopPropagation()
                  // Ignore the click that terminates a pan gesture.
                  if (movedRef.current) return
                  onSelect(b.id)
                }}
                role="button"
                aria-label={`${b.title} by ${displayAuthor(b.authors)}`}
              >
                <rect
                  width={COVER_W}
                  height={COVER_H}
                  rx={4}
                  fill={coverColor(b.id)}
                  stroke={selected ? '#ffd166' : 'rgba(0,0,0,0.35)'}
                  strokeWidth={selected ? 4 : 1}
                />
                {b.cover_url && (
                  <image
                    href={b.cover_url}
                    width={COVER_W}
                    height={COVER_H}
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}
                <foreignObject x={4} y={6} width={COVER_W - 8} height={COVER_H - 12}>
                  <div className="cover-label">
                    <span className="cover-title">{b.title}</span>
                    <span className="cover-author">{displayAuthor(b.authors)}</span>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </g>
      </svg>
      <div className="shelf-controls">
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => zoomBy(0.8)} aria-label="Zoom out">
          −
        </button>
        <button type="button" onClick={reset} aria-label="Reset view">
          ⤢
        </button>
      </div>
    </div>
  )
}
