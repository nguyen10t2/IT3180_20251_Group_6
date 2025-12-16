-- Active: 1762699987142@@127.0.0.1@5432@elysia
CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) UNIQUE NOT NULL,
    permission INT NOT NULL CHECK (permission >= 0)
);

CREATE TABLE house_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) UNIQUE NOT NULL
);

CREATE TABLE invoice_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE house (
    house_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type room_type NOT NULL,
    area DECIMAL(10, 2) CHECK (area > 0),
    member_count INT DEFAULT 0 CHECK (member_count >= 0),
    house_resident_id UUID,
    has_vehicle BOOLEAN DEFAULT FALSE,
    vehicle_count INT DEFAULT 0 CHECK (vehicle_count >= 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resident (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES house(house_id) ON DELETE SET NULL,
    fullname VARCHAR(255) NOT NULL,
    id_card VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE),
    phone VARCHAR(15) UNIQUE NOT NULL,
    gender gender NOT NULL,
    role INT NOT NULL REFERENCES house_role(id) ON DELETE RESTRICT,
    status resident_status NOT NULL,
    occupation VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add FK after resident table is created
ALTER TABLE house ADD CONSTRAINT fk_house_resident 
    FOREIGN KEY (house_resident_id) REFERENCES resident(id) ON DELETE SET NULL;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status status NOT NULL DEFAULT 'inactive',
    verify BOOLEAN NOT NULL DEFAULT FALSE,
    role INT NOT NULL REFERENCES user_role(id) ON DELETE RESTRICT DEFAULT 3,
    resident_id UUID REFERENCES resident(id) ON DELETE SET NULL,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE users ADD CONSTRAINT fk_users_approved_by 
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE fee_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category fee_category NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    house_id UUID REFERENCES house(house_id) ON DELETE CASCADE,
    period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL CHECK (period_year >= 2000),
    invoice_type INT REFERENCES invoice_type(id) ON DELETE SET NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status fee_status NOT NULL DEFAULT 'pending',
    due_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    fee_type_id INT NOT NULL REFERENCES fee_types(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    context TEXT NOT NULL,
    type notification_type NOT NULL,
    target notification_target NOT NULL,
    target_id UUID,
    is_pinned BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    expired_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    house_id UUID REFERENCES house(house_id) ON DELETE SET NULL,
    type feedback_type NOT NULL,
    priority feedback_priority NOT NULL DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    context TEXT NOT NULL,
    attachments TEXT[],
    status feedback_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE feedback_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID REFERENCES feedbacks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);