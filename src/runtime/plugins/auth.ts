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

    const { _loggedIn } = useDirectusSession()

    if (initialized.value === false) {
      const { path } = useRoute()

      const { fetchUser } = useDirectusAuth()
      const { _refreshToken, _accessToken, refresh } = useDirectusSession()

      if (_accessToken.get()) {
        await fetchUser()
      } else {
        const isCallback = path === config.auth.redirect.callback
        const isLoggedIn = _loggedIn.get() === 'true'

        if (isCallback || isLoggedIn || _refreshToken.get()) {
          await refresh()
          if (_accessToken.get()) {
            await fetchUser()
          }
        }
      }
    }

    initialized.value = true

    const { user } = useDirectusAuth()

    if (user.value) {
      _loggedIn.set(true)
      const { callHook } = useNuxtApp()
      await callHook('auth:loggedIn', true)
    } else {
      _loggedIn.set(false)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
})
