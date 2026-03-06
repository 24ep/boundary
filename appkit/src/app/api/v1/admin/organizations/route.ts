import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function upsertAdminUser(email: string, name: string): Promise<string> {
  const existing = await prisma.adminUser.findFirst({ where: { email } })
  if (existing) return existing.id

  const created = await prisma.adminUser.create({
    data: {
      email,
      name: name || email,
      passwordHash: '', // SSO / User-table users have no admin password
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
    const { name, slug: rawSlug, description } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const slug = (rawSlug || toSlug(name.trim())).toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/(^-|-$)/g, '')
    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await prisma.application.findFirst({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'This slug is already taken. Please choose another.' }, { status: 409 })
    }

    // Ensure admin user record exists in admin_users table
    const displayName = [auth.admin.firstName, auth.admin.lastName].filter(Boolean).join(' ') || auth.admin.name || auth.admin.email
    const adminUserId = await upsertAdminUser(auth.admin.email, displayName)

    // Create org + link admin in a transaction
    const [application] = await prisma.$transaction([
      prisma.application.create({
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          isActive: true,
        },
      }),
    ])

    await prisma.adminUserApplication.create({
      data: {
        adminUserId,
        applicationId: application.id,
        role: 'owner',
        isPrimary: true,
      },
    })

    return NextResponse.json({
      organization: {
        id: application.id,
        name: application.name,
        slug: application.slug,
        description: application.description,
      },
    })
  } catch (error: any) {
    console.error('[organizations POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}
