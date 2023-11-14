import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,
  modules: ['../src/module'],
  directus: {
    auth: {
      enabled: true,
      enableGlobalAuthMiddleware: true,
      userFields: ['first_name', 'last_name'],
      redirect: {
        home: '/',
        login: '/auth/login',
        logout: '/auth/login',
        requestPassword: '/auth/request-password',
        resetPassword: '/auth/reset-password',
        callback: '/auth/callback'
      }
    }
  },
  devtools: { enabled: false }
})
