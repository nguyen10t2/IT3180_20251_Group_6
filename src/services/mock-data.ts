//Làm dữ liệu mẫu
import { Resident, Fee } from "../types";

export const MOCK_RESIDENTS: Resident[] = [
  { id: "RES001", fullName: "Nguyễn Đạo Nam Hải", roomNumber: "A-1201" },
  { id: "RES002", fullName: "Trần Văn B", roomNumber: "B-0504" },
];

export const MOCK_FEES: Fee[] = [
  { id: "FEE01", name: "Phí vệ sinh", amount: 50000, type: "Bắt buộc" },
  { id: "FEE02", name: "Quỹ từ thiện", amount: 0, type: "Tự nguyện" },
];