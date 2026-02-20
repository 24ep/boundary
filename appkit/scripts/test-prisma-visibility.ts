import { PrismaClient } from '@prisma/client';
async function test() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing direct Prisma connection...');
    
    // Check if we can see the schemas
    const schemas = await prisma.$queryRawUnsafe(`SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('core', 'admin', 'bondarys')`);
    console.log('Schemas visible to Prisma:', JSON.stringify(schemas, null, 2));

    // Check if we can see the table
    const tables = await prisma.$queryRawUnsafe(`SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'audit_logs'`);
    console.log('Tables visible to Prisma:', JSON.stringify(tables, null, 2));

    // Try a direct find
    const count = await prisma.auditLog.count();
    console.log('AuditLog count:', count);

  } catch (err) {
    console.error('Prisma test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
