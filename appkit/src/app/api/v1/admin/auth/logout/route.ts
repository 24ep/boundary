import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Logout successful' })
    response.cookies.set('appkit_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  } catch (error: any) {
    console.error('Admin logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
