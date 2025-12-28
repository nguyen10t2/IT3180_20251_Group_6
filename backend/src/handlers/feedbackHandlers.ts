import Elysia, { t } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { createFeedback, getFeedbacksByUserId, getFeedbackWithComments } from "../services/feetbackServices";
import { CreateFeedbackBody } from "../types/feedbackTypes";
import { getResidentByUserId } from "../services/residentServices";


export const feedbackRoutes = new Elysia({ prefix: "/feedback", detail: { tags: ['Feedback'] } })
	.use(authenticationPlugins)
	.get("/getFeedbacks", async ({ user, status }) => {
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
	.post("/createFeedback", async ({ body, status }) => {
		try {
			const res = await createFeedback(body);
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
	.get("/getFeedbackDetails/:feedback_id", async ({ params, status }) => {
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
	})