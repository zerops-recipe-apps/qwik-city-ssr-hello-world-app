// Database migration script. Run once per deploy via zsc execOnce in
// zerops.yaml initCommands. Idempotent: safe to run multiple times.
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'db',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

async function migrate() {
  const client = await pool.connect();
  try {
    // IF NOT EXISTS and ON CONFLICT DO NOTHING make this idempotent
    await client.query(`
      CREATE TABLE IF NOT EXISTS greetings (
        id      INTEGER PRIMARY KEY,
        message TEXT NOT NULL
      );
    `);
    await client.query(`
      INSERT INTO greetings (id, message)
      VALUES (1, 'Hello from Zerops!')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Migration completed successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
