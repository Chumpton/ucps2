// ============================================================
//  Supabase Edge Function: push-to-notion
//  Triggered by a Supabase Database Webhook on INSERT to email_list
//
//  Deploy with:
//    supabase functions deploy push-to-notion
//
//  Set secrets with:
//    supabase secrets set NOTION_TOKEN=secret_xxx
//    supabase secrets set NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
    try {
        // Supabase DB webhook sends the new row as JSON in the body
        const payload = await req.json();

        // The new row is in payload.record
        const record = payload.record;
        if (!record || !record.email) {
            return new Response('No email in payload', { status: 200 });
        }

        const NOTION_TOKEN = Deno.env.get('NOTION_TOKEN') ?? '';
        const NOTION_DATABASE_ID = Deno.env.get('NOTION_DATABASE_ID') ?? '';

        // Build the Notion page properties
        // Adjust property names to match your Notion database columns
        const notionBody = {
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
                // "Name" column (title type)
                'Email': {
                    title: [{ text: { content: record.email } }]
                },
                // "Source" column (rich_text type)
                'Source': {
                    rich_text: [{ text: { content: record.source ?? 'unknown' } }]
                },
                // "Date" column (date type)
                'Date': {
                    date: { start: record.created_at ?? new Date().toISOString() }
                },
            }
        };

        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notionBody),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Notion API error:', err);
            return new Response(`Notion error: ${err}`, { status: 500 });
        }

        console.log(`[push-to-notion] Added ${record.email} (${record.source})`);
        return new Response('OK', { status: 200 });

    } catch (e) {
        console.error('Edge function error:', e);
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
});
