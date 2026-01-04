import Elysia from "elysia";
import { userRoutes } from "./userHandlers";
import { authorizationPlugins } from "../plugins/authorizationPlugins";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { ConfirmInvoiceBody, CreateInvoiceBody, UpdateInvoiceBody } from "../types/invoiceTypes";
import { confirmInvoice, createInvoice, deleteInvoice, getAll, getInvoiceById, updateInvoice, getInvoiceTypes } from "../services/invoiceServices";
import { getAll as getAllHouses } from "../services/houseServices";
import { createNotification, deleteNotification, getAll as getAllNotification, getNotificationById } from "../services/notificationServices";
import { CreateNotificationBody } from "../types/notificationTypes";
import { getDashboardStats } from "../services/dashboardServices";

export const accountantHandlers = new Elysia({
    prefix: "/accountants",
    tags: ["Accountant"],
})
  .use(userRoutes)
  .use(authorizationPlugins('accountant'))
  .get("/households", async ({ status }) => {
    try {
      const res = await getAllHouses();
      return status(200, { households: res?.data ?? [] });
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .get('/stats', async ({ status }) => {
    try {
      const res = await getDashboardStats();
      return status(200, { stats: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .group('/invoices', (app) =>
    app
      .get('/types', async ({ status }) => {
        try {
          const res = await getInvoiceTypes();
          return status(200, { invoiceTypes: res?.data ?? [] });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .get('/', async ({ status }) => {
        try {
          const res = await getAll();
          return status(200, { invoices: res?.data ?? [] });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .get('/:invoice_id', async ({ params, status }) => {
        try {
          const res = await getInvoiceById(params.invoice_id);
          if (!res.data) { throw new HttpError(404, 'Không tìm thấy hóa đơn'); }
          return status(200, { invoice: res.data });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .post('/', async ({ body, user, status }) => {
        try {
          const userId = user.id!;
          const dueDate = new Date(body.due_date as unknown as string);

          if (Number.isNaN(dueDate.getTime())) {
            throw new HttpError(400, 'Hạn thanh toán không hợp lệ');
          }

          const formattedBody = {
            ...body,
            invoice_types: body.invoice_types,
            due_date: dueDate,
            created_by: userId
          };

          await createInvoice(formattedBody);
          return status(200, { message: 'Tạo hóa đơn thành công' });

        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: CreateInvoiceBody
      })
      .patch('/:invoice_id', async ({ params, body, status }) => {
        try {
          const fetchInvoice = await getInvoiceById(params.invoice_id);
          if (!fetchInvoice.data) { throw new HttpError(404, 'Không tìm thấy hóa đơn'); }

          const payload = {
            ...body,
            due_date: body?.due_date ? new Date(body.due_date as unknown as string) : undefined,
            invoice_types: body?.invoice_types,
          };

          const res = await updateInvoice(params.invoice_id, payload);
          if (res.data) { return status(200, { message: 'Cập nhật hóa đơn thành công' }); }
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: UpdateInvoiceBody
      })
      .delete('/:invoice_id', async ({ params, status }) => {
        try {
          const fetchInvoice = await getInvoiceById(params.invoice_id);
          if (!fetchInvoice.data) { throw new HttpError(404, 'Không tìm thấy hóa đơn'); }

          const res = await deleteInvoice(params.invoice_id);
          if (res.data) { return status(200, { message: 'Xóa hóa đơn thành công' }); }
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .patch('/:invoice_id/confirm', async ({ params, body, user, status }) => {
        try {
          const fetchInvoice = await getInvoiceById(params.invoice_id);
          if (!fetchInvoice.data) { throw new HttpError(404, 'Không tìm thấy hóa đơn'); }

          const confirmerId = user.id!;
          const res = await confirmInvoice(params.invoice_id, confirmerId, body?.paidAmount, body?.paymentNote);

          if (!res.data) {
            throw new HttpError(400, 'Hóa đơn không ở trạng thái chờ hoặc đã được xử lý');
          }

          return status(200, { message: 'Xác nhận thanh toán hóa đơn thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: ConfirmInvoiceBody
      })
  )
  .group('/notifications', (app) =>
    app
      .get('/', async ({ status }) => {
        try {
          const res = await getAllNotification();
          return status(200, { notifications: res?.data ?? [] });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .post('/', async ({ body, user, status }) => {
        try {
          const userId = user.id!;
          const formattedBody = {
            ...body,
            created_by: userId
          }
          await createNotification(formattedBody);
          return status(200, { message: 'Tạo thông báo thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: CreateNotificationBody
      })
      .delete('/:notification_id', async ({ params, status }) => {
        try {
          const fetchNotification = await getNotificationById(params.notification_id);
          if (!fetchNotification.data) { throw new HttpError(404, 'Không tìm thấy thông báo'); }

          const res = await deleteNotification(params.notification_id);
          if (res.data) { return status(200, { message: 'Xóa thông báo thành công' }); }
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
  )
