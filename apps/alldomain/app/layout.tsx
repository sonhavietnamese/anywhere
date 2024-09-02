import { Providers } from '@/app/providers'

import '@/styles/globals.css'
import clsx from 'clsx'
import type { Metadata, Viewport } from 'next'
import { type ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    default: 'Profile | sonhavietnamese.blink',
    template: `%s - Profile`,
  },
  description: 'Profile',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang='en'>
      <body className={clsx('min-h-screen bg-background font-sans antialiased')}>
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>{children} </Providers>
      </body>
    </html>
  )
}
