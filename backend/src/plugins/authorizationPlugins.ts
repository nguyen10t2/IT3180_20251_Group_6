import Elysia, { Context } from "elysia";
import { authenticationPlugins } from "./authenticationPlugins";
import { getRoleByName } from "../services/roleServices";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";

export const authorizationPlugins = (role: string) => (app: Elysia) => app
    .use(authenticationPlugins)
    .onBeforeHandle(async ({ user, status }) => {
        const [ requiredRole, userRole ] = await Promise.all([
            getRoleByName(role),
            getRoleByName(user?.role!)
        ]);

        if (requiredRole.error || userRole.error) {
            throw new HttpError(500, INTERNAL_SERVER_ERROR);
        }

        const userPermissions = userRole.data?.permission!;
        const requiredPermissions = requiredRole.data?.permission!;

        if (userPermissions < requiredPermissions) {
            throw new HttpError(403, "You do not have permission to access this resource");
        }
    });