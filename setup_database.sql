-- Complete NoidaStay Database Setup
-- Run this in Supabase SQL Editor to create all tables

-- 1. Core Schema
\i 20260312224251_init_schema.sql

-- 2. Extensions and Additional Tables
\i 20260314000000_add_tenants_table.sql
\i 20260314000001_add_activity_logs.sql
\i 20260314000002_add_profile_fields.sql
\i 20260315000000_fix_profiles_rls.sql
\i 20260315035000_add_favorites_reviews.sql
\i 20260315100000_fix_favorites_property_id.sql

-- 3. KYC and Verification System
\i 20260316000000_add_kyc_fields.sql
\i 20260316150000_add_referral_fields_to_profiles.sql
\i 20260316153000_harden_vault_rls.sql
\i 20260317090000_add_kyc_fields_to_profiles.sql
\i 20260317093000_add_consent_and_document_log_tables.sql
\i 20260318010000_secure_vault.sql
\i 20260318033000_add_consent_records.sql
\i 20260318043000_add_audit_logs_and_trigger.sql
\i 20260319000000_core_trust_engine.sql
\i 20260320000000_kyc_pipeline_v2.sql

-- 4. Payment and Escrow
\i 20260321000000_payment_escrow_system.sql

-- 5. Property Features
\i 20260322000000_visit_scheduling.sql
\i 20260323000000_owner_verification_flow.sql
\i 20260324000000_parent_stay_engine.sql

-- 6. Communication and Social
\i 20260325000000_inquiry_chat_system.sql
\i 20260326000000_room_audit_system.sql
\i 20260327000000_roommate_matching.sql
\i 20260328000000_verified_reviews_system.sql

-- 7. Business Logic
\i 20260329000000_urgency_system.sql
\i 20260330000000_financial_backbone.sql

-- 8. Performance Optimization
\i 20260331000000_performance_indexes.sql

-- Success Message
SELECT 'NoidaStay database setup completed successfully!' as status;
