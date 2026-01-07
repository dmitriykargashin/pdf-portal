import type { Agent, AgentCreateInput, AgentUpdateInput } from '~/types'

export function useAgents() {
  const agents = useState<Agent[]>('agents', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all agents (admin) or current agent (agent role)
   */
  async function fetchAgents(params?: { search?: string; status?: string }): Promise<Agent[]> {
    loading.value = true
    error.value = null
    
    try {
      const query = new URLSearchParams()
      if (params?.search) query.set('search', params.search)
      if (params?.status) query.set('status', params.status)

      const data = await $fetch(`/api/agents?${query.toString()}`)
      agents.value = data.agents
      return data.agents
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch agents'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single agent by ID
   */
  async function fetchAgent(id: string): Promise<Agent | null> {
    loading.value = true
    error.value = null
    
    try {
      const data = await $fetch(`/api/agents/${id}`)
      return data.agent
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch agent'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new agent
   */
  async function createAgent(input: AgentCreateInput): Promise<Agent | null> {
    loading.value = true
    error.value = null
    
    try {
      const data = await $fetch('/api/agents', {
        method: 'POST',
        body: input
      })
      
      agents.value = [data.agent, ...agents.value]
      return data.agent
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to create agent'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update existing agent
   */
  async function updateAgent(id: string, input: Partial<AgentUpdateInput>): Promise<Agent | null> {
    loading.value = true
    error.value = null
    
    try {
      const data = await $fetch(`/api/agents/${id}`, {
        method: 'PUT',
        body: input
      })
      
      // Update local state
      const index = agents.value.findIndex(a => a.id === id)
      if (index !== -1) {
        agents.value[index] = data.agent
      }
      
      return data.agent
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to update agent'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete agent
   */
  async function deleteAgent(id: string): Promise<boolean> {
    loading.value = true
    error.value = null
    
    try {
      await $fetch(`/api/agents/${id}`, { method: 'DELETE' })
      agents.value = agents.value.filter(a => a.id !== id)
      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to delete agent'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    agents,
    loading,
    error,
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    deleteAgent
  }
}
