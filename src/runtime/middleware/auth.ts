import {
  defineNuxtRouteMiddleware,
  useRuntimeConfig,
  navigateTo,
  useDirectusAuth
} from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const config: any = useRuntimeConfig().public.directus

  if (
    to.path === config.auth.redirect.login ||
    to.path === config.auth.redirect.callback ||
    to.path === config.auth.redirect.requestPassword ||
    (to.path === config.auth.redirect.resetPassword && !!to.query?.token)
  ) {
    return
  }

  if (config.auth.enableGlobalAuthMiddleware === true) {
    if (to.meta.auth === false) {
      return
    }
  }

  const { user } = useDirectusAuth()

  if (!user.value) {
    return navigateTo({
      path: config.auth.redirect.login
    })
  }
})
