<script setup lang="ts">
const { agentId } = useAuth()
const { inspections, fetchInspections, loading, formatDate, getStatusColor } = useInspections()

onMounted(() => {
  if (agentId.value) {
    fetchInspections({ agentId: agentId.value })
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Inspection History
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        View your property inspection records
      </p>
    </div>

    <!-- Inspections -->
    <UCard>
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-20" />
      </div>

      <div v-else-if="inspections.length === 0" class="empty-state">
        <UIcon name="i-lucide-clipboard-check" class="empty-state-icon" />
        <p class="empty-state-title">No inspections</p>
        <p class="empty-state-description">
          Your inspection history will appear here.
        </p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <NuxtLink
          v-for="inspection in inspections"
          :key="inspection.id"
          :to="`/portal/inspections/${inspection.id}`"
          class="block py-4 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-4 px-4 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-home" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ inspection.propertyAddress }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(inspection.inspectionDate) }} · Inspector: {{ inspection.inspectorName }}
                </p>
                <p v-if="inspection.notes" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {{ inspection.notes }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UBadge
                :color="getStatusColor(inspection.status)"
                variant="subtle"
              >
                {{ inspection.status }}
              </UBadge>
              <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>
