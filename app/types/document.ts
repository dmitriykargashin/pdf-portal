// Document type definitions
export type DocumentCategory = 'W9' | 'Agreement' | 'Insurance' | 'InspectionReport' | 'Other'

export interface Document {
  id: string
  agentId: string
  inspectionId?: string  // Optional - links document to a specific inspection
  title: string
  category: DocumentCategory
  fileName: string
  fileSize: number
  mimeType: string
  storagePath: string
  uploadedBy: string
  createdAt: string
}

export interface DocumentWithInspection extends Document {
  inspection?: {
    id: string
    propertyAddress: string
    inspectionDate: string
    status: string
  }
}

export interface DocumentCreateInput {
  agentId: string
  inspectionId?: string
  title: string
  category: DocumentCategory
  fileName: string
  fileSize: number
  mimeType: string
  storagePath: string
  uploadedBy: string
}

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'W9', label: 'W9 Form' },
  { value: 'Agreement', label: 'Agreement' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'InspectionReport', label: 'Inspection Report' },
  { value: 'Other', label: 'Other' }
]
