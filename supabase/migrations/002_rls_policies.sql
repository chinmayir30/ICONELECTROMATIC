-- ==============================================================================
-- 002_rls_policies.sql
-- Row Level Security (RLS) Policies for Icon Electromatic Catalog
-- Hardened security: Public read-only for published items, staff write access
-- ==============================================================================

-- 1. Enable RLS on all public tables
ALTER TABLE public.oems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user has staff role
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- OEMs Policies
-- ------------------------------------------------------------------------------
-- Public can read all OEMs
CREATE POLICY "Public can view OEMs"
    ON public.oems FOR SELECT
    TO anon, authenticated
    USING (true);

-- Staff can insert/update/delete OEMs
CREATE POLICY "Staff can manage OEMs"
    ON public.oems FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- Categories Policies
-- ------------------------------------------------------------------------------
-- Public can view all categories
CREATE POLICY "Public can view categories"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (true);

-- Staff can manage categories
CREATE POLICY "Staff can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- Products Policies
-- ------------------------------------------------------------------------------
-- Public can view only PUBLISHED products
CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

-- Staff can view ALL products (including drafts)
CREATE POLICY "Staff can view all products"
    ON public.products FOR SELECT
    TO authenticated
    USING (public.is_staff());

-- Staff can insert, update, delete products
CREATE POLICY "Staff can manage products"
    ON public.products FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- Product Images Policies
-- ------------------------------------------------------------------------------
-- Public can view images belonging to published products
CREATE POLICY "Public can view published product images"
    ON public.product_images FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_id AND p.is_published = true
        )
    );

-- Staff can manage all product images
CREATE POLICY "Staff can manage product images"
    ON public.product_images FOR ALL
    TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

-- ------------------------------------------------------------------------------
-- Enquiries Policies (Strict privacy)
-- ------------------------------------------------------------------------------
-- Public can NEVER select enquiries
-- Only Admins can view submitted enquiries
CREATE POLICY "Admins can view enquiries"
    ON public.enquiries FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Edge Function / service role inserts enquiries (bypasses RLS)
-- Authenticated staff cannot delete enquiries without admin
CREATE POLICY "Admins can manage enquiries"
    ON public.enquiries FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- User Roles Policies
-- ------------------------------------------------------------------------------
-- Users can view their own role
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Only admins can assign or change roles
CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
