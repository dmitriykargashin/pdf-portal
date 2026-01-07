<script setup lang="ts">
import type { Agent } from '~/types'

const { agentId } = useAuth()
const { fetchAgent, loading } = useAgents()

const agent = ref<Agent | null>(null)

onMounted(async () => {
  if (agentId.value) {
    agent.value = await fetchAgent(agentId.value)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        My Profile
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        View your agent profile information
      </p>
    </div>

    <!-- Profile card -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-4">
          <UAvatar
            v-if="agent"
            :text="agent.fullName[0]"
            size="xl"
          />
          <USkeleton v-else class="w-16 h-16 rounded-full" />
          <div>
            <h2 v-if="agent" class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ agent.fullName }}
            </h2>
            <USkeleton v-else class="h-6 w-40" />
            <p v-if="agent" class="text-gray-500 dark:text-gray-400">
              {{ agent.brokerageName }}
            </p>
            <USkeleton v-else class="h-4 w-32 mt-1" />
          </div>
        </div>
      </template>

      <div v-if="agent" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p class="text-gray-900 dark:text-white">{{ agent.email }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Phone</p>
          <p class="text-gray-900 dark:text-white">{{ agent.phone }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">License Number</p>
          <p class="text-gray-900 dark:text-white">{{ agent.licenseNumber || '—' }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
          <UBadge
            :color="agent.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ agent.status }}
          </UBadge>
        </div>
        <div class="sm:col-span-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">Address</p>
          <p class="text-gray-900 dark:text-white">{{ agent.address || '—' }}</p>
        </div>
      </div>
      
      <div v-else class="space-y-4">
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
        <USkeleton class="h-4 w-2/3" />
      </div>
    </UCard>

    <!-- Quick links -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UCard class="card-hover cursor-pointer" @click="navigateTo('/portal/documents')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <UIcon name="i-lucide-file-text" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              My Documents
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              View and download your PDFs
            </p>
          </div>
        </div>
      </UCard>

      <UCard class="card-hover cursor-pointer" @click="navigateTo('/portal/inspections')">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
            <UIcon name="i-lucide-clipboard-check" class="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Inspection History
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              View your property inspections
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
