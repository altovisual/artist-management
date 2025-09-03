import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Papa from 'https://esm.sh/papaparse@5.3.2'

// Log function for debugging
const log = (message, data = null) => {
  console.log(message, JSON.stringify(data, null, 2));
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const ROYALTIES_HEADERS = ['song_title', 'platform', 'country', 'revenue'];
const AUDIENCE_HEADERS = ['date', 'listeners', 'streams', 'followers'];

function determineReportType(headers) {
  const lowercasedHeaders = headers.map(h => h.trim().toLowerCase().replace(/"/g, ''));
  log("Determining report type from headers:", lowercasedHeaders);

  const hasMinRoyaltyHeaders = ROYALTIES_HEADERS.every(h => lowercasedHeaders.includes(h));
  if (hasMinRoyaltyHeaders) {
    log("Report type identified as: royalty");
    return 'royalty';
  }

  const hasMinAudienceHeaders = AUDIENCE_HEADERS.every(h => lowercasedHeaders.includes(h));
  if (hasMinAudienceHeaders) {
    log("Report type identified as: audience");
    return 'audience';
  }

  log("Report type identified as: unknown");
  return 'unknown';
}

serve(async (req) => {
  log("Function invoked.");
  const { record: storageRecord } = await req.json();
  log("Request payload:", { storageRecord });

  if (!storageRecord || !storageRecord.id) {
    log("Invalid payload received.");
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  const filePath = storageRecord.name;
  const userId = storageRecord.owner;
  log("Processing file:", { filePath, userId });

  let reportId;

  try {
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (artistError || !artist) {
      throw new Error(`Failed to find artist for user: ${userId}`);
    }
    log("Artist found:", artist);

    // Create royalty report record
    const { data: report, error: reportError } = await supabase
      .from('royalty_reports')
      .insert({
        artist_id: artist.id,
        file_name: filePath,
        user_id: userId,
        status: 'processing'
      })
      .select('id')
      .single();

    if (reportError || !report) {
      throw new Error(`Failed to create royalty report: ${reportError?.message}`);
    }
    reportId = report.id;
    log("Royalty report created:", { reportId });


    const { data: fileData, error: fileError } = await supabase.storage
      .from('royalty-reports')
      .download(filePath);

    if (fileError) {
      throw new Error(`Failed to download file: ${fileError.message}`);
    }
    log("File downloaded successfully.");

    const fileContent = await fileData.text();
    
    const { data: parsedData, errors } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.toLowerCase().trim().replace(/\s+/g, '_')
    });

    if (errors.length > 0) {
      log("Parsing errors:", errors);
      throw new Error('Failed to parse CSV file');
    }

    const headers = Object.keys(parsedData[0] || {});
    const reportType = determineReportType(headers);
    log("Determined report type:", reportType);

    if (reportType === 'royalty') {
      const royaltyData = parsedData.map(row => ({
        artist_id: artist.id,
        report_id: reportId,
        song_title: row.song_title,
        platform: row.platform,
        country: row.country,
        revenue: parseFloat(row.revenue)
      }));
      log("Parsed royalty data:", royaltyData);

      const { error: royaltyError } = await supabase.from('royalties').insert(royaltyData);
      if (royaltyError) throw new Error(`Failed to insert royalty data: ${royaltyError.message}`);
      log("Royalty data inserted successfully.");

    } else if (reportType === 'audience') {
      const audienceData = parsedData.map(row => ({
        artist_id: artist.id,
        report_id: reportId, // Assuming audience reports also have a report_id
        report_date: row.date,
        listeners: parseInt(row.listeners, 10) || 0,
        streams: parseInt(row.streams, 10) || 0,
        followers: parseInt(row.followers, 10) || 0,
      }));
      log("Parsed audience data:", audienceData);

      const { error: audienceError } = await supabase.from('audience_reports').insert(audienceData);
      if (audienceError) throw new Error(`Failed to insert audience data: ${audienceError.message}`);
      log("Audience data inserted successfully.");

    } else {
      throw new Error('Unknown or invalid report format');
    }

    await supabase.from('royalty_reports').update({ status: 'processed' }).eq('id', reportId);
    log("Report status updated to processed.");

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    log("Error processing report:", { message: error.message });
    if (reportId) {
      await supabase.from('royalty_reports').update({ status: 'failed', error_message: error.message }).eq('id', reportId);
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});