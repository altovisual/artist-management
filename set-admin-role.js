import { createClient } from '@supabase/supabase-js';

// ADVERTENCIA: No subas este archivo a tu repositorio de git.
// Contiene claves secretas.

// --- REEMPLAZA ESTOS VALORES ---
const supabaseUrl = 'https://tdbomtxyevggobphozdu.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYm9tdHh5ZXZnZ29icGhvemR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE1MzMwNywiZXhwIjoyMDcxNzI5MzA3fQ.3YOp-WJdOBYFbTgl1m3T6ymTWuj3MaC0cqk2nh1V_xg';
const userIdToMakeAdmin = 'a56bc5e0-9dba-4a01-924e-c0b6938f0857';
// -----------------------------

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setAdminRole() {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userIdToMakeAdmin,
    { app_metadata: { role: 'admin' } }
  );

  if (error) {
    console.error('Error setting admin role:', error.message);
  } else {
    console.log('Successfully set admin role for user:', data.user.email);
  }
}

setAdminRole();
