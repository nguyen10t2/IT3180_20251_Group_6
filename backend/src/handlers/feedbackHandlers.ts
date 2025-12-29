import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { createFeedback, getFeedbacksByUserId, getFeedbackWithComments } from "../services/feetbackServices";
import { CreateFeedbackBody } from "../types/feedbackTypes";
import { getResidentByUserId } from "../services/residentServices";
import { getUserById } from "../services/userServices";


export const feedbackRoutes = new Elysia({ prefix: "/feedback", detail: { tags: ['Feedback'] } })
  .use(authenticationPlugins)
  .get("/", async ({ user, status }) => {
    try {
      const userID = user.id!;

      const res = await getFeedbacksByUserId(userID);

      if (!res.data)
        return status(200, { feedbacks: [] });

      return status(200, { feedbacks: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })
  .post("/", async ({ body, status, user }) => {
    try {
      const userId = user.id!;
      const fetchUser = await getUserById(userId);
      if (!fetchUser.data || fetchUser.data.status !== 'active') {
        return status(403, { message: 'Người dùng không hợp lệ hoặc chưa được kích hoạt' });
      }

      const residentRes = await getResidentByUserId(userId);
      if (!residentRes.data) {
        return status(400, { message: 'Người dùng không phải cư dân' });
      }
      const houseId = residentRes.data.house_id;

      const bodyWithUserAndHouse = {
        ...body,
        user_id: userId,
        house_id: houseId!,
      };
      const res = await createFeedback(bodyWithUserAndHouse);
      if (res.data)
        return status(200, { message: 'Gửi phản hồi thành công' })
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: CreateFeedbackBody
  })
  .get("/:feedback_id", async ({ params, status }) => {
    try {
      const res = await getFeedbackWithComments(params.feedback_id);

      if (!res.data)
        return status(404, { message: 'Không tìm thấy phản hồi' });

      return status(200, { feedback: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  });