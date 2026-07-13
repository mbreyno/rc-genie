-- ============================================================
-- Subscription support (Stripe)
-- 7-day free trial (no card), then $9/mo via Stripe Checkout.
-- Subscription state lives on advisor_profiles and is written
-- ONLY by the Stripe webhook (service role) — never by clients.
-- ============================================================

ALTER TABLE advisor_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS trial_ends_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS advisor_profiles_stripe_customer_idx
  ON advisor_profiles(stripe_customer_id);

-- Existing accounts: fresh 7-day trial starting at launch
UPDATE advisor_profiles
SET subscription_status = 'trialing',
    trial_ends_at       = NOW() + INTERVAL '7 days';

-- ─── COLUMN-LEVEL PROTECTION ─────────────────────────────────────────────────
-- RLS lets users update their own profile row; without this they could set
-- their own subscription_status. Replace the table-level UPDATE/INSERT grants
-- with column lists that exclude subscription fields. The service role
-- (webhook) is unaffected.

REVOKE UPDATE, INSERT ON advisor_profiles FROM authenticated, anon;

GRANT UPDATE (firm_name, advisor_name, advisor_email, logo_url, logo_path, brand_color)
  ON advisor_profiles TO authenticated;

GRANT INSERT (id, firm_name, advisor_name, advisor_email, logo_url, logo_path, brand_color)
  ON advisor_profiles TO authenticated;

-- ─── RLS BACKSTOP FOR REPORT CREATION ────────────────────────────────────────
-- UI paywall aside, the database itself refuses new reports unless the
-- advisor is on an unexpired trial or has an active subscription.

CREATE OR REPLACE FUNCTION has_active_subscription(uid UUID)
RETURNS BOOLEAN AS $func$
  SELECT EXISTS (
    SELECT 1 FROM advisor_profiles p
    WHERE p.id = uid
      AND (
        p.subscription_status = 'active'
        OR (p.subscription_status = 'trialing' AND p.trial_ends_at > NOW())
      )
  );
$func$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Advisors can create reports" ON reports;
CREATE POLICY "Advisors can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = advisor_id AND has_active_subscription(auth.uid()));
