import mongoose from 'mongoose';

const EventStatsSchema = new mongoose.Schema(
  {
    winningRewardsIssued: { type: Number, default: 0 }, // Deprecated or mapped to vouchers
    bearsIssued: { type: Number, default: 0 },
    vouchersIssued: { type: Number, default: 0 },
    totalVisitors: { type: Number, default: 0 }, // Used to generate Visitor Number atomically
  },
  { timestamps: true }
);

export default mongoose.models.EventStats || mongoose.model('EventStats', EventStatsSchema);
