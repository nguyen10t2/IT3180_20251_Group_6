import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { PagingUserBody } from "../types/userTypes";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { approveUser, getPendingUsers, getUserById, getUsersByLastCreatedAndLimit, getUserWithResident, rejectUser } from "../services/userServices";
import { authorizationPlugins } from "../plugins/authorizationPlugins";
import { householdRoutes } from "./householdHandlers";
import { userRoutes } from "./userHandlers";


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