
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  const musoAiProfileId = '29e086f1-b4f2-463f-9b87-1acc516b48fb'; // Hardcoded from user

  try {
    // 1. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    // 2. Get the artist_id from the user_id
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (artistError || !artistData) {
      return NextResponse.json({ error: 'Could not find an artist profile linked to your user account.' }, { status: 404 });
    }
    const artistId = artistData.id;

    // 3. Check if a Muso.AI profile already exists for this artist
    const { data: existingProfile, error: selectError } = await supabase
      .from('muso_ai_profiles')
      .select('id')
      .eq('artist_id', artistId);

    if (selectError) {
      throw selectError;
    }

    let finalData;

    if (existingProfile && existingProfile.length > 0) {
      // 4a. Update existing profile
      const { data: updatedData, error: updateError } = await supabase
        .from('muso_ai_profiles')
        .update({ muso_ai_profile_id: musoAiProfileId, last_updated: new Date().toISOString() })
        .eq('artist_id', artistId)
        .select();
      
      if (updateError) throw updateError;
      finalData = updatedData;

    } else {
      // 4b. Insert new profile
      const { data: insertedData, error: insertError } = await supabase
        .from('muso_ai_profiles')
        .insert({ artist_id: artistId, muso_ai_profile_id: musoAiProfileId, popularity: 0 })
        .select();

      if (insertError) throw insertError;
      finalData = insertedData;
    }

    return NextResponse.json({ message: 'Successfully linked Muso.AI profile!', data: finalData });

  } catch (error: any) {
    console.error('Error linking Muso.AI profile:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
