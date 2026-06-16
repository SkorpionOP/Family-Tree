const mongoose = require('mongoose');

const EdgeSchema = new mongoose.Schema({
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  sourceNodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  targetNodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  relationshipType: {
    type: String,
    required: true,
    enum: ['parent_child', 'spouse']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Edge', EdgeSchema);
