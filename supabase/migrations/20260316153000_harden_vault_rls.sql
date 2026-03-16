-- Harden storage and sensitive table RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='storage' AND table_name='objects') THEN
    BEGIN
      EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN insufficient_privilege OR invalid_table_definition THEN
      RAISE NOTICE 'Skipping vault objects RLS due no privilege';
    END;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='storage' AND table_name='objects') THEN
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vault_objects_select' AND schemaname = 'storage') THEN
        EXECUTE 'CREATE POLICY "vault_objects_select" ON storage.objects FOR SELECT USING ((metadata->>''user_id'' = auth.uid()::text) OR auth.role() = ''service_role'')';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vault_objects_insert' AND schemaname = 'storage') THEN
        EXECUTE 'CREATE POLICY "vault_objects_insert" ON storage.objects FOR INSERT WITH CHECK (auth.role() = ''service_role'' OR (metadata->>''user_id'' = auth.uid()::text))';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vault_objects_update' AND schemaname = 'storage') THEN
        EXECUTE 'CREATE POLICY "vault_objects_update" ON storage.objects FOR UPDATE USING (false) WITH CHECK (false)';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vault_objects_delete' AND schemaname = 'storage') THEN
        EXECUTE 'CREATE POLICY "vault_objects_delete" ON storage.objects FOR DELETE USING (false)';
      END IF;
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Vault policies exist';
    END;
  END IF;
END$$;

-- Harden audit logs
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_logs_insert' AND schemaname = 'public') THEN
    EXECUTE 'CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_logs_select' AND schemaname = 'public') THEN
    EXECUTE 'CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (auth.uid() = user_id OR auth.role() = ''service_role'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_logs_no_update' AND schemaname = 'public') THEN
    EXECUTE 'CREATE POLICY audit_logs_no_update ON audit_logs FOR UPDATE USING (false) WITH CHECK (false)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_logs_no_delete' AND schemaname = 'public') THEN
    EXECUTE 'CREATE POLICY audit_logs_no_delete ON audit_logs FOR DELETE USING (false)';
  END IF;
END$$;
