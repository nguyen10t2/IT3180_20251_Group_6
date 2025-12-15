-- Active: 1762699987142@@127.0.0.1@5432@bluemoon@public
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) UNIQUE NOT NULL,
    permission INT NOT NULL
);

CREATE TABLE house_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) UNIQUE NOT NULL
);

CREATE TABLE invoice_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TYPE status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE resident_status AS ENUM ('tamtru', 'thuongtru', 'tamvang');
CREATE TYPE room_type AS ENUM ('penhouse', 'studio', 'normal');

CREATE TYPE fee_category AS ENUM ('fixed', 'variable');
CREATE TYPE fee_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

CREATE TYPE notification_type AS ENUM ('general', 'emergency', 'event', 'payment');
CREATE TYPE notification_target AS ENUM ('all', 'household', 'individual');

CREATE TYPE feedback_type AS ENUM ('complaint', 'suggestion', 'maintenance', 'other');
CREATE TYPE feedback_status AS ENUM ('pending', 'in_progress', 'resolved', 'rejected');
CREATE TYPE feedback_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE house (
    house_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type room_type NOT NULL,
    area DECIMAL(10, 2),
    member_count INT DEFAULT 0,
    house_resident_id UUID,
    has_vehicle BOOLEAN DEFAULT FALSE,
    vehicle_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resident (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID,
    fullname VARCHAR(255) NOT NULL,
    id_card VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    gender gender NOT NULL,
    role INT NOT NULL REFERENCES house_role(id) ON DELETE RESTRICT,
    status resident_status NOT NULL,
    occupation VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status status NOT NULL DEFAULT 'inactive',
    role INT NOT NULL REFERENCES user_role(id) ON DELETE RESTRICT DEFAULT 3,
    resident_id UUID REFERENCES resident(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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
    peroid_month INT NOT NULL,
    peroid_year INT NOT NULL,
    invoice_type INT REFERENCES invoice_type(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status fee_status NOT NULL DEFAULT 'pending',
    due_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    context TEXT NOT NULL,
    type notification_type NOT NULL,
    target notification_target NOT NULL,
    target_id UUID,
    is_pinned BOOLEAN DEFAULT FALSE,
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