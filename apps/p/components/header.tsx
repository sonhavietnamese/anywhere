'use client'

import { siteConfig } from '@/config/site'
import useEnvironment from '@/hooks/use-environment'
import { Chip } from '@nextui-org/chip'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const page = siteConfig.pageDefine[pathname.split('/')[2] as keyof typeof siteConfig.pageDefine]
  const environment = useEnvironment()

  return (
    <header className={'b-3  flex w-full flex-col justify-end border-b border-b-divider bg-background px-3'}>
      {page && (
        <>
          <h1 className={' flex items-center gap-2 font-bold text-3xl'}>
            {page.title}

            {environment === 'development' && (
              <Chip size={'sm'} variant='flat' color='warning'>
                <span className={'font-medium'}>Development</span>
              </Chip>
            )}
          </h1>
          <span className={'mb-3 text-default-400'}>{page.description}</span>
        </>
      )}
    </header>
  )
}
