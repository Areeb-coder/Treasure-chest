import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import EventStats from '@/models/EventStats';

export async function GET(req: Request) {
  try {
    // Basic auth check via header
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch stats
    const stats = await EventStats.findOne({}) || { winningRewardsIssued: 0, totalVisitors: 0 };
    
    // Fetch visitors (sort by newest)
    const visitors = await Visitor.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ 
      stats, 
      visitors 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
