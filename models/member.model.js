import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { calculateProfileProgress } from "../utils/profileProgress.js";

const redanMemberSchema = new mongoose.Schema({
fullName: {
    type: String,
    required: true,
    trim: true,
  },
companyName: {
    type: String,
    trim: true,
  },
email: {
  type: String,
  required: true,
  unique: true,
  index: true,
  lowercase: true,
  match: /.+\@.+\..+/,
},
phoneNumber: {
    type: String,
    required: true,
    match: /^(\+234|0)[789][01]\d{8}$/,
  },
about: { type: String, trim: true },
  role: {
    type: String,
    enum: ['member', 'non-member'],
    default: 'member',
    },
  address: {
    type: String,
    required: true,
  },
 dob: { type: Date },
  state: {
    type: String,
    required: true,
  },
  lga: {
    type: String,
  },
  rcNumber: {
    type: String, // CAC registration number
  },
  nin: {
    type: String,
  },
  identificationType: {
    type: String,
    enum: ['NIN', 'Passport', 'Driver License'],
    default: null,
  },
profilePhotoUrl: String,
profilePhotoPublicId: String,
companyLogoUrl: String,
companyLogoPublicId: String,
identificationDocUrl: String,
identificationDocPublicId: String,
documents: {
  taxClearanceUrl: { type: String, default: null },
  taxClearancePublicId: { type: String, default: null },
  cacCertificateUrl: { type: String, default: null },
  cacCertificatePublicId: { type: String, default: null },
  businessPermitUrl: { type: String, default: null },
  businessPermitPublicId: { type: String, default: null },
},
supportDocs: [
  {
    url: String,
    publicId: String,
  }
],

  membershipId: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  approvedAt: {
    type: Date,
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Projects',
  }],
 levyPayments: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'LevyPayment'
 }],
totalLevyPaid: {
  type: Number,
  default: 0
},

accountBlock: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'BlockedAccount',
  default: null
},
isActive: {
  type: Boolean,
  default: true
},


lastLogin: { type: Date, default: Date.now },

resetPasswordToken: String,
resetPasswordExpiresAt: Date,
verificationToken: String,
verificationTokenExpiresAt: Date,

verificationCode: {
  type: String,
  select: false
},
verificationCodeExpiresAt: Date,
otpAttemptCount: { type: Number, default: 0 },
lastOtpAttemptAt: { type: Date },

  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  completionSections: {
    personal: { type: Number, default: 0 },
    company: { type: Number, default: 0 },
    documents: { type: Number, default: 0 },
  },

notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],

}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});


redanMemberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

redanMemberSchema.methods.comparePassword = async function (memberPassword) {
  return await bcrypt.compare(memberPassword, this.password);
};

redanMemberSchema.methods.generateMembershipId = function () {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.membershipId = `REDAN-${timestamp}-${randomPart}`;
};

redanMemberSchema.pre('save', function (next) {
  const { total, sections } = calculateProfileProgress(this);
  this.profileCompletion = total;
  this.completionSections = sections;
  next();
});


const RedanMember = mongoose.model("RedanMember", redanMemberSchema);
export default RedanMember;
