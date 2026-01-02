import { apiClient } from '@/lib/api-client';
import type {
  House,
  HouseWithResident,
  CreateHouseRequest,
  UpdateHouseRequest,
  ApiResponse,
} from '@/types';

export const houseService = {
  // Get all houses
  getAllHouses: async (): Promise<House[]> => {
    const response = await apiClient.get<{ houses: House[] }>('/residents/households');
    return response.data.houses;
  },

  // Get all houses (manager only)
  getAllHousesManager: async (): Promise<HouseWithResident[]> => {
    const response = await apiClient.get<{ households: HouseWithResident[] }>('/managers/households');
    return response.data.households;
  },

  // Get house by ID (manager only)
  getHouseById: async (id: string): Promise<HouseWithResident> => {
    const response = await apiClient.get<{ household: HouseWithResident }>(`/managers/households/${id}`);
    return response.data.household;
  },

  // Create house (manager only)
  createHouse: async (data: CreateHouseRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/managers/households', data);
    return response.data;
  },

  // Update house (manager only)
  updateHouse: async (id: string, data: UpdateHouseRequest): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/managers/households/${id}`, data);
    return response.data;
  },

  // Delete house (manager only)
  deleteHouse: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/managers/households/${id}`);
    return response.data;
  },

  // Update head resident (manager only)
  updateHeadResident: async (houseId: string, residentId: string): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/managers/households/${houseId}/head-resident`, {
      head_resident_id: residentId,
    });
    return response.data;
  },
};
