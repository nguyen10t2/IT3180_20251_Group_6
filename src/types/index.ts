//Kiểu dữ liệu cho dân cư
export interface Resident {
  id: string;
  fullName: string;
  roomNumber: string;
}

//Kiểu dữ liệu các khoản thu
export interface Fee {
  id: string;
  name: string;
  amount: number;
  type: 'Bắt buộc' | 'Tự nguyện';
}

//Kiểu dữ liệu lịch sử đóng tiền
export interface Transaction {
  id: string;
  residentId: string;
  feeId: string;
  amount: number;
  paymentDate: string;
  note?: string;
}