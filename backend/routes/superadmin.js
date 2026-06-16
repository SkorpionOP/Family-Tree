const express = require('express');
const router = express.Router();
const {
  getSuperAdminTrees,
  reassignTreeAdmin,
  deleteTreeSuperAdmin
} = require('../controllers/superadminController');
const { protect } = require('../middleware/auth');

// Super Admin Role Middleware
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized: SuperAdmin access only' });
  }
};

router.use(protect);
router.use(isSuperAdmin);

router.get('/trees', getSuperAdminTrees);
router.post('/reassign-admin', reassignTreeAdmin);
router.delete('/trees/:id', deleteTreeSuperAdmin);

module.exports = router;
