const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      activeTrees: []
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync user profile fields to all linked nodes
const syncUserToNodes = async (userId, customNodeId = null) => {
  const Node = require('../models/Node');
  const User = require('../models/User');

  const user = await User.findById(userId);
  if (!user) return;

  const query = { linkedUserId: userId };
  if (customNodeId) {
    query._id = customNodeId;
  }

  const nodes = await Node.find(query);
  for (const node of nodes) {
    let changed = false;

    if (user.syncSettings.name && user.profile.name && node.name !== user.profile.name) {
      node.name = user.profile.name;
      changed = true;
    }
    if (user.syncSettings.dob && user.profile.dob) {
      const uDob = new Date(user.profile.dob).getTime();
      const nDob = node.dob ? new Date(node.dob).getTime() : null;
      if (uDob !== nDob) {
        node.dob = user.profile.dob;
        changed = true;
      }
    }
    if (user.syncSettings.bloodGroup && user.profile.bloodGroup && node.bloodGroup !== user.profile.bloodGroup) {
      node.bloodGroup = user.profile.bloodGroup;
      changed = true;
    }
    if (user.syncSettings.gotram && user.profile.gotram && node.gotram !== user.profile.gotram) {
      node.gotram = user.profile.gotram;
      changed = true;
    }
    if (user.syncSettings.mobileNumber && user.profile.mobileNumber && node.mobileNumber !== user.profile.mobileNumber) {
      node.mobileNumber = user.profile.mobileNumber;
      changed = true;
    }
    if (user.syncSettings.email && user.email && node.email !== user.email) {
      node.email = user.email;
      changed = true;
    }
    if (user.syncSettings.profilePictureUrl && user.profile.profilePictureUrl && node.profilePictureUrl !== user.profile.profilePictureUrl) {
      node.profilePictureUrl = user.profile.profilePictureUrl;
      changed = true;
    }
    if (user.syncSettings.socialLinks && user.profile.socialLinks && JSON.stringify(node.socialLinks) !== JSON.stringify(user.profile.socialLinks)) {
      node.socialLinks = user.profile.socialLinks;
      changed = true;
    }

    if (changed) {
      await node.save();
    }
  }
};

// @desc    Update user profile and sync settings
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { profile, syncSettings } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (profile) {
      user.profile = {
        ...user.profile,
        name: profile.name !== undefined ? profile.name : user.profile.name,
        dob: profile.dob !== undefined ? profile.dob : user.profile.dob,
        bloodGroup: profile.bloodGroup !== undefined ? profile.bloodGroup : user.profile.bloodGroup,
        gotram: profile.gotram !== undefined ? profile.gotram : user.profile.gotram,
        mobileNumber: profile.mobileNumber !== undefined ? profile.mobileNumber : user.profile.mobileNumber,
        profilePictureUrl: profile.profilePictureUrl !== undefined ? profile.profilePictureUrl : user.profile.profilePictureUrl,
        socialLinks: profile.socialLinks !== undefined ? profile.socialLinks : user.profile.socialLinks
      };
    }

    if (syncSettings) {
      user.syncSettings = {
        ...user.syncSettings,
        name: syncSettings.name !== undefined ? syncSettings.name : user.syncSettings.name,
        dob: syncSettings.dob !== undefined ? syncSettings.dob : user.syncSettings.dob,
        bloodGroup: syncSettings.bloodGroup !== undefined ? syncSettings.bloodGroup : user.syncSettings.bloodGroup,
        gotram: syncSettings.gotram !== undefined ? syncSettings.gotram : user.syncSettings.gotram,
        mobileNumber: syncSettings.mobileNumber !== undefined ? syncSettings.mobileNumber : user.syncSettings.mobileNumber,
        email: syncSettings.email !== undefined ? syncSettings.email : user.syncSettings.email,
        profilePictureUrl: syncSettings.profilePictureUrl !== undefined ? syncSettings.profilePictureUrl : user.syncSettings.profilePictureUrl,
        socialLinks: syncSettings.socialLinks !== undefined ? syncSettings.socialLinks : user.syncSettings.socialLinks
      };
    }

    await user.save();

    // Trigger sync to all user's linked nodes
    await syncUserToNodes(user._id);

    const updatedUser = await User.findById(user._id).select('-passwordHash');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google Sign In / Register
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Google credential token is required' });
  }

  try {
    let email, name, picture;
    const clientID = process.env.GOOGLE_CLIENT_ID;

    if (clientID) {
      const { google } = require('googleapis');
      const oauthClient = new google.auth.OAuth2(clientID);
      const ticket = await oauthClient.verifyIdToken({
        idToken: credential,
        audience: clientID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      // Base64 decode JWT for development/testing when client ID is missing
      const parts = credential.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Invalid or unparseable Google token' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generate standard random password hash
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(Math.random().toString(36), salt);

      user = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        profile: {
          name: name || '',
          profilePictureUrl: picture || '',
          dob: null,
          bloodGroup: '',
          gotram: '',
          mobileNumber: '',
          socialLinks: []
        },
        syncSettings: {
          name: true,
          dob: true,
          bloodGroup: true,
          gotram: true,
          mobileNumber: true,
          email: true,
          profilePictureUrl: true,
          socialLinks: true
        },
        activeTrees: []
      });
    }

    res.json({
      _id: user.id,
      email: user.email,
      role: user.role || 'User',
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Google Sign In Error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// @desc    Firebase Auth Login / Register
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseLogin = async (req, res) => {
  const { firebaseToken } = req.body;
  if (!firebaseToken) {
    return res.status(400).json({ message: 'Firebase ID token is required' });
  }

  try {
    const { verifyFirebaseIdToken } = require('../utils/firebaseVerifier');
    const decoded = await verifyFirebaseIdToken(firebaseToken);
    
    const { email, name, picture, email_verified } = decoded;
    const uid = decoded.uid || decoded.sub;

    if (!email) {
      return res.status(400).json({ message: 'Firebase token is missing email' });
    }

    if (!email_verified) {
      return res.status(400).json({ message: 'Email address is not verified' });
    }

    let user = await User.findOne({ firebaseUid: uid });
    
    if (user) {
      // If email has changed in Firebase (since it is verified now), update it in backend
      if (user.email !== email.toLowerCase()) {
        user.email = email.toLowerCase();
        await user.save();
        
        // Sync email updates to kinship tree nodes
        await syncUserToNodes(user._id);
      }
    } else {
      // Fallback: search by email
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    if (!user) {
      // Create user if not exists
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(Math.random().toString(36), salt);

      user = await User.create({
        email: email.toLowerCase(),
        firebaseUid: uid,
        passwordHash,
        emailVerified: true,
        profile: {
          name: name || '',
          profilePictureUrl: picture || '',
          dob: null,
          bloodGroup: '',
          gotram: '',
          mobileNumber: '',
          socialLinks: []
        },
        syncSettings: {
          name: true,
          dob: true,
          bloodGroup: true,
          gotram: true,
          mobileNumber: true,
          email: true,
          profilePictureUrl: true,
          socialLinks: true
        },
        activeTrees: []
      });
    } else if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    res.json({
      _id: user.id,
      email: user.email,
      role: user.role || 'User',
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Firebase Login Error:', error);
    res.status(500).json({ message: error.message || 'Firebase authentication failed' });
  }
};

// --- Telegram Verification Helpers ---

const sendTelegramMessage = async (token, chatId, text) => {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
  }
};

const requestContact = async (token, chatId, text) => {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: {
          keyboard: [[
            {
              text: '📱 Share Phone Number',
              request_contact: true
            }
          ]],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      })
    });
  } catch (err) {
    console.error('Failed to request contact:', err);
  }
};

const removeKeyboard = async (token, chatId, text) => {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: {
          remove_keyboard: true
        }
      })
    });
  } catch (err) {
    console.error('Failed to remove keyboard:', err);
  }
};

