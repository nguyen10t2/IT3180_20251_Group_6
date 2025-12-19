import postgres from 'postgres';
import { colors, log } from './testHelpers';

/**
 * Check database connection before running tests
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  const dbUrl = Bun.env.TEST_DATABASE_URL || Bun.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('\n' + '═'.repeat(80));
    log.error('❌ DATABASE_URL is not set!', true);
    console.log('═'.repeat(80));
    console.log(`${colors.yellow}Please create a .env file with:${colors.reset}`);
    console.log(`${colors.dim}  DATABASE_URL=postgresql://user:password@localhost:5432/dbname${colors.reset}`);
    console.log('\n' + `${colors.cyan}Or copy from example:${colors.reset}`);
    console.log(`${colors.dim}  cp .env.example .env${colors.reset}`);
    console.log('═'.repeat(80) + '\n');
    return false;
  }

  try {
    const sql = postgres(dbUrl, {
      max: 1,
      connect_timeout: 5,
    });

    // Try a simple query
    await sql`SELECT 1 as test`;
    await sql.end();
    
    log.success('Database connection OK');
    return true;
  } catch (error: any) {
    console.log('\n' + '═'.repeat(80));
    log.error('❌ Cannot connect to database!', true);
    console.log('═'.repeat(80));
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.log('\n' + `${colors.yellow}Common issues:${colors.reset}`);
    console.log(`${colors.dim}  1. PostgreSQL server is not running${colors.reset}`);
    console.log(`${colors.dim}  2. Wrong credentials in DATABASE_URL${colors.reset}`);
    console.log(`${colors.dim}  3. Database doesn't exist${colors.reset}`);
    console.log(`${colors.dim}  4. Wrong host/port${colors.reset}`);
    console.log('\n' + `${colors.cyan}Your DATABASE_URL:${colors.reset}`);
    console.log(`${colors.dim}  ${maskPassword(dbUrl)}${colors.reset}`);
    console.log('═'.repeat(80) + '\n');
    return false;
  }
}

/**
 * Mask password in connection string for security
 */
function maskPassword(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      return url.replace(parsed.password, '****');
    }
    return url;
  } catch {
    return url.replace(/:([^@]+)@/, ':****@');
  }
}

/**
 * Check if database has any data
 */
export async function checkDatabaseData(): Promise<{ 
  hasUsers: boolean; 
  hasHouses: boolean; 
  hasResidents: boolean;
}> {
  const dbUrl = Bun.env.TEST_DATABASE_URL || Bun.env.DATABASE_URL;
  
  if (!dbUrl) {
    return { hasUsers: false, hasHouses: false, hasResidents: false };
  }

  try {
    const sql = postgres(dbUrl, { max: 1 });
    
    const [users] = await sql`SELECT COUNT(*) as count FROM users LIMIT 1`;
    const [houses] = await sql`SELECT COUNT(*) as count FROM house LIMIT 1`;
    const [residents] = await sql`SELECT COUNT(*) as count FROM resident LIMIT 1`;
    
    await sql.end();
    
    const result = {
      hasUsers: Number(users.count) > 0,
      hasHouses: Number(houses.count) > 0,
      hasResidents: Number(residents.count) > 0,
    };

    if (!result.hasUsers && !result.hasHouses && !result.hasResidents) {
      console.log(`${colors.yellow}⚠  Database is empty - some tests may fail or be skipped${colors.reset}`);
    } else {
      console.log(`${colors.dim}Database has: ${result.hasUsers ? '✓ users' : '✗ users'}, ${result.hasHouses ? '✓ houses' : '✗ houses'}, ${result.hasResidents ? '✓ residents' : '✗ residents'}${colors.reset}`);
    }
    
    return result;
  } catch (error: any) {
    log.warn(`Cannot check database data: ${error.message}`);
    return { hasUsers: false, hasHouses: false, hasResidents: false };
  }
}
