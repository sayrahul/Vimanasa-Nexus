-- ============================================
-- VIMANASA NEXUS - RECRUITMENT SYSTEM SETUP
-- ============================================
-- This script creates the missing job_openings and candidates tables
-- and populates them with sample data for a functional careers portal.
-- Run this in the Supabase SQL Editor.

-- 1. JOB OPENINGS TABLE
CREATE TABLE IF NOT EXISTS job_openings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT DEFAULT 'Remote',
  type TEXT DEFAULT 'Full-time',
  salary_range TEXT,
  description TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'open',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_title TEXT,
  job_id TEXT, -- Can be UUID or internal code
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  aadhar_number TEXT,
  pan_number TEXT,
  current_employer TEXT,
  total_experience_years INTEGER DEFAULT 0,
  current_salary DECIMAL(12, 2) DEFAULT 0,
  expected_salary DECIMAL(12, 2) DEFAULT 0,
  notice_period_days INTEGER DEFAULT 30,
  skills TEXT,
  resume_url TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_openings(status);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);

-- 4. SAMPLE JOB DATA
INSERT INTO job_openings (title, department, location, type, salary_range, description, requirements, status)
VALUES 
(
  'Senior Security Specialist', 
  'Security Operations', 
  'Mumbai, MH', 
  'Full-time', 
  '₹45,000 - ₹65,000', 
  'We are looking for an experienced security specialist to lead our on-site team and manage security protocols for high-profile clients.', 
  'Minimum 5 years experience in security management\nEx-servicemen preferred\nExcellent communication and leadership skills',
  'open'
),
(
  'HR Operations Manager', 
  'Human Resources', 
  'Remote / Pune', 
  'Full-time', 
  '₹60,000 - ₹85,000', 
  'Join our corporate team to manage end-to-end HR operations, recruitment, and employee relations for our growing workforce.', 
  'MBA in HR or equivalent\n3+ years experience in HR Operations\nProficiency in HRM systems',
  'open'
),
(
  'Facility Coordinator', 
  'Facility Management', 
  'Bangalore, KA', 
  'Contract', 
  '₹30,000 - ₹40,000', 
  'Coordinate facility maintenance and operations for our tech-park clients. Ensure smooth day-to-day functioning.', 
  'Diploma or Degree in any field\nExperience in vendor management\nStrong problem-solving abilities',
  'open'
);

-- 5. VERIFICATION NOTICE
DO $$
BEGIN
  RAISE NOTICE '✅ Recruitment System Tables Created!';
  RAISE NOTICE '🚀 3 Sample Jobs Added. The Careers page is now functional.';
END $$;
