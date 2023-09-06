import type { RestCommand } from '@directus/sdk'
import { useNuxtApp } from '#imports'

// eslint-disable-next-line require-await
export default async function useDirectusRest(
  options: RestCommand<object, DirectusSchema>
): Promise<object> {
  const { $directus } = useNuxtApp()

  return $directus.rest.request(options)
}
