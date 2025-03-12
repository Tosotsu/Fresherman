-- Create demo account and necessary tables
-- Run this in the Supabase SQL Editor

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.personal_info (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text,
    email text,
    age text,
    stream text,
    gender text,
    contact_no text,
    next_phone text,
    country text,
    district text,
    state text,
    village text,
    parent_name text,
    relation text,
    occupation text,
    posting_date text,
    updation_date text,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can only access their own data"
ON public.personal_info
FOR ALL
USING (auth.uid() = user_id);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can only access their own profile"
ON public.profiles
FOR ALL 
USING (auth.uid() = user_id);

-- Create a function to create a new profile for each new user
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create a profile for each new user
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.create_profile_for_new_user(); 