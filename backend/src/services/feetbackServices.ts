import { eq, getTableColumns, sql, asc, and, isNull, desc } from 'drizzle-orm';
import { db } from '../database/db';
import { feedbackSchema, type NewFeedback } from '../models/feedbackSchema';
import { feedbackCommentSchema } from '../models/feedbackCommentSchema';
import { houseSchema } from '../models/houseSchema';
import { userSchema } from '../models/userSchema';
import type { FeedbackStatusEnum, FeedbackTypeEnum, FeedbackPriorityEnum } from '../models/pgEnum';
import { CommentFeedbackType, CreateFeedbackType } from '../types/feedbackTypes';

// Lấy tất cả phản hồi (chưa bị xóa)
export const getAll = async () => {
  const rows = await db.select({
    ...getTableColumns(feedbackSchema),
    user_fullname: userSchema.full_name,
    room_number: houseSchema.room_number,
    comment_count: sql<number>`(SELECT COUNT(*) FROM feedback_comments WHERE feedback_comments.feedback_id = ${feedbackSchema.id})`.as('comment_count'),
  })
    .from(feedbackSchema)
    .leftJoin(userSchema, eq(feedbackSchema.user_id, userSchema.id))
    .leftJoin(houseSchema, eq(feedbackSchema.house_id, houseSchema.id))
    .where(isNull(feedbackSchema.deleted_at))
    .orderBy(desc(feedbackSchema.created_at));

  return { data: rows };
};

// Lấy phản hồi theo ID
export const getFeedbackById = async (id: string) => {
  const rows = await db.select({
    ...getTableColumns(feedbackSchema),
    user_fullname: userSchema.full_name,
    room_number: houseSchema.room_number,
  })
    .from(feedbackSchema)
    .leftJoin(userSchema, eq(feedbackSchema.user_id, userSchema.id))
    .leftJoin(houseSchema, eq(feedbackSchema.house_id, houseSchema.id))
    .where(and(
      eq(feedbackSchema.id, id),
      isNull(feedbackSchema.deleted_at)
    ));

  return { data: rows[0] ?? null };
};

// Phản hồi feedback - cập nhật status, resolution_notes và assigned_to
export const respondToFeedback = async (
  feedbackId: string,
  response: string,
  respondedBy: string,
) => {
  const [result] = await db.update(feedbackSchema)
    .set({
      status: 'resolved' as FeedbackStatusEnum,
      resolution_notes: response,
      assigned_to: respondedBy,
      resolved_at: new Date(),
      updated_at: new Date(),
    })
    .where(and(
      eq(feedbackSchema.id, feedbackId),
      isNull(feedbackSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Lấy phản hồi theo user_id
export const getFeedbacksByUserId = async (userId: string) => {
  const rows = await db.select({
    ...getTableColumns(feedbackSchema),
    comment_count: sql<number>`(SELECT COUNT(*) FROM feedback_comments WHERE feedback_comments.feedback_id = ${feedbackSchema.id})`.as('comment_count'),
  })
    .from(feedbackSchema)
    .where(and(
      eq(feedbackSchema.user_id, userId),
      isNull(feedbackSchema.deleted_at)
    ))
    .orderBy(desc(feedbackSchema.created_at));

  return { data: rows };
};

// Tạo phản hồi mới
export const createFeedback = async (
  data: CreateFeedbackType,
) => {
  const [result] = await db.insert(feedbackSchema)
    .values({
      ...data,
      attachments: data.attachments || [],
    })
    .returning();

  return { data: result };
};

// Lấy phản hồi với tất cả comments
export const getFeedbackWithComments = async (feedbackId: string, includeInternal: boolean = false) => {
  const [feedback] = await db.select({
    ...getTableColumns(feedbackSchema),
    user_fullname: userSchema.full_name,
  })
    .from(feedbackSchema)
    .leftJoin(userSchema, eq(feedbackSchema.user_id, userSchema.id))
    .where(and(
      eq(feedbackSchema.id, feedbackId),
      isNull(feedbackSchema.deleted_at)
    ));

  if (!feedback) {
    return { data: null };
  }

  const commentsQuery = db.select({
    ...getTableColumns(feedbackCommentSchema),
    commenter_name: userSchema.full_name,
  })
    .from(feedbackCommentSchema)
    .leftJoin(userSchema, eq(feedbackCommentSchema.user_id, userSchema.id))
    .where(
      includeInternal
        ? eq(feedbackCommentSchema.feedback_id, feedbackId)
        : and(
          eq(feedbackCommentSchema.feedback_id, feedbackId),
          eq(feedbackCommentSchema.is_internal, false)
        )
    )
    .orderBy(asc(feedbackCommentSchema.created_at));

  const comments = await commentsQuery;

  return {
    data: {
      feedback,
      comments,
    },
  };
};

// Thêm comment vào feedback
export const addComment = async (data: CommentFeedbackType) => {
  const [result] = await db.insert(feedbackCommentSchema)
    .values(data)
    .returning();

  return { data: result };
};

// Cập nhật trạng thái feedback
export const updateFeedbackStatus = async (id: string, status: FeedbackStatusEnum, assignedTo?: string) => {
  const updateData: any = {
    status,
    updated_at: new Date(),
  };

  if (assignedTo) {
    updateData.assigned_to = assignedTo;
  }

  if (status === 'resolved') {
    updateData.resolved_at = new Date();
  }

  const [result] = await db.update(feedbackSchema)
    .set(updateData)
    .where(and(
      eq(feedbackSchema.id, id),
      isNull(feedbackSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};

// Soft delete feedback
export const deleteFeedback = async (id: string) => {
  await db.update(feedbackSchema)
    .set({ deleted_at: new Date() })
    .where(eq(feedbackSchema.id, id));

  return { data: 'Feedback deleted successfully' };
};

// Lấy feedbacks theo status
export const getFeedbacksByStatus = async (status: FeedbackStatusEnum) => {
  const rows = await db.select({
    ...getTableColumns(feedbackSchema),
    user_fullname: userSchema.full_name,
    room_number: houseSchema.room_number,
  })
    .from(feedbackSchema)
    .leftJoin(userSchema, eq(feedbackSchema.user_id, userSchema.id))
    .leftJoin(houseSchema, eq(feedbackSchema.house_id, houseSchema.id))
    .where(and(
      eq(feedbackSchema.status, status),
      isNull(feedbackSchema.deleted_at)
    ))
    .orderBy(desc(feedbackSchema.created_at));

  return { data: rows };
};

// Gán người xử lý
export const assignFeedback = async (id: string, assignedTo: string) => {
  const [result] = await db.update(feedbackSchema)
    .set({
      assigned_to: assignedTo,
      status: 'in_progress' as FeedbackStatusEnum,
      updated_at: new Date(),
    })
    .where(and(
      eq(feedbackSchema.id, id),
      isNull(feedbackSchema.deleted_at)
    ))
    .returning();

  return { data: result ?? null };
};
