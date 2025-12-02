/**
 * Script to migrate data from JSON to Supabase
 * Run: npx tsx scripts/migrate-to-supabase.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { User } from '../src/types/user';
import { userToDbRow } from '../src/lib/supabase';

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase environment variables not configured!');
  console.error('Create a .env.local file with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

async function migrateUsers() {
  console.log('🚀 Starting data migration...\n');

  // Check if file exists
  if (!fs.existsSync(USERS_FILE)) {
    console.error('❌ users.json file not found!');
    process.exit(1);
  }

  // Load users from JSON
  const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
  const users: User[] = JSON.parse(usersData);

  console.log(`📦 Found ${users.length} users in JSON\n`);

  if (users.length === 0) {
    console.log('✅ No users to migrate.');
    return;
  }

  // Check existing users in Supabase
  const { data: existingUsers } = await supabase
    .from('users')
    .select('email');

  const existingEmails = new Set(existingUsers?.map(u => u.email) || []);
  
  // Filter users that already exist
  const usersToMigrate = users.filter(u => !existingEmails.has(u.email));
  const usersToSkip = users.length - usersToMigrate.length;

  if (usersToSkip > 0) {
    console.log(`⚠️  ${usersToSkip} user(s) already exist in database and will be skipped\n`);
  }

  if (usersToMigrate.length === 0) {
    console.log('✅ All users have already been migrated!');
    return;
  }

  console.log(`📤 Migrating ${usersToMigrate.length} user(s)...\n`);

  let successCount = 0;
  let errorCount = 0;

  // Migrate in batches of 10
  const batchSize = 10;
  for (let i = 0; i < usersToMigrate.length; i += batchSize) {
    const batch = usersToMigrate.slice(i, i + batchSize);
    
    const rowsToInsert = batch.map(user => userToDbRow(user));

    const { data, error } = await supabase
      .from('users')
      .insert(rowsToInsert)
      .select();

    if (error) {
      console.error(`❌ Error migrating batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += data?.length || 0;
      console.log(`✅ Migrated ${successCount}/${usersToMigrate.length} users...`);
    }
  }

  console.log('\n📊 Migration summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⏭️  Skipped: ${usersToSkip}`);
  console.log(`   📦 Total: ${users.length}\n`);

  if (errorCount === 0) {
    console.log('🎉 Migration completed successfully!');
  } else {
    console.log('⚠️  Migration completed with some errors.');
  }
}

// Run migration
migrateUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