// --- Telegram Verification Controllers ---

const getTelegramVerificationUrl = async (req, res) => {
  const crypto = require('crypto');
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = 'tg_' + crypto.randomBytes(16).toString('hex');
    user.telegramVerificationCode = token;
    await user.save();

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'KinshipTreeVerifyBot';
    const url = `https://t.me/${botUsername}?start=${token}`;

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTelegramVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto-migrate: if user has a mobile number but mobileVerified is false, set it to true
    if (user.profile.mobileNumber && !user.mobileVerified) {
      user.mobileVerified = true;
      await user.save();
    }

    res.json({ verified: user.mobileVerified, mobileNumber: user.profile.mobileNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleTelegramWebhook = async (req, res) => {
  res.sendStatus(200);

  const { message } = req.body;
  if (!message) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  const chatId = message.chat.id;

  try {
    if (message.text && message.text.startsWith('/start')) {
      const parts = message.text.split(' ');
      const token = parts[1];

      if (!token || !token.startsWith('tg_')) {
        await sendTelegramMessage(botToken, chatId, '⚠️ Invalid verification link. Please click the verify button in the app again.');
        return;
      }

      const user = await User.findOne({ telegramVerificationCode: token });
      if (!user) {
        await sendTelegramMessage(botToken, chatId, '⚠️ Verification session expired or invalid. Please try again from the website.');
        return;
      }

      user.telegramChatId = chatId.toString();
      await user.save();

      await requestContact(botToken, chatId, '👋 Welcome! To verify your mobile number for Dravidian Kinship, please click the button below to share your phone contact.');
      return;
    }

    if (message.contact) {
      const { phone_number, user_id } = message.contact;

      if (message.from.id !== user_id) {
        await sendTelegramMessage(botToken, chatId, '⚠️ You must share your own contact to verify your number.');
        return;
      }

      const user = await User.findOne({ telegramChatId: chatId.toString() });
      if (!user || !user.telegramVerificationCode) {
        await sendTelegramMessage(botToken, chatId, '⚠️ Verification session not found or already completed.');
        return;
      }

      let formattedPhone = phone_number;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      user.profile.mobileNumber = formattedPhone;
      user.mobileVerified = true;
      user.telegramVerificationCode = '';
      user.telegramChatId = '';
      await user.save();

      await syncUserToNodes(user._id);

      await removeKeyboard(botToken, chatId, '✅ Mobile number verified and updated successfully! You can return to the app now.');
      return;
    }
  } catch (err) {
    console.error('Telegram webhook error:', err);
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadToDrive = require('../utils/driveUpload');
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    const uniqueFileName = `${Date.now()}-${originalName}`;
    const link = await uploadToDrive(fileBuffer, uniqueFileName, mimeType);

    res.status(200).json({
      success: true,
      link
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  googleLogin,
  firebaseLogin,
  syncUserToNodes,
  getTelegramVerificationUrl,
  getTelegramVerificationStatus,
  handleTelegramWebhook,
  uploadProfilePicture
};
