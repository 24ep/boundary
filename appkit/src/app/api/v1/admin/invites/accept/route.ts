import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

function validateInvite(invite: any): string | null {
  if (!invite.isActive) return 'This invite is no longer active'
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return 'This invite has expired'
  if (invite.maxUses !== null && invite.useCount >= invite.maxUses) return 'This invite has reached its maximum uses'
  return null
}

async function upsertAdminUser(email: string, name: string): Promise<string> {
  const existing = await prisma.adminUser.findFirst({ where: { email } })
  if (existing) return existing.id

  const created = await prisma.adminUser.create({
    data: {
      email,
      name: name || email,
      passwordHash: '',
      isActive: true,
      isSuperAdmin: false,
    },
  })
  return created.id
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

    // Re-validate at accept time (race condition protection)
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

    // Ensure admin user record exists
    const displayName = [auth.admin.firstName, auth.admin.lastName].filter(Boolean).join(' ') || auth.admin.name || auth.admin.email
    const adminUserId = await upsertAdminUser(auth.admin.email, displayName)

    // Check if already a member
    const existingMembership = await prisma.adminUserApplication.findFirst({
      where: { adminUserId, applicationId: invite.applicationId },
    })
    if (existingMembership) {
      return NextResponse.json({ error: 'You are already a member of this organization' }, { status: 409 })
    }

    // Determine if this should be primary (first org for this user)
    const existingOrgs = await prisma.adminUserApplication.count({ where: { adminUserId } })
    const isPrimary = existingOrgs === 0

    await prisma.$transaction([
      prisma.adminUserApplication.create({
        data: {
          adminUserId,
          applicationId: invite.applicationId,
          role: invite.role,
          isPrimary,
        },
      }),
      prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { useCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      success: true,
      organization: {
        id: invite.application.id,
        name: invite.application.name,
        slug: invite.application.slug,
      },
    })
  } catch (error: any) {
    console.error('[invites/accept] Error:', error)
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 })
  }
}
