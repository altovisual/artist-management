import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  const { record } = await req.json();
  log("Request payload:", { record });

  if (!record || !record.id) {
    log("Invalid payload received.");
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  const filePath = record.name;
  const userId = record.owner;
  log("Processing file:", { filePath, userId });

  const { data: fileData, error: fileError } = await supabase.storage
    .from('royalty-reports')
    .download(filePath);

  if (fileError) {
    log("Error downloading file:", fileError);
    return new Response(JSON.stringify({ error: 'Failed to download file' }), { status: 500 });
  }
  log("File downloaded successfully.");

  const fileContent = await fileData.text();
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  const headers = lines.shift()?.trim().split(/,|	| /) || [];
  log("Parsed headers:", headers);

  const reportType = determineReportType(headers);
  log("Determined report type:", reportType);

  if (reportType === 'royalty') {
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (artistError || !artist) {
      log("Error fetching artist for user:", { userId, artistError });
      return new Response(JSON.stringify({ error: 'Failed to find artist for user' }), { status: 500 });
    }
    log("Artist found:", artist);

    const royaltyData = lines.map(line => {
      const values = line.split(/, |\t| /);
      const report = {
        artist_id: artist.id,
        report_id: record.id,
        song_title: values[headers.indexOf('song_title')],
        platform: values[headers.indexOf('platform')],
        country: values[headers.indexOf('country')],
        revenue: parseFloat(values[headers.indexOf('revenue')])
      };
      return report;
    });
    log("Parsed royalty data:", royaltyData);

    const { error: royaltyError } = await supabase.from('royalties').insert(royaltyData);

    if (royaltyError) {
      log("Error inserting royalty data:", royaltyError);
      return new Response(JSON.stringify({ error: 'Failed to insert royalty data' }), { status: 500 });
    }
    log("Royalty data inserted successfully.");

  } else if (reportType === 'audience') {
    log("Executing audience report logic.");
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (artistError || !artist) {
      log("Error fetching artist for user:", { userId, artistError });
      return new Response(JSON.stringify({ error: 'Failed to find artist for user' }), { status: 500 });
    }
    log("Artist found:", artist);

    const audienceData = lines.map(line => {
      const values = line.split(/, |\t| /);
      const report = {
        artist_id: artist.id,
      };
      headers.forEach((header, index) => {
        const key = header.trim().toLowerCase().replace(/\s+/g, '_');
        if (key === 'date') {
          report['report_date'] = values[index];
        } else {
          report[key] = values[index] ? parseInt(values[index], 10) || 0 : 0;
        }
      });
      return report;
    });
    log("Parsed audience data:", audienceData);

    const { error: audienceError } = await supabase.from('audience_reports').insert(audienceData);

    if (audienceError) {
      log("Error inserting audience data:", audienceError);
      return new Response(JSON.stringify({ error: 'Failed to insert audience data' }), { status: 500 });
    }
    log("Audience data inserted successfully.");

  } else {
    log("Unknown report format.");
    return new Response(JSON.stringify({ error: 'Unknown or invalid report format' }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
