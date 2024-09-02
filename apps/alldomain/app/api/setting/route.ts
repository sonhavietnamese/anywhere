import { ACTIONS_CORS_HEADERS } from '@solana/actions'

const setting: Record<string, { cheerup: boolean; message: boolean }> = {
  'sonhavietnamese.blink': {
    cheerup: true,
    message: false,
  },
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain') || 'sonhavietnamese.blink'

  return Response.json(setting[domain], {
    headers: ACTIONS_CORS_HEADERS,
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const domain = body.domain || 'sonhavietnamese.blink'

  if (setting[domain]) {
    setting[domain] = {
      cheerup: body.cheerup ?? setting[domain].cheerup,
      message: body.message ?? setting[domain].message,
    }
    return Response.json({ success: true, setting: setting[domain] })
  } else {
    return Response.json({ success: false, error: 'Domain not found' }, { status: 404 })
  }
}
