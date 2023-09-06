import common from '../middleware/common'
import auth from '../middleware/auth'
import guest from '../middleware/guest'
import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useRuntimeConfig,
  useState,
  useDirectusAuth,
  useRoute,
  useDirectusSession,
  useNuxtApp
} from '#imports'

export default defineNuxtPlugin(async () => {
  try {
    const config = useRuntimeConfig().public.directus

    addRouteMiddleware('auth', auth, {
      global: config.auth.enableGlobalAuthMiddleware
    })

    addRouteMiddleware('common', common, { global: true })

    addRouteMiddleware('guest', guest)

    const initialized = useState('auth-initialized', () => false)

    const { loggedIn, authCookies } = useDirectusSession()

    if (initialized.value === false) {
      const { path } = useRoute()
      const { fetchUser } = useDirectusAuth()
      const { refreshToken, accessToken, refresh } = useDirectusSession()

      if (accessToken.get()) {
        await fetchUser()
      } else {
        const isCallback = path === config.auth.redirect.callback
        const isLoggedIn = loggedIn.get() === 'true'

        if (isCallback || isLoggedIn || refreshToken.get()) {
          await refresh()
          if (accessToken.get()) {
            await fetchUser()
          }
        }
      }
    }

    initialized.value = true

    const { user } = useDirectusAuth()

    if (user.value) {
      loggedIn.set(true)
      const { callHook } = useNuxtApp()
      await callHook('auth:loggedIn', true)
    } else {
      authCookies.clear()
      loggedIn.set(false)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})
