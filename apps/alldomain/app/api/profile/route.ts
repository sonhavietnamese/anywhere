import { ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from '@solana/actions'
import { ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { NextResponse } from 'next/server'

const HELIUS_RPC = 'https://devnet.helius-rpc.com/?api-key=3aa7d7b0-5f60-4b0f-a719-edcf4dfb2504'
const connection = new Connection(HELIUS_RPC)

export async function GET(req: Request) {
  return Response.json({
    headers: ACTIONS_CORS_HEADERS,
  })
}

// ensures cors
export const OPTIONS = GET

export async function POST(req: Request) {
  const body = (await req.json()) as { account: string; signature: string }
  const account = new PublicKey(body.account)

  const tx = await createBlankTransaction(account)

  const payload = await createPostResponse({
    fields: {
      links: {
        next: {
          type: 'inline',
          action: {
            description: ``,
            icon: `/tutorial.png`,
            label: ``,
            title: `Hoppin | Tutorial`,
            type: 'action',
            links: {
              actions: [
                {
                  label: `Hop in`,
                  href: `/api/action?stage=start&step=0`,
                },
              ],
            },
          },
        },
      },
      transaction: tx,
    },
  })

  return NextResponse.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

const createBlankTransaction = async (sender: PublicKey) => {
  const transaction = new Transaction()
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000,
    }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from('This is a blank memo transaction'),
      keys: [],
    }),
  )
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = sender

  return transaction
}
