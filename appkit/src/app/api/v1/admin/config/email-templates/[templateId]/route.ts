import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const templateId = params.templateId
    if (!UUID_REGEX.test(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID format' }, { status: 400 })
    }

    const existing = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, applicationId: true },
    })
    if (!existing || existing.applicationId !== null) {
      return NextResponse.json({ error: 'Default template not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const next = {
      ...(typeof body.name === 'string' ? { name: body.name.trim() } : {}),
      ...(typeof body.slug === 'string' ? { slug: body.slug.trim() } : {}),
      ...(typeof body.subject === 'string' ? { subject: body.subject.trim() } : {}),
      ...(typeof body.htmlContent === 'string' ? { htmlContent: body.htmlContent } : {}),
      ...(typeof body.textContent === 'string' ? { textContent: body.textContent } : {}),
      ...(Array.isArray(body.variables) ? { variables: body.variables } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    }

    if (typeof next.slug === 'string' && next.slug.length > 0) {
      const duplicate = await prisma.emailTemplate.findFirst({
        where: {
          applicationId: null,
          slug: next.slug,
          id: { not: templateId },
        },
        select: { id: true },
      })
      if (duplicate) {
        return NextResponse.json({ error: 'Default template slug already exists' }, { status: 409 })
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: next,
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Failed to update default email template:', error)
    return NextResponse.json({ error: 'Failed to update default email template' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    const templateId = params.templateId
    if (!UUID_REGEX.test(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID format' }, { status: 400 })
    }

    const existing = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, applicationId: true },
    })
    if (!existing || existing.applicationId !== null) {
      return NextResponse.json({ error: 'Default template not found' }, { status: 404 })
    }

    await prisma.emailTemplate.delete({ where: { id: templateId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete default email template:', error)
    return NextResponse.json({ error: 'Failed to delete default email template' }, { status: 500 })
  }
}

