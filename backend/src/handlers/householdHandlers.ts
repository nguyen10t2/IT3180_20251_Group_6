import Elysia, { t } from "elysia";
import { HttpError, httpErrorStatus } from "../constants/errorConstant";
import { createHouse, deleteHouse, getAll, getHouseById, updateHouse, updateHeadResident } from "../services/houseServices";
import { CreateHouseBody, UpdateHouseBody } from "../types/houseTypes";
import { getResidentsByHouseId } from "../services/residentServices";

export const householdRoutes = new Elysia({ prefix: "/households" })
  .get("/", async ({ status }) => {
    try {
      const res = await getAll();
      const households = (res.data || []).map((house: any) => ({
        ...house,
        members_count: house.members_count ?? 0,
        head_resident: house.head_resident_id
          ? {
            id: house.head_resident_id,
            full_name: house.head_fullname ?? '',
            phone: house.head_phone ?? null,
          }
          : null,
      }));

      return status(200, { households });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .post("/", async ({ body, status }) => {
    try {
      const res = await createHouse(body);
      if (res.data) { return status(200, { message: 'Tạo hộ dân thành công' }) }
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
      if (!res.data) { throw new HttpError(404, 'Không tìm thấy hộ dân'); }

      const residents = res.data.residents || [];
      const headResident = res.data.head_resident_id
        ? residents.find((resident: any) => resident.id === res.data?.head_resident_id) || null
        : null;

      return status(200, {
        household: {
          ...res.data,
          members_count: res.data.members_count ?? residents.length,
          head_resident: headResident,
          residents,
        }
      });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .patch("/:household_id", async ({ params, body, status }) => {
    try {
      const fetchHousehold = await getHouseById(params.household_id);
      if (!fetchHousehold.data) { throw new HttpError(404, 'Không tìm thấy hộ dân'); }

      if (body === null || typeof body !== "object" || Object.keys(body).length === 0) {
        throw new HttpError(400, "Không có thông tin để cập nhật hộ dân");
      }

      const res = await updateHouse(params.household_id, body);
      if (res.data) { return status(200, { message: 'Cập nhật hộ dân thành công' }) }
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
      if (!fetchHousehold.data) { throw new HttpError(404, 'Không tìm thấy hộ dân'); }

      const res = await deleteHouse(params.household_id);

      if (res) { return status(200, { message: 'Xóa hộ dân thành công' }); }
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .get("/:household_id/members", async ({ params, status }) => {
    try {
      const res = await getResidentsByHouseId(params.household_id);
      return status(200, { members: res.data });
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  })
  .patch("/:household_id/head-resident", async ({ params, body, user, status }) => {
    try {
      const fetchHousehold = await getHouseById(params.household_id);
      if (!fetchHousehold.data) { throw new HttpError(404, 'Không tìm thấy hộ dân'); }

      const res = await updateHeadResident(
        params.household_id,
        body.head_resident_id,
        body.reason || 'Đổi chủ hộ',
        user.id!
      );

      if (res) { return status(200, { message: 'Cập nhật chủ hộ thành công' }); }
    }
    catch (error) {
      console.error(error);
      httpErrorStatus(error);
    }
  }, {
    body: t.Object({
      head_resident_id: t.String({ format: 'uuid' }),
      reason: t.Optional(t.String())
    })
  });