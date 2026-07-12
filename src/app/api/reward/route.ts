import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import EventStats from '@/models/EventStats';

const WINNING_PROBABILITY = 0.02; // 2% chance

const FUNNY_MESSAGES = [
  "Phew... my treasure is safe today.",
  "I almost thought you'd steal my treasure.",
  "Nice try... But I can't make it THAT easy.",
  "The treasure likes making people curious.",
  "You came very close... ...or maybe I just said that.",
  "I've been guarding this chest for 372 years. I'm getting pretty good at it.",
  "Looks like the treasure wants you to explore the collection instead.",
  "No treasure this time... But I do know where the prettiest jewellery is hiding.",
  "You unlocked something even better... A reason to look around.",
  "Don't worry... The chest doesn't open for everyone.",
  "I told you not to open it... You never listen.",
  "You definitely open every mysterious WhatsApp message."
];

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { visitorId, selectedChest } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID is required' }, { status: 400 });
    }

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    if (visitor.reward) {
      return NextResponse.json({ 
        reward: visitor.reward, 
        rewardId: visitor.rewardId,
        message: 'Reward already generated' 
      }, { status: 200 });
    }

    const TOTAL_BEARS = 4;
    const TOTAL_VOUCHERS = 4; // Assuming 4 vouchers like before

    const stats = await EventStats.findOne({});
    const currentVouchers = stats ? stats.vouchersIssued : 0;
    const currentBears = stats ? stats.bearsIssued : 0;

    let assignedReward = null;
    let assignedRewardId = null;

    // Check for Bear Key Chain
    const bearWinningScans = [1, 5, 20, 50];
    const isBearWinner = bearWinningScans.includes(visitor.visitorNumber);

    if (isBearWinner && currentBears < TOTAL_BEARS) {
      const updatedStats = await EventStats.findOneAndUpdate(
        {},
        { $inc: { bearsIssued: 1 } },
        { new: true, upsert: true }
      );
      assignedReward = 'Cute Bear Key Chain 🧸';
      assignedRewardId = `BEAR-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (currentVouchers < TOTAL_VOUCHERS) {
      // Roll the dice for voucher
      if (Math.random() < WINNING_PROBABILITY) {
        const updatedStats = await EventStats.findOneAndUpdate(
          { vouchersIssued: { $lt: TOTAL_VOUCHERS } },
          { $inc: { vouchersIssued: 1 } },
          { new: true, upsert: true }
        );
        if (updatedStats) {
          assignedReward = '₹50 OFF on purchases above ₹799';
          assignedRewardId = `MT-${Math.floor(10000 + Math.random() * 90000)}`;
        }
      }
    }

    if (!assignedReward) {
      assignedReward = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];
    }

    visitor.selectedChest = selectedChest || null;
    visitor.reward = assignedReward;
    visitor.rewardId = assignedRewardId;
    await visitor.save();

    // Fetch latest stats for the UI
    const latestStats = await EventStats.findOne({});
    const bearsLeft = Math.max(0, TOTAL_BEARS - (latestStats?.bearsIssued || 0));
    const vouchersLeft = Math.max(0, TOTAL_VOUCHERS - (latestStats?.vouchersIssued || 0));

    return NextResponse.json({ 
      reward: assignedReward,
      rewardId: assignedRewardId,
      isWinner: !!assignedRewardId,
      bearsLeft,
      vouchersLeft
    }, { status: 200 });
  } catch (error: any) {
    console.error('Reward Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
