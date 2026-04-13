import mysql, { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Truksta aplinkos kintamojo ${name}.`);
  }

  return value;
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: requireEnv("DB_HOST"),
      port: Number(process.env.DB_PORT ?? "3306"),
      user: requireEnv("DB_USER"),
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "ligonines_sistema",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return pool;
}

export async function queryRows<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
) {
  const currentPool = getPool();
  const [rows] = await currentPool.query<T>(sql, params);
  return rows;
}

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
