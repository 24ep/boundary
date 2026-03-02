import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const templates = await prisma.emailTemplate.findMany({
      where: { applicationId: null },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Failed to fetch default email templates:', error)
    return NextResponse.json({ error: 'Failed to fetch default email templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const htmlContent = typeof body.htmlContent === 'string' ? body.htmlContent : ''
    const textContent = typeof body.textContent === 'string' ? body.textContent : ''
    const variables = Array.isArray(body.variables) ? body.variables : []

    if (!name || !slug || !subject) {
      return NextResponse.json({ error: 'name, slug, and subject are required' }, { status: 400 })
    }

    const exists = await prisma.emailTemplate.findFirst({
      where: { applicationId: null, slug },
      select: { id: true },
    })
    if (exists) {
      return NextResponse.json({ error: 'Default template slug already exists' }, { status: 409 })
    }

    const template = await prisma.emailTemplate.create({
      data: {
        applicationId: null,
        name,
        slug,
        subject,
        htmlContent,
        textContent,
        variables,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Failed to create default email template:', error)
    return NextResponse.json({ error: 'Failed to create default email template' }, { status: 500 })
  }
}

