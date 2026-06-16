const mongoose = require('mongoose');
const Tree = require('../models/Tree');
const Node = require('../models/Node');
const Edge = require('../models/Edge');
const Notification = require('../models/Notification');
const { getUserRoleInTree } = require('./treeController');

const getNearestEventDate = (dateOfEvent, today) => {
  const m = dateOfEvent.getMonth();
  const d = dateOfEvent.getDate();
  const y = today.getFullYear();
  const dates = [
    new Date(y - 1, m, d),
    new Date(y, m, d),
    new Date(y + 1, m, d)
  ];
  let closest = dates[0];
  let minDiff = Math.abs(dates[0] - today);
  for (const date of dates) {
    const diff = Math.abs(date - today);
    if (diff < minDiff) {
      minDiff = diff;
      closest = date;
    }
  }
  return closest;
};

// @desc    Get and sync notifications for a tree
// @route   GET /api/kinship/:treeId/notifications
// @access  Private (Admin, Sub-Admin, or Linked Node User)
const getNotifications = async (req, res) => {
  const { treeId } = req.params;
  try {
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    const role = await getUserRoleInTree(tree, req.user.id);
    const isLinked = await Node.exists({ treeId, linkedUserId: req.user.id });
    const isAdmin = role === 'Admin' || role === 'Sub-Admin';

    if (!isAdmin && !isLinked) {
      return res.status(403).json({ message: 'Access denied: You must be an Admin or have a linked node to view notifications.' });
    }

    const nodes = await Node.find({ treeId });
    const spouseEdges = await Edge.find({ treeId, relationshipType: 'spouse' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastLimit = new Date(today);
    pastLimit.setDate(pastLimit.getDate() - 30);
    const futureLimit = new Date(today);
    futureLimit.setDate(futureLimit.getDate() + 30);

    // 1. Clean up outdated notifications for this user/tree
    await Notification.deleteMany({
      userId: req.user.id,
      treeId,
      $or: [
        { eventDate: { $lt: pastLimit } },
        { eventDate: { $gt: futureLimit } }
      ]
    });

    // 2. Scan nodes and generate notifications
    for (const node of nodes) {
      // Birthday notification
      if (node.dob && !node.isDeceased) {
        const eventOccurrence = getNearestEventDate(node.dob, today);
        const diffTime = eventOccurrence - today;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (Math.abs(diffDays) <= 30) {
          const age = eventOccurrence.getFullYear() - node.dob.getFullYear();
          const title = `🎂 Birthday: ${node.name}`;
          const message = `${node.name} turns ${age} on ${node.dob.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`;
          
          await Notification.findOneAndUpdate(
            {
              userId: req.user.id,
              treeId,
              type: 'birthday',
              nodeId: node._id,
              year: eventOccurrence.getFullYear()
            },
            {
              title,
              message,
              eventDate: eventOccurrence
            },
            { upsert: true, new: true }
          );
        }
      }

      // Death anniversary notification
      if (node.dateOfDeath && node.isDeceased) {
        const eventOccurrence = getNearestEventDate(node.dateOfDeath, today);
        const diffTime = eventOccurrence - today;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (Math.abs(diffDays) <= 30) {
          const years = eventOccurrence.getFullYear() - node.dateOfDeath.getFullYear();
          const title = `🙏 Remembrance: ${node.name}`;
          const message = `${node.name}'s death anniversary (${years} year${years !== 1 ? 's' : ''}) is on ${node.dateOfDeath.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`;

          await Notification.findOneAndUpdate(
            {
              userId: req.user.id,
              treeId,
              type: 'death',
              nodeId: node._id,
              year: eventOccurrence.getFullYear()
            },
            {
              title,
              message,
              eventDate: eventOccurrence
            },
            { upsert: true, new: true }
          );
        }
      }

      // Marriage anniversary notification
      if (node.marriageDate) {
        const spouseEdge = spouseEdges.find(
          e => e.sourceNodeId.toString() === node._id.toString() || 
               e.targetNodeId.toString() === node._id.toString()
        );

        if (spouseEdge) {
          const spouseId = spouseEdge.sourceNodeId.toString() === node._id.toString()
            ? spouseEdge.targetNodeId
            : spouseEdge.sourceNodeId;

          // Process only once per couple (lower ID goes first)
          if (node._id.toString() < spouseId.toString()) {
            const spouse = nodes.find(n => n._id.toString() === spouseId.toString());
            if (spouse) {
              const eventOccurrence = getNearestEventDate(node.marriageDate, today);
              const diffTime = eventOccurrence - today;
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

              if (Math.abs(diffDays) <= 30) {
                const years = eventOccurrence.getFullYear() - node.marriageDate.getFullYear();
                const title = `💑 Anniversary: ${node.name} & ${spouse.name}`;
                const message = `${node.name} & ${spouse.name}'s marriage anniversary (${years} year${years !== 1 ? 's' : ''}) is on ${node.marriageDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`;

                await Notification.findOneAndUpdate(
                  {
                    userId: req.user.id,
                    treeId,
                    type: 'anniversary',
                    nodeId: node._id,
                    year: eventOccurrence.getFullYear()
                  },
                  {
                    spouseNodeId: spouse._id,
                    title,
                    message,
                    eventDate: eventOccurrence
                  },
                  { upsert: true, new: true }
                );
              }
            }
          }
        }
      }
    }

    // 3. Return notifications sorted by date (newest/most relevant first)
    const notifications = await Notification.find({ userId: req.user.id, treeId })
      .sort({ isRead: 1, eventDate: 1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/kinship/:treeId/notifications/:notificationId/read
// @access  Private
const markAsRead = async (req, res) => {
  const { treeId, notificationId } = req.params;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.id, treeId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications in a tree as read
// @route   PUT /api/kinship/:treeId/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  const { treeId } = req.params;
  try {
    await Notification.updateMany(
      { userId: req.user.id, treeId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
