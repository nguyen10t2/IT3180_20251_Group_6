// ==================== House Types ====================

export interface House {
  id: string;
  room_number: string;
  room_type: string;
  building: string | null;
  area: string;
  head_resident_id: string | null;
  has_vehicle: boolean;
  motorbike_count: number;
  car_count: number;
  notes: string | null;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseWithResident extends House {
  head_resident?: Resident | null;
  residents?: Resident[];
}

export interface CreateHouseRequest {
  room_number: string;
  room_type: string;
  building?: string;
  area: string;
  head_resident_id?: string;
  has_vehicle?: boolean;
  motorbike_count?: number;
  car_count?: number;
  notes?: string;
  status?: string;
}

export interface UpdateHouseRequest {
  room_number?: string;
  room_type?: string;
  building?: string;
  area?: string;
  head_resident_id?: string;
  has_vehicle?: boolean;
  motorbike_count?: number;
  car_count?: number;
  notes?: string;
  status?: string;
}

export interface HouseholdHeadHistory {
  id: string;
  house_id: string;
  resident_id: string;
  start_date: string;
  end_date: string | null;
  changed_by: string;
  reason: string | null;
  created_at: string;
}

// Import Resident type
import type { Resident } from './user';
