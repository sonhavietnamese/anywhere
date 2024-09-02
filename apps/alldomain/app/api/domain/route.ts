import { ACTIONS_CORS_HEADERS } from '@solana/actions'

export async function GET(req: Request) {
  const payload = {
    domain: 'sonhavietnamese.blink',
    owner: 'Fv3ajwjGvuoe5Mrgucg12WWjND4oGQo4tUC6xPBqvfnb',
  }

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  })
}
