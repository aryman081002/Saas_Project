const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// ============================================
// GET /api/clients — List all clients for user
// ============================================
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Optional search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data: clients, error, count } = await query;

    if (error) {
      console.error('Fetch clients error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch clients.',
      });
    }

    res.json({
      success: true,
      clients,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

// ============================================
// GET /api/clients/:id — Get single client
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.',
      });
    }

    res.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

// ============================================
// POST /api/clients — Create new client
// ============================================
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Client name is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('company').optional().trim(),
    body('phone').optional().trim(),
    body('status').optional().isIn(['active', 'inactive']),
    body('notes').optional().trim(),
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

      // Check client limit for starter plan
      const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('id', req.user.id)
        .single();

      if (user && user.plan === 'starter') {
        const { count } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', req.user.id);

        if (count >= 5) {
          return res.status(403).json({
            success: false,
            message: 'Starter plan is limited to 5 clients. Upgrade to Professional for unlimited clients.',
          });
        }
      }

      const { name, email, company, phone, status, notes } = req.body;

      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          user_id: req.user.id,
          name,
          email: email || null,
          company: company || null,
          phone: phone || null,
          status: status || 'active',
          notes: notes || null,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Create client error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create client.',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Client created successfully!',
        client,
      });
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error.',
      });
    }
  }
);

// ============================================
// PUT /api/clients/:id — Update client
// ============================================
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail(),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Verify client belongs to user
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Client not found.',
        });
      }

      const updates = {};
      const fields = ['name', 'email', 'company', 'phone', 'status', 'notes',
                       'page_views', 'unique_users', 'conversion_rate', 'avg_session_duration'];
      fields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const { data: client, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select('*')
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update client.',
        });
      }

      res.json({
        success: true,
        message: 'Client updated.',
        client,
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error.',
      });
    }
  }
);

// ============================================
// DELETE /api/clients/:id — Delete client
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    // Verify client belongs to user
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.',
      });
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete client.',
      });
    }

    res.json({
      success: true,
      message: 'Client deleted.',
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

module.exports = router;
