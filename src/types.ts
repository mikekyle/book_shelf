// Types mirror book_core read APIs. See api-contracts.md.

export type LayoutMode = 'pca_1_2' | 'pca_2_3' | 'pca_3_4' | 'umap'

export type BookFormat = 'kindle' | 'physical' | 'other'

export interface PcaVariance {
  // Keys follow the layout pair (pc1/pc2, pc2/pc3, or pc3/pc4).
  [component: string]: number
}

export interface ShelfItem {
  id: string
  title: string
  authors: string[]
  format: BookFormat
  cover_url: string | null
  cluster_label: string | null
  x: number
  y: number
  pca_variance?: PcaVariance
}

export interface BookDetail extends ShelfItem {
  description?: string | null
  tags?: string[]
  location?: string | null
}

export interface ProjectionMeta {
  layouts: Array<{
    mode: LayoutMode
    label: string
    // Variance explained per component, only meaningful for PCA layouts.
    variance?: PcaVariance
  }>
}
