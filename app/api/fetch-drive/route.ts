import { NextRequest, NextResponse } from 'next/server';

function extractGoogleDocId(url: string): string | null {
  const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) return docMatch[1];
  const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch) return sheetMatch[1];
  return null;
}

function isGoogleSheet(url: string): boolean {
  return url.includes('/spreadsheets/');
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'No URL provided.' }, { status: 400 });
    }

    const docId = extractGoogleDocId(url);
    if (!docId) {
      return NextResponse.json(
        { error: 'Could not find a Google Doc or Sheet ID in that URL. Make sure the link is a shareable Google Drive URL.' },
        { status: 400 }
      );
    }

    const exportFormat = isGoogleSheet(url) ? 'csv' : 'txt';
    const exportBase = isGoogleSheet(url)
      ? `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`
      : `https://docs.google.com/document/d/${docId}/export?format=txt`;

    const response = await fetch(exportBase, {
      headers: { 'User-Agent': 'CW-Discovery-Tool/1.0' },
    });

    if (response.status === 403 || response.status === 401) {
      return NextResponse.json(
        {
          error:
            'This document is not publicly accessible. In Google Drive, click Share → "Anyone with the link" → Viewer, then try again.',
        },
        { status: 403 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Google returned status ${response.status}. Verify the link is shareable.` },
        { status: 400 }
      );
    }

    const text = await response.text();
    if (!text.trim()) {
      return NextResponse.json({ error: 'The document appears to be empty.' }, { status: 400 });
    }

    const name = `Google ${isGoogleSheet(url) ? 'Sheet' : 'Doc'} (${docId.slice(0, 8)}…)`;
    return NextResponse.json({ text: text.slice(0, 40000), name });
  } catch (err) {
    console.error('[fetch-drive]', err);
    return NextResponse.json({ error: 'Failed to fetch the document. Check the URL and try again.' }, { status: 500 });
  }
}
