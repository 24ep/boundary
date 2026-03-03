import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Read platform name and logo from system settings (system.general)
    const systemRow = await prisma.systemConfig.findUnique({ where: { key: 'system.general' } })
    const systemGeneral = (systemRow?.value || {}) as Record<string, any>

    const platformName: string = systemGeneral.platformName || 'AppKit'
    const logoUrl: string | null = systemGeneral.appkitLogoUrl || null

    const responseData = {
      adminAppName: platformName,
      name: platformName,
      logoUrl: logoUrl || undefined,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      branding: responseData,
      message: 'Branding retrieved successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Admin Branding API] Local branding fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch branding',
      message: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    // if (!hasPermission(auth.admin, 'branding:update')) {
    //   return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    // }

    const body = await request.json()
    const { branding } = body

    if (!branding) {
      return NextResponse.json({ error: 'Branding data is required' }, { status: 400 })
    }

    const activeApplication = await prisma.application.findFirst({
      where: { isActive: true },
      select: { id: true }
    })

    if (!activeApplication) {
      return NextResponse.json({ error: 'No active application found' }, { status: 404 })
    }

    await prisma.appSetting.upsert({
      where: {
        applicationId_key: {
          applicationId: activeApplication.id,
          key: 'branding'
        }
      },
      update: { value: branding as any },
      create: {
        applicationId: activeApplication.id,
        key: 'branding',
        value: branding as any
      }
    })

    return NextResponse.json({
      success: true,
      data: branding,
      message: 'Branding updated successfully'
    })

  } catch (error: any) {
    console.error('Local branding update error:', error)
    return NextResponse.json({ error: 'Failed to update branding' }, { status: 500 })
  }
}
