'use client'

import { trimWallet } from '@/libs/utils'
import { useWalletgoStore } from '@/stores/walletgo'
import { Button } from '@nextui-org/button'
import { useWalletgo } from '@roninnetwork/walletgo'

export default function ConnectButton() {
	const [setOpen] = useWalletgoStore((s) => [s.setOpen])
	const { account } = useWalletgo()

	return (
		<>
			{account ? (
				<Button className={'h-full w-full'} variant={'faded'} onPress={() => setOpen(true)}>
					<span className="">{trimWallet(account)}</span>
				</Button>
			) : (
				<Button className={'h-full w-full'} onPress={() => setOpen(true)} color={'primary'}>
					<span className="">Connect</span>
				</Button>
			)}
		</>
	)
}
