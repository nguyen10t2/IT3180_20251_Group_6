import Elysia, { Context } from "elysia";
import { authenticationPlugins } from "./authenticationPlugins";
import { getRoleByName } from "../services/roleServices";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorConstant";

export const authorizationPlugins = (role: string) => (app: Elysia) => app
  .use(authenticationPlugins)
  .onBeforeHandle(async ({ user, status }) => {
    try {
      const [requiredRole, userRole] = await Promise.all([
        getRoleByName(role),
        getRoleByName(user?.role!)
      ]);

      const userPermissions = userRole.data?.permission!;
      const requiredPermissions = requiredRole.data?.permission!;

      if (userPermissions < requiredPermissions) {
        throw new HttpError(403, "You do not have permission to access this resource");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  });