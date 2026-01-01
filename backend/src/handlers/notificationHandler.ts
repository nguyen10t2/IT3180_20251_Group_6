import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { getNotificationsForUser, markAllAsRead, markAsRead } from "../services/notificationServices";
import { getResidentByUserId } from "../services/residentServices";


export const notificationRoutes = new Elysia({ prefix: "/notifications", detail: { tags: ['Notification'] } })
  .use(authenticationPlugins)
  .get("/", async ({ user, status }) => {
    try {
      const userId = user.id!;
      const resident = await getResidentByUserId(userId);

      if (!resident.data)
        throw new HttpError(403, 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân');

      if (!resident.data.house_id)
        throw new HttpError(403, 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu');

      const householdId = resident.data.house_id!;
      const res = await getNotificationsForUser(userId, householdId);
      if (res.data == null) {
        return status(200, { notifications: [] });
      }

      return status(200, { notifications: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .put("/:notification_id/read", async ({ params, user, status }) => {
    try {
      const notifiId = params.notification_id;
      const userId = user.id!;

      const data = await markAsRead(notifiId, userId);
      if (data)
        return status(200, { message: "Đã đánh dấu đã đọc thông báo" })
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    params: t.Object({
      notification_id: t.String({ format: 'uuid' })
    })
  })
  .put("/read-all", async ({ user, status }) => {
    try {
      const userId = user.id!;
      const resident = await getResidentByUserId(userId);

      if (!resident.data)
        throw new HttpError(403, 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân');

      if (!resident.data.house_id)
        throw new HttpError(403, 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu');

      const householdId = resident.data.house_id!;

      await markAllAsRead(userId, householdId);
      return status(200, { message: 'Đã đánh dấu tất cả đã đọc' })
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })