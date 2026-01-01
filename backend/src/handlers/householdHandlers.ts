// @ts-nocheck
import Elysia from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { createHouse, deleteHouse, getAll, getHouseById, getMemberCount, updateHouse } from "../services/houseServices";
import { CreateHouseBody, UpdateHouseBody } from "../types/houseTypes";
import openapi from "@elysiajs/openapi";

export const householdRoutes = new Elysia({ prefix: "/households" })
  .get("/", async ({ status }) => {
    try {
      const res = await getAll();
      return status(200, { households: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .post("/", async ({ body, user, status }) => {
    try {
      console.log(body);
      
      const res = await createHouse(body);
      if (res.data)
        return status(200, { message: 'Tạo hộ dân thành công' })
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: CreateHouseBody
  })
  .get("/:household_id", async ({ params, status }) => {
    try {
      const res = await getHouseById(params.household_id);
      if (!res.data)
        throw new HttpError(404, 'Không tìm thấy hộ dân');
      if (res.data)
        return status(200, { household: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .patch("/:household_id", async ({ params, body, status }) => {
    try {
      const fetchHousehold = await getHouseById(params.household_id);
      if (!fetchHousehold.data)
        throw new HttpError(404, 'Không tìm thấy hộ dân');

      if (body == null || typeof body !== "object" || Object.keys(body).length === 0) {
        throw new HttpError(400, "Không có thông tin để cập nhật hộ dân");
      }

      const res = await updateHouse(params.household_id, body);
      if (res.data)
        return status(200, { message: 'Cập nhật hộ dân thành công' })
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: UpdateHouseBody
  })
  .delete('/:household_id', async ({ params, status }) => {
    try {
      const fetchHousehold = await getHouseById(params.household_id);
      if (!fetchHousehold.data)
        throw new HttpError(404, 'Không tìm thấy hộ dân');

      const res = await deleteHouse(params.household_id);
  
      if(res)
        return status(200, {message: 'Xóa hộ dân thành công'});
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .get("/:household_id/members", async ({ params, status }) => {
    try {
      const res = await getMemberCount(params.household_id);
      if (res.data)
        return status(200, { memberCount: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    } 
  });