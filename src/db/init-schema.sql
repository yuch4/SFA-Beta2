-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Initialize schema with all required tables
\i 'src/db/users-schema.sql'
\i 'src/db/cases-schema.sql'