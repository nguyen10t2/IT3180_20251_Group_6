import Elysia, { t } from "elysia";
import { PagingUserBody } from "../types/userTypes";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { approveUser, getPendingUsers, getUserById, getUsersByLastCreatedAndLimit, getUserWithResident, rejectUser } from "../services/userServices";
import { authorizationPlugins } from "../plugins/authorizationPlugins";
import { householdRoutes } from "./householdHandlers";
import { userRoutes } from "./userHandlers";
import { deleteResident, getAll as getAllResident, getResidentById, updateResident, createResident } from "../services/residentServices";
import { UpdateResidentBody, CreateResidentBody } from "../types/residentTypes";
import { createNotification, deleteNotification, getAll as getAllNotification, getNotificationById } from "../services/notificationServices";
import { CreateNotificationBody } from "../types/notificationTypes";
import { getAll as getAllFeedback, getFeedbackById, respondToFeedback, addComment as addFeedbackComment, updateFeedbackStatus } from "../services/feedbackServices";
import { FeedBackResponse } from "../types/feedbackTypes";
import { getDashboardStats } from "../services/dashboardServices";


export const managerRoutes = new Elysia({ prefix: '/managers', tags: ['Manager'] })
  .use(userRoutes)
  .use(authorizationPlugins('manager'))
  .use(householdRoutes)
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
  .group('/users', (app) =>
    app
      .post('/', async ({ body, status }) => {
        try {
          const res = await getUsersByLastCreatedAndLimit(body.lastCreatedAt, body.limit);
          if (res.data) { return status(200, { users: res.data }); }
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
          if (res.data) { return status(200, { pendingUsers: res.data }); }
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

          if (!res.data) { throw new HttpError(404, 'Không tìm thấy người dùng'); }

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
          if (!fetchUser.data) { throw new HttpError(404, 'Không tìm thấy người dùng'); }
          if (fetchUser.data.status !== 'pending') { throw new HttpError(400, 'Người dùng không có nhu cầu phê duyệt'); }

          const approverId = user.id!;
          const res = await approveUser(params.user_id, approverId);
          if (res.data) { return status(200, { message: 'Phê duyệt người dùng thành công' }); }

        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .patch('/:user_id/reject', async ({ params, body, status }) => {
        try {
          const fetchUser = await getUserById(params.user_id);
          if (!fetchUser.data) { throw new HttpError(404, 'Không tìm thấy người dùng'); }
          if (fetchUser.data.status !== 'pending') { throw new HttpError(400, 'Người dùng không có nhu cầu phê duyệt'); }

          const res = await rejectUser(params.user_id, body.reject_reason);
          if (res.data) { return status(200, { message: 'Đã từ chối phê duyệt người dùng' }); }
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
  .group('/residents', (app) =>
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
          if (!res.data) { throw new HttpError(404, 'Không tìm thấy cư dân'); }
          return status(200, { resident: res.data });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .patch('/:resident_id', async ({ body, params, status }) => {
        if (body === null || typeof body !== "object" || Object.keys(body).length === 0) {
          throw new HttpError(400, "Không có thông tin để cập nhật cư dân");
        }
        try {
          const fetchResident = await getResidentById(params.resident_id);
          if (!fetchResident.data) { throw new HttpError(404, 'Không tìm thấy cư dân'); }

          const res = await updateResident(params.resident_id, body);
          if (res.data) { return status(200, { message: 'Cập nhật thông tin cư dân thành công' }); }
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
          if (!fetchResident.data) { throw new HttpError(404, 'Không tìm thấy cư dân'); }
          
          // Kiểm tra nếu là chủ hộ thì không cho xóa
          if (fetchResident.data.house_role === 'owner') {
            throw new HttpError(400, 'Không thể xóa chủ hộ. Vui lòng đổi chủ hộ trước khi xóa.');
          }
          
          await deleteResident(params.resident_id);
          return status(200, { message: 'Xóa cư dân thành công' });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .post('/:house_id/members', async ({ params, body, status }) => {
        try {
          // Tạo cư dân mới và gán vào hộ
          const newResident = await createResident({
            ...body,
            house_id: params.house_id,
          });
          if (newResident.data) { return status(201, { message: 'Thêm cư dân vào hộ thành công', resident: newResident.data }); }
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: CreateResidentBody
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
  .group('/feedbacks', (app) =>
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
      .get('/:id', async ({ params, status }) => {
        try {
          const res = await getFeedbackById(params.id);
          if (!res.data) {
            throw new HttpError(404, 'Không tìm thấy phản hồi');
          }
          return status(200, { feedback: res.data });
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      })
      .post('/:id/comments', async ({ params, body, user, status }) => {
        try {
          const userId = user.id!;
          
          const feedback = await getFeedbackById(params.id);
          if (!feedback.data) {
            throw new HttpError(404, 'Không tìm thấy phản hồi');
          }

          const commentData = {
            feedback_id: params.id,
            user_id: userId,
            content: body.content,
            is_internal: false,
          };
          
          const res = await addFeedbackComment(commentData);
          if (res.data) {
            return status(201, { message: 'Thêm bình luận thành công', comment: res.data });
          }
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: t.Object({ content: t.String() })
      })
      .patch('/:id/status', async ({ params, body, user, status }) => {
        try {
          const feedback = await getFeedbackById(params.id);
          if (!feedback.data) {
            throw new HttpError(404, 'Không tìm thấy phản hồi');
          }

          const updaterId = user.id!;
          const res = await updateFeedbackStatus(params.id, body.status, updaterId);

          if (res.data) {
            return status(200, { message: 'Cập nhật trạng thái thành công', feedback: res.data });
          }
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: t.Object({ status: t.Union([t.Literal('pending'), t.Literal('in_progress'), t.Literal('resolved'), t.Literal('rejected')]) })
      })
      .post('/response', async ({ body, user, status }) => {
        try {
          const fetchFeedback = await getFeedbackById(body.id);
          if (!fetchFeedback.data) { throw new HttpError(404, 'Không tìm thấy phản hồi'); }

          const responserId = user.id!;
          const res = await respondToFeedback(body.id, body.response, responserId);

          if (res.data) { return status(200, { message: 'Trả lời phản hồi thành công' }); }
        }
        catch (error) {
          console.error(error);
          httpErrorStatus(error);
        }
      }, {
        body: FeedBackResponse
      })
  )