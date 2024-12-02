-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Initialize user management
\i 'src/db/init-users.sql'

-- Initialize user synchronization
\i 'src/db/sync-users.sql'

-- Initialize master tables and case management
\i 'src/db/schema.sql'
\i 'src/db/cases-schema.sql'

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;