-- ==============================================================================
-- 001_initial_schema.sql
-- Icon Electromatic B2B Catalog Database Schema
-- Standard PostgreSQL DDL compatible with Supabase
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. OEMs (Original Equipment Manufacturers / Partners)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.oems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    priority_order INT DEFAULT 99,
    website_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_oems_slug ON public.oems(slug);
CREATE INDEX IF NOT EXISTS idx_oems_priority ON public.oems(priority_order);

-- ------------------------------------------------------------------------------
-- 2. Categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    oem_id UUID REFERENCES public.oems(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_oem_id ON public.categories(oem_id);

-- ------------------------------------------------------------------------------
-- 3. Products
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    oem_id UUID NOT NULL REFERENCES public.oems(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    description TEXT,
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    features TEXT[] NOT NULL DEFAULT '{}'::text[],
    applications TEXT[] NOT NULL DEFAULT '{}'::text[],
    datasheet_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    -- On-record SEO fields
    meta_title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    og_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Prevent duplicate product slugs within the same OEM
    CONSTRAINT unique_oem_product_slug UNIQUE (oem_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_oem_id ON public.products(oem_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);

-- ------------------------------------------------------------------------------
-- 4. Product Images (Ordered Left-to-Right gallery)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 1,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    width INT,
    height INT,
    format TEXT NOT NULL DEFAULT 'webp',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON public.product_images(product_id, display_order);

-- ------------------------------------------------------------------------------
-- 5. User Roles (Access Control for Staff)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. Enquiries & Rate Limiting (Host-Independent)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    destination_office TEXT NOT NULL CHECK (destination_office IN ('india', 'singapore', 'usa')),
    destination_email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    ip_hash TEXT,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'emailed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip_hash TEXT PRIMARY KEY,
    request_count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_oems_updated_at
    BEFORE UPDATE ON public.oems
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
