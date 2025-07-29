import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from './models/User.js';
import Material from './models/Material.js';
import Design from './models/Design.js';
import Sale from './models/Sale.js';
import { authenticateToken, isAdmin } from './middleware/auth.js';
import { sendOTP } from './utils/emailService.js';

dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(express.json());


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validation middleware
const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    await createAdminUser();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create initial admin user
const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Auth routes
app.post('/api/auth/initiate-signup',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Initiating signup for email:', email);

      // Check if user exists and is verified
      let user = await User.findOne({ email });
      
      if (user && user.isVerified) {
        console.log('User already exists and is verified');
        return res.status(400).json({ error: 'Email already exists' });
      }

      const otp = generateOTP();
      console.log('Generated OTP:', otp);

      // Send OTP first before creating/updating user
      try {
        await sendOTP(email, otp);
        console.log('OTP sent successfully');
      } catch (error) {
        console.error('Failed to send OTP:', error);
        return res.status(500).json({ error: 'Failed to send verification email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      if (user) {
        // Update existing unverified user
        user.password = hashedPassword;
        user.otp = {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };
        await user.save();
        console.log('Updated existing unverified user');
      } else {
        // Create new user
        user = new User({
          email,
          password: hashedPassword,
          otp: {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
          }
        });
        await user.save();
        console.log('Created new user');
      }

      res.status(200).json({ 
        message: 'OTP sent to your email',
        email: email
      });
    } catch (error) {
      console.error('Signup initiation error:', error);
      res.status(500).json({ error: 'Failed to initiate signup. Please try again.' });
    }
  }
);

app.post('/api/auth/verify-otp',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 })
  ]),
  async (req, res) => {
    try {
      const { email, otp } = req.body;
      console.log('Verifying OTP for email:', email);

      const user = await User.findOne({ 
        email,
        'otp.code': otp,
        'otp.expiresAt': { $gt: new Date() }
      });

      if (!user) {
        console.log('Invalid or expired OTP');
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      user.isVerified = true;
      user.otp = undefined;
      await user.save();
      console.log('User verified successfully');

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET
      );

      res.json({ token, role: user.role });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
    }
  }
);

app.post('/api/auth/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !user.password) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(400).json({ error: 'Please verify your email first' });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET
      );

      res.json({ token, role: user.role });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.post('/api/auth/google',
  async (req, res) => {
    try {
      const { credential } = req.body;
      
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const { email, sub: googleId } = payload;

      let user = await User.findOne({ email });
      
      if (!user) {
        user = new User({
          email,
          googleId,
          isVerified: true
        });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET
      );

      res.json({ token, role: user.role });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Materials routes
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await Material.find().sort('-createdAt');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/materials',
  authenticateToken,
  isAdmin,
  validate([
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('size').trim().notEmpty()
  ]),
  async (req, res) => {
    try {
      const material = new Material(req.body);
      await material.save();
      res.status(201).json(material);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.put('/api/materials/:id',
  authenticateToken,
  isAdmin,
  validate([
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('size').trim().notEmpty()
  ]),
  async (req, res) => {
    try {
      const material = await Material.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      res.json(material);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.delete('/api/materials/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const material = await Material.findByIdAndDelete(req.params.id);
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      res.json({ message: 'Material deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Designs routes
app.get('/api/designs', async (req, res) => {
  try {
    const designs = await Design.find().sort('-createdAt');
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/designs',
  authenticateToken,
  isAdmin,
  validate([
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 })
  ]),
  async (req, res) => {
    try {
      const design = new Design(req.body);
      await design.save();
      res.status(201).json(design);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.put('/api/designs/:id',
  authenticateToken,
  isAdmin,
  validate([
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 })
  ]),
  async (req, res) => {
    try {
      const design = await Design.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }
      res.json(design);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.delete('/api/designs/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const design = await Design.findByIdAndDelete(req.params.id);
      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }
      res.json({ message: 'Design deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Sales routes
app.get('/api/sales',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const sales = await Sale.find()
        .populate('customer', 'email')
        .sort('-createdAt');
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.post('/api/sales/create', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    const sale = new Sale({
      customer: req.user.id,
      items: items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price + (item.design ? item.design.price : 0)
      })),
      total: items.reduce((total, item) => {
        return total + (item.product.price + (item.design ? item.design.price : 0)) * item.quantity;
      }, 0),
      status: 'completed'
    });

    await sale.save();
    res.json({ success: true, sale });
  } catch (error) {
    console.error('Sale creation error:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

app.get('/api/sales/user', authenticateToken, async (req, res) => {
  try {
    const sales = await Sale.find({ customer: req.user.id })
      .sort('-createdAt');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize MongoDB connection and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});