import type { DashboardStats, RecentActivity } from '~/types'

export function useDashboard() {
  const stats = ref<DashboardStats | null>(null)
  const activity = ref<RecentActivity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch dashboard stats
   */
  async function fetchStats(): Promise<DashboardStats | null> {
    loading.value = true
    error.value = null
    
    try {
      const data = await $fetch('/api/dashboard/stats')
      stats.value = data.stats
      return data.stats
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch stats'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch recent activity
   */
  async function fetchActivity(): Promise<RecentActivity[]> {
    try {
      const data = await $fetch('/api/dashboard/activity')
      activity.value = data.activity
      return data.activity
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to fetch activity'
      return []
    }
  }

  /**
   * Format timestamp for display
   */
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return {
    stats,
    activity,
    loading,
    error,
    fetchStats,
    fetchActivity,
    formatTimestamp
  }
}
