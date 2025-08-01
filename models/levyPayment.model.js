import mongoose from "mongoose";

const levyPaymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RedanMember",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  levyType: {
    type: String,
    enum: ['annual', 'project', 'penalty', 'other'],
    default: 'annual',
  },
  reference: String,
  channel: String,
  paidAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model("LevyPayment", levyPaymentSchema);
