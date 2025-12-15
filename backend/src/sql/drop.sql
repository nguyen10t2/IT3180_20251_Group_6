-- =============================================
-- Drop all database objects
-- Run this file to reset the database
-- Usage: psql -d bluemoon -f drop.sql
-- =============================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_house_updated_at ON house;
DROP TRIGGER IF EXISTS update_resident_updated_at ON resident;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_fee_types_updated_at ON fee_types;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_feedbacks_updated_at ON feedbacks;
DROP TRIGGER IF EXISTS update_member_count_on_insert ON resident;
DROP TRIGGER IF EXISTS update_member_count_on_update ON resident;
DROP TRIGGER IF EXISTS update_member_count_on_delete ON resident;
DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON invoices;
DROP TRIGGER IF EXISTS set_invoice_paid_at_trigger ON invoices;
DROP TRIGGER IF EXISTS calculate_invoice_detail_amount ON invoice_details;
DROP TRIGGER IF EXISTS update_invoice_total_trigger ON invoice_details;
DROP TRIGGER IF EXISTS update_invoice_total_on_delete ON invoice_details;
DROP TRIGGER IF EXISTS set_feedback_resolved_at_trigger ON feedbacks;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_house_member_count();
DROP FUNCTION IF EXISTS update_invoice_total();
DROP FUNCTION IF EXISTS update_invoice_total_after();
DROP FUNCTION IF EXISTS generate_invoice_number();
DROP FUNCTION IF EXISTS set_invoice_paid_at();
DROP FUNCTION IF EXISTS set_feedback_resolved_at();

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS feedback_comments CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS notification_reads CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS invoice_details CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS fee_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS resident CASCADE;
DROP TABLE IF EXISTS house CASCADE;
DROP TABLE IF EXISTS invoice_type CASCADE;
DROP TABLE IF EXISTS house_role CASCADE;
DROP TABLE IF EXISTS user_role CASCADE;

-- Drop types
DROP TYPE IF EXISTS feedback_priority CASCADE;
DROP TYPE IF EXISTS feedback_status CASCADE;
DROP TYPE IF EXISTS feedback_type CASCADE;
DROP TYPE IF EXISTS notification_target CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS fee_status CASCADE;
DROP TYPE IF EXISTS fee_category CASCADE;
DROP TYPE IF EXISTS room_type CASCADE;
DROP TYPE IF EXISTS resident_status CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS status CASCADE;

-- Drop extensions (optional)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

\echo 'All database objects dropped!'