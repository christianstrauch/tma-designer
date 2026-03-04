import type { Specimen, TMAInput } from './tma-types'

const sampleTypes = ['FFPE', 'Frozen', 'Fresh', 'Fixed']
const tissueTypes = ['Breast', 'Colon', 'Lung', 'Liver', 'Kidney', 'Prostate', 'Ovary', 'Brain', 'Skin', 'Pancreas']
const diagnoses = ['Carcinoma', 'Adenoma', 'Normal', 'Hyperplasia', 'Dysplasia', 'Metastatic', 'Benign']

// Deterministic pseudo-random function using a seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateSpecimens(count: number): Specimen[] {
  const specimens: Specimen[] = []

  for (let i = 1; i <= count; i++) {
    // Use index as seed for deterministic values
    const seed1 = i * 13
    const seed2 = i * 17
    const seed3 = i * 23
    const seed4 = i * 29
    const seed5 = i * 31
    const seed6 = i * 37
    const seed7 = i * 41
    const seed8 = i * 43

    const year = 2023 + Math.floor(seededRandom(seed1) * 2)
    const month = String(Math.floor(seededRandom(seed2) * 12) + 1).padStart(2, '0')
    const day = String(Math.floor(seededRandom(seed3) * 28) + 1).padStart(2, '0')

    specimens.push({
      id: `SPEC-${String(i).padStart(4, '0')}`,
      sampleId: `S${year}-${String(i).padStart(5, '0')}`,
      histopathologyNumber: `HP${year}${month}${String(i).padStart(4, '0')}`,
      sampleType: sampleTypes[Math.floor(seededRandom(seed4) * sampleTypes.length)],
      tissueType: tissueTypes[Math.floor(seededRandom(seed5) * tissueTypes.length)],
      diagnosis: diagnoses[Math.floor(seededRandom(seed6) * diagnoses.length)],
      patientId: `PT-${String(Math.floor(seededRandom(seed7) * 9000) + 1000)}`,
      collectionDate: `${year}-${month}-${day}`,
      blockNumber: `B${Math.floor(seededRandom(seed8) * 20) + 1}`,
      notes: seededRandom(i * 47) > 0.7 ? 'Quality verified' : undefined,
    })
  }

  return specimens
}

export const mockTMAInput: TMAInput = {
  specimens: generateSpecimens(48),
  config: {
    /*rows: 8,
    cols: 12,*/
    name: 'TMA-2024-001',
  },
  displayFields: ['sampleId', 'histopathologyNumber', 'sampleType'],
}

export function generateMockInput(specimenCount: number): TMAInput {
  return {
    specimens: generateSpecimens(specimenCount),
    displayFields: ['sampleId', 'histopathologyNumber', 'sampleType'],
  }
}
