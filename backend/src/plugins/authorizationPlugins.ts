import Elysia from "elysia";
import { authenticationPlugins } from "./authenticationPlugins";
import { getRoleByName } from "../services/roleServices";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";

export const authorizationPlugins = (role: string) => (app: Elysia) => app
  .use(authenticationPlugins)
  .onBeforeHandle(async ({ user }) => {
    try {
      const [requiredRole, userRole] = await Promise.all([
        getRoleByName(role),
        getRoleByName(user?.role!)
      ]);

      const userPermissions = userRole.data?.permission!;
      const requiredPermissions = requiredRole.data?.permission!;

      if (userPermissions < requiredPermissions) {
        throw new HttpError(403, `Bạn không có quyền truy cập tài nguyên này. Yêu cầu vai trò: ${role}`);
      }
    } catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  });