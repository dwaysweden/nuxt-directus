interface Rest {
  baseUrl: string
  nuxtBaseUrl: string
}

interface Graphql {
  enabled: true
  httpEndpoint: string
  wsEndpoint?: string
}

interface Authentication {
  enabled: true
  userFields?: Array<string | object>
  enableGlobalAuthMiddleware: boolean
  refreshTokenCookieName?: string
  accessTokenCookieName?: string
  expiresTokenCookieName?: string
  msRefreshBeforeExpires?: number
  redirect: {
    login: string
    logout: string
    home: string
    callback: string
    resetPassword: string
    requestPassword: string
  }
}

export interface PublicConfig {
  rest: Rest
  auth: Authentication | { enabled: false }
  graphql: Graphql | { enabled: false }
}
