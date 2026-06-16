const express = require('express');
const router = express.Router();
const {
  createTree,
  getTrees,
  getTreeById,
  deleteTree,
  manageUserRole,
  requestToJoinTree,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest
} = require('../controllers/treeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createTree)
  .get(getTrees);

router.post('/join', requestToJoinTree);

router.route('/:id')
  .get(getTreeById)
  .delete(deleteTree);

router.post('/:id/roles', manageUserRole);

router.get('/:id/join-requests', getJoinRequests);
router.post('/:id/join-requests/:requestId/approve', approveJoinRequest);
router.post('/:id/join-requests/:requestId/reject', rejectJoinRequest);

module.exports = router;
