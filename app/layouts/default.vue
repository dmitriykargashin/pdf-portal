<script setup lang="ts">
const route = useRoute()
const { user, logout, isAdmin } = useAuth()
const isSidebarOpen = ref(true)
const isMobile = ref(false)

// Check for mobile viewport
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Navigation items for admin
const adminNavItems = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Agents', to: '/agents', icon: 'i-lucide-users' },
  { label: 'Inspections', to: '/admin/inspections', icon: 'i-lucide-clipboard-check' },
  { label: 'Audit Log', to: '/admin/audit', icon: 'i-lucide-scroll-text' }
]

// Navigation items for agents
const agentNavItems = [
  { label: 'My Profile', to: '/portal', icon: 'i-lucide-user' },
  { label: 'Documents', to: '/portal/documents', icon: 'i-lucide-file-text' },
  { label: 'Inspections', to: '/portal/inspections', icon: 'i-lucide-clipboard-check' }
]

const navItems = computed(() => isAdmin.value ? adminNavItems : agentNavItems)

const isActive = (path: string) => {
  // Exact match for root paths
  if (path === '/admin' || path === '/portal') {
    return route.path === path
  }
  // For other paths, check if current route starts with this path
  // Make sure we match full path segments (e.g., /agents shouldn't match /agents-new)
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="isMobile && isSidebarOpen"
        class="drawer-overlay"
        @click="toggleSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="sidebar">
      <aside
        v-show="isSidebarOpen"
        :class="[
          'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col',
          isMobile ? 'shadow-xl' : ''
        ]"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <UIcon name="i-lucide-building-2" class="w-5 h-5 text-white" />
            </div>
            <span class="font-semibold text-gray-900 dark:text-white">Agent Portal</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="isMobile && toggleSidebar()"
          >
            <UIcon :name="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- User section -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3 px-3 py-2">
            <UAvatar
              :text="user?.agentName?.[0] || (isAdmin ? 'A' : 'U')"
              size="sm"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ user?.agentName || (isAdmin ? 'Admin' : 'User') }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ isAdmin ? 'Administrator' : 'Agent' }}
              </p>
            </div>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            class="w-full mt-2 justify-start"
            icon="i-lucide-log-out"
            @click="handleLogout"
          >
            Sign out
          </UButton>
        </div>
      </aside>
    </Transition>

    <!-- Main content -->
    <div
      :class="[
        'transition-all duration-300',
        isSidebarOpen && !isMobile ? 'lg:ml-64' : ''
      ]"
    >
      <!-- Header -->
      <header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 lg:px-6 sticky top-0 z-40">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-menu"
          class="mr-4"
          @click="toggleSidebar"
        />
        
        <div class="flex-1" />

        <!-- Header actions -->
        <div class="flex items-center gap-2">
          <UColorModeButton />
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
