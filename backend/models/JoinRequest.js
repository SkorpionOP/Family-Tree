const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  assignedNodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    default: null
  }
}, {
  timestamps: true
});

// Avoid duplicate pending requests for same user and tree
JoinRequestSchema.index({ treeId: 1, userId: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', JoinRequestSchema);
