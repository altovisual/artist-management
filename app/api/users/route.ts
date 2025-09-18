import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type User } from '@supabase/supabase-js';

export async function GET() {
  const supabase = await createClient();

  try {
    // Supabase admin client is needed to query auth.users
    // The createClient from /lib/supabase/server should be an admin client.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    // We only return non-sensitive user data
    const safeUsers = users.map((user: User) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
    }));

    return NextResponse.json(safeUsers);

  } catch (error: any) {
    console.error('[API /users Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}