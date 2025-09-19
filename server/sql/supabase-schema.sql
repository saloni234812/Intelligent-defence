-- AEGIS Defense System - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS public.users_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'Operator', 'User')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  confidence NUMERIC DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Radar detections table
CREATE TABLE IF NOT EXISTS public.radar_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  radar_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  range_meters NUMERIC NOT NULL CHECK (range_meters > 0),
  azimuth_deg INTEGER NOT NULL CHECK (azimuth_deg >= 0 AND azimuth_deg < 360),
  elevation_deg INTEGER DEFAULT 0 CHECK (elevation_deg >= -90 AND elevation_deg <= 90),
  rcs NUMERIC DEFAULT 0,
  velocity_mps NUMERIC DEFAULT 0,
  confidence NUMERIC DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Response playbooks table
CREATE TABLE IF NOT EXISTS public.playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL CHECK (priority IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','IN_PROGRESS','COMPLETED','FAILED','CANCELLED')),
  eta_seconds INTEGER DEFAULT 0,
  category TEXT DEFAULT 'TACTICAL',
  parameters JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users_app(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users_app(email);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_radar_radar_id ON public.radar_detections(radar_id);
CREATE INDEX IF NOT EXISTS idx_radar_timestamp ON public.radar_detections(timestamp);
CREATE INDEX IF NOT EXISTS idx_playbooks_priority ON public.playbooks(priority);
CREATE INDEX IF NOT EXISTS idx_playbooks_status ON public.playbooks(status);
CREATE INDEX IF NOT EXISTS idx_playbooks_created_by ON public.playbooks(created_by);

-- Enable Row Level Security
ALTER TABLE public.users_app ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your security requirements)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users_app
  FOR SELECT USING (auth.uid()::text = id::text);

-- Alerts are readable by authenticated users
CREATE POLICY "Authenticated users can read alerts" ON public.alerts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Alerts can be created by authenticated users
CREATE POLICY "Authenticated users can create alerts" ON public.alerts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Alerts can be updated by authenticated users
CREATE POLICY "Authenticated users can update alerts" ON public.alerts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Radar detections are readable by authenticated users
CREATE POLICY "Authenticated users can read radar" ON public.radar_detections
  FOR SELECT USING (auth.role() = 'authenticated');

-- Radar detections can be created by authenticated users
CREATE POLICY "Authenticated users can create radar" ON public.radar_detections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Radar detections can be deleted by authenticated users
CREATE POLICY "Authenticated users can delete radar" ON public.radar_detections
  FOR DELETE USING (auth.role() = 'authenticated');

-- Playbooks are readable by authenticated users
CREATE POLICY "Authenticated users can read playbooks" ON public.playbooks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Playbooks can be created by authenticated users
CREATE POLICY "Authenticated users can create playbooks" ON public.playbooks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Playbooks can be updated by authenticated users
CREATE POLICY "Authenticated users can update playbooks" ON public.playbooks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Playbooks can be deleted by authenticated users
CREATE POLICY "Authenticated users can delete playbooks" ON public.playbooks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.users_app (name, email, password_hash, role) VALUES
  ('Admin User', 'admin@aegis.com', '$2a$10$rQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQ', 'Admin'),
  ('Operator 1', 'operator@aegis.com', '$2a$10$rQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQ', 'Operator'),
  ('Test User', 'test@aegis.com', '$2a$10$rQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQZ8K9vL8vQ', 'User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.alerts (alert_type, title, description, location, confidence, status) VALUES
  ('CRITICAL', 'Intrusion detected at North Gate', 'Unauthorized perimeter breach detected by motion sensors.', 'Grid N-12', 92, 'OPEN'),
  ('HIGH', 'UAV detected at 2km range', 'Low-altitude UAV approaching from northeast.', 'Grid E-07', 81, 'OPEN'),
  ('MEDIUM', 'Unusual RF activity', 'Spectrum analyzer reports intermittent spikes.', 'Ops Sector 3', 64, 'ACKNOWLEDGED'),
  ('LOW', 'Camera offline', 'Maintenance required for camera C-14.', 'Hangar B', 55, 'OPEN'),
  ('CRITICAL', 'System breach attempt', 'Multiple failed login attempts detected.', 'Server Room A', 95, 'RESOLVED')
ON CONFLICT DO NOTHING;

INSERT INTO public.radar_detections (radar_id, timestamp, range_meters, azimuth_deg, elevation_deg, rcs, velocity_mps, confidence) VALUES
  ('R-ALPHA', NOW() - INTERVAL '1 hour', 850, 34, 5, 12.5, 45, 0.86),
  ('R-ALPHA', NOW() - INTERVAL '58 minutes', 820, 35, 6, 14.2, 47, 0.88),
  ('R-BRAVO', NOW() - INTERVAL '2 hours', 2200, 120, 2, 6.7, -20, 0.72),
  ('R-BRAVO', NOW() - INTERVAL '1 hour 58 minutes', 2150, 121, 2, 7.1, -22, 0.70),
  ('R-ALPHA', NOW() - INTERVAL '30 minutes', 1200, 180, 8, 18.3, 65, 0.91)
ON CONFLICT DO NOTHING;

INSERT INTO public.playbooks (name, description, priority, status, eta_seconds, category) VALUES
  ('LAUNCH UAV RECON', 'Deploy drone for aerial surveillance and assessment', 'HIGH', 'IN_PROGRESS', 45, 'TACTICAL'),
  ('ALERT COMMAND CENTER', 'Notify higher command of critical threat status', 'MEDIUM', 'COMPLETED', 1, 'COMMUNICATION'),
  ('ACTIVATE EMP SHIELD', 'Deploy electronic countermeasures in affected zone', 'CRITICAL', 'AVAILABLE', 10, 'DEFENSIVE'),
  ('EVACUATE PERSONNEL', 'Initiate emergency evacuation procedures', 'CRITICAL', 'AVAILABLE', 300, 'SAFETY'),
  ('LOCKDOWN FACILITY', 'Secure all access points and restrict movement', 'HIGH', 'AVAILABLE', 30, 'SECURITY')
ON CONFLICT DO NOTHING;
