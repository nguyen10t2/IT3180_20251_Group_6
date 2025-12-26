CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) UNIQUE NOT NULL,
    permission INT NOT NULL CHECK (permission >= 0),
    description VARCHAR(255)
);

CREATE TABLE house (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type room_type NOT NULL,
    building VARCHAR(10),
    area DECIMAL(10, 2) NOT NULL CHECK (area > 0),
    head_resident_id UUID,
    has_vehicle BOOLEAN DEFAULT FALSE,
    motorbike_count INT DEFAULT 0 CHECK (motorbike_count >= 0),
    car_count INT DEFAULT 0 CHECK (car_count >= 0),
    notes TEXT,
    status status NOT NULL DEFAULT 'active',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_house_head_resident ON house(head_resident_id);
CREATE INDEX idx_room_number ON house(room_number);
CREATE INDEX idx_status ON house(status);
ALTER TABLE house ADD CONSTRAINT unique_room_number_active UNIQUE (room_number, deleted_at);

CREATE TABLE resident (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES house(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    id_card VARCHAR(12) NOT NULL,
    date_of_birth DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE),
    phone VARCHAR(10) NOT NULL,
    email VARCHAR(100),
    gender gender NOT NULL,
    occupation VARCHAR(100),
    house_role house_role_type NOT NULL DEFAULT 'member',
    residence_status resident_status NOT NULL DEFAULT 'thuongtru',
    move_in_date DATE,
    move_out_date DATE,
    move_out_reason TEXT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_id_card_active UNIQUE (id_card, deleted_at),
    CONSTRAINT unique_phone_active UNIQUE (phone, deleted_at)
);
ALTER TABLE house ADD CONSTRAINT fk_house_head_resident 
    FOREIGN KEY (head_resident_id) REFERENCES resident(id) ON DELETE SET NULL;
CREATE INDEX idx_house_id ON resident(house_id);
CREATE INDEX idx_deleted_at ON resident(deleted_at);
CREATE INDEX idx_full_name ON resident(full_name);
CREATE INDEX idx_id_card ON resident(id_card);
CREATE INDEX idx_phone ON resident(phone);
CREATE INDEX idx_house_role ON resident(house_role);
CREATE INDEX idx_residence_status ON resident(residence_status);


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    resident_id UUID REFERENCES resident(id) ON DELETE SET NULL,
    role INT NOT NULL REFERENCES user_role(id) ON DELETE RESTRICT DEFAULT 3,
    status status NOT NULL DEFAULT 'inactive',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_email_active UNIQUE (email, deleted_at)
);
ALTER TABLE users ADD CONSTRAINT fk_users_approved_by 
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_user_resident_id ON users(resident_id);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_status ON users(status);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_deleted_at ON users(deleted_at);

CREATE TABLE fee_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    category fee_category NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_fee_name_active UNIQUE (name, deleted_at)
);
CREATE INDEX idx_fee_name ON fee_types(name);
CREATE INDEX idx_fee_category ON fee_types(category);
CREATE INDEX idx_fee_is_active ON fee_types(is_active);
CREATE INDEX idx_fee_effective ON fee_types(effective_from, effective_to);
CREATE INDEX idx_fee_deleted_at ON fee_types(deleted_at);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    house_id UUID NOT NULL REFERENCES house(id) ON DELETE RESTRICT,
    period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL CHECK (period_year >= 2000),
    invoice_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status fee_status NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    paid_amount DECIMAL(12, 2),
    payment_note VARCHAR(50),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_invoice_per_period UNIQUE (house_id, period_month, period_year, invoice_type, deleted_at)
);
CREATE INDEX idx_invoice_house_id ON invoices(house_id);
CREATE INDEX idx_invoice_period ON invoices(period_month, period_year);
CREATE INDEX idx_invoice_status ON invoices(status);
CREATE INDEX idx_invoice_due_date ON invoices(due_date);
CREATE INDEX idx_invoice_create_by ON invoices(created_by);

CREATE TABLE invoice_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    fee_type_id INT NOT NULL REFERENCES fee_types(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoice_detail_invoice_id ON invoice_details(invoice_id);
CREATE INDEX idx_invoice_detail_fee_id ON invoice_details(fee_type_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'general',
    target notification_target NOT NULL DEFAULT 'all',
    target_id UUID,
    is_pinned BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_target_id ON notifications(target_id);
CREATE INDEX idx_notification_created_by ON notifications(created_by);
CREATE INDEX idx_notification_deleted_at ON notifications(deleted_at);
CREATE INDEX idx_notification_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notification_published_at ON notifications(published_at);

CREATE TABLE notification_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_notification_read UNIQUE (notification_id, user_id)
);

CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    house_id UUID REFERENCES house(id) ON DELETE SET NULL,
    type feedback_type NOT NULL DEFAULT 'other',
    priority feedback_priority NOT NULL DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[],
    status feedback_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_feedback_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedback_house_id ON feedbacks(house_id);
CREATE INDEX idx_feedback_status ON feedbacks(status);
CREATE INDEX idx_feedback_created_at ON feedbacks(created_at);

CREATE TABLE feedback_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES feedbacks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_feedback_comment_feedback_id ON feedback_comments(feedback_id);
CREATE INDEX idx_feedback_comment_user_id ON feedback_comments(user_id);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT idx_refresh_token_expires CHECK (expires_at > created_at)
);
CREATE INDEX idx_refresh_token_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_token_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_token_token_hash ON refresh_tokens(token_hash);

CREATE TABLE household_head_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES house(id) ON DELETE CASCADE,
    previous_head_id UUID REFERENCES resident(id) ON DELETE SET NULL,
    new_head_id UUID NOT NULL REFERENCES resident(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_household_head_history_house ON household_head_history(house_id);
CREATE INDEX idx_household_head_history_date ON household_head_history(changed_at);