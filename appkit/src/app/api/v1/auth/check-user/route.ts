import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-ID',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { exists: false, message: 'Email or phone is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    let user = null;

    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true, isActive: true }
      });
    }

    return NextResponse.json(
      { exists: !!user, isActive: user?.isActive ?? false },
      { headers: CORS_HEADERS }
    );

  } catch (error: any) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { exists: false, message: 'Failed to check user' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
