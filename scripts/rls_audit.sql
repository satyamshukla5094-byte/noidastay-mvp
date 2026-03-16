-- Check for tables with public ALL access
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND (roles @> '{public}' OR roles @> '{anon}');

-- Check for tables without RLS enabled
SELECT 
    relname AS tablename
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'
AND NOT relrowsecurity;
