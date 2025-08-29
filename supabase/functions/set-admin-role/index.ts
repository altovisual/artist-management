import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cors headers for browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the user that called the function.
    // This way we can check if the user is an admin.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )

    // Get the user from the session
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Check if the user is an admin.
    if (user.app_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Not authorized. Admin role required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Now, create a Supabase client with the service_role key to perform admin actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user ID and new role from the request body
    const { userIdToUpdate, newRole } = await req.json()

    if (!userIdToUpdate || !newRole) {
        return new Response(JSON.stringify({ error: 'userIdToUpdate and newRole are required.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    // Update the user's app_metadata with the new role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userIdToUpdate,
      { app_metadata: { role: newRole } }
    )

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})