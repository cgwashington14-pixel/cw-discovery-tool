import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Compact question schema sent to Claude so it can map content to IDs
const QUESTION_MAP = `
TRACK: solicitations
sol-01 — How procurement need is identified | options: budget-cycle, dept-request, emergency, grant
sol-02 — How solicitation document is created | options: central-templates, scattered-templates, from-scratch, third-party-system
sol-02b — Does procurement system connect to execution | options: connected, partial, not-connected
sol-03 — Who approves solicitation before publication | options: procurement-only, legal-procurement, three-plus, board
sol-04 — How status is tracked | options: procurement-system, email-thread, spreadsheet, no-tracking
sol-05 — How final contract is created after vendor selection | options: standard-contract, vendor-contract, legal-drafts, mixed
sol-06 — Where executed contracts are stored | options: dedicated-system, sharepoint-drive, email-attachments, physical-scan
sol-07 — How renewals and key dates are tracked | options: system-alerts, calendar, spreadsheet-dates, not-tracked

TRACK: third-party-review
tpr-01 — How third-party contracts arrive | options: email, portal, mail, mixed
tpr-02 — Who first receives incoming contracts | options: procurement, legal, dept-initiator, no-clear-owner
tpr-03 — How terms are compared to standard positions | options: formal-checklist, attorney-knowledge, side-by-side, no-process
tpr-04 — Risk flags the team looks for (multi-select) | options: unlimited-liability, auto-renewal, indemnification, termination
tpr-05 — Rounds of redlining | options: one-round, two-three, four-six, no-pattern
tpr-06 — Final approval authority | options: procurement-dir, county-attorney, city-manager, elected-board
tpr-07 — How obligations/renewals are tracked post-signing | options: automated-alerts, calendar-tickler, inconsistent, missed-before

TRACK: drafting-approvals
da-01 — Types of agreements most frequently drafted (multi-select) | options: service-vendor, construction, mou-iga, leases
da-02 — Whether standard templates exist | options: centrally-maintained, scattered, partial, no-templates
da-03 — Who can initiate a new draft | options: legal-procurement-only, dept-heads, any-staff-approval, unclear
da-04 — Typical internal approval chain | options: draft-legal-sign, draft-legal-dept-exec, draft-finance-legal-exec, custom
da-05 — How redlines and version control are managed | options: track-changes-shared, email-attachments, legal-manages, no-version-control
da-06 — Biggest bottleneck in drafting/approval | options: getting-started, legal-review-time, getting-signatures, finding-precedents
da-07 — How often past agreements are referenced | options: frequent-easy, frequent-hard, occasionally, rarely

PAIN POINT IDs:
email-tracking, no-templates, scattered-templates, manual-routing, approval-bottleneck, no-visibility,
static-storage, missing-renewals, no-risk-process, version-control, system-silos, manual-risk-review,
long-cycle, compliance-gaps, cant-find-contracts, deadline-pressure
`;

const SYSTEM_PROMPT = `You are an expert DocuSign Solutions Consultant analyzing pre-discovery context
about a state or local government customer. Your job is to extract structured intelligence from
raw notes, transcripts, or documents that will help an SC run a smarter discovery conversation.

Respond ONLY with valid JSON matching the schema provided. No markdown, no explanation, just JSON.`;

function buildUserPrompt(content: string): string {
  return `Analyze this discovery context and extract structured intelligence.

CONTENT TO ANALYZE:
---
${content.slice(0, 30000)}
---

QUESTION FRAMEWORK (track → question-id | valid answer option IDs):
${QUESTION_MAP}

Return a JSON object with this exact schema:
{
  "recommendedTrack": "solicitations" | "third-party-review" | "drafting-approvals" | null,
  "trackConfidence": "high" | "medium" | "low",
  "contextSummary": "2-3 sentence plain English summary of what was ingested and what it tells us",
  "keyInsights": ["3-5 specific things already known about this customer's workflow"],
  "gapsToExplore": ["3-5 areas not covered in the context that the SC should still probe"],
  "knownAnswers": {
    "question-id": "option-id"
  },
  "identifiedPainPoints": ["pain-point-id-1", "pain-point-id-2"],
  "agencyContext": {
    "agencyName": "name if mentioned, else null",
    "agencyType": "city | county | state-agency | school-district | other | null",
    "currentSystem": "any ERP, CLM, or procurement system mentioned",
    "teamSize": "estimated team size if mentioned",
    "region": "state or region if mentioned"
  }
}

Rules:
- Only include knownAnswers when you are confident the content clearly implies that answer
- identifiedPainPoints must use ONLY the IDs listed in the framework above
- If the content is a generic template or sample with no real customer data, set recommendedTrack to null and knownAnswers to {}
- gapsToExplore should be pointed questions the SC should ask, not generic advice`;
}

export async function POST(req: NextRequest) {
  try {
    const { content, apiKey } = await req.json();

    if (!content || typeof content !== 'string' || content.trim().length < 50) {
      return NextResponse.json({ error: 'Not enough content to analyze.' }, { status: 400 });
    }

    const key = process.env.ANTHROPIC_API_KEY || apiKey;
    if (!key) {
      return NextResponse.json(
        { error: 'NO_API_KEY', message: 'Anthropic API key required.' },
        { status: 401 }
      );
    }

    const client = new Anthropic({ apiKey: key });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(content) }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';

    let parsed;
    try {
      // Strip possible markdown code fences
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[analyze] Failed to parse Claude response:', rawText.slice(0, 500));
      return NextResponse.json({ error: 'Analysis returned unexpected format. Try again.' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('[analyze]', err);
    const msg = err instanceof Error ? err.message : 'Analysis failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
