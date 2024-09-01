'use client'

import { type ReactNode, useState } from 'react'
import useKonami from 'react-use-konami'

export default function SecWrapper({ children }: { children: ReactNode }) {
  const [accepted, setAccepted] = useState(false)

  useKonami(
    () => {
      setAccepted(true)
    },
    {
      code: ['x', 'x', 'x'],
    },
  )

  return <>{process.env.NODE_ENV === 'development' || accepted ? children : null}</>
}
