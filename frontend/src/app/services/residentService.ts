import axiosInstance from "@/lib/axios";

export interface Resident {
  resident_id: string;
  house_id: string | null;
  fullname: string;
  id_card: string | null;
  date_of_birth: string;
  phone_number: string;
  gender: "male" | "female" | "other";
  role: "chuho" | "nguoidaidien" | "nguoithue" | "thanhvien";
  status: "tamtru" | "thuongtru" | "tamvang";
  occupation: string | null;
  registration_date: string | null;
  room_number?: string;
  floor?: number;
  created_at: string;
  updated_at: string;
}

export interface HouseHold {
  house_hold_id: string;
  room_number: string;
  room_type: string;
  floor: number;
  area: number;
  head_resident_id: string | null;
  head_fullname?: string;
}

export interface UpdateResidentData {
  phone_number?: string;
  occupation?: string;
}

export interface CreateResidentData {
  house_id?: string | null;
  fullname: string;
  id_card?: string;
  date_of_birth: string;
  phone_number: string;
  gender: "male" | "female" | "other";
  role: "chuho" | "nguoidaidien" | "nguoithue" | "thanhvien";
  status: "tamtru" | "thuongtru" | "tamvang";
  occupation?: string;
}

export interface GetMyResidentResponse {
  resident: Resident | null;
  isNewResident: boolean;
  userInfo?: {
    fullname: string;
    email: string;
  };
}

export const residentService = {
  // Lấy thông tin cư dân của user đang đăng nhập
  async getMyResident(): Promise<GetMyResidentResponse> {
    const response = await axiosInstance.get("/api/residents/me");
    return response.data;
  },

  // Tạo mới thông tin cư dân (dành cho user pending lần đầu)
  async createMyResident(data: CreateResidentData): Promise<{ message: string; resident: Resident }> {
    const response = await axiosInstance.post("/api/residents/me", data);
    return response.data;
  },

  // Cập nhật thông tin cư dân
  async updateMyResident(data: UpdateResidentData): Promise<{ message: string; resident: Resident }> {
    const response = await axiosInstance.put("/api/residents/me", data);
    return response.data;
  },

  // Lấy danh sách hộ gia đình
  async getHouseHolds(): Promise<{ houseHolds: HouseHold[] }> {
    const response = await axiosInstance.get("/api/residents/households");
    return response.data;
  },
};
