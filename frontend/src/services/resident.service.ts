import { apiClient } from '@/lib/api-client';
import type {
  Resident,
  CreateResidentRequest,
  UpdateResidentRequest,
  ApiResponse,
} from '@/types';

export const residentService = {
  // Get current resident info
  getCurrentResident: async (): Promise<{ resident: Resident | null; isNewResident: boolean; userInfo?: any }> => {
    const response = await apiClient.get<{ resident: Resident | null; isNewResident: boolean; userInfo?: any }>('/residents');
    return response.data;
  },

  // Create resident
  createResident: async (data: CreateResidentRequest): Promise<Resident> => {
    const response = await apiClient.post<{ resident: Resident; message: string }>('/residents', data);
    return response.data.resident;
  },

  // Update resident
  updateResident: async (data: UpdateResidentRequest): Promise<Resident> => {
    const response = await apiClient.put<{ resident: Resident; message: string }>('/residents', data);
    return response.data.resident;
  },

  // Get all residents (manager only)
  getAllResidents: async (): Promise<Resident[]> => {
    const response = await apiClient.get<{ residents: Resident[] }>('/managers/residents');
    return response.data.residents;
  },

  // Get resident by ID (manager only)
  getResidentById: async (id: string): Promise<Resident> => {
    const response = await apiClient.get<{ resident: Resident }>(`/managers/residents/${id}`);
    return response.data.resident;
  },

  // Get household info for current resident
  getHousehold: async (): Promise<{ household: { house_id: string; room_number: string; members: Resident[] } }> => {
    const response = await apiClient.get<{ household: { house_id: string; room_number: string; members: Resident[] } }>('/residents/household');
    return response.data;
  },

  // Delete resident (manager only)
  deleteResident: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/managers/residents/${id}`);
    return response.data;
  },
};
