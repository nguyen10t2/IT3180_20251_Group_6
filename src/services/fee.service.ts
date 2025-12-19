import { MOCK_RESIDENTS, MOCK_FEES } from "./mock-data";
import { TransactionFormValues } from "../schemas/transaction.schema";

export const feeService = {
  //Lấy danh sách cư dân
  getResidents: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Giả lập mạng chậm 0.5s
    return MOCK_RESIDENTS;
  },

  //danh sách phí
  getFees: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_FEES;
  },

  //gửi data lên server
  createTransaction: async (data: TransactionFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập đang xử lý 1s
    
    console.log("Dữ liệu Người A đã validate và gửi đi:", data);
    
    //giả lập phản hồi thành công
    return {
      success: true,
      message: "Ghi nhận đóng phí thành công!"
    };
  }
};