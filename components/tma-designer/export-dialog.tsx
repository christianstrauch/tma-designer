'use client'

import { useState } from 'react'
import type { TMALayout } from '@/lib/tma-types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, Copy, Download } from 'lucide-react'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layout: TMALayout | null
}

export function ExportDialog({ open, onOpenChange, layout }: ExportDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!layout) return null

  const jsonString = JSON.stringify(layout, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${layout.name.replace(/\s+/g, '-').toLowerCase()}-layout.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filledPositions = layout.positions.filter(
    (p) => p.specimenId && !p.isControl
  ).length
  const controlPositions = layout.positions.filter((p) => p.isControl).length
  const emptyPositions =
    layout.positions.length - filledPositions - controlPositions

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export TMA Layout</DialogTitle>
          <DialogDescription>
            Review and export your TMA layout as JSON
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-secondary rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{layout.rows}</p>
              <p className="text-xs text-muted-foreground">Rows</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{layout.cols}</p>
              <p className="text-xs text-muted-foreground">Columns</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{filledPositions}</p>
              <p className="text-xs text-muted-foreground">Specimens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-control">{controlPositions}</p>
              <p className="text-xs text-muted-foreground">Controls</p>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">JSON Output</p>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-64 rounded-md border border-border bg-muted">
              <pre className="p-4 text-xs font-mono text-foreground">
                {jsonString}
              </pre>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
