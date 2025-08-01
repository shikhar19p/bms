// packages/db/src/test/setup-db.ts
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const testDbName = `${process.env.POSTGRES_DB}_test`;

const client = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost',
  port: 5433, // Connect to the test database container
  database: 'postgres', // Connect to the default 'postgres' db to create a new one
});

async function setup() {
  await client.connect();

  // Check if the test database already exists
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${testDbName}'`);

  if (res.rowCount === 0) {
    console.log(`Creating test database: ${testDbName}`);
    await client.query(`CREATE DATABASE "${testDbName}"`);
  } else {
    console.log(`Test database '${testDbName}' already exists.`);
  }

  await client.end();
}

setup().catch((err) => {
  console.error('Error setting up test database:', err);
  process.exit(1);
});
