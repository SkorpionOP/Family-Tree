const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE_NODE', 'UPDATE_NODE', 'DELETE_NODE', 'CREATE_SPOUSE', 'CREATE_MARRIAGE']
  },
  description: {
    type: String,
    required: true
  },
  revertData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isReverted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
