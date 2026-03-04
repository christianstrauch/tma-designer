'use client'

import { useState, useMemo } from 'react'
import type { Specimen, TMAPosition } from '@/lib/tma-types'
import { FIELD_LABELS } from '@/lib/tma-types'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, GripVertical, Check } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SpecimenListProps {
  specimens: Specimen[]
  displayFields: (keyof Specimen)[]
  positions: TMAPosition[]
  selectedSpecimens: Set<string>
  onSelectionChange: (selected: Set<string>) => void
}

export function SpecimenList({
  specimens,
  displayFields,
  positions,
  selectedSpecimens,
  onSelectionChange,
}: SpecimenListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const placedSpecimenIds = useMemo(() => {
    return new Set(
      positions.filter((p) => p.specimenId).map((p) => p.specimenId as string)
    )
  }, [positions])

  const filteredSpecimens = useMemo(() => {
    if (!searchQuery.trim()) return specimens

    const query = searchQuery.toLowerCase()
    return specimens.filter((specimen) =>
      displayFields.some((field) =>
        String(specimen[field] || '')
          .toLowerCase()
          .includes(query)
      )
    )
  }, [specimens, searchQuery, displayFields])

  const availableSpecimens = useMemo(() => {
    return filteredSpecimens.filter((s) => !placedSpecimenIds.has(s.id))
  }, [filteredSpecimens, placedSpecimenIds])

  const handleDragStart = (e: React.DragEvent, specimen: Specimen) => {
    e.dataTransfer.setData('specimenId', specimen.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const toggleSelection = (specimenId: string) => {
    const newSelected = new Set(selectedSpecimens)
    if (newSelected.has(specimenId)) {
      newSelected.delete(specimenId)
    } else {
      newSelected.add(specimenId)
    }
    onSelectionChange(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedSpecimens.size === availableSpecimens.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(availableSpecimens.map((s) => s.id)))
    }
  }

  const stats = {
    total: specimens.length,
    placed: placedSpecimenIds.size,
    available: specimens.length - placedSpecimenIds.size,
    selected: selectedSpecimens.size,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="space-y-3 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Specimens</h3>
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary">{stats.total} total</Badge>
            <Badge variant="default">{stats.placed} placed</Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search specimens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        {/* Select all */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={
                availableSpecimens.length > 0 &&
                selectedSpecimens.size === availableSpecimens.length
              }
              onCheckedChange={toggleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Select all available
            </label>
          </div>
          {selectedSpecimens.size > 0 && (
            <Badge variant="outline" className="text-accent border-accent">
              {selectedSpecimens.size} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Specimen List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredSpecimens.map((specimen) => {
            const isPlaced = placedSpecimenIds.has(specimen.id)
            const isSelected = selectedSpecimens.has(specimen.id)

            return (
              <div
                key={specimen.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, specimen)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-md border transition-all',
                  isPlaced
                    ? 'bg-primary/10 border-primary/30 opacity-60'
                    : 'bg-secondary border-border hover:border-primary/50 cursor-grab active:cursor-grabbing',
                  isSelected && !isPlaced && 'border-accent bg-accent/10'
                )}
              >
                {!isPlaced && (
                  <>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(specimen.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </>
                )}
                {isPlaced && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0 ml-6" />
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  {displayFields.map((field, idx) => (
                    <p
                      key={field}
                      className={cn(
                        'truncate',
                        idx === 0
                          ? 'text-sm font-medium text-foreground'
                          : 'text-xs text-muted-foreground'
                      )}
                      title={`${FIELD_LABELS[field]}: ${specimen[field] || '-'}`}
                    >
                      {idx === 0
                        ? specimen[field]
                        : `${FIELD_LABELS[field]}: ${specimen[field] || '-'}`}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}

          {filteredSpecimens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No specimens found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
