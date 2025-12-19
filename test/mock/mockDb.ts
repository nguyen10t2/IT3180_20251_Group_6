import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../backend/src/models';

// Mock database connection sử dụng in-memory hoặc test database
const createMockDb = () => {
  // Sử dụng DATABASE_URL từ env hoặc fallback sang mock connection
  const connectionString = Bun.env.TEST_DATABASE_URL || Bun.env.DATABASE_URL || 'postgresql://localhost:5432/test_db';
  const sql = postgres(connectionString);
  return drizzle(sql, { schema });
};

export const mockDb = createMockDb();

// Mock data generators
export const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  password: await Bun.password.hash('password123'),
  name: 'Test User',
  verify: true,
  status: 'active' as const,
  role: 3,
  resident_id: null,
  approved_by: null,
  approved_at: null,
  rejected_reason: null,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockResident = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  full_name: 'Nguyễn Văn A',
  phone: '0123456789',
  id_card: '001234567890',
  date_of_birth: new Date('1990-01-01'),
  gender: 'male' as const,
  occupation: 'Engineer',
  status: 'active' as const,
  role: 'owner' as const,
  house_id: '770e8400-e29b-41d4-a716-446655440002',
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockHouse = {
  house_id: '770e8400-e29b-41d4-a716-446655440002',
  room_number: 'A101',
  room_type: 'apartment' as const,
  area: '100',
  house_resident_id: '660e8400-e29b-41d4-a716-446655440001',
  member_count: 3,
  has_vehicle: true,
  vehicle_count: 1,
  notes: 'Test house',
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockNotification = {
  id: '880e8400-e29b-41d4-a716-446655440003',
  title: 'Test Notification',
  context: 'This is a test notification',
  type: 'info' as const,
  target: 'all' as const,
  target_id: null,
  created_by: '550e8400-e29b-41d4-a716-446655440000',
  publish_at: new Date(),
  expires_at: null,
  is_pinned: false,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockRefreshToken = {
  id: '990e8400-e29b-41d4-a716-446655440004',
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  token: 'mock_refresh_token',
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  created_at: new Date(),
};
