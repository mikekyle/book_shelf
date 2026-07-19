// Offline fixtures used when VITE_BOOK_CORE_API_BASE is unset or unreachable.
// These mirror the book_core read API shapes (see api-contracts.md) so the SPA
// is fully explorable without a live backend. Coordinates are precomputed here
// exactly like book_core would return them; the browser never computes PCA/UMAP.

import type { BookDetail, LayoutMode, ProjectionMeta, ShelfItem } from './types'

interface SeedBook {
  id: string
  title: string
  authors: string[]
  description: string
  tags: string[]
  // Per-layout coordinates, precomputed offline.
  coords: Record<LayoutMode, [number, number]>
}

const seed: SeedBook[] = [
  {
    id: 'b-0001',
    title: "Fermat's Last Theorem",
    authors: ['Singh, Simon'],
    description:
      'The story of the 350-year quest to prove a deceptively simple equation.',
    tags: ['mathematics', 'history', 'popular-science'],
    coords: {
      pca_1_2: [0.41, -0.89],
      pca_2_3: [-0.12, 0.44],
      pca_3_4: [0.28, 0.15],
      umap: [2.1, 4.4],
    },
  },
  {
    id: 'b-0002',
    title: 'The Selfish Gene',
    authors: ['Dawkins, Richard'],
    description: 'A gene-centred view of evolution that reframed biology.',
    tags: ['biology', 'evolution', 'science'],
    coords: {
      pca_1_2: [0.62, 0.31],
      pca_2_3: [0.55, -0.2],
      pca_3_4: [-0.4, 0.62],
      umap: [3.8, 3.1],
    },
  },
  {
    id: 'b-0003',
    title: 'Gödel, Escher, Bach',
    authors: ['Hofstadter, Douglas'],
    description:
      'An eternal golden braid weaving logic, art, and music into a theory of mind.',
    tags: ['cognition', 'mathematics', 'philosophy'],
    coords: {
      pca_1_2: [-0.33, 0.78],
      pca_2_3: [0.2, 0.66],
      pca_3_4: [0.51, -0.11],
      umap: [1.2, 5.6],
    },
  },
  {
    id: 'b-0004',
    title: 'Thinking, Fast and Slow',
    authors: ['Kahneman, Daniel'],
    description: 'Two systems that drive the way we think and make choices.',
    tags: ['psychology', 'economics', 'decision-making'],
    coords: {
      pca_1_2: [-0.71, -0.22],
      pca_2_3: [-0.5, -0.31],
      pca_3_4: [0.13, 0.48],
      umap: [0.4, 2.9],
    },
  },
  {
    id: 'b-0005',
    title: 'Sapiens',
    authors: ['Harari, Yuval Noah'],
    description: 'A brief history of humankind from foragers to empires.',
    tags: ['history', 'anthropology'],
    coords: {
      pca_1_2: [0.05, 0.52],
      pca_2_3: [0.31, 0.09],
      pca_3_4: [-0.22, -0.35],
      umap: [2.6, 3.7],
    },
  },
  {
    id: 'b-0006',
    title: 'The Pragmatic Programmer',
    authors: ['Hunt, Andrew', 'Thomas, David'],
    description: 'Timeless, practical advice on the craft of software.',
    tags: ['software', 'engineering', 'career'],
    coords: {
      pca_1_2: [0.88, -0.44],
      pca_2_3: [0.7, 0.5],
      pca_3_4: [0.62, 0.29],
      umap: [4.9, 1.8],
    },
  },
  {
    id: 'b-0007',
    title: 'Structure and Interpretation of Computer Programs',
    authors: ['Abelson, Harold', 'Sussman, Gerald Jay'],
    description: 'The wizard book: computation as a medium for expressing ideas.',
    tags: ['software', 'computer-science', 'lisp'],
    coords: {
      pca_1_2: [0.79, -0.61],
      pca_2_3: [0.61, 0.62],
      pca_3_4: [0.7, 0.18],
      umap: [5.2, 2.1],
    },
  },
  {
    id: 'b-0008',
    title: 'The Road',
    authors: ['McCarthy, Cormac'],
    description: 'A father and son walk through the ash of a dead world.',
    tags: ['fiction', 'post-apocalyptic', 'literary'],
    coords: {
      pca_1_2: [-0.62, 0.66],
      pca_2_3: [-0.7, 0.4],
      pca_3_4: [-0.55, -0.52],
      umap: [0.9, 5.9],
    },
  },
  {
    id: 'b-0009',
    title: 'Dune',
    authors: ['Herbert, Frank'],
    description: 'Desert power, spice, and prophecy on the planet Arrakis.',
    tags: ['fiction', 'science-fiction'],
    coords: {
      pca_1_2: [-0.48, 0.35],
      pca_2_3: [-0.4, 0.61],
      pca_3_4: [-0.38, -0.2],
      umap: [1.6, 5.1],
    },
  },
  {
    id: 'b-0010',
    title: 'Cosmos',
    authors: ['Sagan, Carl'],
    description: 'A personal voyage through the universe and our place in it.',
    tags: ['science', 'astronomy', 'popular-science'],
    coords: {
      pca_1_2: [0.34, 0.14],
      pca_2_3: [0.4, -0.5],
      pca_3_4: [-0.1, 0.7],
      umap: [3.1, 3.9],
    },
  },
  {
    id: 'b-0011',
    title: 'The Beginning of Infinity',
    authors: ['Deutsch, David'],
    description: 'Explanations that transform the world, without limit.',
    tags: ['physics', 'philosophy', 'science'],
    coords: {
      pca_1_2: [0.52, 0.6],
      pca_2_3: [0.62, -0.12],
      pca_3_4: [0.05, 0.55],
      umap: [3.5, 4.6],
    },
  },
  {
    id: 'b-0012',
    title: 'Meditations',
    authors: ['Aurelius, Marcus'],
    description: 'Private notes of a Roman emperor on how to live.',
    tags: ['philosophy', 'stoicism', 'classics'],
    coords: {
      pca_1_2: [-0.85, 0.12],
      pca_2_3: [-0.6, -0.55],
      pca_3_4: [0.4, -0.6],
      umap: [0.2, 4.1],
    },
  },
]

