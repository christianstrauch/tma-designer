'use client'

import { useState } from 'react'
import type {
  AutofillConfig,
  SortField,
  FillDirection,
  Specimen,
} from '@/lib/tma-types'
import { ALL_SPECIMEN_FIELDS, FIELD_LABELS } from '@/lib/tma-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Grid3X3,
  Settings2,
  Wand2,
  ChevronDown,
  Download,
  RotateCcw,
} from 'lucide-react'

interface ConfigPanelProps {
  rows: number
  cols: number
  onRowsChange: (rows: number) => void
  onColsChange: (cols: number) => void
  tmaName: string
  onNameChange: (name: string) => void
  displayFields: (keyof Specimen)[]
  onDisplayFieldsChange: (fields: (keyof Specimen)[]) => void
  selectedStartPosition: { row: number; col: number } | null
  selectedSpecimensCount: number
  onAutofill: (config: AutofillConfig) => void
  onExport: () => void
  onReset: () => void
  isConfigLocked: boolean
}

function getRowLabel(row: number): string {
  return String.fromCharCode(65 + row)
}

export function ConfigPanel({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  tmaName,
  onNameChange,
  displayFields,
  onDisplayFieldsChange,
  selectedStartPosition,
  selectedSpecimensCount,
  onAutofill,
  onExport,
  onReset,
  isConfigLocked,
}: ConfigPanelProps) {
  const [direction, setDirection] = useState<FillDirection>('horizontal')
  const [sortField, setSortField] = useState<SortField>('sampleId')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleAutofill = () => {
    if (!selectedStartPosition) return
    onAutofill({
      startRow: selectedStartPosition.row,
      startCol: selectedStartPosition.col,
      direction,
      sortField,
      sortOrder,
    })
  }

  const toggleDisplayField = (field: keyof Specimen) => {
    if (displayFields.includes(field)) {
      if (displayFields.length > 1) {
        onDisplayFieldsChange(displayFields.filter((f) => f !== field))
      }
    } else {
      onDisplayFieldsChange([...displayFields, field])
    }
  }

  return (
    <div className="space-y-4 p-4">
      {/* TMA Name */}
      <div className="space-y-2">
        <Label htmlFor="tma-name">TMA Name</Label>
        <Input
          id="tma-name"
          value={tmaName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter TMA name..."
          className="bg-secondary border-border"
        />
      </div>

      {/* Grid Configuration */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Grid Configuration
          </span>
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rows" className="text-xs">
                Rows
              </Label>
              <Input
                id="rows"
                type="number"
                min={1}
                max={26}
                value={rows}
                onChange={(e) => onRowsChange(Number(e.target.value))}
                disabled={isConfigLocked}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cols" className="text-xs">
                Columns
              </Label>
              <Input
                id="cols"
                type="number"
                min={1}
                max={50}
                value={cols}
                onChange={(e) => onColsChange(Number(e.target.value))}
                disabled={isConfigLocked}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Grid size: {rows} x {cols} = {rows * cols} positions
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Display Fields */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Display Fields
          </span>
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {ALL_SPECIMEN_FIELDS.map((field) => (
            <div key={field} className="flex items-center gap-2">
              <Checkbox
                id={`field-${field}`}
                checked={displayFields.includes(field)}
                onCheckedChange={() => toggleDisplayField(field)}
              />
              <label
                htmlFor={`field-${field}`}
                className="text-sm cursor-pointer"
              >
                {FIELD_LABELS[field]}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Autofill */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
          <span className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Autofill Options
          </span>
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Start Position</Label>
            <div className="h-9 px-3 rounded-md bg-secondary border border-border flex items-center text-sm">
              {selectedStartPosition
                ? `${getRowLabel(selectedStartPosition.row)}${selectedStartPosition.col + 1}`
                : 'Click a grid cell to select'}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Fill Direction</Label>
            <Select
              value={direction}
              onValueChange={(v) => setDirection(v as FillDirection)}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">
                  Horizontal first (left to right)
                </SelectItem>
                <SelectItem value="vertical">
                  Vertical first (top to bottom)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Sort By</Label>
              <Select
                value={sortField}
                onValueChange={(v) => setSortField(v as SortField)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_SPECIMEN_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {FIELD_LABELS[field]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Order</Label>
              <Select
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAutofill}
            disabled={!selectedStartPosition || selectedSpecimensCount === 0}
            className="w-full"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Autofill {selectedSpecimensCount > 0 && `(${selectedSpecimensCount})`}
          </Button>
          <p className="text-xs text-muted-foreground">
            Select specimens from the list and click a starting position on the
            grid
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="pt-4 border-t border-border space-y-2">
        <Button onClick={onExport} className="w-full" variant="default">
          <Download className="w-4 h-4 mr-2" />
          Export TMA Layout
        </Button>
        <Button onClick={onReset} variant="outline" className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Layout
        </Button>
      </div>
    </div>
  )
}
