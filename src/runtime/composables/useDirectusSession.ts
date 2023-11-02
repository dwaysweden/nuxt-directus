import jwtDecode from 'jwt-decode'
import {
  deleteCookie,
  getCookie,
  setCookie,
  parseCookies,
  splitCookiesString,
  appendResponseHeader
} from 'h3'
import type { AuthenticationData } from '../types'
import {
  useRequestEvent,
  useRuntimeConfig,
  useState,
  useCookie,
  useRequestHeaders,
  navigateTo
} from '#imports'

export default function () {
  const event = useRequestEvent()
  const config: any = useRuntimeConfig().public.directus

  const accessTokenCookieName = config.auth.accessTokenCookieName
  const refreshTokenCookieName = config.auth.refreshTokenCookieName
  const expiresTokenCookieName = config.auth.expiresTokenCookieName
  const msRefreshBeforeExpires = config.auth.msRefreshBeforeExpires
  const loggedInName = 'logged_in'

  const accessToken = {
    get: () =>
      process.server
        ? event.context[accessTokenCookieName] ||
          getCookie(event, accessTokenCookieName)
        : useCookie(accessTokenCookieName).value,
    set: (value: string) => {
      if (process.server) {
        event.context[accessTokenCookieName] = value
        setCookie(event, accessTokenCookieName, value, {
          sameSite: 'lax',
          secure: true
        })
      } else {
        useCookie(accessTokenCookieName, {
          sameSite: 'lax',
          secure: true
        }).value = value
      }
    }
  }

  const refreshToken = {
    get: () => process.server && getCookie(event, refreshTokenCookieName)
  }

  const expires = {
    get: () =>
      process.server
        ? event.context[expiresTokenCookieName] ||
          getCookie(event, expiresTokenCookieName)
        : useCookie(expiresTokenCookieName).value,
    set: (value: number) => {
      if (process.server) {
        event.context[expiresTokenCookieName] = value
        setCookie(event, expiresTokenCookieName, value.toString(), {
          sameSite: 'lax',
          secure: true
        })
      } else {
        useCookie(expiresTokenCookieName, {
          sameSite: 'lax',
          secure: true
        }).value = value.toString()
      }
    }
  }

  const authCookies = {
    clear: () => {
      if (process.server) {
        const cookies = parseCookies(event)
        const authCookie = Object.keys(cookies)
        for (const cookie of authCookie) {
          if (cookie.includes('auth')) {
            deleteCookie(event, cookie)
          }
        }
      } else {
        const getCookies = document.cookie.split(';').map((e) => e.trim())
        const cookies = getCookies.map((e) => e.slice(0, e.indexOf('=')))
        for (const cookie of cookies) {
          if (cookie.includes('auth')) {
            useCookie(cookie).value = null
          }
        }
      }
    }
  }

  const loggedIn = {
    get: () => process.client && localStorage.getItem(loggedInName),
    set: (value: boolean) =>
      process.client && localStorage.setItem(loggedInName, value.toString())
  }

  async function refresh() {
    const isRefreshOn = useState('refresh-loading', () => false)
    const user = useState('user')

    if (isRefreshOn.value) {
      return
    }

    isRefreshOn.value = true

    const cookie = useRequestHeaders(['cookie']).cookie || ''

    await $fetch
      .raw<AuthenticationData>('/auth/refresh', {
        baseURL: config.rest.baseUrl,
        method: 'POST',
        credentials: 'include',
        body: {
          mode: 'cookie'
        },
        headers: {
          cookie
        }
      })
      .then((res) => {
        const setCookie = res.headers.get('set-cookie') || ''
        const cookies = splitCookiesString(setCookie)
        for (const cookie of cookies) {
          appendResponseHeader(event, 'set-cookie', cookie)
        }
        if (res._data) {
          accessToken.set(res._data?.data.access_token)
          expires.set(res._data?.data.expires)
          loggedIn.set(true)
        }
        isRefreshOn.value = false
        return res
      })
      .catch(async () => {
        isRefreshOn.value = false
        authCookies.clear()
        loggedIn.set(false)
        user.value = null
        if (process.client) {
          await navigateTo(config.auth.redirect.logout)
        }
      })
  }

  async function getToken() {
    const token = accessToken.get()

    if (token && isTokenExpired(token)) {
      try {
        // Refresh the token
        await refresh()

        // Retry the fetch request
        return getToken()
      } catch (error) {
        // console.log('Error refreshing token:', error)
        // Handle the error
        // ...
      }
    }

    return accessToken.get()
  }

  function isTokenExpired(token: string) {
    const decoded = jwtDecode(token) as { exp: number }
    const expires = decoded.exp * 1000 - msRefreshBeforeExpires
    return expires < Date.now()
  }

  return {
    refresh,
    getToken,
    accessToken,
    refreshToken,
    expires,
    loggedIn,
    authCookies
  }
}
