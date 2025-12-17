import { Elysia } from "elysia";
import { pluginDB } from "./database";
import { authRoutes } from "./routes/authRoutes";
import { HouseType, UpdateHouseBody } from "./types/houseTypes";
import { updateHouse } from "./services/houseServices";

const hostname: string = Bun.env.IP_ADDRESS || '127.0.0.1';
const port: number = Number(Bun.env.PORT || '3000');

new Elysia()
  .use(pluginDB)
  .get("/", () => "Hello Elysia")
  .post("/house/:id", async ({ params, body, status }) => {
    const houseId = params.id;
    const houseData = body as HouseType;
    
    const res = await updateHouse(houseId, houseData);
    if (res.error) {
      status(500);
      return { message: res.error };
    }

    return { message: res.data }
  }, {
    body: UpdateHouseBody
  })
  .use(authRoutes)
  .listen({ hostname, port });

console.log(
  'Server run at: http://' + hostname + ":" + port
);