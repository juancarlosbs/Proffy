import db from '@/server/db';

interface CreateRatingParams {
    user_id: number;
    score: number;
    comment?: string;
}

export async function teacherExists(user_id: number) {
    const user = await db('users').where('id', user_id).first();
    return Boolean(user);
}

export async function createRating({ user_id, score, comment }: CreateRatingParams) {
    await db('ratings').insert({
        user_id,
        score,
        comment: comment ?? null,
    });
}

export interface RatingsSummary {
    user_id: number;
    average: number;
    count: number;
}

export async function findRatingsSummaryByUserIds(userIds: number[]): Promise<RatingsSummary[]> {
    if (!userIds.length) return [];

    const rows = await db('ratings')
        .whereIn('user_id', userIds)
        .groupBy('user_id')
        .select('user_id')
        .avg('score as average')
        .count('* as count');

    return rows.map(row => ({
        user_id: row.user_id,
        average: Math.round(Number(row.average) * 10) / 10,
        count: Number(row.count),
    }));
}

export async function findCommentsByUserIds(userIds: number[]) {
    if (!userIds.length) return [];

    return db('ratings')
        .whereIn('user_id', userIds)
        .whereNotNull('comment')
        .whereRaw("trim(comment) != ''")
        .select('user_id', 'comment', 'created_at');
}
