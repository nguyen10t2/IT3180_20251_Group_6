-- Indexes for performance

-- House indexes
CREATE INDEX idx_house_room_number ON house(room_number);
CREATE INDEX idx_house_room_type ON house(room_type);

-- Resident indexes
CREATE INDEX idx_resident_house_id ON resident(house_id);
CREATE INDEX idx_resident_id_card ON resident(id_card);
CREATE INDEX idx_resident_phone ON resident(phone);
CREATE INDEX idx_resident_status ON resident(status);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_resident_id ON users(resident_id);
CREATE INDEX idx_users_feed ON users(role, created_at, status) WHERE resident_id IS NOT NULL; 
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- Fee types indexes
CREATE INDEX idx_fee_types_category ON fee_types(category);
CREATE INDEX idx_fee_types_is_active ON fee_types(is_active);

-- Invoices indexes
CREATE INDEX idx_invoices_house_id ON invoices(house_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_period ON invoices(period_year, period_month);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);

-- Invoice details indexes
CREATE INDEX idx_invoice_details_invoice_id ON invoice_details(invoice_id);
CREATE INDEX idx_invoice_details_fee_type_id ON invoice_details(fee_type_id);

-- Notifications indexes
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_target ON notifications(target);
CREATE INDEX idx_notifications_published_at ON notifications(published_at);
CREATE INDEX idx_notifications_is_pinned ON notifications(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_notifications_created_by ON notifications(created_by);

-- Notification reads indexes
CREATE INDEX idx_notification_reads_notification_id ON notification_reads(notification_id);
CREATE INDEX idx_notification_reads_user_id ON notification_reads(user_id);

-- Feedbacks indexes
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_house_id ON feedbacks(house_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_priority ON feedbacks(priority);
CREATE INDEX idx_feedbacks_type ON feedbacks(type);
CREATE INDEX idx_feedbacks_assigned_to ON feedbacks(assigned_to);

-- Feedback comments indexes
CREATE INDEX idx_feedback_comments_feedback_id ON feedback_comments(feedback_id);
CREATE INDEX idx_feedback_comments_user_id ON feedback_comments(user_id);