import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server/lib/prisma';
import { config } from '@/server/config/env';
import { buildCorsHeaders } from '@/server/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(req) });
}

export async function POST(req: NextRequest) {
  const cors = buildCorsHeaders(req);
  try {
    const body = await req.json();
    const { email, phone, otp } = body;

    if ((!email && !phone) || !otp) {
      return NextResponse.json(
        { success: false, message: 'Identifier and OTP required' },
        { status: 400, headers: cors }
      );
    }

    const user = await prisma.user.findFirst({
      where: email ? { email: email.toLowerCase() } : { phoneNumber: phone },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid code' },
        { status: 401, headers: cors }
      );
    }

    const prefs = (user.preferences as Record<string, any>) || {};
    const storedOtp = prefs._otp as string | undefined;
    const storedExpiry = prefs._otpExpiry as number | undefined;

    if (!storedOtp || !storedExpiry) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired code' },
        { status: 401, headers: cors }
      );
    }

    if (Date.now() > storedExpiry) {
      const { _otp, _otpExpiry, ...rest } = prefs;
      await prisma.user.update({ where: { id: user.id }, data: { preferences: rest } });
      return NextResponse.json(
        { success: false, message: 'Code has expired' },
        { status: 401, headers: cors }
      );
    }

    if (storedOtp !== String(otp)) {
      return NextResponse.json(
        { success: false, message: 'Invalid code' },
        { status: 401, headers: cors }
      );
    }

    // OTP valid — consume it
    const { _otp, _otpExpiry, ...restPrefs } = prefs;
    await prisma.user.update({
      where: { id: user.id },
      data: { preferences: restPrefs, lastLoginAt: new Date() },
    });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, type: 'user' },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phoneNumber,
          avatar: user.avatarUrl,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { headers: cors }
    );
  } catch (error: any) {
    console.error('OTP login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500, headers: cors }
    );
  }
}
