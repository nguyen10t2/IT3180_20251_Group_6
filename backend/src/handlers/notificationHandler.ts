import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { getNotificationsForUser, markAllAsRead, markAsRead } from "../services/notificationServices";
import { getResidentByUserId } from "../services/residentServices";


export const notificationRoutes = new Elysia({ prefix: "/notification" })
    .use(authenticationPlugins)
    .get("/getNotifications", async ({ user, status }) => {
        try {
            const userId = user.id!;
            const resident = await getResidentByUserId(userId);

            if(!resident.data)
                return status(200, {message: 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân'});

            if(!resident.data.house_id)
                return status(200, {message: 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu'});

            const householdId = resident.data.house_id!;

            const res = await getNotificationsForUser(userId, householdId);

            if (res.data == null) {
                return status(200, { notifications: [] });
            }

            return status(200, { notifications: res.data });
        }
        catch (error) {
            console.error(error);
            throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
    })
    .post("/markAsRead", async ({ params, user, status }) => {
        try {
            const notifiId = params.notification_id;
            const userId = user.id!;

            const data = await markAsRead(notifiId, userId);
            if (data)
                return status(200, { message: "Đã đánh dấu đã đọc thông báo" })
        }
        catch (error) {
            console.error(error);
            throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
    }, {
        params: t.Object({
            notification_id: t.String({ format: 'uuid' })
        })
    })
    .post("/markAllAsRead", async ({user, status}) => {
        try {
            const userId = user.id!;
            const resident = await getResidentByUserId(userId);

            if(!resident.data)
                return status(200, {message: 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân'})

            if(!resident.data.house_id)
                return status(200, {message: 'Bạn chưa có hộ khẩu, vui lòng cập nhật hộ khẩu'})

            const householdId = resident.data.house_id!;

            await markAllAsRead(userId, householdId);
            return status(200, { message: 'Đã đánh dấu tất cả đã đọc'})
        }
        catch (error) {
            console.error(error);
            throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }
    })