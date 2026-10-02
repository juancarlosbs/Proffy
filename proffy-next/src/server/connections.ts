import db from '@/server/db';

export async function countConnections() {
    return db('connections').count('* as total');
}

export async function createConnection(user_id: string) {
    await db('connections').insert({
        user_id,
    });
}
