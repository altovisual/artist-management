import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AUCO_API_URL = process.env.AUCO_API_URL || 'https://api.auco.io/v1'
const AUCO_API_KEY = process.env.AUCO_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!AUCO_API_KEY) {
      return NextResponse.json(
        { error: 'AUCO_API_KEY not configured' },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting Auco signatures sync...')

    // Fetch all documents from Auco
    const aucoDocs = await fetch(`${AUCO_API_URL}/documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUCO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!aucoDocs.ok) {
      const errorText = await aucoDocs.text()
      console.error('❌ Auco API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch from Auco', details: errorText },
        { status: aucoDocs.status }
      )
    }

    const aucoData = await aucoDocs.json()
    console.log('📄 Fetched documents from Auco:', aucoData.data?.length || 0)

    const documents = aucoData.data || []
    let syncedCount = 0
    let updatedCount = 0
    let errorCount = 0

    // Sync each document
    for (const doc of documents) {
      try {
        // Get first signer (assuming one signer per document)
        const signer = doc.signers?.[0]
        
        if (!signer) {
          console.warn('⚠️ Document without signer:', doc.id)
          continue
        }

        // Map Auco status to our status
        const statusMap: { [key: string]: string } = {
          'draft': 'pending',
          'sent': 'pending',
          'completed': 'completed',
          'declined': 'failed',
          'expired': 'failed',
        }

        const status = statusMap[doc.status] || 'pending'

        // Check if signature already exists
        const { data: existing } = await supabase
          .from('signatures')
          .select('id, status, auco_document_id')
          .eq('auco_document_id', doc.id)
          .single()

        const signatureData = {
          auco_document_id: doc.id,
          signer_email: signer.email,
          signer_name: signer.name || signer.email,
          status: status,
          document_url: doc.download_url || null,
          signed_at: doc.completed_at ? new Date(doc.completed_at).toISOString() : null,
          metadata: {
            auco_status: doc.status,
            auco_created_at: doc.created_at,
            auco_updated_at: doc.updated_at,
            template_id: doc.template_id,
          }
        }

        if (existing) {
          // Update existing signature
          const { error: updateError } = await supabase
            .from('signatures')
            .update(signatureData)
            .eq('id', existing.id)

          if (updateError) {
            console.error('❌ Error updating signature:', updateError)
            errorCount++
          } else {
            console.log('✅ Updated signature:', existing.id)
            updatedCount++
          }
        } else {
          // Insert new signature
          const { error: insertError } = await supabase
            .from('signatures')
            .insert({
              ...signatureData,
              user_id: user.id,
              created_at: new Date(doc.created_at).toISOString(),
            })

          if (insertError) {
            console.error('❌ Error inserting signature:', insertError)
            errorCount++
          } else {
            console.log('✅ Inserted new signature:', doc.id)
            syncedCount++
          }
        }
      } catch (error) {
        console.error('❌ Error processing document:', doc.id, error)
        errorCount++
      }
    }

    console.log('✅ Sync completed:', { syncedCount, updatedCount, errorCount })

    return NextResponse.json({
      success: true,
      message: 'Signatures synced successfully',
      stats: {
        total: documents.length,
        synced: syncedCount,
        updated: updatedCount,
        errors: errorCount,
      }
    })

  } catch (error) {
    console.error('❌ Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get signature counts
    const { count: totalCount } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true })

    const { count: pendingCount } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: completedCount } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount || 0,
        pending: pendingCount || 0,
        completed: completedCount || 0,
      }
    })

  } catch (error) {
    console.error('❌ Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
