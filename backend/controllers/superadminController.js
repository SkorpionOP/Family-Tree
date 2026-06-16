const Tree = require('../models/Tree');
const User = require('../models/User');
const Node = require('../models/Node');
const Edge = require('../models/Edge');

// @desc    Get all trees with counts of nodes/edges and admins
// @route   GET /api/superadmin/trees
// @access  Private (SuperAdmin)
const getSuperAdminTrees = async (req, res) => {
  try {
    const trees = await Tree.find()
      .populate('createdBy', 'email')
      .populate('admins', 'email')
      .populate('subAdmins', 'email');

    const treesWithDetails = await Promise.all(
      trees.map(async (tree) => {
        const nodeCount = await Node.countDocuments({ treeId: tree._id });
        const edgeCount = await Edge.countDocuments({ treeId: tree._id });
        return {
          ...tree.toObject(),
          nodeCount,
          edgeCount
        };
      })
    );

    res.status(200).json(treesWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reassign a tree's admin
// @route   POST /api/superadmin/reassign-admin
// @access  Private (SuperAdmin)
const reassignTreeAdmin = async (req, res) => {
  const { treeId, newAdminEmail } = req.body;

  if (!treeId || !newAdminEmail) {
    return res.status(400).json({ message: 'Tree ID and new admin email are required' });
  }

  try {
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    const targetUser = await User.findOne({ email: newAdminEmail.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({ message: 'No user found with the specified email' });
    }

    // Update tree admins and creator
    tree.createdBy = targetUser._id;
    tree.admins = [targetUser._id];
    // Clear sub-admins or keep? Let's keep sub-admins or pull targetUser from it
    tree.subAdmins = tree.subAdmins.filter(id => id.toString() !== targetUser._id.toString());
    await tree.save();

    // Ensure user has this tree in activeTrees
    await User.findByIdAndUpdate(targetUser._id, {
      $addToSet: { activeTrees: tree._id }
    });

    res.status(200).json({
      message: `Successfully reassigned admin of tree "${tree.treeName}" to ${targetUser.email}`,
      tree
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any tree in the system
// @route   DELETE /api/superadmin/trees/:id
// @access  Private (SuperAdmin)
const deleteTreeSuperAdmin = async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id);
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    // Delete all nodes and edges
    await Node.deleteMany({ treeId: tree._id });
    await Edge.deleteMany({ treeId: tree._id });

    // Remove from activeTrees list of all users
    await User.updateMany(
      { activeTrees: tree._id },
      { $pull: { activeTrees: tree._id } }
    );

    // Delete tree record
    await Tree.findByIdAndDelete(tree._id);

    res.status(200).json({ message: `Tree "${tree.treeName}" and all related nodes/edges deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuperAdminTrees,
  reassignTreeAdmin,
  deleteTreeSuperAdmin
};
