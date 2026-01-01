import Elysia from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { getResidentByUserId } from "../services/residentServices";
import { getInvoiceById, getInvoiceDetails, getInvoicesByHouseId } from "../services/invoiceServices";


export const invoiceRoutes = new Elysia({ prefix: "/invoice", detail: { tags: ['Invoice'] } })
  .use(authenticationPlugins)
  .get("/", async ({ user, status }) => {
    try {
      const userId = user.id!;
      const fetchResident = await getResidentByUserId(userId);

      if (!fetchResident.data)
        throw new HttpError(403, 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân để xem được hóa đơn');

      if (!fetchResident.data.house_id)
        throw new HttpError(403, 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu để xem được hóa đơn');

      const householdId = fetchResident.data.house_id!;
      const res = await getInvoicesByHouseId(householdId);
      if (res.data == null) {
        return status(200, { invoices: [] });
      }

      return status(200, { invoices: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .get("/:invoice_id", async ({ params, user, status }) => {
    try {
      const userId = user.id!;
      const fetchResident = await getResidentByUserId(userId);

      if (!fetchResident.data)
        throw new HttpError(403, 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân để xem được hóa đơn');

      if (!fetchResident.data.house_id)
        throw new HttpError(403, 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu để xem được hóa đơn');

      const invoiceWithHouseId = await getInvoiceById(params.invoice_id);

      if (invoiceWithHouseId.data.house_id != fetchResident.data.house_id)
        throw new HttpError(403, "Bạn không có quyền truy cập vào hóa đơn này");

      const res = await getInvoiceDetails(params.invoice_id);
      if (!res.data)
        throw new HttpError(404, 'Không tìm thấy hóa đơn');
      return status(200, { invoiceDetails: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })