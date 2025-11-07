
-- ============================================
-- WordPress Database Optimization for Performance
-- ============================================

-- 1. Clean up revisions (keep last 3)
DELETE a,b,c FROM wp_posts a
LEFT JOIN wp_term_relationships b ON (a.ID = b.object_id)
LEFT JOIN wp_postmeta c ON (a.ID = c.post_id)
WHERE a.post_type = 'revision'
AND a.post_date < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 2. Clean up spam comments
DELETE FROM wp_comments WHERE comment_approved = 'spam';

-- 3. Clean up trashed comments
DELETE FROM wp_comments WHERE comment_approved = 'trash';

-- 4. Clean up orphaned post meta
DELETE pm FROM wp_postmeta pm
LEFT JOIN wp_posts p ON pm.post_id = p.ID
WHERE p.ID IS NULL;

-- 5. Clean up orphaned comment meta
DELETE cm FROM wp_commentmeta cm
LEFT JOIN wp_comments c ON cm.comment_id = c.comment_ID
WHERE c.comment_ID IS NULL;

-- 6. Optimize tables
OPTIMIZE TABLE wp_posts;
OPTIMIZE TABLE wp_postmeta;
OPTIMIZE TABLE wp_comments;
OPTIMIZE TABLE wp_commentmeta;
OPTIMIZE TABLE wp_options;
OPTIMIZE TABLE wp_terms;
OPTIMIZE TABLE wp_term_taxonomy;
OPTIMIZE TABLE wp_term_relationships;

-- ============================================
-- Performance Indexes (if not exist)
-- ============================================

-- Index for post queries
CREATE INDEX idx_post_type_status_date ON wp_posts(post_type, post_status, post_date);

-- Index for post meta queries
CREATE INDEX idx_meta_key_value ON wp_postmeta(meta_key, meta_value(10));

-- Index for term relationships
CREATE INDEX idx_term_object ON wp_term_relationships(term_taxonomy_id, object_id);

-- Index for comments
CREATE INDEX idx_comment_post_approved ON wp_comments(comment_post_ID, comment_approved);

-- ============================================
-- WordPress Options Optimization
-- ============================================

-- Remove expired transients
DELETE FROM wp_options 
WHERE option_name LIKE '_transient_%' 
AND option_name NOT LIKE '_transient_timeout_%';

-- Clean up autoload options
UPDATE wp_options SET autoload = 'no' 
WHERE option_name IN (
  'widget_recent-posts',
  'widget_recent-comments', 
  'widget_archives',
  'widget_categories'
) AND autoload = 'yes';

-- ============================================
-- WP GraphQL Specific Optimizations
-- ============================================

-- Ensure GraphQL cache tables are optimized
-- (Run these if you have GraphQL caching plugins)

-- OPTIMIZE TABLE wp_graphql_cache;
-- OPTIMIZE TABLE wp_graphql_persisted_queries;
