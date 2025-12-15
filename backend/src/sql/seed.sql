-- =============================================
-- SEED DATA
-- =============================================

-- User roles
INSERT INTO user_role (name, permission) VALUES
    ('admin', 100),
    ('manager', 50),
    ('accountant', 20),
    ('resident', 1);

-- House roles
INSERT INTO house_role (name) VALUES
    ('owner'),
    ('member'),
    ('tenant');

-- Invoice types
INSERT INTO invoice_type (name) VALUES
    ('monthly'),
    ('quarterly'),
    ('yearly'),
    ('one-time');

-- Fee types
INSERT INTO fee_types (name, description, category, unit_price, unit, is_active) VALUES
    ('Phí quản lý', 'Phí quản lý chung cư hàng tháng', 'fixed', 7000, 'm2', TRUE),
    ('Phí dịch vụ', 'Phí dịch vụ tiện ích', 'fixed', 5000, 'm2', TRUE),
    ('Phí gửi xe máy', 'Phí gửi xe máy hàng tháng', 'fixed', 100000, 'xe', TRUE),
    ('Phí gửi ô tô', 'Phí gửi ô tô hàng tháng', 'fixed', 1500000, 'xe', TRUE),
    ('Tiền điện', 'Tiền điện tiêu thụ', 'variable', 3500, 'kWh', TRUE),
    ('Tiền nước', 'Tiền nước tiêu thụ', 'variable', 15000, 'm3', TRUE),
    ('Phí internet', 'Phí internet hàng tháng', 'fixed', 200000, 'tháng', TRUE),
    ('Phí đóng góp', 'Phí đóng góp tự nguyện', 'variable', 0, 'lần', TRUE);

-- Sample houses
INSERT INTO house (room_number, room_type, area, notes) VALUES
    ('101', 'normal', 65.5, 'Căn hộ tầng 1'),
    ('102', 'normal', 70.0, 'Căn hộ tầng 1'),
    ('201', 'studio', 45.0, 'Căn studio tầng 2'),
    ('202', 'normal', 80.0, 'Căn hộ tầng 2'),
    ('301', 'penhouse', 150.0, 'Penhouse tầng 3'),
    ('302', 'normal', 75.0, 'Căn hộ tầng 3');

-- Sample residents (without house_id first, will update later)
INSERT INTO resident (fullname, id_card, date_of_birth, phone, gender, role, status, occupation) VALUES
    ('Nguyễn Văn An', '001234567890', '1985-05-15', '0901234567', 'male', 1, 'thuongtru', 'Kỹ sư'),
    ('Trần Thị Bình', '001234567891', '1990-08-20', '0901234568', 'female', 2, 'thuongtru', 'Giáo viên'),
    ('Lê Hoàng Cường', '001234567892', '1988-12-10', '0901234569', 'male', 1, 'thuongtru', 'Bác sĩ'),
    ('Phạm Thị Dung', '001234567893', '1992-03-25', '0901234570', 'female', 2, 'thuongtru', 'Nhân viên văn phòng'),
    ('Hoàng Văn Em', '001234567894', '1995-07-30', '0901234571', 'male', 3, 'tamtru', 'Sinh viên'),
    ('Vũ Thị Phương', '001234567895', '1987-11-05', '0901234572', 'female', 1, 'thuongtru', 'Doanh nhân');

-- Update residents with house_id
UPDATE resident SET house_id = (SELECT house_id FROM house WHERE room_number = '101') WHERE id_card = '001234567890';
UPDATE resident SET house_id = (SELECT house_id FROM house WHERE room_number = '101') WHERE id_card = '001234567891';
UPDATE resident SET house_id = (SELECT house_id FROM house WHERE room_number = '102') WHERE id_card = '001234567892';
UPDATE resident SET house_id = (SELECT house_id FROM house WHERE room_number = '102') WHERE id_card = '001234567893';
UPDATE resident SET house_id = (SELECT house_id FROM house WHERE room_number = '201') WHERE id_card = '001234567894';
UPDATE resident SET house_id = (SELECT house_id FROM house WHERE room_number = '301') WHERE id_card = '001234567895';

-- Update house_resident_id (owner of house)
UPDATE house SET house_resident_id = (SELECT id FROM resident WHERE id_card = '001234567890') WHERE room_number = '101';
UPDATE house SET house_resident_id = (SELECT id FROM resident WHERE id_card = '001234567892') WHERE room_number = '102';
UPDATE house SET house_resident_id = (SELECT id FROM resident WHERE id_card = '001234567894') WHERE room_number = '201';
UPDATE house SET house_resident_id = (SELECT id FROM resident WHERE id_card = '001234567895') WHERE room_number = '301';

-- Sample admin user (password: Admin@123 - hashed with bcrypt)
INSERT INTO users (email, password, status, role) VALUES
    ('admin@bluemoon.com', '$2b$10$rQZ8K.5L5hJ5k5k5k5k5k.5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k', 'active', 1);

-- Sample notifications
INSERT INTO notifications (title, context, type, target, is_pinned, published_at, created_by) VALUES
    ('Thông báo bảo trì thang máy', 'Thang máy sẽ được bảo trì vào ngày 20/12/2025 từ 8h-12h. Mong cư dân thông cảm.', 'general', 'all', TRUE, NOW(), (SELECT id FROM users WHERE email = 'admin@bluemoon.com')),
    ('Nhắc nhở đóng phí tháng 12', 'Kính mời quý cư dân đóng phí quản lý tháng 12/2025 trước ngày 25/12/2025.', 'payment', 'all', FALSE, NOW(), (SELECT id FROM users WHERE email = 'admin@bluemoon.com')),
    ('Sự kiện Giáng sinh 2025', 'Chung cư BlueMoon tổ chức sự kiện Giáng sinh vào tối 24/12/2025 tại sảnh tầng 1.', 'event', 'all', TRUE, NOW(), (SELECT id FROM users WHERE email = 'admin@bluemoon.com'));