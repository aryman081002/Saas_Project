const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// ============================================
// GET /api/dashboard/stats
// Get aggregated dashboard statistics
// ============================================
router.get('/stats', async (req, res) => {
  try {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, plan, created_at')
      .eq('id', req.user.id)
      .single();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Get total clients count
    const { count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    // Get active clients count
    const { count: activeClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('status', 'active');

    // Get aggregated metrics from all clients
    const { data: clients } = await supabase
      .from('clients')
      .select('page_views, unique_users, conversion_rate, avg_session_duration')
      .eq('user_id', req.user.id);

    let metrics = {
      totalPageViews: 0,
      totalUniqueUsers: 0,
      avgConversionRate: 0,
      avgSessionDuration: 0,
    };

    if (clients && clients.length > 0) {
      metrics.totalPageViews = clients.reduce((sum, c) => sum + (c.page_views || 0), 0);
      metrics.totalUniqueUsers = clients.reduce((sum, c) => sum + (c.unique_users || 0), 0);
      metrics.avgConversionRate = (
        clients.reduce((sum, c) => sum + (parseFloat(c.conversion_rate) || 0), 0) / clients.length
      ).toFixed(2);
      metrics.avgSessionDuration = Math.round(
        clients.reduce((sum, c) => sum + (c.avg_session_duration || 0), 0) / clients.length
      );
    }

    // Get latest subscription
    const { data: latestSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    res.json({
      success: true,
      dashboard: {
        user: {
          name: user.name,
          email: user.email,
          plan: user.plan,
          memberSince: user.created_at,
        },
        clients: {
          total: totalClients || 0,
          active: activeClients || 0,
          inactive: (totalClients || 0) - (activeClients || 0),
        },
        metrics,
        subscription: latestSubscription || null,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

module.exports = router;
