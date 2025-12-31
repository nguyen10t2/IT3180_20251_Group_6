// @ts-nocheck
import Elysia from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { createHouse, deleteHouse, getAll, getHouseById, getMemberCount, updateHouse } from "../services/houseServices";
import { CreateHouseBody, UpdateHouseBody } from "../types/houseTypes";

export const householdRoutes = new Elysia({ prefix: "/household" })
  .get("/", async ({ status }) => {
    try {
      const res = await getAll();
      return status(200, { households: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
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
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: CreateHouseBody
  })
  .get("/:household_id", async ({ params, status }) => {
    try {
      const res = await getHouseById(params.household_id);
      if (!res.data)
        return status(404, { message: 'Không tìm thấy hộ dân' })
      if (res.data)
        return status(200, { household: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })
  .patch("/:household_id", async ({ params, body, status }) => {
    try {
      const fetchHousehold = await getHouseById(params.household_id);
      if (!fetchHousehold.data)
        return status(404, { message: 'Không tìm thấy hộ dân' })

      if (body == null || typeof body !== "object" || Object.keys(body).length === 0) {
        return status(400, { message: "Không có thông tin để cập nhật hộ dân" });
      }

      const res = await updateHouse(params.household_id, body);
      if (res.data)
        return status(200, { message: 'Cập nhật hộ dân thành công' })
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: UpdateHouseBody
  })
  .delete('/:household_id', async ({ params, status }) => {
    try {
      const fetchHousehold = await getHouseById(params.household_id);
      if (!fetchHousehold.data)
        return status(404, { message: 'Không tìm thấy hộ dân' })

      const res = await deleteHouse(params.household_id);
  
      if(res)
        return status(200, {message: 'Xóa hộ dân thành công'});
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
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
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    } 
  });