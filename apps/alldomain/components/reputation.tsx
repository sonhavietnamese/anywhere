import { CONFIG } from '@/config/endpoints'
import useEnvironment from '@/hooks/use-environment'
import { createMessage } from '@/libs/utils'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { useWalletgo } from '@roninnetwork/walletgo'
import { Check, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Reputation({ reputation, clientID, fetchUsers }: { reputation: number; clientID: string; fetchUsers: () => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [reputationValue, setReputationValue] = useState(reputation?.toString() ?? '0')

  const environment = useEnvironment()

  const { account, walletProvider } = useWalletgo()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!account || !walletProvider || !Number(reputationValue)) {
      return
    }

    const message = createMessage(account.toLowerCase(), Date.now())
    const signature = await walletProvider.getSigner().signMessage(message)

    try {
      const response = await fetch(`${CONFIG[environment].url}/v1/cms/user-reputation/punish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Message ${message} Signature ${signature}`,
        },
        body: JSON.stringify({
          punishments: [
            {
              clientID,
              amount: Number(reputationValue),
              type: 'punishment',
            },
          ],
        }),
      })

      if (response.ok) {
        toast.success('Updated')
        setIsEditing(false)
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data._errorMessage)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to update')
    }
  }

  return (
    <div className='flex w-full flex-col gap-1'>
      <span className='text-default-300 text-sm'>Reputation</span>
      {isEditing ? (
        <form onSubmit={handleSubmit} className='flex items-center justify-between gap-2'>
          <Input
            label=''
            placeholder='0'
            labelPlacement='outside'
            size={'md'}
            type='text'
            value={reputationValue}
            onChange={(e) => setReputationValue(e.target.value)}
          />
          <div className='flex gap-2'>
            <Button size='sm' isIconOnly variant='light' onClick={() => setIsEditing(false)}>
              <X width={16} />
            </Button>

            <Button size='sm' isIconOnly color='primary' type='submit'>
              <Check width={16} />
            </Button>
          </div>
        </form>
      ) : (
        <div className='flex items-center justify-between gap-2'>
          <span className='text-left font-semibold text-2xl'>{reputation}</span>
          <Button size='sm' isIconOnly variant='light' onClick={() => setIsEditing(true)}>
            <Pencil width={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
