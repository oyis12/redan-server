import mongoose from 'mongoose';

const blockedAccountSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RedanMember',
    required: true
  },
  reason: {
    type: String,
    enum: ['levy_default', 'land_dispute', 'fraudulent_activity', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true,
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  blockedAt: {
    type: Date,
    default: Date.now
  },
  reactivatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const BlockedAccount = mongoose.model("BlockedAccount", blockedAccountSchema);
export default BlockedAccount;
