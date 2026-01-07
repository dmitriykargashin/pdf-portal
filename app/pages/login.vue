<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { login, checkSession, isAuthenticated, isAdmin } = useAuth()
const { agents, fetchAgents } = useAgents()

const toast = useToast()

const loginType = ref<'admin' | 'agent'>('admin')
const adminPassword = ref('')
const selectedAgentId = ref('')
const agentPasscode = ref('')
const isLoading = ref(false)

// Copy to clipboard helper
const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      title: 'Copied!',
      description: `${type} copied to clipboard`,
      color: 'success'
    })
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Load agents for dropdown
onMounted(async () => {
  // Check if already logged in
  await checkSession()
  if (isAuthenticated.value) {
    if (isAdmin.value) {
      await navigateTo('/admin')
    } else {
      await navigateTo('/portal')
    }
    return
  }
  
  // Fetch agents for dropdown (using public endpoint would be needed, for now mock)
  // In production, you'd have a public endpoint to list agents for login
})

const handleSubmit = async () => {
  isLoading.value = true
  
  try {
    let result
    
    if (loginType.value === 'admin') {
      if (!adminPassword.value) {
        toast.add({
          title: 'Error',
          description: 'Please enter the admin password',
          color: 'error'
        })
        return
      }
      
      result = await login({
        role: 'admin',
        password: adminPassword.value
      })
    } else {
      if (!selectedAgentId.value || !agentPasscode.value) {
        toast.add({
          title: 'Error',
          description: 'Please select an agent and enter the passcode',
          color: 'error'
        })
        return
      }
      
      result = await login({
        role: 'agent',
        agentId: selectedAgentId.value,
        passcode: agentPasscode.value
      })
    }
    
    if (result.success) {
      toast.add({
        title: 'Success',
        description: 'Login successful',
        color: 'success'
      })
      
      if (loginType.value === 'admin') {
        await navigateTo('/admin')
      } else {
        await navigateTo('/portal')
      }
    } else {
      toast.add({
        title: 'Error',
        description: result.error || 'Login failed',
        color: 'error'
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <UCard class="shadow-xl">
      <template #header>
        <div class="text-center">
          <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-building-2" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Portal
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Sign in to your account
          </p>
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Login type toggle -->
        <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            type="button"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              loginType === 'admin'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
            @click="loginType = 'admin'"
          >
            Admin
          </button>
          <button
            type="button"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              loginType === 'agent'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
            @click="loginType = 'agent'"
          >
            Agent
          </button>
        </div>

        <!-- Admin login form -->
        <div v-if="loginType === 'admin'" class="space-y-4">
          <UFormField label="Admin Password" name="password">
            <UInput
              v-model="adminPassword"
              type="password"
              placeholder="Enter admin password"
              icon="i-lucide-lock"
              size="lg"
            />
          </UFormField>
          
          <!-- Demo hint -->
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">🔑 Demo Credentials</p>
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs text-blue-600 dark:text-blue-400">Password: <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin123</code></p>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-copy"
                @click="copyToClipboard('admin123', 'Password')"
              />
            </div>
          </div>
        </div>

        <!-- Agent login form -->
        <div v-else class="space-y-4">
          <UFormField label="Email" name="agentId">
            <UInput
              v-model="selectedAgentId"
              type="email"
              placeholder="Enter your email"
              icon="i-lucide-mail"
              size="lg"
            />
          </UFormField>
          
          <UFormField label="Passcode" name="passcode">
            <UInput
              v-model="agentPasscode"
              type="password"
              placeholder="Enter agent passcode"
              icon="i-lucide-key"
              size="lg"
            />
          </UFormField>
          
          <!-- Demo hint -->
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">🔑 Demo Credentials</p>
            <div class="flex items-center justify-between gap-2 mb-2">
              <p class="text-xs text-blue-600 dark:text-blue-400">Passcode: <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">agent123</code></p>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-copy"
                @click="copyToClipboard('agent123', 'Passcode')"
              />
            </div>
            <p class="text-xs text-blue-600 dark:text-blue-400 mb-1">Test Account:</p>
            <div class="flex items-center justify-between gap-2">
              <code class="text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded">david.thompson@cityproperties.com</code>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-copy"
                @click="copyToClipboard('david.thompson@cityproperties.com', 'Email')"
              />
            </div>
          </div>
        </div>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="isLoading"
        >
          Sign in
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          {{ loginType === 'admin' ? 'Internal staff access only' : 'Use your registered email to sign in' }}
        </p>
      </template>
    </UCard>
  </div>
</template>
