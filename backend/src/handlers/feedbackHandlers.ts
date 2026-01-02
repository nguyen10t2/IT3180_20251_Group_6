import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { createFeedback, getFeedbacksByUserId, getFeedbackWithComments, addComment } from "../services/feedbackServices";
import { CreateFeedbackBody } from "../types/feedbackTypes";
import { getResidentByUserId } from "../services/residentServices";
import { getUserById } from "../services/userServices";


export const feedbackRoutes = new Elysia({ prefix: "/feedbacks", detail: { tags: ['Feedback'] } })
  .use(authenticationPlugins)
  .get("/", async ({ user, status }) => {
    try {
      const userID = user.id!;

      const res = await getFeedbacksByUserId(userID);

      if (!res.data)
        {return status(200, { feedbacks: [] });}

      return status(200, { feedbacks: res.data });
    }
    catch (error) {
      httpErrorStatus(error);
    }
  })
  .post("/", async ({ body, status, user }) => {
    try {
      const userId = user.id!;
      const fetchUser = await getUserById(userId);
      if (!fetchUser.data || fetchUser.data.status !== 'active') {
        throw new HttpError(403, 'Người dùng không hợp lệ hoặc chưa được kích hoạt');
      }

      const residentRes = await getResidentByUserId(userId);
      if (!residentRes.data) {
        throw new HttpError(403, 'Người dùng không phải cư dân');
      }
      const houseId = residentRes.data.house_id;

      const bodyWithUserAndHouse = {
        ...body,
        user_id: userId,
        house_id: houseId!,
      };
      const res = await createFeedback(bodyWithUserAndHouse);
      if (res.data)
        {return status(200, { message: 'Gửi phản hồi thành công' })}
    }
    catch (error) {
      httpErrorStatus(error);
    }
  }, {
    body: CreateFeedbackBody
  })
  .get("/:feedback_id", async ({ params, status }) => {
    try {
      const res = await getFeedbackWithComments(params.feedback_id);

      if (!res.data)
        {throw new HttpError(404, 'Không tìm thấy phản hồi');}

      return status(200, { feedback: res.data });
    }
    catch (error) {
      httpErrorStatus(error);
    }
  })
  .post("/:feedback_id/comments", async ({ params, body, user, status }) => {
    try {
      const userId = user.id!;
      
      // Verify feedback exists
      const feedback = await getFeedbackWithComments(params.feedback_id);
      if (!feedback.data) {
        throw new HttpError(404, 'Không tìm thấy phản hồi');
      }
      
      // Only feedback owner can comment
      if (feedback.data.feedback.user_id !== userId) {
        throw new HttpError(403, 'Bạn không có quyền bình luận vào phản hồi này');
      }

      const commentData = {
        feedback_id: params.feedback_id,
        user_id: userId,
        content: body.content,
        is_internal: false,
      };
      
      const res = await addComment(commentData);
      if (res.data) {
        return status(201, { message: 'Thêm bình luận thành công', comment: res.data });
      }
    }
    catch (error) {
      httpErrorStatus(error);
    }
  }, {
    body: t.Object({ content: t.String() })
  });