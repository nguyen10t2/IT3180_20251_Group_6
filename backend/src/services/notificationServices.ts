import { Notifications } from "../models/notifications";
import { Users } from "../models/users";
import { eq, desc, asc, getTableColumns, isNotNull, and, lt, or, isNull, gt, sql } from "drizzle-orm";
import { db } from "../database/db";
import { NotificationTargetEnum, NotificationTypeEnum, NotificationType, NotificationTarget } from "../models/enum";
import { NotificationReads } from "../models/notification_reads";

// Lấy tất cả thông báo
export const getAll = async () => {
    try {
        const rows = await db.select({
            ...getTableColumns(Notifications),
            created_by_name: Users.name,
        })
            .from(Notifications)
            .leftJoin(Users, eq(Notifications.create_by, Users.id))
            .orderBy(desc(Notifications.created_at));

        return { data: rows };
    } catch (_) {
        return { error: 'Internal Server Error' };
    }
};

// Tạo thông báo mới
export const createNotification = async (
    title: string,
    content: string,
    type: NotificationTypeEnum,
    target: NotificationTargetEnum,
    target_id: string | null,
    created_by: string
) => {
    try {
        await db.insert(Notifications).values({
            title,
            content,
            type: type || NotificationType.enumValues[0],
            target: target || NotificationTarget.enumValues[0],
            target_id,
            create_by: created_by,
        });

        return { data: 'Notification created successfully' };
    } catch (_) {
        return { error: 'Internal Server Error' };
    }
};

// Xoá thông báo
export const deleteNotification = async (id: string) => {
    try {
        await db.delete(Notifications).where(eq(Notifications.id, id));
        return { data: 'Notification deleted successfully' };
    } catch (_) {
        return { error: 'Internal Server Error' };
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
                    lt(Notifications.publish_at, now),
                    or(
                        isNull(Notifications.expired_at),
                        gt(Notifications.expired_at, now)
                    ),
                    or(
                        eq(Notifications.target, 'all'),
                        and(
                            eq(Notifications.target, 'household'),
                            eq(Notifications.target_id, household_id)
                        ),
                        and(
                            eq(Notifications.target, 'individual'),
                            eq(Notifications.target_id, user_id)
                        )
                    )
                )
            )
            .orderBy(
                desc(Notifications.is_pinned),
                desc(Notifications.publish_at)
            )
            .limit(100);

        return { data: rows };

    } catch (_) {
        return { error: 'Internal Server Error' };
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

        return { data: res.count };
    } catch (_) {
        return { error: 'Internal Server Error' };
    }
};

// Tạo thông báo theo lịch trình
export const createScheduledNotification = async (
    title: string,
    content: string,
    type: NotificationTypeEnum,
    target: NotificationTargetEnum,
    target_id: string | null,
    scheduled_at: Date,
    create_by: string
) => {
    try {
        const rows = await db.insert(Notifications).values({
            title,
            content,
            type: type || NotificationType.enumValues[0],
            target: target || NotificationTarget.enumValues[0],
            target_id,
            scheduled_at: scheduled_at,
            create_by: create_by,
        });

        return { data: rows };
    } catch (_) {
        return { error: 'Internal Server Error' };
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
        return { error: 'Internal Server Error' };
    }
};
