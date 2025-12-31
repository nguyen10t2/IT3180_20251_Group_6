import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { PagingUserBody } from "../types/userTypes";
import { HttpError, httpErrorStatus, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { approveUser, getPendingUsers, getUserById, getUsersByLastCreatedAndLimit, getUserWithResident, rejectUser } from "../services/userServices";
import { authorizationPlugins } from "../plugins/authorizationPlugins";
import { householdRoutes } from "./householdHandlers";
import { userRoutes } from "./userHandlers";
import { deleteResident, getAll as getAllResident, getResidentById, updateResident } from "../services/residentServices";
import { UpdateResidentBody } from "../types/residentTypes";
import { confirmInvoice, createInvoice, deleteInvoice, getAll as getAllInvoice, getInvoiceById, updateInvoice } from "../services/invoiceServices";
import { CreateInvoiceBody, UpdateInvoiceBody } from "../types/invoiceTypes";
import { createNotification, deleteNotification, getAll as getAllNotification, getNotificationById } from "../services/notificationServices";
import { CreateNotificationBody } from "../types/notificationTypes";
import { getAll as getAllFeedback, getFeedbackById, respondToFeedback } from "../services/feedbackServices";


export const managerRoutes = new Elysia({ prefix: '/manager', tags: ['Manager'] })
  .use(userRoutes)
  .use(authorizationPlugins('manager'))
  .use(householdRoutes)
  .group('/user', (app) =>
    app
      .post('/', async ({ body, status }) => {
        try {
          const res = await getUsersByLastCreatedAndLimit(body.lastCreatedAt, body.limit);
          if (res.data)
            return status(200, { users: res.data });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: PagingUserBody
      })
      .get('/pending', async ({ status }) => {
        try {
          const res = await getPendingUsers();
          if (res.data)
            return status(200, { pendingUsers: res.data });
          return status(200, { pendingUsers: [] });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .get('/:user_id', async ({ params, status }) => {
        try {
          const res = await getUserWithResident(params.user_id);

          if (!res.data)
            throw new HttpError(404, 'Không tìm thấy người dùng');

          return status(200, { userDetails: res.data });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .patch('/:user_id/approve', async ({ params, user, status }) => {
        try {
          const fetchUser = await getUserWithResident(params.user_id);
          if (!fetchUser.data)
            throw new HttpError(404, 'Không tìm thấy người dùng');
          if (fetchUser.data.status !== 'pending')
            throw new HttpError(400, 'Người dùng không có nhu cầu phê duyệt');

          const approverId = user.id!;
          const res = await approveUser(params.user_id, approverId);
          if (res.data)
            return status(200, { message: 'Phê duyệt người dùng thành công' });

        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .patch('/:user_id/reject', async ({ params, body, status }) => {
        try {
          const fetchUser = await getUserById(params.user_id);
          if (!fetchUser.data)
            throw new HttpError(404, 'Không tìm thấy người dùng');
          if (fetchUser.data.status !== 'pending')
            throw new HttpError(400, 'Người dùng không có nhu cầu phê duyệt');

          const res = await rejectUser(params.user_id, body.reject_reason);
          if (res.data)
            return status(200, { message: 'Đã từ chối phê duyệt người dùng' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: t.Object({
          reject_reason: t.String({ error: 'Không được để trống lý do từ chối' })
        })
      })
  )
  .group('/resident', (app) =>
    app
      .get('/', async ({ status }) => {
        try {
          const res = await getAllResident();
          return status(200, { residents: res?.data ?? [] });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .get('/:resident_id', async ({ params, status }) => {
        try {
          const res = await getResidentById(params.resident_id);
          if (!res.data)
            throw new HttpError(404, 'Không tìm thấy cư dân');
          return status(200, { resident: res.data });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .patch('/:resident_id', async ({ body, params, status }) => {
        if (body == null || typeof body !== "object" || Object.keys(body).length === 0) {
          throw new HttpError(400, "Không có thông tin để cập nhật cư dân");
        }
        try {
          const fetchResident = await getResidentById(params.resident_id);
          if (!fetchResident.data)
            throw new HttpError(404, 'Không tìm thấy cư dân');

          const res = await updateResident(params.resident_id, body);
          if (res.data)
            return status(200, { message: 'Cập nhật thông tin cư dân thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: UpdateResidentBody
      })
      .delete('/:resident_id', async ({ params, status }) => {
        try {
          const fetchResident = await getResidentById(params.resident_id);
          if (!fetchResident.data)
            throw new HttpError(404, 'Không tìm thấy cư dân');
          await deleteResident(params.resident_id);
          return status(200, { message: 'Xóa cư dân thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
  )
  .group('/invoice', (app) =>
    app
      .get('/', async ({ status }) => {
        try {
          const res = await getAllInvoice();
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
          if (!res.data)
            throw new HttpError(404, 'Không tìm thấy hóa đơn');
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
          const formattedBody = {
            ...body,
            created_by: userId
          }
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
          if (!fetchInvoice.data)
            throw new HttpError(404, 'Không tìm thấy hóa đơn');

          const res = await updateInvoice(params.invoice_id, body);
          if (res.data)
            return status(200, { message: 'Cập nhật hóa đơn thành công' });
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
          if (!fetchInvoice.data)
            throw new HttpError(404, 'Không tìm thấy hóa đơn');

          const res = await deleteInvoice(params.invoice_id);
          if (res.data)
            return status(200, { message: 'Xóa hóa đơn thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .patch('/:invoice_id/confirm', async ({ params, body, user, status }) => {
        try {
          const fetchInvoice = await getInvoiceById(params.invoice_id);
          if (!fetchInvoice.data)
            throw new HttpError(404, 'Không tìm thấy hóa đơn');

          const confirmerId = user.id!;
          const paidAmount = body?.paidAmount ?? "";
          const paymentNote = body?.paymentNote ?? "";
          const res = await confirmInvoice(params.invoice_id, confirmerId, paidAmount, paymentNote);

          if (res.data)
            return status(200, { message: 'Xác nhận thanh toán hóa đơn thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: t.Object({
          paidAmount: t.Optional(t.String()),
          paymentNote: t.Optional(t.String())
        })
      })
  )
  .group('/notification', (app) =>
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
          if (!fetchNotification.data)
            throw new HttpError(404, 'Không tìm thấy thông báo');

          const res = await deleteNotification(params.notification_id);
          if (res.data)
            return status(200, { message: 'Xóa thông báo thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
  )
  .group('/feedback', (app) =>
    app
      .get('/', async ({ status }) => {
        try {
          const res = await getAllFeedback();
          return status(200, { feedbacks: res?.data ?? [] });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .post('/:feedback_id/response', async ({ params, body, user, status }) => {
        try {
          const fetchFeedback = await getFeedbackById(params.feedback_id);
          if (!fetchFeedback.data)
            throw new HttpError(404, 'Không tìm thấy phản hồi');

          const responserId = user.id!;
          const res = await respondToFeedback(params.feedback_id, body.response, responserId);

          if(res.data)
            return status(200, {message: 'Trả lời phản hồi thành công'});
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: t.Object({
          response: t.String({ error: 'Vui lòng không để trống nội dung trả lời phản hồi' })
        })
      })
  )