import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-ID',
};

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json({ success: false, message: 'Email or phone required' }, { status: 400, headers: CORS_HEADERS });
    }

    // Look up user
    const user = await prisma.user.findFirst({
      where: email ? { email: email.toLowerCase() } : { phoneNumber: phone },
      select: { id: true, isActive: true, preferences: true },
    });

    if (!user || !user.isActive) {
      // Return success to avoid user enumeration
      return NextResponse.json({ success: true, message: 'If an account exists, a code has been sent' }, { headers: CORS_HEADERS });
    }

    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Persist OTP in the user's preferences JSON field
    const currentPrefs = (user.preferences as Record<string, any>) || {};
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: {
          ...currentPrefs,
          _otp: otp,
          _otpExpiry: otpExpiry,
        },
      },
    });

    // TODO: Send via email/SMS. Until then, always return the code so users can log in.
    console.log(`[OTP] Code for ${email || phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      debug_otp: otp,
    }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('OTP request error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send code' }, { status: 500, headers: CORS_HEADERS });
  }
}
