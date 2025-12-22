import { eq, getTableColumns, sql, asc, and } from 'drizzle-orm';
import { db } from '../database/db';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/errorContant';
import { House } from '../models/house';
import { Users } from '../models/users';
import { Feedbacks } from '../models/feedbacks';
import { FeedbackComments } from '../models/feedback_comments';
import { singleOrNotFound } from '../helpers/dataHelpers';
import { FeedbackStatusEnum, FeedbackTypeEnum, FeedbackPriorityEnum } from '../models/enum';

// Get all feedbacks with user fullname, house room_number and comment count
export const getAll = async () => {
    try {
        const feedbacks = await db
            .select({
                ...getTableColumns(Feedbacks),
                user_fullname: Users.name,
                room_number: House.room_number,
                comment_count: sql<number>`(SELECT COUNT(*) FROM feedback_comments WHERE feedback_comments.feedback_id = ${Feedbacks.id})`.as('comment_count'),
            })
            .from(Feedbacks)
            .leftJoin(Users, eq(Feedbacks.user_id, Users.id))
            .leftJoin(House, eq(Feedbacks.house_id, House.house_id));

        return { data: feedbacks };
    } catch (error) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

// Respond to a feedback - update status, resolution_notes and assigned_to
export const respond = async (
    feedback_id: string,
    response: string,
    responded_by: string
) => {
    try {
        const result = await db
            .update(Feedbacks)
            .set({
                status: 'resolved' as FeedbackStatusEnum,
                resolution_notes: response,
                assigned_to: responded_by,
                resolved_at: new Date(),
                updated_at: new Date(),
            })
            .where(eq(Feedbacks.id, feedback_id))
            .returning();

        return singleOrNotFound(result);
    } catch (error) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

// Get all feedbacks by user_id with comment count
export const getFeedbackByUser = async (user_id: string) => {
    try {
        const feedbacks = await db
            .select({
                ...getTableColumns(Feedbacks),
                comment_count: sql<number>`(SELECT COUNT(*) FROM feedback_comments WHERE feedback_comments.feedback_id = ${Feedbacks.id})`.as('comment_count'),
            })
            .from(Feedbacks)
            .where(eq(Feedbacks.user_id, user_id));

        return { data: feedbacks };
    } catch (error) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

// Create a new feedback
export const create = async (body: {
    user_id: string;
    house_id: string;
    type: FeedbackTypeEnum;
    priority: FeedbackPriorityEnum;
    title: string;
    content: string;
}) => {
    try {
        const result = await db
            .insert(Feedbacks)
            .values({
                user_id: body.user_id,
                house_id: body.house_id,
                type: body.type,
                priority: body.priority,
                title: body.title,
                context: body.content,
            })
            .returning();

        return singleOrNotFound(result);
    } catch (error) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

// Get feedback with all its comments for a specific user
export const getFeedbackWithComments = async (
    feedback_id: string,
    user_id: string,
) => {
    try {
        // Get the feedback
        const feedback = await db
            .select({
                ...getTableColumns(Feedbacks),
            })
            .from(Feedbacks)
            .where(eq(Feedbacks.id, feedback_id));

        if (feedback.length === 0) {
            return { error: NOT_FOUND };
        }

        const comments = await db
            .select({
                ...getTableColumns(FeedbackComments),
                commenter_name: Users.name,
            })
            .from(FeedbackComments)
            .leftJoin(Users, eq(FeedbackComments.user_id, Users.id))
            .where(
                and(
                    eq(FeedbackComments.feedback_id, feedback_id),
                    eq(FeedbackComments.is_internal, false),
                )
            )
            .orderBy(asc(FeedbackComments.created_at));

        return {
            data: {
                feedback: feedback[0],
                comments: comments,
            },
        };
    } catch (error) {
        return { error: INTERNAL_SERVER_ERROR };
    }
};

