import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import EventStats from '@/models/EventStats';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { fullName, phoneNumber, email } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json({ error: 'Name and Phone number are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingVisitor = await Visitor.findOne({ phoneNumber });
    if (existingVisitor) {
      return NextResponse.json({ visitor: existingVisitor, message: 'Welcome back!' }, { status: 200 });
    }

    // Atomically increment total visitors to generate visitorNumber safely
    const stats = await EventStats.findOneAndUpdate(
      {},
      { $inc: { totalVisitors: 1 } },
      { new: true, upsert: true }
    );

    const visitor = await Visitor.create({
      fullName,
      phoneNumber,
      email,
      visitorNumber: stats.totalVisitors,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({ visitor, message: 'Registered successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
