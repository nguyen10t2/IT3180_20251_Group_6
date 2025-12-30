import Elysia from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { getResidentByUserId } from "../services/residentServices";
import { getInvoiceById, getInvoiceDetails, getInvoicesByHouseId } from "../services/invoiceServices";


export const invoiceRoutes = new Elysia({ prefix: "/invoice", detail: { tags: ['Invoice'] } })
  .use(authenticationPlugins)
  .get("/", async ({ user, status }) => {
    try {
      const userId = user.id!;
      const fetchResident = await getResidentByUserId(userId);

      if (!fetchResident.data)
        return status(403, { message: 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân để xem được hóa đơn' });

      if (!fetchResident.data.house_id)
        return status(403, { message: 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu để xem được hóa đơn' });

      const householdId = fetchResident.data.house_id!;
      const res = await getInvoicesByHouseId(householdId);
      if (res.data == null) {
        return status(200, { invoices: [] });
      }

      return status(200, { invoices: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })
  .get("/:invoice_id", async ({ params, user, status }) => {
    try {
      const userId = user.id!;
      const fetchResident = await getResidentByUserId(userId);

      if (!fetchResident.data)
        return status(403, { message: 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân để xem được hóa đơn' });

      if (!fetchResident.data.house_id)
        return status(403, { message: 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu để xem được hóa đơn' });

      const invoiceWithHouseId = await getInvoiceById(params.invoice_id);

      if (invoiceWithHouseId.data.house_id != fetchResident.data.house_id)
        return status(403, { message: "Bạn không có quyền truy cập vào hóa đơn này" });

      const res = await getInvoiceDetails(params.invoice_id);
      if (!res.data)
        return status(404, { message: 'Không tìm thấy hóa đơn' });

      return status(200, { invoiceDetails: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })