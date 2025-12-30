import { Elysia} from "elysia";
import { pluginDB } from "./database";
import { authRoutes } from "./handlers/authHandlers";
import { HttpError} from "./constants/errorContant";
import openapi from "@elysiajs/openapi";
import { authorizationPlugins } from "./plugins/authorizationPlugins";
import { userRoutes } from "./handlers/userHandlers";
import { notificationRoutes } from "./handlers/notificationHandler";
import { residentRoutes } from "./handlers/residentHandlers";
import { feedbackRoutes } from "./handlers/feedbackHandlers";
import { invoiceRoutes } from "./handlers/invoiceHandlers";
import cors from "@elysiajs/cors";
import { householdRoutes } from "./handlers/householdHandlers";

const hostname: string = Bun.env.IP_ADDRESS || '127.0.0.1';
const port: number = Number(Bun.env.PORT || '3000');

new Elysia()
  .use(pluginDB)
  .use(cors({
    origin: "http://localhost:3001",
    credentials: true,
  }))
  .use(openapi())
  .onError(({ error, status, code }) => {
    if (error instanceof HttpError) {
      return status(error.status, { message: error.body });
    }

    if (code === 'VALIDATION') return status(400, { message: error.message });

    return status(500, { message: "Internal Server Error" });
  })
  .get("/", ({ redirect }) => redirect("/openapi"), { detail: { tags: ['Root'] } })
  .use(authRoutes)
  .use(authorizationPlugins("resident"))
  .use(userRoutes)
  .use(residentRoutes)
  .use(invoiceRoutes)
  .use(householdRoutes)
  .use(feedbackRoutes)
  .use(notificationRoutes)
  .listen({ hostname, port });

console.log(
  'Server run at: http://' + hostname + ":" + port
);