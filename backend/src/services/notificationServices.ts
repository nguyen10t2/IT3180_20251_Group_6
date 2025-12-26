import { eq, desc, asc, getTableColumns, isNotNull, and, lt, or, isNull, gt, sql } from "drizzle-orm";
import { db } from "../database/db";
import { notificationSchema, type NewNotification } from "../models/notifycationSchema";
import { notificationReadSchema } from "../models/notificationReadSchema";
import { userSchema } from "../models/userSchema";
import type { NotificationTypeEnum, NotificationTargetEnum } from "../models/pgEnum";

// Lấy tất cả thông báo (chưa bị xóa)
export const getAll = async () => {
  const rows = await db.select({
    ...getTableColumns(notificationSchema),
    created_by_name: userSchema.full_name,
  })
    .from(notificationSchema)
    .leftJoin(userSchema, eq(notificationSchema.created_by, userSchema.id))
    .where(isNull(notificationSchema.deleted_at))
    .orderBy(desc(notificationSchema.created_at));

  return { data: rows };
};

// Lấy thông báo theo ID
export const getNotificationById = async (id: string) => {
  const rows = await db.select({
    ...getTableColumns(notificationSchema),
    created_by_name: userSchema.full_name,
  })
    .from(notificationSchema)
    .leftJoin(userSchema, eq(notificationSchema.created_by, userSchema.id))
    .where(and(
      eq(notificationSchema.id, id),
      isNull(notificationSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Tạo thông báo mới
export const createNotification = async (data: {
  title: string;
  content: string;
  type?: NotificationTypeEnum;
  target?: NotificationTargetEnum;
  target_id?: string | null;
  created_by: string;
}) => {
  const [result] = await db.insert(notificationSchema).values({
    title: data.title,
    content: data.content,
    type: data.type ?? 'general',
    target: data.target ?? 'all',
    target_id: data.target_id ?? null,
    created_by: data.created_by,
    published_at: new Date(),
  }).returning();

  return { data: result };
};

// Soft delete thông báo
export const deleteNotification = async (id: string) => {
  await db.update(notificationSchema)
    .set({ deleted_at: new Date() })
    .where(eq(notificationSchema.id, id));

  return { data: 'Notification deleted successfully' };
};

// Lấy thông báo cho người dùng cụ thể
export const getNotificationsForUser = async (userId: string, householdId: string) => {
  const now = new Date();
  const rows = await db.select({
    ...getTableColumns(notificationSchema),
    is_read: isNotNull(notificationReadSchema.user_id)
  })
    .from(notificationSchema)
    .leftJoin(notificationReadSchema, and(
      eq(notificationSchema.id, notificationReadSchema.notification_id),
      eq(notificationReadSchema.user_id, userId)
    ))
    .where(
      and(
        isNull(notificationSchema.deleted_at),
        lt(notificationSchema.published_at, now),
        or(
          isNull(notificationSchema.expires_at),
          gt(notificationSchema.expires_at, now)
        ),
        or(
          eq(notificationSchema.target, 'all'),
          and(
            eq(notificationSchema.target, 'household'),
            eq(notificationSchema.target_id, householdId)
          ),
          and(
            eq(notificationSchema.target, 'individual'),
            eq(notificationSchema.target_id, userId)
          )
        )
      )
    )
    .orderBy(
      desc(notificationSchema.is_pinned),
      desc(notificationSchema.published_at)
    )
    .limit(100);

  return { data: rows };
};

// Đánh dấu tất cả thông báo đã đọc cho user
export const markAllAsRead = async (userId: string, householdId: string) => {
  const res = await db.execute(sql`
    INSERT INTO notification_reads (notification_id, user_id)
    SELECT n.id, ${userId}
    FROM notification n
    WHERE n.deleted_at IS NULL
    AND n.published_at <= now()
    AND (n.expires_at IS NULL OR n.expires_at > now())
    AND (
      n.target = 'all'
      OR (n.target = 'household' AND n.target_id = ${householdId})
      OR (n.target = 'individual' AND n.target_id = ${userId})
    )
    ON CONFLICT (notification_id, user_id) DO NOTHING
  `);

  return { data: res.length ?? 0 };
};

// Đánh dấu một thông báo đã đọc
export const markAsRead = async (notificationId: string, userId: string) => {
  const [result] = await db.insert(notificationReadSchema)
    .values({
      notification_id: notificationId,
      user_id: userId
    })
    .onConflictDoNothing()
    .returning();

  return { data: result ?? null };
};

// Tạo thông báo theo lịch trình
export const createScheduledNotification = async (data: {
  title: string;
  content: string;
  type?: NotificationTypeEnum;
  target?: NotificationTargetEnum;
  target_id?: string | null;
  scheduled_at: Date | string;
  created_by: string;
}) => {
  const [result] = await db.insert(notificationSchema).values({
    title: data.title,
    content: data.content,
    type: data.type ?? 'general',
    target: data.target ?? 'all',
    target_id: data.target_id ?? null,
    scheduled_at: new Date(data.scheduled_at),
    created_by: data.created_by,
  }).returning();

  return { data: result };
};

// Lấy các thông báo đã đến lịch nhưng chưa publish
export const getScheduledNotifications = async () => {
  const now = new Date();
  const rows = await db.select()
    .from(notificationSchema)
    .where(
      and(
        isNull(notificationSchema.deleted_at),
        isNotNull(notificationSchema.scheduled_at),
        lt(notificationSchema.scheduled_at, now),
        isNull(notificationSchema.published_at)
      )
    )
    .orderBy(asc(notificationSchema.scheduled_at));

  return { data: rows };
};

// Publish thông báo đã lên lịch
export const publishNotification = async (id: string) => {
  const [result] = await db.update(notificationSchema)
    .set({
      published_at: new Date(),
      updated_at: new Date()
    })
    .where(eq(notificationSchema.id, id))
    .returning();

  return { data: result ?? null };
};

// Cập nhật thông báo
export const updateNotification = async (id: string, data: Partial<NewNotification>) => {
  const [result] = await db.update(notificationSchema)
    .set({
      ...data,
      updated_at: new Date()
    })
    .where(and(
      eq(notificationSchema.id, id),
      isNull(notificationSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Ghim/bỏ ghim thông báo
export const togglePinNotification = async (id: string, isPinned: boolean) => {
  const [result] = await db.update(notificationSchema)
    .set({
      is_pinned: isPinned,
      updated_at: new Date()
    })
    .where(eq(notificationSchema.id, id))
    .returning();

  return { data: result ?? null };
};
