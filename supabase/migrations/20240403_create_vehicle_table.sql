-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    make character varying,
    model character varying,
    year integer,
    color character varying,
    license_plate character varying,
    vin character varying,
    registration_number character varying,
    insurance_provider character varying,
    insurance_policy_number character varying,
    insurance_expiry_date date,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT vehicles_pkey PRIMARY KEY (id)
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date text,
    type text,
    description text,
    cost text,
    mileage text,
    service_provider text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT maintenance_records_pkey PRIMARY KEY (id)
);
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicles
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.vehicles;
CREATE POLICY "Users can view their own vehicles"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own vehicles" ON public.vehicles;
CREATE POLICY "Users can insert their own vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
CREATE POLICY "Users can update their own vehicles"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;
CREATE POLICY "Users can delete their own vehicles"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for maintenance_records
DROP POLICY IF EXISTS "Users can view their own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can view their own maintenance records"
    ON public.maintenance_records FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can insert their own maintenance records"
    ON public.maintenance_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can update their own maintenance records"
    ON public.maintenance_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can delete their own maintenance records"
    ON public.maintenance_records FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now()); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for vehicles
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for maintenance_records
DROP TRIGGER IF EXISTS update_maintenance_records_updated_at ON public.maintenance_records;
CREATE TRIGGER update_maintenance_records_updated_at
BEFORE UPDATE ON public.maintenance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 