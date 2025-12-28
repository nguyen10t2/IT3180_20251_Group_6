import { Elysia } from "elysia";
import { authenticationPlugins } from "../plugins/authenticationPlugins";
import { HttpError, INTERNAL_SERVER_ERROR } from "../constants/errorContant";
import { createResident, getResidentByIdCard, getResidentByPhone, getResidentByUserId, updateResident } from "../services/residentServices";
import { CreateResidentBody, UpdateResidentBody } from "../types/residentTypes";
import { updateResidentId } from "../services/userServices";
import { getAll } from "../services/houseServices";


export const residentRoutes = new Elysia({ prefix: "/resident", tags: ['Resident'] })
  .use(authenticationPlugins)
  .get("/getResident", async ({ user, status }) => {
    try {
      const userId = user.id!;

      const res = await getResidentByUserId(userId);
      if (!res.data)
        return status(200, { message: 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân' });

      return status(200, { resident: res.data });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })
  .post("/createResident", async ({ body, status, user }) => {

    try {
      const userId = user.id!;

      const isResident = await getResidentByUserId(userId);
      if (isResident.data)
        return status(400, { message: "Bạn đã là cư dân, không cần tạo mới" });

      const isIdCardExist = await getResidentByIdCard(body.id_card);
      if (isIdCardExist.data)
        return status(400, { message: "CCCD đã được sử dụng, vui lòng nhập lại CCCD" });

      const isPhoneExist = await getResidentByPhone(body.phone);
      if (isPhoneExist.data)
        return status(400, { message: "SĐT đã được sử dụng, vui lòng thay đổi SĐT khác" });

      const newResident = await createResident(body);

      const residentId = newResident.data.id;

      await updateResidentId(userId, residentId);

      return status(201, { message: 'Đã tạo cư dân thành công', resident: newResident.data });
    } catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  }, {
    body: CreateResidentBody
  })
  .get("/getHouseHolds", async ({ status }) => {
    try {
      const res = await getAll();

      return status(200, res);
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }
  })
  .post("/updateResident", async ({ body, user, status }) => {
    try {
      if (Object.keys(body).length === 0) 
        return status(400, { message: "Không được để trống "});
      const userId = user.id!;
      const isResident = await getResidentByUserId(userId);
      if (!isResident.data)
        return status(200, { message: 'Bạn chưa phải là cư dân, vui lòng gửi đăng ký cư dân' });
      const residentId = isResident.data.id;
      const res = await updateResident(residentId, body);
      if (res.data)
        return status(200, { message: "Cập nhật cư dân thành công" });
    }
    catch (error) {
      console.error(error);
      throw new HttpError(500, INTERNAL_SERVER_ERROR);
    }

  }, {
    body: UpdateResidentBody
  })
