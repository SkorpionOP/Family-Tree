const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  linkedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profilePictureUrl: {
    type: String,
    default: ''
  },
  dob: {
    type: Date,
    default: null
  },
  bloodGroup: {
    type: String,
    enum: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: ''
  },
  gotram: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  socialLinks: [{
    type: String
  }],
  gender: {
    type: Number,
    required: true,
    enum: [0, 1] // 1 for Male, 0 for Female
  },
  generationLevel: {
    type: Number,
    required: true
  },
  parity: {
    type: Number,
    required: true,
    enum: [0, 1]
  },
  crossTreeLinkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    default: null
  },
  isDeceased: {
    type: Boolean,
    default: false
  },
  dateOfDeath: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Node', NodeSchema);
