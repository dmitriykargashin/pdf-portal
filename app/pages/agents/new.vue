<script setup lang="ts">
import type { AgentCreateInput } from '~/types'

const router = useRouter()
const { createAgent, loading } = useAgents()
const toast = useToast()

const form = ref<AgentCreateInput>({
  fullName: '',
  email: '',
  phone: '',
  brokerageName: '',
  licenseNumber: '',
  address: '',
  status: 'active'
})

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const handleSubmit = async () => {
  const agent = await createAgent(form.value)
  
  if (agent) {
    toast.add({
      title: 'Success',
      description: 'Agent created successfully',
      color: 'success'
    })
    router.push(`/agents/${agent.id}`)
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to create agent',
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
        to="/agents"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
      />
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Add New Agent
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Create a new agent profile
        </p>
      </div>
    </div>

    <!-- Form -->
    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Full Name" name="fullName" required class="sm:col-span-2">
            <UInput
              v-model="form.fullName"
              placeholder="John Doe"
              icon="i-lucide-user"
            />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="john@example.com"
              icon="i-lucide-mail"
            />
          </UFormField>

          <UFormField label="Phone" name="phone" required>
            <UInput
              v-model="form.phone"
              type="tel"
              placeholder="(555) 123-4567"
              icon="i-lucide-phone"
            />
          </UFormField>

          <UFormField label="Brokerage Name" name="brokerageName" required>
            <UInput
              v-model="form.brokerageName"
              placeholder="ABC Real Estate"
              icon="i-lucide-building"
            />
          </UFormField>

          <UFormField label="License Number" name="licenseNumber">
            <UInput
              v-model="form.licenseNumber"
              placeholder="RE-123456"
              icon="i-lucide-badge"
            />
          </UFormField>

          <UFormField label="Address" name="address" class="sm:col-span-2">
            <UTextarea
              v-model="form.address"
              placeholder="123 Main St, City, State 12345"
              :rows="2"
            />
          </UFormField>

          <UFormField label="Status" name="status">
            <USelect
              v-model="form.status"
              :items="statusOptions"
            />
          </UFormField>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <UButton
            to="/agents"
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
            Create Agent
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
