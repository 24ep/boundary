import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  
  // @ts-ignore
  const userId = auth.admin?.id || auth.admin?.adminId;
  if (!userId) return NextResponse.json({ error: 'User ID not found' }, { status: 400 });

  try {
    const { pin } = await req.json();
    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pinCode: true }
    });

    if (!user || !user.pinCode) {
      return NextResponse.json({ error: 'PIN not set', verified: false }, { status: 404 });
    }

    const isValid = await bcrypt.compare(pin, user.pinCode);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid PIN', verified: false }, { status: 401 });
    }

    return NextResponse.json({ message: 'PIN verified successfully', verified: true });
  } catch (error: any) {
    console.error('Verify PIN error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
