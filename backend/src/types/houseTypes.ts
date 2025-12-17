import { RoomType } from "../models/enum";

export type HouseType = {
    room_number?: string;
    room_type?: RoomType;
    area?: string;
    member_count?: number;
    house_resident_id?: string | null;
    has_vehicle?: boolean;
    vehicle_count?: number;
    notes?: string | null;
};