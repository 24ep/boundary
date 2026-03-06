import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

function validateInvite(invite: any): string | null {
  if (!invite.isActive) return 'This invite is no longer active'
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return 'This invite has expired'
  if (invite.maxUses !== null && invite.useCount >= invite.maxUses) return 'This invite has reached its maximum uses'
  return null
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { code } = body
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    const invite = await prisma.organizationInvite.findUnique({
      where: { code: code.trim() },
      include: {
        application: { select: { id: true, name: true, slug: true, isActive: true } },
      },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    const validationError = validateInvite(invite)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    if (!invite.application.isActive) {
      return NextResponse.json({ error: 'This organization is no longer active' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      organization: {
        id: invite.application.id,
        name: invite.application.name,
        slug: invite.application.slug,
      },
      role: invite.role,
      inviteId: invite.id,
    })
  } catch (error: any) {
    console.error('[invites/validate] Error:', error)
    return NextResponse.json({ error: 'Failed to validate invite' }, { status: 500 })
  }
}
