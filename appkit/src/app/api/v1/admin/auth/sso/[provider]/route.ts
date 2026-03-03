import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import crypto from 'crypto'

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  const host = req.headers.get('host') || 'localhost:3001'
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params
  const redirectAfter = request.nextUrl.searchParams.get('redirect') || '/dashboard'

  try {
    // Look up provider by providerName (stored as e.g. "google-oauth" or "google")
    const oauthProvider = await prisma.oAuthProvider.findFirst({
      where: {
        isEnabled: true,
        OR: [
          { providerName: provider },
          { providerName: provider.replace('-oauth', '') },
        ],
      },
    })

    if (!oauthProvider) {
      return NextResponse.json(
        { error: `SSO provider "${provider}" is not configured or not enabled.` },
        { status: 404 }
      )
    }

    if (!oauthProvider.authorizationUrl || !oauthProvider.clientId) {
      return NextResponse.json(
        { error: `SSO provider "${provider}" is missing required configuration (authorizationUrl or clientId).` },
        { status: 500 }
      )
    }

    const stateNonce = crypto.randomBytes(16).toString('hex')
    // Encode both nonce and final redirect into the state so callback can retrieve them
    const statePayload = Buffer.from(JSON.stringify({ nonce: stateNonce, redirect: redirectAfter })).toString('base64url')

    const baseUrl = getBaseUrl(request)
    const callbackUrl = `${baseUrl}/api/v1/admin/auth/sso/${provider}/callback`

    const scopes: string[] = Array.isArray(oauthProvider.scopes)
      ? (oauthProvider.scopes as string[])
      : ['openid', 'email', 'profile']

    const authUrl = new URL(oauthProvider.authorizationUrl)
    authUrl.searchParams.set('client_id', oauthProvider.clientId)
    authUrl.searchParams.set('redirect_uri', callbackUrl)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes.join(' '))
    authUrl.searchParams.set('state', statePayload)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'select_account')

    const response = NextResponse.redirect(authUrl.toString())
    // Store state in cookie to verify on callback
    response.cookies.set('sso_state', statePayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error: any) {
    console.error(`[SSO Initiate] Error for provider "${provider}":`, error)
    return NextResponse.json({ error: 'Failed to initiate SSO login', details: error.message }, { status: 500 })
  }
}
