const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  mobileVerified: {
    type: Boolean,
    default: false
  },
  firebaseUid: {
    type: String,
    default: ''
  },
  currentSessionToken: {
    type: String,
    default: ''
  },
  lastActive: {
    type: Date,
    default: null
  },
  telegramVerificationCode: {
    type: String,
    default: ''
  },
  telegramChatId: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['User', 'SuperAdmin'],
    default: 'User'
  },
  profile: {
    name: { type: String, default: '' },
    dob: { type: Date, default: null },
    bloodGroup: { type: String, default: '' },
    gotram: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    profilePictureUrl: { type: String, default: '' },
    socialLinks: [{ type: String }],
    marriageDate: { type: Date, default: null }
  },
  syncSettings: {
    name: { type: Boolean, default: true },
    dob: { type: Boolean, default: true },
    bloodGroup: { type: Boolean, default: true },
    gotram: { type: Boolean, default: true },
    mobileNumber: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    profilePictureUrl: { type: Boolean, default: true },
    socialLinks: { type: Boolean, default: true },
    marriageDate: { type: Boolean, default: true }
  },
  activeTrees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
