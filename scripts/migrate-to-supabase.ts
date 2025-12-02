/**
 * Script para migrar dados do JSON para Supabase
 * Execute: npx tsx scripts/migrate-to-supabase.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { User } from '../src/types/user';
import { userToDbRow } from '../src/lib/supabase';

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Crie um arquivo .env.local com:');
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
  console.log('🚀 Iniciando migração de dados...\n');

  // Verificar se o arquivo existe
  if (!fs.existsSync(USERS_FILE)) {
    console.error('❌ Arquivo users.json não encontrado!');
    process.exit(1);
  }

  // Carregar usuários do JSON
  const usersData = fs.readFileSync(USERS_FILE, 'utf-8');
  const users: User[] = JSON.parse(usersData);

  console.log(`📦 Encontrados ${users.length} usuários no JSON\n`);

  if (users.length === 0) {
    console.log('✅ Nenhum usuário para migrar.');
    return;
  }

  // Verificar usuários existentes no Supabase
  const { data: existingUsers } = await supabase
    .from('users')
    .select('email');

  const existingEmails = new Set(existingUsers?.map(u => u.email) || []);
  
  // Filtrar usuários que já existem
  const usersToMigrate = users.filter(u => !existingEmails.has(u.email));
  const usersToSkip = users.length - usersToMigrate.length;

  if (usersToSkip > 0) {
    console.log(`⚠️  ${usersToSkip} usuário(s) já existem no banco e serão pulados\n`);
  }

  if (usersToMigrate.length === 0) {
    console.log('✅ Todos os usuários já foram migrados!');
    return;
  }

  console.log(`📤 Migrando ${usersToMigrate.length} usuário(s)...\n`);

  let successCount = 0;
  let errorCount = 0;

  // Migrar em lotes de 10
  const batchSize = 10;
  for (let i = 0; i < usersToMigrate.length; i += batchSize) {
    const batch = usersToMigrate.slice(i, i + batchSize);
    
    const rowsToInsert = batch.map(user => userToDbRow(user));

    const { data, error } = await supabase
      .from('users')
      .insert(rowsToInsert)
      .select();

    if (error) {
      console.error(`❌ Erro ao migrar lote ${Math.floor(i / batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += data?.length || 0;
      console.log(`✅ Migrados ${successCount}/${usersToMigrate.length} usuários...`);
    }
  }

  console.log('\n📊 Resumo da migração:');
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   ⏭️  Pulados: ${usersToSkip}`);
  console.log(`   📦 Total: ${users.length}\n`);

  if (errorCount === 0) {
    console.log('🎉 Migração concluída com sucesso!');
  } else {
    console.log('⚠️  Migração concluída com alguns erros.');
  }
}

// Executar migração
migrateUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

