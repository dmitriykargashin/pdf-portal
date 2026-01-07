<script setup lang="ts">
const { isAdmin } = useAuth()

// Redirect based on role
onMounted(async () => {
  if (isAdmin.value) {
    await navigateTo('/admin')
  } else {
    await navigateTo('/portal')
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      <p class="mt-4 text-gray-500">Redirecting...</p>
    </div>
  </div>
</template>
