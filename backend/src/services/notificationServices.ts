import { Notifications } from "../models/notifications";
import { Users } from "../models/users";
import { eq, desc, asc, getTableColumns, isNotNull, and, lt, or, isNull, gt, sql } from "drizzle-orm";
import { db } from "../database/db";
import { NotificationTargetEnum, NotificationTypeEnum, NotificationType, NotificationTarget } from "../models/enum";
import { NotificationReads } from "../models/notification_reads";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/errorContant";
import { Static } from "elysia";
import { CreateNotificationBody, CreateScheduledNotificationBody } from "../types/notificationTypes";

// Lấy tất cả thông báo
export const getAll = async () => {
  try {
    const rows = await db.select({
      ...getTableColumns(Notifications),
      created_by_name: Users.name,
    })
      .from(Notifications)
      .leftJoin(Users, eq(Notifications.created_by, Users.id))
      .orderBy(desc(Notifications.created_at));

    return { data: rows };
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Tạo thông báo mới
export const createNotification = async (
  data: Static<typeof CreateNotificationBody>
) => {
  try {
    await db.insert(Notifications).values({
      title: data.title,
      context: data.context,
      type: data.type ?? NotificationType.enumValues[0],
      target: data.target ?? NotificationTarget.enumValues[0],
      target_id: data.target_id ?? null,
      created_by: data.created_by,
    });

    return { data: 'Notification created successfully' };
  } catch (_) {
    console.log(_);

    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Xoá thông báo
export const deleteNotification = async (id: string) => {
  try {
    await db.delete(Notifications).where(eq(Notifications.id, id));
    return { data: 'Notification deleted successfully' };
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Lấy thông báo cho người dùng cụ thể
export const getNotificationsForUser = async (user_id: string, household_id: string) => {
  try {
    const now = new Date();
    const rows = await db.select({
      ...getTableColumns(Notifications),
      read: isNotNull(NotificationReads.user_id)
    })
      .from(Notifications)
      .leftJoin(NotificationReads, and(
        eq(Notifications.id, NotificationReads.notification_id),
        eq(NotificationReads.user_id, user_id)
      ))
      .where(
        and(
          lt(Notifications.published_at, now),
          or(
            isNull(Notifications.expires_at),
            gt(Notifications.expires_at, now)
          ),
          or(
            eq(Notifications.target, NotificationTarget.enumValues[0]),
            and(
              eq(Notifications.target, NotificationTarget.enumValues[1]),
              eq(Notifications.target_id, household_id)
            ),
            and(
              eq(Notifications.target, NotificationTarget.enumValues[2]),
              eq(Notifications.target_id, user_id)
            )
          )
        )
      )
      .orderBy(
        desc(Notifications.is_pinned),
        desc(Notifications.published_at)
      )
      .limit(100);

    return { data: rows };

  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (user_id: string, household_id: string) => {
  try {
    const res = await db.execute(sql`
            INSERT INTO notification_reads (notification_id, user_id)
            SELECT n.id, ${user_id}
            FROM notifications n
            WHERE n.published_at <= now()
            AND (n.expires_at IS NULL OR n.expires_at > now())
            AND (
                n.target = 'all'
                OR (n.target = 'household' AND n.target_id = ${household_id})
                OR (n.target = 'individual' AND n.target_id = ${user_id})
            )
            ON CONFLICT (notification_id, user_id) DO NOTHING
        `);
    console.log(res.count);

    return { data: res.count };
  } catch (_) {
    console.log(_);

    return { error: INTERNAL_SERVER_ERROR };
  }
};

// Tạo thông báo theo lịch trình
export const createScheduledNotification = async (
  data: Static<typeof CreateScheduledNotificationBody>
) => {
  try {
    const rows = await db.insert(Notifications).values({
      title: data.title,
      context: data.context,
      type: data.type ?? NotificationType.enumValues[0],
      target: data.target ?? NotificationTarget.enumValues[0],
      target_id: data.target_id ?? null,
      scheduled_at: new Date(data.scheduled_at),
      created_by: data.created_by,
    });

    return { data: rows };
  } catch (_) {
    console.log(_);

    return { error: INTERNAL_SERVER_ERROR };
  }
}

// Lấy các thông báo đã đến lịch trình
export const getScheduledNotifications = async () => {
  try {
    const now = new Date();
    const rows = await db.select()
      .from(Notifications)
      .where(
        and(
          isNotNull(Notifications.scheduled_at),
          lt(Notifications.scheduled_at, now),
        )
      )
      .orderBy(asc(Notifications.scheduled_at));

    return { data: rows };
  } catch (_) {
    return { error: INTERNAL_SERVER_ERROR };
  }
};
