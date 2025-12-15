-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update house member_count when resident is added/removed/updated
CREATE OR REPLACE FUNCTION update_house_member_count()
RETURNS TRIGGER AS $$
BEGIN
    -- If INSERT or UPDATE with new house_id
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.house_id IS DISTINCT FROM OLD.house_id)) THEN
        -- Increment new house member count
        IF NEW.house_id IS NOT NULL THEN
            UPDATE house SET member_count = (
                SELECT COUNT(*) FROM resident WHERE house_id = NEW.house_id
            ) WHERE house_id = NEW.house_id;
        END IF;
        
        -- Decrement old house member count (for UPDATE)
        IF TG_OP = 'UPDATE' AND OLD.house_id IS NOT NULL THEN
            UPDATE house SET member_count = (
                SELECT COUNT(*) FROM resident WHERE house_id = OLD.house_id
            ) WHERE house_id = OLD.house_id;
        END IF;
    END IF;
    
    -- If DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.house_id IS NOT NULL THEN
            UPDATE house SET member_count = (
                SELECT COUNT(*) FROM resident WHERE house_id = OLD.house_id
            ) WHERE house_id = OLD.house_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-calculate invoice total from invoice_details
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE invoices SET total_amount = (
            SELECT COALESCE(SUM(amount), 0) FROM invoice_details WHERE invoice_id = OLD.invoice_id
        ) WHERE id = OLD.invoice_id;
        RETURN OLD;
    ELSE
        -- Calculate amount = quantity * unit_price
        NEW.amount = NEW.quantity * NEW.unit_price;
        
        -- Update invoice total after this row is inserted/updated
        PERFORM pg_notify('update_invoice_total', NEW.invoice_id::text);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice total (called after insert/update on invoice_details)
CREATE OR REPLACE FUNCTION update_invoice_total_after()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices SET total_amount = (
        SELECT COALESCE(SUM(amount), 0) FROM invoice_details WHERE invoice_id = NEW.invoice_id
    ) WHERE id = NEW.invoice_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_seq INT;
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-[0-9]{6}-([0-9]+)') AS INT)), 0) + 1
        INTO next_seq
        FROM invoices
        WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-%';
        
        NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(next_seq::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set paid_at when status changes to 'paid'
CREATE OR REPLACE FUNCTION set_invoice_paid_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        NEW.paid_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set resolved_at when feedback status changes to 'resolved'
CREATE OR REPLACE FUNCTION set_feedback_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Triggers for updated_at
CREATE TRIGGER update_house_updated_at 
    BEFORE UPDATE ON house 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resident_updated_at 
    BEFORE UPDATE ON resident 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_types_updated_at 
    BEFORE UPDATE ON fee_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedbacks_updated_at 
    BEFORE UPDATE ON feedbacks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for house member count
CREATE TRIGGER update_member_count_on_insert
    AFTER INSERT ON resident
    FOR EACH ROW EXECUTE FUNCTION update_house_member_count();

CREATE TRIGGER update_member_count_on_update
    AFTER UPDATE OF house_id ON resident
    FOR EACH ROW EXECUTE FUNCTION update_house_member_count();

CREATE TRIGGER update_member_count_on_delete
    AFTER DELETE ON resident
    FOR EACH ROW EXECUTE FUNCTION update_house_member_count();

-- Triggers for invoice
CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER set_invoice_paid_at_trigger
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION set_invoice_paid_at();

-- Triggers for invoice_details
CREATE TRIGGER calculate_invoice_detail_amount
    BEFORE INSERT OR UPDATE ON invoice_details
    FOR EACH ROW EXECUTE FUNCTION update_invoice_total();

CREATE TRIGGER update_invoice_total_trigger
    AFTER INSERT OR UPDATE ON invoice_details
    FOR EACH ROW EXECUTE FUNCTION update_invoice_total_after();

CREATE TRIGGER update_invoice_total_on_delete
    AFTER DELETE ON invoice_details
    FOR EACH ROW EXECUTE FUNCTION update_invoice_total();

-- Triggers for feedback
CREATE TRIGGER set_feedback_resolved_at_trigger
    BEFORE UPDATE ON feedbacks
    FOR EACH ROW EXECUTE FUNCTION set_feedback_resolved_at();