'use client'

import { useCallback } from 'react'
import type { TMAPosition, Specimen } from '@/lib/tma-types'
import { cn } from '@/lib/utils'
import { X, Shield } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TMAGridProps {
  rows: number
  cols: number
  positions: TMAPosition[]
  specimens: Specimen[]
  onDropSpecimen: (row: number, col: number, specimenId: string) => void
  onRemoveSpecimen: (row: number, col: number) => void
  onToggleControl: (row: number, col: number) => void
  selectedStartPosition: { row: number; col: number } | null
  onSelectStartPosition: (row: number, col: number) => void
}

function getRowLabel(row: number): string {
  return String.fromCharCode(65 + row)
}

export function TMAGrid({
  rows,
  cols,
  positions,
  specimens,
  onDropSpecimen,
  onRemoveSpecimen,
  onToggleControl,
  selectedStartPosition,
  onSelectStartPosition,
}: TMAGridProps) {
  const getPosition = useCallback(
    (row: number, col: number) => {
      return positions.find((p) => p.row === row && p.col === col)
    },
    [positions]
  )

  const getSpecimen = useCallback(
    (specimenId: string | null) => {
      if (!specimenId) return null
      return specimens.find((s) => s.id === specimenId) || null
    },
    [specimens]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    const specimenId = e.dataTransfer.getData('specimenId')
    if (specimenId) {
      onDropSpecimen(row, col, specimenId)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    onToggleControl(row, col)
  }

  const handleClick = (row: number, col: number) => {
    onSelectStartPosition(row, col)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-1">
        {/* Column headers */}
        <div className="flex gap-1 pl-8">
          {Array.from({ length: cols }, (_, col) => (
            <div
              key={col}
              className="w-12 h-6 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {col + 1}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex gap-1">
            {/* Row label */}
            <div className="w-7 h-12 flex items-center justify-center text-xs font-medium text-muted-foreground">
              {getRowLabel(row)}
            </div>

            {/* Grid cells */}
            {Array.from({ length: cols }, (_, col) => {
              const position = getPosition(row, col)
              const specimen = position ? getSpecimen(position.specimenId) : null
              const isControl = position?.isControl || false
              const isOccupied = !!position?.specimenId
              const isStartPosition =
                selectedStartPosition?.row === row &&
                selectedStartPosition?.col === col

              return (
                <Tooltip key={col}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-150',
                        'hover:scale-105',
                        isControl && 'bg-control border-control',
                        isOccupied &&
                          !isControl &&
                          'bg-primary border-primary',
                        !isOccupied &&
                          !isControl &&
                          'bg-secondary border-border hover:border-primary/50',
                        isStartPosition &&
                          'ring-2 ring-accent ring-offset-2 ring-offset-background'
                      )}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, row, col)}
                      onContextMenu={(e) => handleContextMenu(e, row, col)}
                      onClick={() => handleClick(row, col)}
                    >
                      {isControl ? (
                        <Shield className="w-4 h-4 text-control-foreground" />
                      ) : isOccupied ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                          <span className="text-[10px] font-medium text-primary-foreground truncate px-1">
                            {specimen?.sampleId?.slice(-4) || '?'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveSpecimen(row, col)
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {getRowLabel(row)}
                          {col + 1}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="text-xs">
                      <p className="font-medium">
                        Position: {getRowLabel(row)}
                        {col + 1}
                      </p>
                      {isControl && (
                        <p className="text-control">Control Position</p>
                      )}
                      {specimen && (
                        <div className="mt-1 space-y-0.5">
                          <p>Sample: {specimen.sampleId}</p>
                          <p>Histopath: {specimen.histopathologyNumber}</p>
                          <p>Type: {specimen.sampleType}</p>
                          {specimen.diagnosis && (
                            <p>Diagnosis: {specimen.diagnosis}</p>
                          )}
                        </div>
                      )}
                      {!isControl && !isOccupied && (
                        <p className="text-muted-foreground">
                          Drop specimen or right-click for control
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
