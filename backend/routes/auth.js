const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer memory storage setup (limit: 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile, 
  googleLogin, 
  firebaseLogin,
  uploadProfilePicture
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload', protect, upload.single('image'), uploadProfilePicture);

module.exports = router;
