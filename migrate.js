const { Client } = require('pg');
const fs = require('fs');

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL...');
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log('Connected. Running migrations...');
    
    const sql = fs.readFileSync('/migration.sql', 'utf8');
    await client.query(sql);
    
    console.log('✅ Migration complete!');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
