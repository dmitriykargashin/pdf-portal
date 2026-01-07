<script setup lang="ts">
import type { Agent, InspectionCreateInput, InspectionStatus } from '~/types'
import { INSPECTION_STATUSES } from '~/types/inspection'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { agents, fetchAgents } = useAgents()
const { createInspection, loading } = useInspections()

// Pre-select agent if passed in query
const preSelectedAgentId = route.query.agentId as string | undefined

const form = ref<InspectionCreateInput>({
  agentId: preSelectedAgentId || '',
  inspectionDate: '',
  propertyAddress: '',
  inspectorName: '',
  status: 'scheduled',
  notes: ''
})

const selectedAgent = ref<Agent | null>(null)

// Fetch agents on mount
onMounted(async () => {
  await fetchAgents()
  
  if (preSelectedAgentId) {
    selectedAgent.value = agents.value.find(a => a.id === preSelectedAgentId) || null
  }
})

// Watch for agent selection changes
watch(() => form.value.agentId, (newId) => {
  selectedAgent.value = agents.value.find(a => a.id === newId) || null
})

const agentOptions = computed(() => 
  agents.value.map(a => ({
    label: `${a.fullName} - ${a.brokerageName}`,
    value: a.id
  }))
)

const handleSubmit = async () => {
  if (!form.value.agentId || !form.value.inspectionDate || !form.value.propertyAddress || !form.value.inspectorName) {
    toast.add({
      title: 'Error',
      description: 'Please fill in all required fields',
      color: 'error'
    })
    return
  }
  
  const inspection = await createInspection(form.value)
  
  if (inspection) {
    toast.add({
      title: 'Success',
      description: 'Inspection created successfully',
      color: 'success'
    })
    router.push('/admin/inspections')
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to create inspection',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Page header -->
    <div class="flex items-center gap-4">
      <UButton
        to="/admin/inspections"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
      />
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Schedule Inspection
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Create a new property inspection
        </p>
      </div>
    </div>

    <!-- Agent info card (if selected) -->
    <UCard v-if="selectedAgent" class="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
      <div class="flex items-center gap-4">
        <UAvatar
          :text="selectedAgent.fullName[0]"
          size="lg"
        />
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ selectedAgent.fullName }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ selectedAgent.brokerageName }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ selectedAgent.email }} · {{ selectedAgent.phone }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- Form -->
    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <UFormField label="Agent" name="agentId" required>
          <USelect
            v-model="form.agentId"
            :items="agentOptions"
            placeholder="Select an agent"
            searchable
          />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Inspection Date" name="inspectionDate" required>
            <UInput
              v-model="form.inspectionDate"
              type="date"
            />
          </UFormField>

          <UFormField label="Status" name="status">
            <USelect
              v-model="form.status"
              :items="INSPECTION_STATUSES"
            />
          </UFormField>
        </div>

        <UFormField label="Property Address" name="propertyAddress" required>
          <UTextarea
            v-model="form.propertyAddress"
            placeholder="123 Main Street, City, State 12345"
            :rows="2"
          />
        </UFormField>

        <UFormField label="Inspector Name" name="inspectorName" required>
          <UInput
            v-model="form.inspectorName"
            placeholder="Inspector name"
            icon="i-lucide-user"
          />
        </UFormField>

        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="form.notes"
            placeholder="Additional notes about the inspection..."
            :rows="3"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <UButton
            to="/admin/inspections"
            color="neutral"
            variant="outline"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
          >
            Create Inspection
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
