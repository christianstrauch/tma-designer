export interface Specimen {
  id: string
  sampleId: string
  histopathologyNumber: string
  sampleType: string
  tissueType?: string
  diagnosis?: string
  patientId?: string
  collectionDate?: string
  blockNumber?: string
  notes?: string
  [key: string]: string | undefined
}

export interface TMAPosition {
  row: number
  col: number
  specimenId: string | null
  isControl: boolean
}

export interface TMAConfig {
  rows: number
  cols: number
  name?: string
}

export interface TMAInput {
  specimens: Specimen[]
  config?: TMAConfig
  displayFields?: string[]
}

export interface TMALayout {
  name: string
  rows: number
  cols: number
  positions: {
    row: number
    col: number
    rowLabel: string
    colLabel: number
    specimenId: string | null
    isControl: boolean
  }[]
  exportedAt: string
}

export type FillDirection = 'horizontal' | 'vertical'

export type SortField = keyof Specimen

export interface AutofillConfig {
  startRow: number
  startCol: number
  direction: FillDirection
  sortField: SortField
  sortOrder: 'asc' | 'desc'
}

export const DEFAULT_DISPLAY_FIELDS: (keyof Specimen)[] = [
  'sampleId',
  'histopathologyNumber',
  'sampleType',
]

export const ALL_SPECIMEN_FIELDS: (keyof Specimen)[] = [
  'sampleId',
  'histopathologyNumber',
  'sampleType',
  'tissueType',
  'diagnosis',
  'patientId',
  'collectionDate',
  'blockNumber',
  'notes',
]

export const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  sampleId: 'Sample ID',
  histopathologyNumber: 'Histopath #',
  sampleType: 'Sample Type',
  tissueType: 'Tissue Type',
  diagnosis: 'Diagnosis',
  patientId: 'Patient ID',
  collectionDate: 'Collection Date',
  blockNumber: 'Block #',
  notes: 'Notes',
}
