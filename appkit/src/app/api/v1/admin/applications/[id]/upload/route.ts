import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 })
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Upload requires multipart/form-data' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are supported' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image is too large (max 10MB)' }, { status: 400 })
    }

    const extFromName = file.name.includes('.') ? file.name.split('.').pop() : ''
    const extFromMime = file.type.split('/')[1] || ''
    const extension = (extFromName || extFromMime || 'bin').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const fileName = `${Date.now()}_${randomBytes(8).toString('hex')}.${extension}`

    const baseUploadDir = process.env.APP_UPLOAD_DIR
      ? path.resolve(process.cwd(), process.env.APP_UPLOAD_DIR)
      : path.join(process.cwd(), 'public', 'uploads')
    const publicBaseUrl = (process.env.APP_UPLOAD_BASE_URL || '/uploads').replace(/\/+$/, '')
    const outputDir = path.join(baseUploadDir, 'applications', id)

    const buffer = Buffer.from(await file.arrayBuffer())
    const outputPath = path.join(outputDir, fileName)
    try {
      await mkdir(outputDir, { recursive: true })
      await writeFile(outputPath, buffer)
    } catch (fsError: any) {
      const code = fsError?.code
      if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
        return NextResponse.json(
          { error: 'Upload storage is not writable. Please configure APP_UPLOAD_DIR to a writable location.' },
          { status: 500 }
        )
      }
      throw fsError
    }

    const url = `${publicBaseUrl}/applications/${id}/${fileName}`
    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('Error uploading application file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

