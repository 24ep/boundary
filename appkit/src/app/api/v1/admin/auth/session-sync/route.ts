import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret'

    try {
      jwt.verify(token, secret)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('appkit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
    return response
  } catch (error) {
    console.error('Session sync error:', error)
    return NextResponse.json({ error: 'Session sync failed' }, { status: 500 })
  }
}
