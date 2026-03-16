-- Database Indexing Audit for 10k+ Listings Performance
-- Ensure sub-200ms response times for map search

-- 1. Properties Table Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_sector_price ON properties(sector, price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_verification ON properties(is_verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_location ON properties USING GIST(ST_Point(longitude, latitude));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_active ON properties(is_active) WHERE is_active = true;

-- 2. Transactions Table Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_property ON transactions(property_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- 3. Profiles Table Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_kyc ON profiles(kyc_status) WHERE kyc_status = 'verified';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. Visits Table Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_property_status ON visits(property_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_user ON visits(user_id);

-- 5. Reviews Table Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_property ON reviews(property_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);

-- 6. Favorites Table Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_property ON favorites(property_id);

-- 7. Audit Logs Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_action ON audit_logs(action_type, created_at DESC);

-- 8. Full Text Search for Property Names
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search ON properties USING gin(to_tsvector('english', title || ' ' || sector));

-- Performance Monitoring Query
-- Run this to check index usage:
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/
