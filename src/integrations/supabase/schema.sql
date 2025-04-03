-- ============================================================================
-- SECURE LIFE HUB DATABASE SCHEMA
-- ============================================================================
-- Run this in the Supabase SQL Editor to set up your database

-- Clean up any existing tables and functions first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.vehicles;
DROP TABLE IF EXISTS public.employment;
DROP TABLE IF EXISTS public.medical_records;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.education;
DROP TABLE IF EXISTS public.personal_info;
DROP TABLE IF EXISTS public.profiles;

-- ============================================================================
-- PROFILES TABLE - Base table for user profiles directly linked to auth.users
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and modify their own profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================================================
-- PERSONAL INFORMATION TABLE - Detailed personal information
-- ============================================================================
CREATE TABLE public.personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  age TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  gender TEXT,
  occupation TEXT,
  about TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and modify their own personal info
CREATE POLICY "Users can view own personal info" 
  ON public.personal_info FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal info" 
  ON public.personal_info FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal info" 
  ON public.personal_info FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal info" 
  ON public.personal_info FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- EDUCATION TABLE - Educational history
-- ============================================================================
CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  institution TEXT,
  degree TEXT,
  field_of_study TEXT,
  start_year TEXT,
  end_year TEXT,
  gpa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and modify their own education records
CREATE POLICY "Users can view own education" 
  ON public.education FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own education" 
  ON public.education FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own education" 
  ON public.education FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own education" 
  ON public.education FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- DOCUMENTS TABLE - User documents and files
-- ============================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  upload_date TIMESTAMPTZ,
  file_size TEXT,
  file_type TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and modify their own documents
CREATE POLICY "Users can view own documents" 
  ON public.documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" 
  ON public.documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" 
  ON public.documents FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" 
  ON public.documents FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- MEDICAL RECORDS TABLE - Health and medical information
-- ============================================================================
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT,
  provider TEXT,
  date TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and modify their own medical records
CREATE POLICY "Users can view own medical records" 
  ON public.medical_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical records" 
  ON public.medical_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical records" 
  ON public.medical_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical records" 
  ON public.medical_records FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- EMPLOYMENT TABLE - Employment history
-- ============================================================================
CREATE TABLE public.employment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT,
  position TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employment ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and modify their own employment records
CREATE POLICY "Users can view own employment" 
  ON public.employment FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employment" 
  ON public.employment FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own employment" 
  ON public.employment FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own employment" 
  ON public.employment FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- VEHICLES TABLE - Vehicle information
-- ============================================================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  make TEXT,
  model TEXT,
  year TEXT,
  color TEXT,
  registration_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and modify their own vehicles
CREATE POLICY "Users can view own vehicles" 
  ON public.vehicles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" 
  ON public.vehicles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" 
  ON public.vehicles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" 
  ON public.vehicles FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER FUNCTION - Create profile for new users
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.profiles
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
