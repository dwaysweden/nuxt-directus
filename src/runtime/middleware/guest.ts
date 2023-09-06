import {
  defineNuxtRouteMiddleware,
  useRuntimeConfig,
  navigateTo,
  useDirectusAuth
} from '#imports'

export default defineNuxtRouteMiddleware((to, from) => {
  const config: any = useRuntimeConfig().public.directus

  if (
    to.path === config.auth.redirect.login ||
    to.path === config.auth.redirect.callback ||
    to.path === config.auth.redirect.requestPassword ||
    (to.path === config.auth.redirect.resetPassword && !!to.query?.token)
  ) {
    return
  }

  const { user } = useDirectusAuth()

  if (user.value) {
    const returnToPath = from.query.redirect?.toString()
    const redirectTo = returnToPath || config.auth.redirect.home
    return navigateTo(redirectTo)
  }
})
