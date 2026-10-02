import db from '@/server/db';

export async function countConnections() {
    const totalConnections = await db('connections').count('* as total');

    return totalConnections[0].total;
}

export async function createConnection(user_id: string) {
    await db('connections').insert({
        user_id,
    });
}
