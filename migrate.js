const { Client } = require('pg');
const fs = require('fs');

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('FATAL: DATABASE_URL not set');
    process.exit(1);
  }

  console.log('DATABASE_URL:', dbUrl.replace(/\/\/.*@/, '//<creds>@'));
  
  const client = new Client({ 
    connectionString: dbUrl,
    connectionTimeoutMillis: 10000,
  });
  
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!');
    
    // Test connection
    const result = await client.query('SELECT current_database(), current_schema, version()');
    console.log('DB:', result.rows[0].current_database);
    console.log('Schema:', result.rows[0].current_schema);
    console.log('Version:', result.rows[0].version.substring(0, 60));
    
    console.log('Running migration SQL...');
    const sql = fs.readFileSync('/migration.sql', 'utf8');
    await client.query(sql);
    
    // Verify tables
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('✅ Tables created:', tables.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    console.log('✅ Migration SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration FAILED:', err.message);
    if (err.stack) console.error(err.stack.substring(0, 500));
    try { await client.end(); } catch(e) {}
    process.exit(1);
  }
}

migrate();
