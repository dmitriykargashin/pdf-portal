import type { Inspection, InspectionCreateInput, InspectionUpdateInput, InspectionStatus } from '~/types'

export function useInspections() {
  const inspections = useState<Inspection[]>('inspections', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch inspections
   */
  async function fetchInspections(params?: { agentId?: string; status?: InspectionStatus }): Promise<Inspection[]> {
    loading.value = true
    error.value = null
    
    try {
      const query = new URLSearchParams()
      if (params?.agentId) query.set('agentId', params.agentId)
      if (params?.status) query.set('status', params.status)

      const data = await $fetch(`/api/inspections?${query.toString()}`)
      inspections.value = data.inspections
      return data.inspections
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch inspections'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single inspection
   */
  async function fetchInspection(id: string): Promise<Inspection | null> {
    loading.value = true
    error.value = null
    
    try {
      const data = await $fetch(`/api/inspections/${id}`)
      return data.inspection
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch inspection'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new inspection
   */
  async function createInspection(input: InspectionCreateInput): Promise<Inspection | null> {
    loading.value = true
    error.value = null
    
    try {
      const data = await $fetch('/api/inspections', {
        method: 'POST',
        body: input
      })
      
      inspections.value = [data.inspection, ...inspections.value]
      return data.inspection
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to create inspection'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update inspection
   */
  async function updateInspection(id: string, input: Partial<InspectionUpdateInput>): Promise<Inspection | null> {
    loading.value = true
    error.value = null
    
    try {
      const data = await $fetch(`/api/inspections/${id}`, {
        method: 'PUT',
        body: input
      })
      
      const index = inspections.value.findIndex(i => i.id === id)
      if (index !== -1) {
        inspections.value[index] = data.inspection
      }
      
      return data.inspection
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to update inspection'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Format inspection date
   */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Get status color
   */
  function getStatusColor(status: InspectionStatus): 'info' | 'success' | 'error' | 'neutral' {
    switch (status) {
      case 'scheduled': return 'info'
      case 'completed': return 'success'
      case 'canceled': return 'error'
      default: return 'neutral'
    }
  }

  return {
    inspections,
    loading,
    error,
    fetchInspections,
    fetchInspection,
    createInspection,
    updateInspection,
    formatDate,
    getStatusColor
  }
}
