import a from './assets/app/a.svg'
import aActive from './assets/app/a-active.svg'
import a46 from './assets/app/a46.svg'
import a46Active from './assets/app/a46-active.svg'

export const devOrigin = 'https://qa-saas.zhuboup.com'

export const groupIcons: Record<string, { icon: string; active: string }> = {
  9: { icon: a46, active: a46Active },
  default: { icon: a, active: aActive }
}

export function getGroupIcons(id: number) {
  return groupIcons[String(id)] || groupIcons.default
}
