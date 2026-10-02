import db from '@/server/db';

export async function countConnections(): Promise<number> {
    const totalConnections = await db('connections').count('* as total');

    const { total } = totalConnections[0];

    return total as number;
}

export async function createConnection(user_id: number) {
    await db('connections').insert({
        user_id,
    });
}
