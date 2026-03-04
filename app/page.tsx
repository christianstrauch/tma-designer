'use client'

import { TMADesigner } from '@/components/tma-designer'
import { mockTMAInput } from '@/lib/mock-specimens'

export default function Page() {
  // In production, this would come from props or an API
  // For demo purposes, we use mock data
  return <TMADesigner input={mockTMAInput} />
}
