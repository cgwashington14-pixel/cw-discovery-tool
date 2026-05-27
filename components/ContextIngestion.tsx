'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Link2, Upload, ClipboardPaste, X, Plus, Loader2,
  CheckCircle2, AlertCircle, Sparkles, FileText, Key,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { ContextSource, SynthesisResult } from '@/data/types';
import { cn } from '@/lib/utils';

type InputTab = 'drive' | 'upload' | 'paste';

export default function ContextIngestion() {
  const { session, addContextSource, removeContextSource, setSynthesis, clearSynthesis, setAnalyzing, setAnalyzeError } = useStore();
  const [activeTab, setActiveTab] = useState<InputTab>('drive');
  const [driveUrl, setDriveUrl] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const combinedContent = session.contextSources.map((s) => `--- ${s.name} ---\n${s.content}`).join('\n\n');

  // ── Fetch Google Drive doc ────────────────────────────────────────────────
  async function fetchDriveDoc() {
    if (!driveUrl.trim()) return;
    setDriveLoading(true);
    setDriveError(null);
    try {
      const res = await fetch('/api/fetch-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: driveUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setDriveError(data.error); return; }
      addContextSource({ id: crypto.randomUUID(), type: 'google-drive', name: data.name, content: data.text, addedAt: new Date().toISOString() });
      setDriveUrl('');
    } catch {
      setDriveError('Network error — check your connection.');
    } finally {
      setDriveLoading(false);
    }
  }

  // ── File upload ───────────────────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const text = await file.text();
      addContextSource({ id: crypto.randomUUID(), type: 'file-upload', name: file.name, content: text.slice(0, 40000), addedAt: new Date().toISOString() });
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── Add paste ─────────────────────────────────────────────────────────────
  function addPaste() {
    if (!pasteText.trim()) return;
    const preview = pasteText.slice(0, 60).replace(/\n/g, ' ');
    addContextSource({ id: crypto.randomUUID(), type: 'paste', name: `Pasted notes: "${preview}…"`, content: pasteText.trim(), addedAt: new Date().toISOString() });
    setPasteText('');
  }

  // ── Run synthesis ─────────────────────────────────────────────────────────
  async function runAnalysis() {
    if (!combinedContent.trim()) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('cw_api_key') : null;
      const key = apiKey || storedKey || undefined;
      if (apiKey) localStorage.setItem('cw_api_key', apiKey);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: combinedContent, apiKey: key }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'NO_API_KEY') { setShowApiKey(true); setAnalyzing(false); return; }
        setAnalyzeError(data.error ?? 'Analysis failed.');
        setAnalyzing(false);
        return;
      }

      setSynthesis(data as SynthesisResult);
    } catch {
      setAnalyzeError('Network error — check your connection.');
      setAnalyzing(false);
    }
  }

  const hasContext = session.contextSources.length > 0;
  const hasSynthesis = !!session.synthesis;

  return (
    <div className="rounded-2xl border border-[#E4E4E7] bg-white overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#7C3AED]" />
          <div>
            <h3 className="text-sm font-semibold">Bring in context</h3>
            <p className="text-xs text-[#A1A1AA]">Google Drive · file upload · paste</p>
          </div>
        </div>
        {hasSynthesis && (
          <button onClick={clearSynthesis} className="text-xs text-[#A1A1AA] hover:text-[#71717A] transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* If synthesis done, show summary instead of input UI */}
      {hasSynthesis && session.synthesis ? (
        <SynthesisSummary synthesis={session.synthesis} sources={session.contextSources} onClear={clearSynthesis} onRemoveSource={removeContextSource} />
      ) : (
        <div className="p-5 flex flex-col gap-5">
          {/* Input tabs */}
          <div className="flex gap-1 p-1 bg-[#F4F4F5] rounded-lg">
            {([['drive', 'Google Drive'], ['upload', 'Upload file'], ['paste', 'Paste text']] as [InputTab, string][]).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn('flex-1 text-xs font-medium py-1.5 rounded-md transition-all', activeTab === tab ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A]')}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'drive' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#71717A]">
                Paste a shareable Google Doc or Sheet link. The file must be set to <strong>"Anyone with the link"</strong> in Drive.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED20] transition-all">
                  <Link2 className="w-3.5 h-3.5 text-[#A1A1AA] flex-shrink-0" />
                  <input
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDriveDoc()}
                    placeholder="https://docs.google.com/document/d/…"
                    className="flex-1 text-xs bg-transparent outline-none placeholder:text-[#A1A1AA]"
                  />
                </div>
                <button
                  onClick={fetchDriveDoc}
                  disabled={!driveUrl.trim() || driveLoading}
                  className="px-3 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-medium hover:bg-[#6D28D9] disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  {driveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Add
                </button>
              </div>
              {driveError && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FEF2F2] text-xs text-[#DC2626]">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {driveError}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#71717A]">
                Upload TXT, MD, or CSV files. For PDFs or DOCX, copy-paste the content into the Paste tab.
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-[#E4E4E7] hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all text-sm text-[#71717A] hover:text-[#7C3AED]"
              >
                <Upload className="w-4 h-4" />
                Click to upload files
              </button>
              <input ref={fileRef} type="file" multiple accept=".txt,.md,.csv,.json" className="hidden" onChange={handleFileUpload} />
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#71717A]">
                Paste meeting notes, call transcripts, CRM notes, or any text about this customer.
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste notes from your last discovery call, account plan, or any relevant context…"
                rows={5}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED20] placeholder:text-[#A1A1AA] resize-none transition-all"
              />
              <button
                onClick={addPaste}
                disabled={!pasteText.trim()}
                className="self-start px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-medium hover:bg-[#6D28D9] disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Add notes
              </button>
            </div>
          )}

          {/* Added sources */}
          {hasContext && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#71717A]">Added ({session.contextSources.length})</p>
              {session.contextSources.map((src) => (
                <SourceChip key={src.id} source={src} onRemove={() => removeContextSource(src.id)} />
              ))}
            </div>
          )}

          {/* API key input (shown if missing) */}
          {showApiKey && (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
              <div className="flex items-center gap-2 text-xs font-medium text-[#92400E]">
                <Key className="w-3.5 h-3.5" />
                Anthropic API key required for synthesis
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-…"
                className="text-xs px-3 py-2 rounded-lg border border-[#FDE68A] bg-white outline-none focus:border-[#F59E0B] transition-all"
              />
              <p className="text-[10px] text-[#A1A1AA]">Stored locally in your browser. Never sent anywhere except the analysis endpoint.</p>
            </div>
          )}

          {/* Analyze button */}
          {hasContext && (
            <button
              onClick={runAnalysis}
              disabled={session.isAnalyzing}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#18181B] text-white text-sm font-medium hover:bg-[#27272A] disabled:opacity-60 transition-all"
            >
              {session.isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Claude…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Synthesize & adapt discovery
                </>
              )}
            </button>
          )}

          {session.analyzeError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {session.analyzeError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SourceChip({ source, onRemove }: { source: ContextSource; onRemove: () => void }) {
  const icons = { 'google-drive': Link2, 'file-upload': Upload, paste: ClipboardPaste };
  const Icon = icons[source.type];
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE]">
      <Icon className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
      <span className="text-xs text-[#6D28D9] flex-1 truncate">{source.name}</span>
      <span className="text-[10px] text-[#A78BFA]">{Math.round(source.content.length / 1000)}k chars</span>
      <button onClick={onRemove} className="text-[#A78BFA] hover:text-[#7C3AED] transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function SynthesisSummary({
  synthesis,
  sources,
  onClear,
  onRemoveSource,
}: {
  synthesis: SynthesisResult;
  sources: ContextSource[];
  onClear: () => void;
  onRemoveSource: (id: string) => void;
}) {
  const TRACK_LABELS: Record<string, string> = {
    solicitations: 'Contract Solicitations',
    'third-party-review': 'Third-Party Contract Review',
    'drafting-approvals': 'Drafting & Approvals',
  };
  const CONFIDENCE_COLORS: Record<string, string> = {
    high: 'text-[#059669] bg-[#ECFDF5]',
    medium: 'text-[#D97706] bg-[#FFFBEB]',
    low: 'text-[#71717A] bg-[#F4F4F5]',
  };

  const knownCount = Object.keys(synthesis.knownAnswers).length;

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Success header */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#059669]" />
        <span className="text-sm font-semibold text-[#059669]">Synthesis complete</span>
        <span className="ml-auto text-xs text-[#A1A1AA]">{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Context summary */}
      <p className="text-sm text-[#3F3F46] leading-relaxed">{synthesis.contextSummary}</p>

      {/* Agency context */}
      {(synthesis.agencyContext.agencyName || synthesis.agencyContext.currentSystem || synthesis.agencyContext.agencyType) && (
        <div className="grid grid-cols-2 gap-2">
          {synthesis.agencyContext.agencyName && <Pill label="Agency" value={synthesis.agencyContext.agencyName} />}
          {synthesis.agencyContext.agencyType && <Pill label="Type" value={synthesis.agencyContext.agencyType} />}
          {synthesis.agencyContext.currentSystem && <Pill label="System" value={synthesis.agencyContext.currentSystem} />}
          {synthesis.agencyContext.region && <Pill label="Region" value={synthesis.agencyContext.region} />}
        </div>
      )}

      {/* Recommended track */}
      {synthesis.recommendedTrack && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-[#7C3AED] uppercase tracking-wider">Recommended track</p>
            <p className="text-sm font-semibold text-[#18181B] mt-0.5">{TRACK_LABELS[synthesis.recommendedTrack]}</p>
          </div>
          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider', CONFIDENCE_COLORS[synthesis.trackConfidence])}>
            {synthesis.trackConfidence} confidence
          </span>
        </div>
      )}

      {/* Pre-answered questions count */}
      {knownCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-[#71717A]">
          <FileText className="w-3.5 h-3.5" />
          <span><strong className="text-[#18181B]">{knownCount} question{knownCount !== 1 ? 's' : ''}</strong> pre-answered from your notes</span>
        </div>
      )}

      {/* Key insights */}
      {synthesis.keyInsights.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Already known</p>
          <ul className="flex flex-col gap-1">
            {synthesis.keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#3F3F46]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps to explore */}
      {synthesis.gapsToExplore.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Still needs discovery</p>
          <ul className="flex flex-col gap-1">
            {synthesis.gapsToExplore.map((gap, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#3F3F46]">
                <span className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#F59E0B] font-bold text-[10px] leading-none flex items-center justify-center">?</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onClear} className="text-xs text-[#A1A1AA] hover:text-[#71717A] transition-colors self-start">
        ← Clear and start over
      </button>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-2.5 py-2 rounded-lg bg-[#F4F4F5]">
      <span className="text-[9px] font-semibold text-[#A1A1AA] uppercase tracking-wider">{label}</span>
      <span className="text-xs font-medium text-[#18181B] truncate">{value}</span>
    </div>
  );
}
