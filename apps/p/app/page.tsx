'use client'

import { Button } from '@nextui-org/button'
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <main className='w-screen bg-background justify-center items-center min-h-screen'>
      <section className='max-w-lg min-h-screen bg-red-300 mx-auto'>
        <Button>Hello</Button>
      </section>
    </main>
  )
}
