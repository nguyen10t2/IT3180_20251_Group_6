import { Elysia} from "elysia";
import { pluginDB } from "./database";
import { authRoutes } from "./handlers/authHandlers";
import { HttpError} from "./constants/errorConstant";
import openapi from "@elysiajs/openapi";
import { authorizationPlugins } from "./plugins/authorizationPlugins";
import { userRoutes } from "./handlers/userHandlers";
import { notificationRoutes } from "./handlers/notificationHandler";
import { residentRoutes } from "./handlers/residentHandlers";
import { feedbackRoutes } from "./handlers/feedbackHandlers";
import { invoiceRoutes } from "./handlers/invoiceHandlers";
import { accountantHandlers } from "./handlers/accountantHandlers";
import cors from "@elysiajs/cors";
import { householdRoutes } from "./handlers/householdHandlers";
import { managerRoutes } from "./handlers/managerHandlers";

const hostname: string = Bun.env.IP_ADDRESS || '127.0.0.1';
const port: number = Number(Bun.env.PORT || '3000');

new Elysia({
  precompile: true,
  aot: true,
})
  .use(pluginDB)
  .use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }))
  .use(openapi())
  .onError(({ error, status, code }) => {
    console.error(code, error);
    
    if (error instanceof HttpError) {
      return status(error.status, { message: error.body });
    }

    if (code === 'VALIDATION') {return status(400, { message: error.message });}

    return status(500, { message: "Internal Server Error" });
  })
  .get("/", ({ redirect }) => redirect("/openapi"), { detail: { tags: ['Root'] } })
  .use(authRoutes)
  .use(managerRoutes)
  .use(accountantHandlers)
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