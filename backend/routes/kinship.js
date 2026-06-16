const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getTreeGraph,
  createNode,
  createSpouseNode,
  createMarriageEdge,
  updateNode,
  deleteNode,
  classifyKinshipRelation,
  uploadProfilePicture,
  getNodeTree,
  getTreeLogs,
  revertTreeLog
} = require('../controllers/kinshipController');
const { protect } = require('../middleware/auth');

// Multer memory storage setup (limit: 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(protect);

router.get('/nodes/:nodeId/tree', getNodeTree);
router.get('/:treeId/graph', getTreeGraph);
router.post('/:treeId/nodes', createNode);
router.post('/:treeId/nodes/spouse', createSpouseNode);
router.post('/:treeId/edges/marriage', createMarriageEdge);
router.put('/:treeId/nodes/:nodeId', updateNode);
router.delete('/:treeId/nodes/:nodeId', deleteNode);
router.get('/:treeId/relation', classifyKinshipRelation);
router.get('/:treeId/logs', getTreeLogs);
router.post('/:treeId/logs/:logId/revert', revertTreeLog);

// Profile picture upload endpoint
router.post('/:treeId/upload', upload.single('image'), uploadProfilePicture);

module.exports = router;

