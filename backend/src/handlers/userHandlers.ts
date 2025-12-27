import Elysia from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { getUserById, getUserWithPasswordByEmail, updateUserPassword } from "../services/userServices";
import { error } from "node:console";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { ChangePasswordBody } from "../types/authTypes";
import { hashedPassword, verifyPassword } from "../helpers/password";


export const userRoutes = new Elysia({ prefix: "/user", detail: { tags: ['User'] } })
  .use(authenticationPlugins)
  .get("/authMe", async ({ user, status }) => {

    try {
      const userId = user.id!;
      const userInf = await getUserById(userId);

      return status(200, { data: userInf.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })
  .post("/changePass", async ({ body, user, status }) => {

    try {
      const userEmail = user.email!;
      const userId = user.id!;

      const userInf = await getUserWithPasswordByEmail(userEmail);

      const oldHashedPass = userInf.data.hashed_password;

      const isOldPass = await verifyPassword(oldHashedPass, body.old_password);

      if (!isOldPass)
        return status(401, { message: 'Mật khẩu cũ không đúng' });

      const newHashedPass = await hashedPassword(body.new_password);
      return await updateUserPassword(userId, newHashedPass);

    } catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: ChangePasswordBody
  })