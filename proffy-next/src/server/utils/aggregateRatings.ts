import { RatingRow } from '@/server/ratings';

export default function aggregateRatings(rows: RatingRow[]) {
    const ratings_count = rows.length;

    const avg_rating = ratings_count
        ? Math.round((rows.reduce((sum, row) => sum + row.score, 0) / ratings_count) * 10) / 10
        : null;

    const ratings = rows.map(({ score, comment, created_at }) => ({
        score,
        comment,
        created_at,
    }));

    return { avg_rating, ratings_count, ratings };
}
