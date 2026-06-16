const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    let conn;

    // Try connecting to persistent MongoDB Atlas URI if provided
    if (mongoUri && process.env.NODE_ENV !== 'test') {
      try {
        console.log('Attempting connection to persistent MongoDB URI...');
        conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000 // timeout quickly if unreachable
        });
        console.log(`MongoDB Connected (Persistent): ${conn.connection.host}`);
        await seedSuperAdmin();
        return;
      } catch (err) {
        console.error(`\n❌ persistent MongoDB connection failed: ${err.message}`);
        console.log('⚠️ Falling back to in-memory development database to keep application online...\n');
      }
    }

    // Spawn in-memory database as fallback
    console.log('Spawning in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log(`In-memory MongoDB started at: ${mongoUri}`);
    
    global.__MONGOD__ = mongod;

    conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
    await seedSuperAdmin();
  } catch (error) {
    console.error(`Critical error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedSuperAdmin = async () => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    const superAdminEmail = 'ad@g.com';
    const exists = await User.findOne({ email: superAdminEmail });

    if (!exists) {
      console.log('Seeding Super Admin user (ad@g.com)...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('12345', salt);

      await User.create({
        email: superAdminEmail,
        passwordHash,
        role: 'SuperAdmin',
        profile: {
          name: 'Super Admin',
          dob: null,
          bloodGroup: '',
          gotram: 'Global',
          mobileNumber: '9999999999',
          profilePictureUrl: '',
          socialLinks: []
        },
        syncSettings: {
          name: false,
          dob: false,
          bloodGroup: false,
          gotram: false,
          mobileNumber: false,
          email: false,
          profilePictureUrl: false,
          socialLinks: false
        },
        activeTrees: []
      });
      console.log('Super Admin seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding Super Admin:', err.message);
  }
};

module.exports = connectDB;
