import db from '@/server/db';

export interface RatingRow {
    score: number;
    comment: string | null;
    created_at: string;
}

interface CreateRatingParams {
    user_id: number;
    score: number;
    comment?: string | null;
}

export async function createRating({ user_id, score, comment }: CreateRatingParams) {
    if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new Error('score must be an integer between 1 and 5');
    }

    const user = await db('users').where('id', user_id).first();

    if (!user) {
        throw new Error('user_id does not refer to an existing user');
    }

    await db('ratings').insert({
        user_id,
        score,
        comment: comment ?? null,
    });
}

export async function findRatingsByUserIds(userIds: number[]): Promise<Array<RatingRow & { user_id: number }>> {
    return userIds.length
        ? db('ratings').whereIn('user_id', userIds)
        : [];
}

export async function findRatingsByUserId(userId: number | string): Promise<RatingRow[]> {
    return db('ratings').where('user_id', userId);
}
