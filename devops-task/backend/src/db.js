const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// DB bağlantısını test et + tabloyu oluştur
async function initDB(retries = 5, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id        SERIAL PRIMARY KEY,
          title     VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log("✅ PostgreSQL bağlantısı kuruldu, tablo hazır.");
      return;
    } catch (err) {
      console.error(`❌ DB bağlantı denemesi ${i}/${retries}: ${err.message}`);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

module.exports = { pool, initDB };
