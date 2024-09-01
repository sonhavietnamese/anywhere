'use client'

import { siteConfig } from '@/config/site'
import useEnvironment from '@/hooks/use-environment'
import { cn } from '@nextui-org/theme'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MainNav() {
  const pathname = usePathname()
  const environment = useEnvironment()

  return (
    <div className={'flex flex-col gap-2 p-4 px-2'}>
      {siteConfig.mainNav.map((navItem, index) => (
        <Link
          key={navItem.name}
          href={`/${environment}${navItem.href}`}
          className={cn(
            'flex gap-2 rounded-xl p-3 py-2 hover:bg-[#18181B] hover:opacity-100',
            pathname.includes(navItem.href) ? 'bg-[#18181B] opacity-100' : 'opacity-80',
          )}>
          <figure className='aspect-square w-7'>
            <Image src={navItem.icon} width={0} height={0} sizes='100wh' className='h-auto w-full' alt='' />
          </figure>
          <span className={cn(' font-medium text-[16px]', pathname.includes(navItem.href) ? 'text-default-800' : 'text-default-400')}>
            {navItem.name}
          </span>
        </Link>
      ))}
    </div>
  )
}
