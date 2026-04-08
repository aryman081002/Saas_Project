const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// ============================================
// POST /api/auth/register — Create new account
// ============================================
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user in Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password: hashedPassword,
          plan: 'starter',
          is_active: true,
        })
        .select('id, name, email, plan, created_at')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create account. Please try again.',
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          plan: newUser.plan,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  }
);

// ============================================
// POST /api/auth/login — Login & get JWT
// ============================================
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Contact support.',
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  }
);

// ============================================
// GET /api/auth/me — Get current user profile
// ============================================
router.get('/me', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, plan, is_active, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

// ============================================
// PUT /api/auth/me — Update user profile
// ============================================
router.put(
  '/me',
  auth,
  [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const updates = {};
      if (req.body.name) updates.name = req.body.name;

      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select('id, name, email, plan, is_active, created_at')
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update profile.',
        });
      }

      res.json({
        success: true,
        message: 'Profile updated.',
        user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error.',
      });
    }
  }
);

module.exports = router;
