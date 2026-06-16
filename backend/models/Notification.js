const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  type: {
    type: String,
    enum: ['birthday', 'death', 'anniversary'],
    required: true
  },
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  spouseNodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index to find user notifications easily and prevent duplicates
NotificationSchema.index({ userId: 1, treeId: 1, type: 1, nodeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Notification', NotificationSchema);