export const fixtureProjectionMeta: ProjectionMeta = {
  layouts: [
    { mode: 'pca_1_2', label: 'PCA 1×2', variance: { pc1: 0.18, pc2: 0.11 } },
    { mode: 'pca_2_3', label: 'PCA 2×3', variance: { pc2: 0.11, pc3: 0.08 } },
    { mode: 'pca_3_4', label: 'PCA 3×4', variance: { pc3: 0.08, pc4: 0.06 } },
    { mode: 'umap', label: 'UMAP' },
  ],
}

function varianceFor(layout: LayoutMode) {
  return fixtureProjectionMeta.layouts.find((l) => l.mode === layout)?.variance
}

export function fixtureShelf(layout: LayoutMode): ShelfItem[] {
  const variance = varianceFor(layout)
  return seed.map((b) => {
    const [x, y] = b.coords[layout]
    return {
      id: b.id,
      title: b.title,
      authors: b.authors,
      format: 'kindle',
      cover_url: null,
      cluster_label: null,
      x,
      y,
      ...(variance ? { pca_variance: variance } : {}),
    }
  })
}

export function fixtureBook(id: string): BookDetail | undefined {
  const b = seed.find((s) => s.id === id)
  if (!b) return undefined
  const [x, y] = b.coords.pca_1_2
  return {
    id: b.id,
    title: b.title,
    authors: b.authors,
    format: 'kindle',
    cover_url: null,
    cluster_label: null,
    x,
    y,
    description: b.description,
    tags: b.tags,
    location: null,
  }
}
