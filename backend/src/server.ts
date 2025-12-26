import { Elysia, status, t } from "elysia";
import { pluginDB } from "./database";
import { authRoutes } from "./handlers/authHandlers";
import { ErrorStatus, HttpError, INTERNAL_SERVER_ERROR } from "./constants/errorContant";
import { createUser, getUserById } from "./services/userServices";
import { authenticationPlugins } from "./plugins/authenticationPlugins";
import openapi from "@elysiajs/openapi";
import { authorizationPlugins } from "./plugins/authorizationPlugins";
import { RegisterBody } from "./types/authTypes";
import { userRoutes } from "./handlers/userHandlers";

const hostname: string = Bun.env.IP_ADDRESS || '127.0.0.1';
const port: number = Number(Bun.env.PORT || '3000');

new Elysia()
  .use(pluginDB)
  .use(openapi())
  .onError(({ error, status, code }) => {
    if (error instanceof HttpError) {
      return status(error.status, { message: error.body });
    }

    if (code === 'VALIDATION') return status(400, { message: "Thông tin không hợp lệ !" });

    return status(500, { message: "Internal Server Error" });
  })
  .get("/", () => "Hello Elysia")
  .use(authRoutes)
  .use(userRoutes)
  .post("/register", async ({ body }) => {
    try {
      const { email, password, name } = body;
      const hashed = await Bun.password.hash(password);
      const res = await createUser(email, hashed, name);
      return res.data;
    } catch (error) {
      console.error(error);
      throw new HttpError(ErrorStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: RegisterBody,
  })
  .use(authorizationPlugins("resident"))
  .get("/profile", async ({ user }) => {
    return await getUserById(user.id!);
  })
  .listen({ hostname, port });

console.log(
  'Server run at: http://' + hostname + ":" + port
);