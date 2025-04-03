-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blood_type TEXT,
    allergies TEXT,
    medications TEXT,
    conditions TEXT,
    emergency_contact TEXT,
    insurance_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create employment_records table
CREATE TABLE IF NOT EXISTS employment_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_employer TEXT,
    position TEXT,
    start_date DATE,
    salary TEXT,
    work_experience TEXT,
    skills TEXT,
    education TEXT,
    certifications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for medical_records
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medical records"
    ON medical_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical records"
    ON medical_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical records"
    ON medical_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for employment_records
ALTER TABLE employment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employment records"
    ON employment_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employment records"
    ON employment_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employment records"
    ON employment_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employment_records_updated_at
    BEFORE UPDATE ON employment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 