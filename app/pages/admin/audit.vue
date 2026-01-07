<script setup lang="ts">
import type { AuditLog } from '~/types'

const logs = ref<AuditLog[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/audit')
    logs.value = data.logs
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'UPLOAD_DOC': return 'i-lucide-upload'
    case 'DELETE_DOC': return 'i-lucide-trash-2'
    case 'CREATE_INSPECTION': return 'i-lucide-clipboard-plus'
    case 'UPDATE_INSPECTION': return 'i-lucide-clipboard-edit'
    case 'CREATE_AGENT': return 'i-lucide-user-plus'
    case 'UPDATE_AGENT': return 'i-lucide-user-cog'
    case 'DELETE_AGENT': return 'i-lucide-user-x'
    case 'LOGIN': return 'i-lucide-log-in'
    case 'LOGOUT': return 'i-lucide-log-out'
    default: return 'i-lucide-activity'
  }
}

const getActionColor = (action: string) => {
  if (action.includes('DELETE')) return 'error'
  if (action.includes('CREATE') || action.includes('UPLOAD')) return 'success'
  if (action.includes('UPDATE')) return 'warning'
  if (action === 'LOGIN') return 'info'
  return 'neutral'
}

const formatAction = (action: string) => {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Audit Log
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        View system activity and changes
      </p>
    </div>

    <!-- Log entries -->
    <UCard>
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-16" />
      </div>

      <div v-else-if="logs.length === 0" class="empty-state">
        <UIcon name="i-lucide-scroll-text" class="empty-state-icon" />
        <p class="empty-state-title">No audit logs</p>
        <p class="empty-state-description">
          Activity will be logged here as you use the system.
        </p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <div
          v-for="log in logs"
          :key="log.id"
          class="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              `bg-${getActionColor(log.action)}-100 dark:bg-${getActionColor(log.action)}-900/20`
            ]"
          >
            <UIcon
              :name="getActionIcon(log.action)"
              :class="[
                'w-5 h-5',
                `text-${getActionColor(log.action)}-600 dark:text-${getActionColor(log.action)}-400`
              ]"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <UBadge
                :color="getActionColor(log.action)"
                variant="subtle"
                size="sm"
              >
                {{ formatAction(log.action) }}
              </UBadge>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                by {{ log.actorRole }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {{ log.entityType }} {{ log.entityId ? `(${log.entityId.slice(0, 8)}...)` : '' }}
            </p>
            <p v-if="log.metadata" class="text-xs text-gray-400 mt-1 font-mono">
              {{ JSON.stringify(log.metadata) }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ formatDate(log.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
