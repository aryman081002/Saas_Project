-- ============================================
-- TechFlow — Fix RLS Policies
-- Run this in your Supabase SQL Editor
-- This allows inserts/updates/deletes for all roles
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;

-- Create permissive policies for all operations
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on clients" ON clients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);
