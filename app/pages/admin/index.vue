<script setup lang="ts">
const { stats, activity, loading, fetchStats, fetchActivity, formatTimestamp } = useDashboard()

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchActivity()
  ])
})

const statCards = computed(() => [
  {
    title: 'Total Agents',
    value: stats.value?.totalAgents || 0,
    icon: 'i-lucide-users',
    color: 'primary'
  },
  {
    title: 'Active Agents',
    value: stats.value?.activeAgents || 0,
    icon: 'i-lucide-user-check',
    color: 'success'
  },
  {
    title: 'Inspections This Month',
    value: stats.value?.inspectionsThisMonth || 0,
    icon: 'i-lucide-clipboard-check',
    color: 'info'
  },
  {
    title: 'Documents Uploaded',
    value: stats.value?.documentsUploaded || 0,
    icon: 'i-lucide-file-text',
    color: 'warning'
  }
])

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'upload': return 'i-lucide-upload'
    case 'inspection': return 'i-lucide-clipboard-check'
    case 'agent': return 'i-lucide-user-plus'
    default: return 'i-lucide-activity'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening today.
        </p>
      </div>
      
      <div class="flex gap-2">
        <UButton
          to="/agents/new"
          color="primary"
          icon="i-lucide-user-plus"
        >
          Add Agent
        </UButton>
        <UButton
          to="/admin/inspections/new"
          color="neutral"
          variant="outline"
          icon="i-lucide-plus"
        >
          Add Inspection
        </UButton>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="stat in statCards"
        :key="stat.title"
        class="card-hover"
      >
        <div class="flex items-center gap-4">
          <div
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              `bg-${stat.color}-100 dark:bg-${stat.color}-900/20`
            ]"
          >
            <UIcon
              :name="stat.icon"
              :class="[
                'w-6 h-6',
                `text-${stat.color}-600 dark:text-${stat.color}-400`
              ]"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ stat.title }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ loading ? '—' : stat.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick actions & Recent activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Quick actions -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </template>
        
        <div class="space-y-2">
          <UButton
            to="/agents/new"
            color="neutral"
            variant="ghost"
            class="w-full justify-start"
            icon="i-lucide-user-plus"
          >
            Create New Agent
          </UButton>
          <UButton
            to="/admin/inspections/new"
            color="neutral"
            variant="ghost"
            class="w-full justify-start"
            icon="i-lucide-clipboard-plus"
          >
            Schedule Inspection
          </UButton>
          <UButton
            to="/agents"
            color="neutral"
            variant="ghost"
            class="w-full justify-start"
            icon="i-lucide-upload"
          >
            Upload Document
          </UButton>
          <UButton
            to="/admin/audit"
            color="neutral"
            variant="ghost"
            class="w-full justify-start"
            icon="i-lucide-scroll-text"
          >
            View Audit Log
          </UButton>
        </div>
      </UCard>

      <!-- Recent activity -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </template>
        
        <div v-if="activity.length === 0" class="empty-state py-8">
          <UIcon name="i-lucide-activity" class="empty-state-icon" />
          <p class="empty-state-title">No recent activity</p>
          <p class="empty-state-description">
            Activity will appear here as you use the portal.
          </p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="item in activity"
            :key="item.id"
            class="flex items-start gap-3"
          >
            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <UIcon
                :name="getActivityIcon(item.type)"
                class="w-4 h-4 text-gray-600 dark:text-gray-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.description }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTimestamp(item.timestamp) }} · {{ item.actorRole }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
