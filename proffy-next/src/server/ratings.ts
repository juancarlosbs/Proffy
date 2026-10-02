import db from '@/server/db';

export interface CreateRatingParams {
    user_id: string;
    stars: number;
    comment?: string | null;
}

export async function userExists(user_id: string | number) {
    const user = await db('users').where('id', user_id).first();
    return Boolean(user);
}

export async function createRating({ user_id, stars, comment }: CreateRatingParams) {
    await db('ratings').insert({
        user_id,
        stars,
        comment: comment || null,
    });
}

export async function findRatingsByUserIds(userIds: number[]) {
    return userIds.length
        ? db('ratings').whereIn('user_id', userIds).orderBy('created_at', 'desc')
        : [];
}

export async function getRatingSummaryByUserIds(userIds: number[]) {
    return userIds.length
        ? db('ratings')
              .whereIn('user_id', userIds)
              .groupBy('user_id')
              .select('user_id')
              .avg('stars as average')
              .count('* as total')
        : [];
}
