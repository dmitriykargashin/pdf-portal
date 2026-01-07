<script setup lang="ts">
import type { Agent } from '~/types'

const { agents, loading, fetchAgents, deleteAgent } = useAgents()
const toast = useToast()

const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const showDeleteModal = ref(false)
const agentToDelete = ref<Agent | null>(null)

// Fetch agents on mount and when filters change
onMounted(() => fetchAgents())

watch([searchQuery, statusFilter], () => {
  fetchAgents({
    search: searchQuery.value || undefined,
    status: statusFilter.value && statusFilter.value !== 'all' ? statusFilter.value : undefined
  })
}, { debounce: 300 })

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const columns = [
  { id: 'fullName', header: 'Name' },
  { id: 'brokerageName', header: 'Brokerage' },
  { id: 'phone', header: 'Phone' },
  { id: 'email', header: 'Email' },
  { id: 'status', header: 'Status' },
  { id: 'actions', header: '' }
]

const confirmDelete = (agent: Agent) => {
  agentToDelete.value = agent
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!agentToDelete.value) return
  
  const success = await deleteAgent(agentToDelete.value.id)
  
  if (success) {
    toast.add({
      title: 'Success',
      description: 'Agent deleted successfully',
      color: 'success'
    })
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to delete agent',
      color: 'error'
    })
  }
  
  showDeleteModal.value = false
  agentToDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Agents
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Manage all real estate agents
        </p>
      </div>
      
      <UButton
        to="/agents/new"
        color="primary"
        icon="i-lucide-user-plus"
      >
        Add Agent
      </UButton>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex flex-col sm:flex-row gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search agents..."
          icon="i-lucide-search"
          class="flex-1"
        />
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="Filter by status"
          class="w-full sm:w-48"
        />
      </div>
    </UCard>

    <!-- Agents table -->
    <UCard :ui="{ body: { padding: '' } }">
      <UTable
        :columns="columns"
        :data="agents"
        :loading="loading"
        class="w-full"
      >
        <template #fullName-cell="{ row }">
          <NuxtLink
            :to="`/agents/${row.original.id}`"
            class="font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            {{ row.original.fullName }}
          </NuxtLink>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton
              :to="`/agents/${row.original.id}`"
              color="neutral"
              variant="ghost"
              icon="i-lucide-eye"
              size="sm"
            />
            <UButton
              :to="`/agents/${row.original.id}?edit=true`"
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              size="sm"
            />
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="sm"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>

        <template #empty>
          <div class="empty-state">
            <UIcon name="i-lucide-users" class="empty-state-icon" />
            <p class="empty-state-title">No agents found</p>
            <p class="empty-state-description">
              {{ searchQuery || statusFilter ? 'Try adjusting your filters' : 'Get started by adding your first agent' }}
            </p>
            <UButton
              v-if="!searchQuery && !statusFilter"
              to="/agents/new"
              color="primary"
              class="mt-4"
            >
              Add Agent
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-error-100 dark:bg-error-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-error-600 dark:text-error-400" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Agent
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </template>

          <p class="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>{{ agentToDelete?.fullName }}</strong>?
            All associated documents and inspections will also be removed.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="showDeleteModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                @click="handleDelete"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
