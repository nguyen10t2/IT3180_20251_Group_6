-- =============================================
-- Main SQL file to run all scripts in order
-- Run this file to initialize the database
-- Usage: psql -d bluemoon -f main.sql
-- =============================================

-- Initialize extensions
\echo 'Creating extensions...'
\i init.sql

-- Create custom types
\echo 'Creating types...'
\i types.sql

-- Create tables
\echo 'Creating tables...'
\i tables.sql

-- Create indexes
\echo 'Creating indexes...'
\i indexes.sql

-- Create triggers and functions
\echo 'Creating triggers and functions...'
\i triggers_functions.sql

-- Insert seed data (optional - comment out for production)
\echo 'Inserting seed data...'
\i seed.sql

\echo 'Database initialization completed!'