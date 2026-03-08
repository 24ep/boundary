import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  
  // @ts-ignore - admin might exist on auth
  const userId = auth.admin?.id || auth.admin?.adminId;
  if (!userId) return NextResponse.json({ error: 'User ID not found' }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pinCode: true }
    });

    return NextResponse.json({ hasPin: !!user?.pinCode });
  } catch (error: any) {
    console.error('Get PIN status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  
  // @ts-ignore
  const userId = auth.admin?.id || auth.admin?.adminId;
  if (!userId) return NextResponse.json({ error: 'User ID not found' }, { status: 400 });

  try {
    const { pin } = await req.json();
    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 6 digits' }, { status: 400 });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { pinCode: hashedPin }
    });

    return NextResponse.json({ message: 'PIN updated successfully' });
  } catch (error: any) {
    console.error('Update PIN error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
