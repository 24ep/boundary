import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'
import { randomBytes } from 'crypto'

async function getPrimaryOrg(adminUserId: string) {
  // Try primary first, then any membership
  const membership = await prisma.adminUserApplication.findFirst({
    where: { adminUserId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  })
  return membership
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const adminId = auth.admin.adminId || auth.admin.id
    const membership = await getPrimaryOrg(adminId)
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const invites = await prisma.organizationInvite.findMany({
      where: { applicationId: membership.applicationId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      invites: invites.map(inv => ({
        id: inv.id,
        code: inv.code,
        role: inv.role,
        maxUses: inv.maxUses,
        useCount: inv.useCount,
        usesRemaining: inv.maxUses !== null ? Math.max(0, inv.maxUses - inv.useCount) : null,
        expiresAt: inv.expiresAt,
        isActive: inv.isActive,
        createdAt: inv.createdAt,
      })),
    })
  } catch (error: any) {
    console.error('[invites GET] Error:', error)
    return NextResponse.json({ error: 'Failed to list invites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const adminId = auth.admin.adminId || auth.admin.id
    const membership = await getPrimaryOrg(adminId)
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const { role = 'admin', maxUses, expiresAt } = body

    const code = randomBytes(24).toString('base64url')

    const invite = await prisma.organizationInvite.create({
      data: {
        applicationId: membership.applicationId,
        code,
        createdById: adminId,
        role,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    })

    return NextResponse.json({
      invite: {
        id: invite.id,
        code: invite.code,
        role: invite.role,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
      },
    })
  } catch (error: any) {
    console.error('[invites POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
