'use client'

import { Avatar } from '@nextui-org/avatar'
import { Card, CardBody } from '@nextui-org/card'
import { Switch } from '@nextui-org/switch'
import useSWR from 'swr'

function trimWalletAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Home() {
  const { data, error, mutate } = useSWR('/api/setting', fetcher)

  const onChange = async (key: string, value: boolean) => {
    const res = await fetch('/api/setting', {
      method: 'POST',
      body: JSON.stringify({ [key]: value }),
    })
    const data = await res.json()
    if (data.success) {
      mutate()
    }
  }

  return (
    <main className='w-screen bg-background justify-center items-center min-h-screen'>
      <section className='max-w-lg min-h-screen mx-auto py-16'>
        <div className='flex flex-col gap-4'>
          <Avatar
            className='w-20 h-20 text-large'
            isBordered
            color='warning'
            radius='lg'
            src='https://t3.ftcdn.net/jpg/04/56/00/16/360_F_456001627_vYt7ZFjxEQ1sshme67JAXorKRPo8gsfN.jpg'
          />
          <div className='flex flex-col leading-none justify-center'>
            <span className='text-xl font-semibold'>sonhavietnamese.blink</span>
            <span className='text-sm text-default-400'>{trimWalletAddress('Fv3ajwjGvuoe5Mrgucg12WWjND4oGQo4tUC6xPBqvfnb')}</span>
          </div>
        </div>

        <div className='flex gap-1 mt-3'>
          <span className='text-small px-2.5 py-0.5 rounded-lg bg-default-400 text-default-700 '>Developer</span>
          <span className='text-small px-2.5 py-0.5 rounded-lg bg-default-400 text-default-700 '>SuperteamVN</span>
        </div>

        <div className='flex flex-col gap-2 mt-8'>
          <span className='text-base mb-1 text-default-400'>Features</span>

          <Card className='py-4'>
            <CardBody className='py-0 pr-3 pl-5 flex flex-row items-center justify-between'>
              <div className='flex flex-col'>
                <h4 className=' font-semibold'>Cheer up!</h4>
                <small className='text-default-500 mt-1'>Let people tip you small amount of $BLINK</small>
              </div>
              <div>
                <Switch onChange={(e) => onChange('cheerup', e.target.checked)} isSelected={data?.cheerup ?? false} size='sm'></Switch>
              </div>
            </CardBody>
          </Card>

          <Card className='py-4'>
            <CardBody className='py-0 pr-3 pl-5 flex flex-row items-center justify-between'>
              <div className='flex flex-col'>
                <h4 className=' font-semibold'>Message</h4>
                <small className='text-default-500 mt-1'>Allow people to send you a short message</small>
              </div>
              <div>
                <Switch onChange={(e) => onChange('message', e.target.checked)} isSelected={data?.message ?? false} size='sm'></Switch>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  )
}
