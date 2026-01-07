import type { Document, DocumentCategory } from '~/types'

interface UploadDocumentParams {
  file: File
  agentId: string
  inspectionId?: string
  title: string
  category: DocumentCategory
}

export function useDocuments() {
  const documents = useState<Document[]>('documents', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch documents for an agent or inspection
   */
  async function fetchDocuments(params?: { agentId?: string; inspectionId?: string; category?: DocumentCategory }): Promise<Document[]> {
    loading.value = true
    error.value = null
    
    try {
      const query = new URLSearchParams()
      if (params?.agentId) query.set('agentId', params.agentId)
      if (params?.inspectionId) query.set('inspectionId', params.inspectionId)
      if (params?.category) query.set('category', params.category)

      const data = await $fetch(`/api/documents?${query.toString()}`)
      documents.value = data.documents
      return data.documents
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch documents'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Upload a new document
   */
  async function uploadDocument(params: UploadDocumentParams): Promise<Document | null> {
    loading.value = true
    error.value = null
    
    try {
      const formData = new FormData()
      formData.append('file', params.file)
      formData.append('agentId', params.agentId)
      formData.append('title', params.title)
      formData.append('category', params.category)
      if (params.inspectionId) {
        formData.append('inspectionId', params.inspectionId)
      }

      const data = await $fetch('/api/documents', {
        method: 'POST',
        body: formData
      })
      
      documents.value = [data.document, ...documents.value]
      return data.document
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to upload document'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get signed URL for document viewing/download
   */
  async function getDocumentUrl(docId: string): Promise<string | null> {
    try {
      const data = await $fetch(`/api/documents/${docId}/url`)
      return data.url
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to get document URL'
      return null
    }
  }

  /**
   * Delete a document
   */
  async function deleteDocument(docId: string): Promise<boolean> {
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      documents.value = documents.value.filter(d => d.id !== docId)
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to delete document'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Format file size for display
   */
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    getDocumentUrl,
    deleteDocument,
    formatFileSize
  }
}
