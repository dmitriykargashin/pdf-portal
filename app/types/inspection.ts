// Inspection type definitions
export type InspectionStatus = 'scheduled' | 'completed' | 'canceled'

export interface Inspection {
  id: string
  agentId: string
  inspectionDate: string
  propertyAddress: string
  status: InspectionStatus
  inspectorName: string
  notes?: string
  createdAt: string
}

export interface InspectionWithAgent extends Inspection {
  agent?: {
    fullName: string
    email: string
    phone: string
    brokerageName: string
  }
}

export interface InspectionCreateInput {
  agentId: string
  inspectionDate: string
  propertyAddress: string
  status?: InspectionStatus
  inspectorName: string
  notes?: string
}

export interface InspectionUpdateInput extends Partial<InspectionCreateInput> {
  id: string
}

export interface InspectionAttachment {
  id: string
  inspectionId: string
  documentId?: string
  storagePath?: string
  createdAt: string
}

export const INSPECTION_STATUSES: { value: InspectionStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'canceled', label: 'Canceled', color: 'error' }
]
