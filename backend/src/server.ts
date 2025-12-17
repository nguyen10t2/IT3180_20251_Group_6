import { Elysia, status, t } from "elysia";
import { pluginDB } from "./database";
import { authRoutes } from "./routes/authRoutes";
import { mapErrorStatus } from "./constants/errorContant";
import { createUser } from "./services/userServices";

const hostname: string = Bun.env.IP_ADDRESS || '127.0.0.1';
const port: number = Number(Bun.env.PORT || '3000');

new Elysia()
  .use(pluginDB)
  .get("/", () => "Hello Elysia")
  .post("/create", async ({ body, set }) => {
    const res = await createUser(body.email, body.password, body.name);
    if (res.error) {
      set.status = mapErrorStatus[res.error];
      return { message: res.error };
    }
    set.status = 200;
    return { message: res.data };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
      name: t.String(),
    }),
  })
  .use(authRoutes)
  .listen({ hostname, port });

console.log(
  'Server run at: http://' + hostname + ":" + port
);