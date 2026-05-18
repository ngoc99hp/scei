const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_rO8ELVhdBf2z@ep-damp-frost-a1kkxggc-pooler.ap-southeast-1.aws.neon.tech/scei?sslmode=require&channel_binding=require');

async function test() {
  const start = performance.now();
  await Promise.all([
    sql`SELECT 1`, sql`SELECT 2`, sql`SELECT 3`, sql`SELECT 4`, sql`SELECT 5`, sql`SELECT 6`, sql`SELECT 7`
  ]);
  console.log('7 concurrent queries: ' + (performance.now() - start) + 'ms');
  
  const start2 = performance.now();
  for (let i = 0; i < 7; i++) await sql`SELECT ${i}`;
  console.log('7 sequential queries: ' + (performance.now() - start2) + 'ms');
}
test();
