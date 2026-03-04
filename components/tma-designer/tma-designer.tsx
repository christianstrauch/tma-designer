'use client'

import { useState, useCallback, useMemo } from 'react'
import type {
  TMAInput,
  TMAPosition,
  TMALayout,
  AutofillConfig,
  Specimen,
} from '@/lib/tma-types'
import { DEFAULT_DISPLAY_FIELDS } from '@/lib/tma-types'
import { TMAGrid } from './tma-grid'
import { SpecimenList } from './specimen-list'
import { ConfigPanel } from './config-panel'
import { ExportDialog } from './export-dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface TMADesignerProps {
  input: TMAInput
}

function getRowLabel(row: number): string {
  return String.fromCharCode(65 + row)
}

function initializePositions(rows: number, cols: number): TMAPosition[] {
  const positions: TMAPosition[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        row,
        col,
        specimenId: null,
        isControl: false,
      })
    }
  }
  return positions
}

export function TMADesigner({ input }: TMADesignerProps) {
  const [rows, setRows] = useState(input.config?.rows || 8)
  const [cols, setCols] = useState(input.config?.cols || 12)
  const [tmaName, setTmaName] = useState(input.config?.name || 'TMA-001')
  const [positions, setPositions] = useState<TMAPosition[]>(() =>
    initializePositions(input.config?.rows || 8, input.config?.cols || 12)
  )
  const [displayFields, setDisplayFields] = useState<(keyof Specimen)[]>(
    (input.displayFields as (keyof Specimen)[]) || DEFAULT_DISPLAY_FIELDS
  )
  const [selectedSpecimens, setSelectedSpecimens] = useState<Set<string>>(
    new Set()
  )
  const [selectedStartPosition, setSelectedStartPosition] = useState<{
    row: number
    col: number
  } | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [exportLayout, setExportLayout] = useState<TMALayout | null>(null)

  const isConfigLocked = !!input.config?.rows && !!input.config?.cols

  // Update grid size
  const handleRowsChange = useCallback(
    (newRows: number) => {
      if (newRows < 1 || newRows > 26) return
      setRows(newRows)
      setPositions((prev) => {
        const newPositions: TMAPosition[] = []
        for (let row = 0; row < newRows; row++) {
          for (let col = 0; col < cols; col++) {
            const existing = prev.find((p) => p.row === row && p.col === col)
            newPositions.push(
              existing || { row, col, specimenId: null, isControl: false }
            )
          }
        }
        return newPositions
      })
      setSelectedStartPosition(null)
    },
    [cols]
  )

  const handleColsChange = useCallback(
    (newCols: number) => {
      if (newCols < 1 || newCols > 50) return
      setCols(newCols)
      setPositions((prev) => {
        const newPositions: TMAPosition[] = []
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < newCols; col++) {
            const existing = prev.find((p) => p.row === row && p.col === col)
            newPositions.push(
              existing || { row, col, specimenId: null, isControl: false }
            )
          }
        }
        return newPositions
      })
      setSelectedStartPosition(null)
    },
    [rows]
  )

  // Drop specimen onto grid
  const handleDropSpecimen = useCallback(
    (row: number, col: number, specimenId: string) => {
      setPositions((prev) => {
        // Remove specimen from any previous position
        const updated = prev.map((p) =>
          p.specimenId === specimenId ? { ...p, specimenId: null } : p
        )
        // Place at new position if not control
        return updated.map((p) =>
          p.row === row && p.col === col && !p.isControl
            ? { ...p, specimenId }
            : p
        )
      })
      setSelectedSpecimens((prev) => {
        const next = new Set(prev)
        next.delete(specimenId)
        return next
      })
    },
    []
  )

  // Remove specimen from position
  const handleRemoveSpecimen = useCallback((row: number, col: number) => {
    setPositions((prev) =>
      prev.map((p) =>
        p.row === row && p.col === col ? { ...p, specimenId: null } : p
      )
    )
  }, [])

  // Toggle control position
  const handleToggleControl = useCallback((row: number, col: number) => {
    setPositions((prev) =>
      prev.map((p) =>
        p.row === row && p.col === col
          ? { ...p, isControl: !p.isControl, specimenId: null }
          : p
      )
    )
  }, [])

  // Select start position for autofill
  const handleSelectStartPosition = useCallback(
    (row: number, col: number) => {
      const position = positions.find((p) => p.row === row && p.col === col)
      if (position?.isControl) return
      setSelectedStartPosition({ row, col })
    },
    [positions]
  )

  // Autofill specimens
  const handleAutofill = useCallback(
    (config: AutofillConfig) => {
      const selectedList = input.specimens.filter((s) =>
        selectedSpecimens.has(s.id)
      )

      // Sort specimens
      const sorted = [...selectedList].sort((a, b) => {
        const aVal = String(a[config.sortField] || '')
        const bVal = String(b[config.sortField] || '')
        const comparison = aVal.localeCompare(bVal)
        return config.sortOrder === 'asc' ? comparison : -comparison
      })

      // Get available positions starting from the selected position
      const availablePositions: { row: number; col: number }[] = []
      if (config.direction === 'horizontal') {
        for (let row = config.startRow; row < rows; row++) {
          for (let col = row === config.startRow ? config.startCol : 0; col < cols; col++) {
            const pos = positions.find((p) => p.row === row && p.col === col)
            if (pos && !pos.isControl && !pos.specimenId) {
              availablePositions.push({ row, col })
            }
          }
        }
      } else {
        for (let col = config.startCol; col < cols; col++) {
          for (let row = col === config.startCol ? config.startRow : 0; row < rows; row++) {
            const pos = positions.find((p) => p.row === row && p.col === col)
            if (pos && !pos.isControl && !pos.specimenId) {
              availablePositions.push({ row, col })
            }
          }
        }
      }

      // Place specimens
      setPositions((prev) => {
        const updated = [...prev]
        sorted.forEach((specimen, idx) => {
          if (idx < availablePositions.length) {
            const { row, col } = availablePositions[idx]
            const posIdx = updated.findIndex(
              (p) => p.row === row && p.col === col
            )
            if (posIdx !== -1) {
              updated[posIdx] = { ...updated[posIdx], specimenId: specimen.id }
            }
          }
        })
        return updated
      })

      setSelectedSpecimens(new Set())
      setSelectedStartPosition(null)
    },
    [input.specimens, selectedSpecimens, positions, rows, cols]
  )

  // Export layout
  const handleExport = useCallback(() => {
    const layout: TMALayout = {
      name: tmaName,
      rows,
      cols,
      positions: positions.map((p) => ({
        row: p.row,
        col: p.col,
        rowLabel: getRowLabel(p.row),
        colLabel: p.col + 1,
        specimenId: p.specimenId,
        isControl: p.isControl,
      })),
      exportedAt: new Date().toISOString(),
    }
    setExportLayout(layout)
    setExportDialogOpen(true)
  }, [tmaName, rows, cols, positions])

  // Reset layout
  const handleReset = useCallback(() => {
    setResetDialogOpen(true)
  }, [])

  const confirmReset = useCallback(() => {
    setPositions(initializePositions(rows, cols))
    setSelectedSpecimens(new Set())
    setSelectedStartPosition(null)
    setResetDialogOpen(false)
  }, [rows, cols])

  // Stats
  const stats = useMemo(() => {
    const total = positions.length
    const filled = positions.filter((p) => p.specimenId).length
    const controls = positions.filter((p) => p.isControl).length
    const available = total - controls
    return { total, filled, controls, available }
  }, [positions])

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Specimen List */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        <SpecimenList
          specimens={input.specimens}
          displayFields={displayFields}
          positions={positions}
          selectedSpecimens={selectedSpecimens}
          onSelectionChange={setSelectedSpecimens}
        />
      </div>

      {/* Center - TMA Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{tmaName}</h1>
            <p className="text-xs text-muted-foreground">
              {stats.filled}/{stats.available} positions filled | {stats.controls}{' '}
              controls
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-primary" />
              Specimen
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-control" />
              Control
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-secondary border border-border" />
              Empty
            </span>
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 p-6 overflow-auto">
          <ScrollArea className="h-full">
            <div className="inline-block min-w-max">
              <TMAGrid
                rows={rows}
                cols={cols}
                positions={positions}
                specimens={input.specimens}
                onDropSpecimen={handleDropSpecimen}
                onRemoveSpecimen={handleRemoveSpecimen}
                onToggleControl={handleToggleControl}
                selectedStartPosition={selectedStartPosition}
                onSelectStartPosition={handleSelectStartPosition}
              />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Right Panel - Configuration */}
      <div className="w-72 border-l border-border bg-card">
        <ScrollArea className="h-full">
          <ConfigPanel
            rows={rows}
            cols={cols}
            onRowsChange={handleRowsChange}
            onColsChange={handleColsChange}
            tmaName={tmaName}
            onNameChange={setTmaName}
            displayFields={displayFields}
            onDisplayFieldsChange={setDisplayFields}
            selectedStartPosition={selectedStartPosition}
            selectedSpecimensCount={selectedSpecimens.size}
            onAutofill={handleAutofill}
            onExport={handleExport}
            onReset={handleReset}
            isConfigLocked={isConfigLocked}
          />
        </ScrollArea>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        layout={exportLayout}
      />

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset TMA Layout</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all specimens and control positions from the
              grid. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>
              Reset Layout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
