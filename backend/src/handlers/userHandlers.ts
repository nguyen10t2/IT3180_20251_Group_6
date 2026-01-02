import Elysia from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { getUserById, getUserWithPasswordByEmail, updateUserPassword } from "../services/userServices";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { ChangePasswordBody } from "../types/authTypes";
import { hashedPassword, verifyPassword } from "../helpers/password";


export const userRoutes = new Elysia({ prefix: "/users", detail: { tags: ['User'] } })
  .use(authenticationPlugins)
  .get("/me", async ({ user, status }) => {

    try {
      const userId = user.id!;
      const userInf = await getUserById(userId);

      return status(200, { user: userInf.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .post("/changePass", async ({ body, user, status }) => {
    try {
      const userEmail = user.email!;
      const userId = user.id!;
      
      const userInf = await getUserWithPasswordByEmail(userEmail);

      const oldHashedPass = userInf.data.hashed_password;
      const isOldPass = await verifyPassword(body.old_password, oldHashedPass);

      if (!isOldPass)
        {throw new HttpError(401, 'Mật khẩu cũ không đúng');}
      
      const newHashedPass = await hashedPassword(body.new_password);
      await updateUserPassword(userId, newHashedPass);
      return status(200, {message: "Đổi mật khẩu thành công"});

    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: ChangePasswordBody
  })