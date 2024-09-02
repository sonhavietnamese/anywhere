import type { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}
export type Environment = 'production' | 'development'

export type Bundle = 'gold' | 'starter-pack'

export type Inputs = {
  clientID: string
  amount?: number
}

export type RequestBody = {
  clientIDs: string[]
  bundle: Bundle
  amount?: number
}
