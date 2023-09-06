import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,
  modules: ['../src/module'],
  directus: {
    auth: {
      enabled: true,
      enableGlobalAuthMiddleware: true,
      userFields: ['first_name', 'last_name']
    }
  },
  devtools: { enabled: false }
})
