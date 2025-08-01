import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  profilePhotoUrl: String,
  profilePhotoPublicId: String,
  role: {
    type: String,
    enum: ['superadmin', 'moderator', 'support'],
    default: 'moderator',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
adminSchema.methods.comparePassword = async function (adminPassword) {
  return await bcrypt.compare(adminPassword, this.password);
}

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;