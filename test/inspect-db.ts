#!/usr/bin/env bun

/**
 * Quick database inspection tool
 * Shows actual data in tables for debugging tests
 */

import { db } from '../backend/src/database/db';
import { Users } from '../backend/src/models/users';
import { House } from '../backend/src/models/house';
import { Resident } from '../backend/src/models/resident';
import { Notifications } from '../backend/src/models/notifications';
import { sql } from 'drizzle-orm';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  dim: '\x1b[2m',
};

async function inspectDatabase() {
  console.log(`\n${colors.cyan}╔${'═'.repeat(78)}╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  📊 Database Inspector - Quick Data Overview${' '.repeat(32)}${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚${'═'.repeat(78)}╝${colors.reset}\n`);

  try {
    // Count users
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(Users);
    console.log(`${colors.green}Users:${colors.reset} ${userCount.count} total`);
    
    // Show users breakdown
    const users = await db.select({
      id: Users.id,
      email: Users.email,
      role: Users.role,
      status: Users.status,
      resident_id: Users.resident_id,
    }).from(Users).limit(10);
    
    if (users.length > 0) {
      console.log(`${colors.dim}  Sample users:${colors.reset}`);
      users.forEach((u, i) => {
        console.log(`${colors.dim}  ${i + 1}. ${u.email} - role: ${u.role}, status: ${u.status}, resident: ${u.resident_id ? '✓' : '✗'}${colors.reset}`);
      });
    }

    // Count houses
    const [houseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(House);
    console.log(`\n${colors.green}Houses:${colors.reset} ${houseCount.count} total`);

    // Count residents
    const [residentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(Resident);
    console.log(`${colors.green}Residents:${colors.reset} ${residentCount.count} total`);

    // Count notifications
    const [notifCount] = await db.select({ count: sql<number>`count(*)::int` }).from(Notifications);
    console.log(`${colors.green}Notifications:${colors.reset} ${notifCount.count} total`);

    // Check for users matching test criteria
    console.log(`\n${colors.yellow}Test Filter Analysis:${colors.reset}`);
    
    const [role3Users] = await db.select({ count: sql<number>`count(*)::int` })
      .from(Users)
      .where(sql`role = 3`);
    console.log(`${colors.dim}  Users with role = 3: ${role3Users.count}${colors.reset}`);
    
    const [withResident] = await db.select({ count: sql<number>`count(*)::int` })
      .from(Users)
      .where(sql`resident_id IS NOT NULL`);
    console.log(`${colors.dim}  Users with resident_id: ${withResident.count}${colors.reset}`);
    
    const [pending] = await db.select({ count: sql<number>`count(*)::int` })
      .from(Users)
      .where(sql`status = 'inactive' AND role = 3 AND resident_id IS NOT NULL`);
    console.log(`${colors.dim}  Pending users (inactive + role=3 + has resident): ${pending.count}${colors.reset}`);

    console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
    process.exit(0);

  } catch (error: any) {
    console.error(`${colors.yellow}Error:${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

inspectDatabase();
