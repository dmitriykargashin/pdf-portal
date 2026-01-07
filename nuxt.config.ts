// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxt/ui',
    // '@nuxtjs/supabase', // Disabled for demo mode - using JSON database
    '@vueuse/nuxt'
  ],

  // Supabase config - uncomment module above and configure for production
  // supabase: {
  //   redirect: false,
  //   redirectOptions: {
  //     login: '/login',
  //     callback: '/login',
  //     exclude: ['/login']
  //   }
  // },

  runtimeConfig: {
    // Server-side only
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    agentPasscode: process.env.AGENT_PASSCODE || 'agent123',
    tursoDbUrl: process.env.TURSO_DATABASE_URL || '',
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN || '',
    storageMode: process.env.STORAGE_MODE || 'local',
    // Public (exposed to client)
    public: {
      // No public config needed for now
    }
  },

  app: {
    head: {
      title: 'Real Estate Agent Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real Estate Agent Portal - Manage profiles, documents, and inspections' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // Server-side auto-imports
  nitro: {
    imports: {
      dirs: ['./server/utils']
    }
  }
})
