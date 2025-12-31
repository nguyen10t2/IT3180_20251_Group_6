import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { PagingUserBody } from "../types/userTypes";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { approveUser, getPendingUsers, getUserById, getUsersByLastCreatedAndLimit, getUserWithResident, rejectUser } from "../services/userServices";
import { authorizationPlugins } from "../plugins/authorizationPlugins";
import { householdRoutes } from "./householdHandlers";
import { userRoutes } from "./userHandlers";
import { deleteResident, getAll as getAllResident, getResidentById, updateResident } from "../services/residentServices";
import { UpdateResidentBody } from "../types/residentTypes";
import { confirmInvoice, createInvoice, deleteInvoice, getAll as getAllInvoice, getInvoiceById, updateInvoice } from "../services/invoiceServices";
import { CreateInvoiceBody, UpdateInvoiceBody } from "../types/invoiceTypes";


export const managerRoutes = new Elysia({ prefix: '/manager', detail: { tags: ['Manager'] } })
  .use(authenticationPlugins)
  .use(userRoutes)
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
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
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
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      })
      .get('/:user_id', async ({ params, status }) => {
        try {
          const res = await getUserWithResident(params.user_id);

          if (!res.data)
            return status(404, { message: 'Không tìm thấy người dùng' })

          return status(200, { userDetails: res.data });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      })
      .post('/:user_id/approve', async ({ params, user, status }) => {
        try {
          const fetchUser = await getUserWithResident(params.user_id);
          if (!fetchUser.data)
            return status(404, { message: 'Không tìm thấy người dùng' });
          if (fetchUser.data.status !== 'pending')
            return status(400, { message: 'Người dùng không có nhu cầu phê duyệt' });

          const approverId = user.id!;
          const res = await approveUser(params.user_id, approverId);
          if (res.data)
            return status(200, { message: 'Phê duyệt người dùng thành công' });

        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      })
      .post('/:user_id/reject', async ({ params, body, status }) => {
        try {
          const fetchUser = await getUserById(params.user_id);
          if (!fetchUser.data)
            return status(404, { message: 'Không tìm thấy người dùng' });
          if (fetchUser.data.status !== 'pending')
            return status(400, { message: 'Người dùng không có nhu cầu phê duyệt' })

          const res = await rejectUser(params.user_id, body.reject_reason);
          if (res.data)
            return status(200, { message: 'Đã từ chối phê duyệt người dùng' });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      }, {
        body: t.Object({
          reject_reason: t.String({ error: 'Không được để trống lý do từ chối' })
        })
      })
  )
  .use(householdRoutes)
  .group('/resident', (app) =>
    app
      .get('/', async ({ status }) => {
        try {
          const res = await getAllResident();
          return status(200, { residents: res?.data ?? [] });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      })
      .get('/:resident_id', async ({ params, status }) => {
        try {
          const res = await getResidentById(params.resident_id);
          if (!res.data)
            return status(404, { message: 'Không tìm thấy cư dân' });
          return status(200, { resident: res.data });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      })
      .put('/:resident_id/update', async ({ body, params, status }) => {
        if (body == null || typeof body !== "object" || Object.keys(body).length === 0) {
          return status(400, { message: "Không có thông tin để cập nhật cư dân" });
        }
        try {
          const fetchResident = await getResidentById(params.resident_id);
          if (!fetchResident.data)
            return status(404, { message: 'Không tìm thấy cư dân' });

          const res = await updateResident(params.resident_id, body);
          if (res.data)
            return status(200, { message: 'Cập nhật thông tin cư dân thành công' });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      }, {
        body: UpdateResidentBody
      })
      .delete('/:resident_id/delete', async ({ params, status }) => {
        try {
          const fetchResident = await getResidentById(params.resident_id);
          if (!fetchResident.data)
            return status(404, { message: 'Không tìm thấy cư dân' });
          const res = deleteResident(params.resident_id);
          return status(200, { message: 'Xóa cư dân thành công' });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
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
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      })
      .get('/:invoice_id', async ({ params, status }) => {
        try {
          const res = await getInvoiceById(params.invoice_id);
          if (!res.data)
            return status(404, { message: 'Không tìm thấy hóa đơn' });
          return status(200, { invoice: res.data });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
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
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      }, {
        body: CreateInvoiceBody
      })
      .put('/:invoice_id/update', async ({ params, body, status }) => {
        try {
          const fetchInvoice = await getInvoiceById(params.invoice_id);
          if (!fetchInvoice.data)
            return status(404, { message: 'Không tìm thấy hóa đơn' });

          const res = await updateInvoice(params.invoice_id, body);
          if (res.data)
            return status(200, { message: 'Cập nhật hóa đơn thành công' });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      }, {
        body: UpdateInvoiceBody
      })
      .delete('/:invoice_id/delete', async ({ params, status }) => {
        try {
          const fetchInvoice = await getInvoiceById(params.invoice_id);
          if (!fetchInvoice.data)
            return status(404, { message: 'Không tìm thấy hóa đơn' });

          const res = await deleteInvoice(params.invoice_id);
          if (res.data)
            return status(200, { message: 'Xóa hóa đơn thành công' });
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      })
      .post('/:invoice_id/confirm', async ({ params, body, user, status }) => {
        try {
          const fetchInvoice = await getInvoiceById(params.invoice_id);
          if (!fetchInvoice.data)
            return status(404, { message: 'Không tìm thấy hóa đơn' });

          const confirmerId = user.id!;
          const paidAmount = body?.paidAmount ?? "";
          const paymentNote = body?.paymentNote ?? "";
          const res = await confirmInvoice(params.invoice_id, confirmerId, paidAmount, paymentNote);

          if(res.data)
            return status(200, {message: 'Xác nhận thanh toán hóa đơn thành công'});
        }
        catch (error) {
          console.error(error);
          throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
      },{
        body: t.Object({
           paidAmount: t.Optional(t.String()),
           paymentNote: t.Optional(t.String())
        })
      })
  )