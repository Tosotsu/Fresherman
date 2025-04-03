-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    record_type text,
    date date,
    blood_type text,
    height text,
    weight text,
    allergies text[],
    emergency_contact jsonb,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT medical_records_pkey PRIMARY KEY (id)
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create employment table
CREATE TABLE IF NOT EXISTS public.employment (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name character varying,
    position character varying,
    start_date date,
    end_date date,
    is_current_job boolean,
    description text,
    location character varying,
    salary numeric,
    supervisor_name character varying,
    supervisor_contact character varying,
    responsibilities text,
    achievements text,
    reason_for_leaving text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT employment_pkey PRIMARY KEY (id)
);
ALTER TABLE public.employment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_records
DROP POLICY IF EXISTS "Users can view their own medical records" ON public.medical_records;
CREATE POLICY "Users can view their own medical records"
    ON public.medical_records FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own medical records" ON public.medical_records;
CREATE POLICY "Users can insert their own medical records"
    ON public.medical_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own medical records" ON public.medical_records;
CREATE POLICY "Users can update their own medical records"
    ON public.medical_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own medical records" ON public.medical_records;
CREATE POLICY "Users can delete their own medical records"
    ON public.medical_records FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for employment
DROP POLICY IF EXISTS "Users can view their own employment records" ON public.employment;
CREATE POLICY "Users can view their own employment records"
    ON public.employment FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own employment records" ON public.employment;
CREATE POLICY "Users can insert their own employment records"
    ON public.employment FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own employment records" ON public.employment;
CREATE POLICY "Users can update their own employment records"
    ON public.employment FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own employment records" ON public.employment;
CREATE POLICY "Users can delete their own employment records"
    ON public.employment FOR DELETE
    USING (auth.uid() = user_id);

-- Assuming the trigger function update_updated_at_column already exists from the vehicle migration

-- Triggers for medical_records
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER update_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for employment
DROP TRIGGER IF EXISTS update_employment_updated_at ON public.employment;
CREATE TRIGGER update_employment_updated_at
BEFORE UPDATE ON public.employment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 