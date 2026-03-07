import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const useRemoteDatabase = process.env.POCKETHASH_USE_REMOTE === 'true'
    || (process.env.NODE_ENV === 'production' && Boolean(process.env.TURSO_DATABASE_URL));

const client = createClient({
    url: useRemoteDatabase && process.env.TURSO_DATABASE_URL
        ? process.env.TURSO_DATABASE_URL
        : 'file:sqlite.db',
    authToken: useRemoteDatabase ? process.env.TURSO_AUTH_TOKEN : undefined,
});

export const db = drizzle(client, { schema });
