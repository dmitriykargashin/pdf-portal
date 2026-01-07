<script setup lang="ts">
import type { InspectionWithAgent } from '~/types'

const { inspections, fetchInspections, loading, formatDate, getStatusColor } = useInspections()

const statusFilter = ref<string | null>(null)

onMounted(() => fetchInspections())

watch(statusFilter, () => {
  fetchInspections({
    status: statusFilter.value && statusFilter.value !== 'all' ? statusFilter.value : undefined
  })
})

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' }
]

const columns = [
  { id: 'inspectionDate', header: 'Date' },
  { id: 'propertyAddress', header: 'Property' },
  { id: 'agent', header: 'Agent' },
  { id: 'inspectorName', header: 'Inspector' },
  { id: 'status', header: 'Status' },
  { id: 'actions', header: '' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Inspections
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          View and manage all property inspections
        </p>
      </div>
      
      <UButton
        to="/admin/inspections/new"
        color="primary"
        icon="i-lucide-plus"
      >
        Add Inspection
      </UButton>
    </div>

    <!-- Filters -->
    <UCard>
      <USelect
        v-model="statusFilter"
        :items="statusOptions"
        placeholder="Filter by status"
        class="w-full sm:w-48"
      />
    </UCard>

    <!-- Inspections table -->
    <UCard :ui="{ body: { padding: '' } }">
      <UTable
        :columns="columns"
        :data="inspections"
        :loading="loading"
      >
        <template #inspectionDate-cell="{ row }">
          {{ formatDate(row.original.inspectionDate) }}
        </template>

        <template #agent-cell="{ row }">
          <NuxtLink
            v-if="row.original.agent"
            :to="`/agents/${row.original.agentId}`"
            class="text-primary-600 dark:text-primary-400 hover:underline"
          >
            {{ row.original.agent.fullName }}
          </NuxtLink>
          <span v-else class="text-gray-400">—</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="getStatusColor(row.original.status)"
            variant="subtle"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            :to="`/admin/inspections/${row.original.id}`"
            color="neutral"
            variant="ghost"
            icon="i-lucide-eye"
            size="sm"
          />
        </template>

        <template #empty>
          <div class="empty-state">
            <UIcon name="i-lucide-clipboard-check" class="empty-state-icon" />
            <p class="empty-state-title">No inspections found</p>
            <p class="empty-state-description">
              {{ statusFilter ? 'Try adjusting your filter' : 'Schedule your first inspection' }}
            </p>
            <UButton
              v-if="!statusFilter"
              to="/admin/inspections/new"
              color="primary"
              class="mt-4"
            >
              Add Inspection
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
