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

    let won = false;
    
    // Check global stats to ensure max 4 winners
    const stats = await EventStats.findOne({});
    const currentWins = stats ? stats.winningRewardsIssued : 0;

    if (currentWins < 4) {
      // Roll the dice
      if (Math.random() < WINNING_PROBABILITY) {
        won = true;
      }
    }

    let assignedReward = null;
    let assignedRewardId = null;

    if (won) {
      // Need to atomically increment and ensure we don't exceed 4 concurrently
      const updatedStats = await EventStats.findOneAndUpdate(
        { winningRewardsIssued: { $lt: 4 } }, // Ensure it's still less than 4
        { $inc: { winningRewardsIssued: 1 } },
        { new: true, upsert: true }
      );

      // If updatedStats is null, it means we hit the limit concurrently
      if (updatedStats) {
        assignedReward = '₹50 OFF on purchases above ₹799';
        assignedRewardId = `MT-${Math.floor(10000 + Math.random() * 90000)}`;
      }
    }

    if (!assignedReward) {
      // Did not win, assign a funny message
      assignedReward = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];
    }

    visitor.selectedChest = selectedChest || null;
    visitor.reward = assignedReward;
    visitor.rewardId = assignedRewardId;
    await visitor.save();

    return NextResponse.json({ 
      reward: assignedReward,
      rewardId: assignedRewardId,
      isWinner: !!assignedRewardId
    }, { status: 200 });
  } catch (error: any) {
    console.error('Reward Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
