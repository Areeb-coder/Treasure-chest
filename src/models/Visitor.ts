import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String },
    visitorNumber: { type: Number, required: true, unique: true },
    selectedChest: { type: String },
    reward: { type: String },
    rewardId: { type: String },
    rewardRedeemed: { type: Boolean, default: false },
    referralCode: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
