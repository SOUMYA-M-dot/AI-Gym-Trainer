import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import User from './models/User.js';

// Resolve MongoDB SRV records reliably across all DNS providers/operating systems
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('DNS server configuration warning:', dnsErr.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ai_gym_default_jwt_secret_key_2026';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory / Resilient Fallback User Store (active if MongoDB is unavailable)
let isMongoConnected = false;
const fallbackUsers = [];

// Connect to MongoDB Atlas
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection error (using resilient fallback store):', err.message);
    isMongoConnected = false;
  });
} else {
  console.warn('⚠️ No MONGO_URI provided in .env, running with fallback store');
}

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email, 
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==========================================
// Authentication Routes
// ==========================================

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, password, and confirm password' 
      });
    }

    const trimmedName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check password matching
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match. Please re-enter identical passwords.' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isMongoConnected) {
      // Check existing user in MongoDB
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'An account with this email already exists. Please sign in.' 
        });
      }

      // Create new user in MongoDB
      const newUser = await User.create({
        name: trimmedName,
        email: cleanEmail,
        password: hashedPassword
      });

      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } else {
      // Fallback Store
      const existing = fallbackUsers.find(u => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'An account with this email already exists. Please sign in.' 
        });
      }

      const fallbackUser = {
        _id: 'usr_' + Date.now(),
        name: trimmedName,
        email: cleanEmail,
        password: hashedPassword,
        createdAt: new Date()
      };
      fallbackUsers.push(fallbackUser);

      const token = generateToken(fallbackUser);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: fallbackUser._id,
          name: fallbackUser.name,
          email: fallbackUser.email
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration: ' + error.message 
    });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email and password' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    let targetUser = null;
    if (isMongoConnected) {
      targetUser = await User.findOne({ email: cleanEmail });
    } else {
      targetUser = fallbackUsers.find(u => u.email === cleanEmail);
    }

    if (!targetUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'No account found with this email. Please check your email or sign up.' 
      });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, targetUser.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect password. Please try again.' 
      });
    }

    // Issue JWT Token
    const token = generateToken(targetUser);
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: targetUser._id || targetUser.id,
        name: targetUser.name,
        email: targetUser.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login: ' + error.message 
    });
  }
});

// 3. GET CURRENT USER (Protected with JWT)
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No authentication token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token. Please sign in again.' 
      });
    }

    let userDetails = null;
    if (isMongoConnected) {
      userDetails = await User.findById(decoded.id).select('-password');
    } else {
      const u = fallbackUsers.find(fu => fu._id === decoded.id || fu.email === decoded.email);
      if (u) {
        userDetails = { id: u._id, name: u.name, email: u.email };
      }
    }

    if (!userDetails) {
      return res.status(404).json({ 
        success: false, 
        message: 'User session not found' 
      });
    }

    return res.status(200).json({
      success: true,
      user: userDetails
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: isMongoConnected ? 'MongoDB Atlas' : 'In-Memory Fallback',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Gym Trainer Auth Server running on http://localhost:${PORT}`);
});
