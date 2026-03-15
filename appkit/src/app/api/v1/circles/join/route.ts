import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server/lib/prisma';
import { config } from '@/server/config/env';
import { buildCorsHeaders } from '@/server/lib/cors';

function getMobileUserId(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    return decoded.id || decoded.adminId || null;
  } catch {
    return null;
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request);
  const userId = getMobileUserId(request);

  if (!userId) {
    return NextResponse.json(
      { error: 'unauthorized', error_description: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const { inviteCode, pinCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'bad_request', error_description: 'Invite code is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const circle = await prisma.circle.findFirst({
      where: {
        OR: [
          { circleCode: inviteCode },
          { pinCode: inviteCode },
        ],
      },
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'not_found', error_description: 'Circle not found with the provided code' },
        { status: 404, headers: corsHeaders }
      );
    }

    const existingMember = await prisma.circleMember.findUnique({
      where: { circleId_userId: { circleId: circle.id, userId } },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'conflict', error_description: 'User is already a member of this circle', circle },
        { status: 409, headers: corsHeaders }
      );
    }

    const newMember = await prisma.circleMember.create({
      data: { userId, circleId: circle.id, role: 'member' },
      include: { circle: true },
    });

    return NextResponse.json(
      { success: true, message: 'Joined circle successfully', circle: newMember.circle },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[POST /api/v1/circles/join] Error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Failed to join circle' },
      { status: 500, headers: corsHeaders }
    );
  }
}
