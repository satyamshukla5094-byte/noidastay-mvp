-- Add required extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  document_id TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Strict RLS: allow inserts/selects only; no delete/update
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "audit_logs_no_update" ON audit_logs
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE POLICY "audit_logs_no_delete" ON audit_logs
  FOR DELETE USING (false);

-- Create function to send webhook through pg_net async
CREATE OR REPLACE FUNCTION public.audit_logs_webhook_notify() RETURNS trigger AS $$
DECLARE
  payload JSON;
  webhook_url TEXT;
BEGIN
  payload = json_build_object(
    'user_id', NEW.user_id,
    'action_type', NEW.action_type,
    'document_id', NEW.document_id,
    'timestamp', NEW.timestamp,
    'details', NEW.details
  );
  webhook_url := current_setting('app.security_alert_webhook', true);

  IF NEW.action_type = 'VAULT_ACCESS' AND webhook_url IS NOT NULL THEN
    PERFORM net.http_post(
      webhook_url,
      json_build_object('Content-Type','application/json')::json,
      payload::text,
      10
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_logs_webhook ON audit_logs;
CREATE TRIGGER trigger_audit_logs_webhook
AFTER INSERT ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.audit_logs_webhook_notify();
