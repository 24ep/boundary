import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    
    // Check permission (optional, depending on requirements, but config checks 'applications:view')
    // if (!hasPermission(auth.admin, 'applications:view')) {
    //   return NextResponse.json({ error: 'Permission denied', userRoles: auth.admin }, { status: 403 })
    // }

    // Fetch applications
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { userApplications: true }
        }
      }
    })

    const onlineRows = await prisma.$queryRaw<Array<{ application_id: string; online_users: number }>>`
      SELECT
        application_id,
        COUNT(DISTINCT user_id)::int AS online_users
      FROM user_sessions
      WHERE is_active = true
        AND expires_at > NOW()
        AND last_activity_at > NOW() - INTERVAL '15 minutes'
        AND application_id IS NOT NULL
      GROUP BY application_id
    `

    const totalRows = await prisma.$queryRaw<Array<{ application_id: string; total_users: number }>>`
      SELECT
        application_id,
        COUNT(DISTINCT user_id)::int AS total_users
      FROM (
        SELECT application_id, user_id
        FROM user_applications
        WHERE application_id IS NOT NULL
        UNION
        SELECT application_id, user_id
        FROM user_sessions
        WHERE application_id IS NOT NULL
      ) app_users
      GROUP BY application_id
    `

    const onlineByApp = new Map<string, number>(
      onlineRows.map((row) => [row.application_id, Number(row.online_users || 0)])
    )
    const totalByApp = new Map<string, number>(
      totalRows.map((row) => [row.application_id, Number(row.total_users || 0)])
    )

    const formattedApps = applications.map(app => ({
      id: app.id,
      name: app.name,
      slug: app.slug,
      description: app.description || 'No description provided.',
      status: app.isActive ? 'active' : 'inactive',
      users: totalByApp.get(app.id) ?? app._count.userApplications,
      onlineUsers: onlineByApp.get(app.id) || 0,
      createdAt: app.createdAt.toISOString(),
      lastModified: app.updatedAt.toISOString(),
      plan: 'free',
      domain: app.slug ? `${app.slug}.appkit.com` : undefined,
      settings: app.settings
    }))

    return NextResponse.json({ success: true, applications: formattedApps })
  } catch (error: any) {
    console.error('GET applications error:', error)
    return NextResponse.json({ error: 'Failed to fetch applications', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, slug, description, isActive = true, settings = {} } = body
    
    if (!name) return NextResponse.json({ error: 'Application name is required' }, { status: 400 })
    
    const appSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    
    const existingApp = await prisma.application.findFirst({
      where: { OR: [{ name }, { slug: appSlug }] }
    })
    
    if (existingApp) return NextResponse.json({ error: 'Application already exists' }, { status: 409 })
    
    const newApp = await prisma.application.create({
      data: {
        name,
        slug: appSlug,
        description: description || '',
        isActive,
        settings,
      }
    })
    
    return NextResponse.json({ success: true, application: newApp, message: 'Application created' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create application', details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, name, slug, description, isActive, settings } = body
    
    if (!id) return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    
    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(settings && { settings }),
      }
    })
    
    return NextResponse.json({ success: true, application: updatedApp, message: 'Application updated' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update application', details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    
    // Check if application has users - safety check
    const appWithUsers = await prisma.application.findUnique({
      where: { id },
      include: { _count: { select: { userApplications: true } } }
    })

    if (appWithUsers && appWithUsers._count.userApplications > 0) {
       return NextResponse.json({ error: 'Cannot delete application with associated users' }, { status: 400 })
    }

    await prisma.application.delete({ where: { id } })
    
    return NextResponse.json({ success: true, message: 'Application deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete application', details: error.message }, { status: 500 })
  }
}
