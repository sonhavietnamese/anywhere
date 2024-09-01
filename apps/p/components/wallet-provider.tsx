// @ts-ignore
// @ts-nocheck
'use client'

import { idConnectorImpl } from '@/config/walletgo-connector'
import { useWalletgoStore } from '@/stores/walletgo'
import { SupportedChainIds, WalletWidget, WalletgoProvider, createRoninWallets } from '@roninnetwork/walletgo'
import type { ReactNode } from 'react'

export const EXPLORER_DOMAIN: string = 'https://app.roninchain.com'
export const EXPLORER_CDN_URL: string = 'https://cdn.skymavis.com/explorer-cdn'
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string

const DEFAULT_WALLETS = createRoninWallets({
	projectId: WC_PROJECT_ID,
	noGnosisSafe: true,
	clientMeta: {
		name: 'App.Ronin',
		description: 'App.Ronin',
		icons: [`${EXPLORER_CDN_URL}/asset/favicon/apple-touch-icon.png`],
		url: EXPLORER_DOMAIN,
		redirect: {
			universal: EXPLORER_DOMAIN,
		},
	},
	ethereumWallets: false,
})

const WITH_ID_WALLETS = [idConnectorImpl, ...DEFAULT_WALLETS]

interface IProviderProps {
	children: ReactNode
}

export function WalletgoCustomProvider({ children }: IProviderProps) {
	const { open, setOpen } = useWalletgoStore()

	return (
		<WalletgoProvider defaultChainId={SupportedChainIds.RoninMainet}>
			<WalletWidget
				wallets={WITH_ID_WALLETS}
				isOpen={open}
				onOpen={() => setOpen(true)}
				onClose={() => setOpen(false)}
			/>
			{children}
		</WalletgoProvider>
	)
}
