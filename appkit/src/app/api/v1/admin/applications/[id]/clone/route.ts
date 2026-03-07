import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'
import { randomBytes } from 'crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function parseSettings(input: unknown): Record<string, any> {
  if (typeof input === 'string') {
    try { return JSON.parse(input || '{}') } catch { return {} }
  }
  return input && typeof input === 'object' ? { ...(input as Record<string, any>) } : {}
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })

    const { id } = params
    if (!UUID_REGEX.test(id)) return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 })

    const body = await request.json()
    const { targetEnvironmentId, name: customName } = body

    // 1. Fetch source application
    const sourceApp = await prisma.application.findUnique({
      where: { id }
    })

    if (!sourceApp) return NextResponse.json({ error: 'Source application not found' }, { status: 404 })

    // 2. Prepare cloned data
    const settings = parseSettings(sourceApp.settings)
    let environments = Array.isArray(settings.environments) ? settings.environments : []

    // If a specific environment was selected to be the ONLY environment in the clone
    if (targetEnvironmentId) {
      const selectedEnv = environments.find((e: any) => e.id === targetEnvironmentId)
      if (selectedEnv) {
        // Create a new version of this environment with a fresh API key
        environments = [{
          ...selectedEnv,
          id: randomBytes(8).toString('hex'),
          apiKey: `env_${randomBytes(20).toString('hex')}`,
          createdAt: new Date().toISOString()
        }]
      }
    } else {
        // Clone all environments with fresh IDs and keys
        environments = environments.map((e: any) => ({
            ...e,
            id: randomBytes(8).toString('hex'),
            apiKey: `env_${randomBytes(20).toString('hex')}`,
            createdAt: new Date().toISOString()
        }))
    }

    settings.environments = environments

    // 3. Create cloned application
    const baseName = customName || `Copy of ${sourceApp.name}`
    const baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    
    // Ensure slug uniqueness
    let finalSlug = baseSlug
    let counter = 1
    while (await prisma.application.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`
    }

    const clonedApp = await prisma.application.create({
      data: {
        name: baseName,
        slug: finalSlug,
        description: sourceApp.description,
        logoUrl: sourceApp.logoUrl,
        branding: sourceApp.branding || {},
        settings: settings,
        isActive: sourceApp.isActive
      }
    })

    return NextResponse.json({ 
      success: true, 
      application: clonedApp, 
      message: 'Application cloned successfully' 
    }, { status: 201 })

  } catch (error: any) {
    console.error('Clone error:', error)
    return NextResponse.json({ error: 'Failed to clone application', details: error.message }, { status: 500 })
  }
}
