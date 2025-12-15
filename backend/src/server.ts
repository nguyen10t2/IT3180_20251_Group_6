import { Elysia } from "elysia";
import { pluginDB } from "./database";
import { authRoutes } from "./routes/authRoutes";

const hostname: string = Bun.env.IP_ADDRESS || '127.0.0.1';
const port: number = Number(Bun.env.PORT ||'3000');

new Elysia()
  .use(pluginDB)
  .get("/", () => "Hello Elysia")
  .use(authRoutes)
  .listen({hostname, port});

console.log(
  'Server run at: http://' + hostname + ":" + port
);