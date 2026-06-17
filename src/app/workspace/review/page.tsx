'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getAIPause, submitAnswers, submitPrompt, createPaymentOrder, startRender, getProject, getClips } from '@/lib/api';
import { AIPauseQuestion, Project } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, ChevronDown, ChevronUp, Film, Scissors, Zap } from 'lucide-react';

function DraftVideoPlayer({ projectId, jobId, draftKey, onReady }: { projectId: string; jobId: string | null; draftKey?: number; onReady?: () => void }) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const MAX_RETRIES = 30;

    // Heartbeat: runs once on mount
    useEffect(() => {
        if (!projectId || projectId === 'test-project-123') return;
        let heartbeatTimer: NodeJS.Timeout | null = null;
        const API_BASE_URL = 'http://127.0.0.1:8000';
        let cachedToken: string | null = null;
        import('@/lib/api').then(({ getAuthToken }) => {
            getAuthToken().then(token => {
                cachedToken = token;
                fetch(`${API_BASE_URL}/projects/${projectId}/heartbeat`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
                heartbeatTimer = setInterval(() => {
                    fetch(`${API_BASE_URL}/projects/${projectId}/heartbeat`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
                }, 10000);
            });
        });
        const handleBeforeUnload = () => {
            if (cachedToken) navigator.sendBeacon(`${API_BASE_URL}/projects/${projectId}/cancel_draft`, new Blob([JSON.stringify({ token: cachedToken })], { type: 'application/json' }));
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (cachedToken) fetch(`${API_BASE_URL}/projects/${projectId}/cancel_draft`, { method: 'POST', keepalive: true, headers: { Authorization: `Bearer ${cachedToken}` } }).catch(() => {});
        };
    }, [projectId]);

    // Draft video fetching
    useEffect(() => {
        let isMounted = true;
        let pollTimer: NodeJS.Timeout | null = null;
        let attempts = 0;

        const fetchDraft = async (): Promise<boolean> => {
            if (!projectId) return false;
            if (projectId === 'test-project-123') {
                if (isMounted) { setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'); setLoading(false); onReady?.(); }
                return true;
            }
            try {
                if (jobId) {
                    const { getJobStatus } = await import('@/lib/api');
                    const jobInfo = await getJobStatus(jobId);
                    if (jobInfo.state === 'cancelled') { if (isMounted) setErrorMsg('Draft render was cancelled.'); return true; }
                    if (jobInfo.state === 'failed') { if (isMounted) setErrorMsg('Draft render failed: ' + (jobInfo.message || 'Unknown error')); return true; }
                }
                const { getAuthToken } = await import('@/lib/api');
                const token = await getAuthToken();
                const API_BASE_URL = 'http://127.0.0.1:8000';
                const res = await fetch(`${API_BASE_URL}/projects/${projectId}/draft`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        let url = data.draft_url;
                        if (url && url.startsWith('/')) url = `${API_BASE_URL}${url}`;
                        setVideoUrl(url);
                        setLoading(false);
                        onReady?.();
                    }
                    return true;
                }
            } catch { /* silent */ }
            return false;
        };

        const attemptFetch = async () => {
            const success = await fetchDraft();
            if (!success && isMounted && !errorMsg && projectId) {
                attempts++;
                if (isMounted) setLoading(false);
                if (attempts < MAX_RETRIES) pollTimer = setTimeout(attemptFetch, 3000);
                else if (isMounted) setErrorMsg('Render timeout. Please try again.');
            }
        };

        if (projectId) { if (isMounted) { setLoading(true); setErrorMsg(null); } attempts = 0; attemptFetch(); }
        return () => { isMounted = false; if (pollTimer) clearTimeout(pollTimer); };
    }, [projectId, draftKey, jobId]);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {loading && !errorMsg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]">
                    <div className="relative w-10 h-10">
                        <div className="w-16 h-16 border border-[#f0b429]/20 rounded-full animate-ping absolute -inset-3" />
                        <div className="w-10 h-10 border-2 border-[#f0b429]/60 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <span className="text-white/40 text-sm mt-8 font-bold tracking-widest uppercase">Loading Draft…</span>
                </div>
            )}
            {!loading && videoUrl && !errorMsg && (
                <video src={videoUrl} controls autoPlay={false} className="w-full h-full object-contain bg-black" />
            )}
            {!loading && !videoUrl && !errorMsg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]">
                    <span className="text-white/30 font-bebas-neue tracking-widest text-3xl">RENDER PENDING</span>
                    <span className="text-white/20 text-sm mt-2">Your draft is being assembled…</span>
                </div>
            )}
            {errorMsg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 px-6 text-center">
                    <span className="text-red-400 font-bebas-neue tracking-widest text-2xl mb-2">RENDER FAILED</span>
                    <span className="text-white/60 text-sm">{errorMsg}</span>
                </div>
            )}
            <div className="absolute bottom-3 right-3 text-white/20 text-[10px] font-bold tracking-widest pointer-events-none select-none">
                CINEMA AI
            </div>
        </div>
    );
}

export default function ReviewScreen() {
    const router = useRouter();
    const { projectId, setCurrentStep, setJobId } = useStore();
    const [mounted, setMounted] = useState(false);
    const [videoReady, setVideoReady] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const [questions, setQuestions] = useState<AIPauseQuestion[]>([]);
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [doneQuestions, setDoneQuestions] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [draftKey, setDraftKey] = useState(0);
    const [isPaying, setIsPaying] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [clips, setClips] = useState<any[]>([]);
    const [edl, setEdl] = useState<any[]>([]);
    const [disabledClips, setDisabledClips] = useState<Set<number>>(new Set());
    const [previewError, setPreviewError] = useState<string | null>(null);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60), secs = Math.floor(seconds % 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    useEffect(() => {
        if (!mounted) return;
        if (!projectId) { router.push('/workspace'); return; }
        setCurrentStep('review');
        getProject(projectId).then(setProject).catch(console.error);
        getClips(projectId).then(setClips).catch(console.error);
        import('@/lib/api').then(({ getAuthToken }) => {
            getAuthToken().then(token => {
                fetch(`http://127.0.0.1:8000/projects/${projectId}/edl`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(r => r.json()).then(d => { if (Array.isArray(d)) setEdl(d); }).catch(console.error);
            });
        });
        getAIPause(projectId).then(res => {
            if (res.questions && res.questions.length > 0) setQuestions(res.questions);
            else setDoneQuestions(true);
        }).catch(err => {
            if (err.message?.toLowerCase().includes('preview limit')) setPreviewError(err.message);
            else setDoneQuestions(true);
        });
    }, [mounted, projectId, router, setCurrentStep]);

    const handleAnswer = (qId: string, answer: string) => {
        const newAnswers = { ...answers, [qId]: answer };
        setAnswers(newAnswers);
        if (currentQIdx < questions.length - 1) setCurrentQIdx(currentQIdx + 1);
        else { submitAnswers(projectId!, newAnswers).catch(console.error); setDoneQuestions(true); }
    };

    const handlePaymentAndRender = async () => {
        if (!projectId) return;
        setIsPaying(true);
        try {
            if (customPrompt) await submitPrompt(projectId, customPrompt);
            await createPaymentOrder(projectId);
            const { job_id } = await startRender(projectId, { aspectRatio: '16:9', subtitles: false, mood: 'cinematic' });
            setJobId(job_id);
            router.push('/workspace/done');
        } catch (err) { console.error('Render failed:', err); }
        finally { setIsPaying(false); }
    };

    return (
        <div className="h-screen bg-[#060606] text-white font-dm-sans flex flex-col overflow-hidden">

            {/* ── TOP NAV ── */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a] shrink-0 z-50">
                <div className="flex items-center space-x-3">
                    <Film className="h-5 w-5 text-[#f0b429]" />
                    <span className="font-bebas-neue tracking-widest text-xl pt-1">CINEMA AI</span>
                    <span className="text-[10px] font-bold text-[#f0b429] border border-[#f0b429]/30 px-2.5 py-0.5 rounded-full tracking-widest">DIRECTOR'S TABLE</span>
                </div>
                <div className="flex items-center space-x-3">
                    {videoReady && (
                        <span className="flex items-center space-x-1.5 text-green-400 text-xs font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span>DRAFT READY</span>
                        </span>
                    )}
                </div>
            </header>

            {/* ── SPLIT PANE ── */}
            <div className="flex-1 flex overflow-hidden min-h-0">

                {/* LEFT: VIDEO (dominant) */}
                <div className="flex-1 flex flex-col bg-black relative min-w-0">
                    <div className="flex-1 relative overflow-hidden">
                        {isRegenerating && (
                            <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                                <div className="w-12 h-12 border-4 border-[#f0b429] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[#f0b429] font-bold tracking-widest uppercase">Applying Changes…</p>
                                <p className="text-white/50 text-sm mt-2">AI is rebuilding your draft</p>
                            </div>
                        )}
                        <DraftVideoPlayer projectId={projectId!} jobId={useStore.getState().jobId} draftKey={draftKey} onReady={() => setVideoReady(true)} />
                    </div>
                    {/* Status bar */}
                    <div className="h-10 border-t border-white/5 flex items-center px-4 space-x-4 bg-[#080808] shrink-0">
                        {project && (
                            <>
                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{project.name}</span>
                                <span className="text-gray-800">·</span>
                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{project.mode || 'highlight'} mode</span>
                                {project.cuts_count && (<><span className="text-gray-800">·</span><span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{project.cuts_count} cuts</span></>)}
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT: CONTROL SIDEBAR */}
                <div className="w-[380px] shrink-0 border-l border-white/5 bg-[#0a0a0a] overflow-y-auto flex flex-col">

                    {previewError ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                <Zap className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Preview Limit Reached</h2>
                            <p className="text-gray-500 text-sm mb-6">{previewError}</p>
                            <button onClick={() => router.push('/workspace')} className="w-full py-3 rounded-xl bg-white/5 text-white font-bold mb-2 hover:bg-white/10 transition-all text-sm">Back to Workspace</button>
                            <button className="w-full py-3 rounded-xl bg-[#f0b429] text-black font-bold hover:bg-[#ffcc44] transition-all text-sm">Upgrade to PRO</button>
                        </div>

                    ) : !videoReady ? (
                        <div className="p-6 space-y-4">
                            <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
                            <div className="h-3 bg-white/5 rounded-full w-1/2 animate-pulse" />
                            <div className="mt-6 h-24 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                            <div className="h-24 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                            <p className="text-[10px] text-gray-700 text-center font-bold uppercase tracking-widest pt-4">Waiting for draft…</p>
                        </div>

                    ) : !doneQuestions ? (
                        /* AI OBSERVATION QUESTIONS — only show after video is ready */
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col p-6">
                            <div className="w-full h-0.5 bg-white/5 rounded-full mb-6 overflow-hidden">
                                <motion.div className="h-full bg-[#f0b429]" initial={{ width: 0 }} animate={{ width: `${(currentQIdx / (questions.length || 1)) * 100}%` }} />
                            </div>
                            <div className="flex items-center space-x-2 mb-6">
                                <Sparkles className="w-4 h-4 text-[#f0b429]" />
                                <span className="text-[10px] font-bold text-[#f0b429] tracking-widest uppercase">AI Observation {currentQIdx + 1} of {questions.length}</span>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                                    <h3 className="text-2xl font-bebas-neue tracking-wide text-white mb-2 leading-snug">
                                        {questions[currentQIdx]?.question || 'Is the pacing OK?'}
                                    </h3>
                                    {questions[currentQIdx]?.context && <p className="text-gray-500 text-sm mb-6">{questions[currentQIdx].context}</p>}
                                </motion.div>
                            </AnimatePresence>
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button onClick={() => handleAnswer(questions[currentQIdx]?.id || String(currentQIdx), 'Modify')} className="py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">Change It</button>
                                <button onClick={() => handleAnswer(questions[currentQIdx]?.id || String(currentQIdx), 'Keep')} className="py-4 bg-[#f0b429]/15 border border-[#f0b429]/50 text-[#f0b429] rounded-2xl font-bold text-sm hover:bg-[#f0b429]/25 transition-all shadow-[0_0_20px_rgba(240,180,41,0.1)]">Keep As Is</button>
                            </div>
                        </motion.div>

                    ) : (
                        /* POST-QUESTIONS ACTIONS */
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-5 space-y-4">

                            <div className="flex items-center space-x-2 text-green-400 py-2">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-bold text-sm tracking-widest uppercase">Draft Approved</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <StatPill label="Est. Length" value={(project?.estimated_duration || project?.duration) ? formatDuration(project?.estimated_duration || project?.duration || 0) : '—'} />
                                <StatPill label="Silence Cut" value={project?.silence_removed ? formatDuration(project.silence_removed) : '0s'} />
                                <StatPill label="Cuts Made" value={`${project?.cuts_count || 0}`} />
                                <StatPill label="Style" value={project?.style || 'Cinematic'} gold />
                            </div>

                            {/* Timeline strip */}
                            {edl.length > 0 && (
                                <div className="bg-[#080808] border border-white/5 rounded-2xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <Scissors className="w-4 h-4 text-[#f0b429]" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                Timeline ({edl.filter((_: any, i: number) => !disabledClips.has(i)).length}/{edl.length})
                                            </span>
                                        </div>
                                        {disabledClips.size > 0 && <span className="text-[10px] text-red-400 font-bold">{disabledClips.size} removed</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-700 mb-3">Tap a clip to remove it</p>
                                    <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-hide">
                                        {edl.map((clip: any, i: number) => {
                                            const dur = (clip.end_time - clip.start_time).toFixed(1);
                                            const w = Math.max(32, Math.min(100, parseFloat(dur) * 8));
                                            const isOff = disabledClips.has(i);
                                            return (
                                                <button key={i} onClick={() => setDisabledClips(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                                                    style={{ width: `${w}px` }}
                                                    className={`h-14 shrink-0 rounded-lg flex flex-col justify-end p-1.5 transition-all border text-left ${isOff ? 'bg-red-900/20 border-red-500/20 opacity-30' : clip.type === 'b-roll' ? 'bg-blue-500/15 border-blue-500/20 hover:border-blue-400/50' : 'bg-white/5 border-white/10 hover:border-[#f0b429]/40'}`}>
                                                    <span className={`text-[8px] font-bold ${isOff ? 'text-red-400' : clip.type === 'b-roll' ? 'text-blue-400' : 'text-gray-500'}`}>{isOff ? '✕' : dur + 's'}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {disabledClips.size > 0 && (
                                        <button disabled={isRegenerating} onClick={async () => {
                                            if (!projectId) return; setIsRegenerating(true);
                                            try {
                                                const { getAuthToken } = await import('@/lib/api'); const token = await getAuthToken(); const BASE = 'http://127.0.0.1:8000';
                                                const modifiedEdl = edl.filter((_: any, i: number) => !disabledClips.has(i));
                                                await fetch(`${BASE}/projects/${projectId}/edl`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(modifiedEdl) });
                                                const { job_id } = await startRender(projectId, { aspectRatio: '16:9', subtitles: false, mood: 'cinematic', is_draft: true });
                                                const interval = setInterval(async () => { try { const res = await fetch(`${BASE}/jobs/${job_id}`, { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { const d = await res.json(); if (d.state === 'done') { clearInterval(interval); setIsRegenerating(false); setDraftKey(p => p + 1); setDisabledClips(new Set()); getProject(projectId).then(setProject).catch(console.error); } else if (d.state === 'failed') { clearInterval(interval); setIsRegenerating(false); } } } catch {} }, 3000);
                                            } catch { setIsRegenerating(false); }
                                        }} className="w-full mt-3 py-2.5 bg-[#f0b429]/10 border border-[#f0b429]/30 text-[#f0b429] rounded-xl font-bold text-xs hover:bg-[#f0b429]/20 transition-all flex items-center justify-center space-x-2">
                                            <Sparkles className="w-3.5 h-3.5" /><span>Re-Render Without {disabledClips.size} Clip{disabledClips.size > 1 ? 's' : ''}</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Director's Prompt */}
                            <div className="bg-[#080808] border border-white/5 rounded-2xl overflow-hidden">
                                <button onClick={() => setShowPrompt(!showPrompt)} className="w-full p-4 flex items-center justify-between text-sm font-bold text-white hover:bg-white/5 transition-colors">
                                    <span className="flex items-center space-x-2"><Sparkles className="w-4 h-4 text-[#f0b429]" /><span>Director's Prompt</span></span>
                                    {showPrompt ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                                </button>
                                {showPrompt && (
                                    <div className="px-4 pb-4 border-t border-white/5">
                                        <div className="flex flex-wrap gap-2 my-3">
                                            {['Faster pacing', 'Shorter', 'More B-roll', 'Cut silence'].map(opt => (
                                                <button key={opt} onClick={() => setCustomPrompt(p => p ? `${p}, ${opt}` : opt)} className="text-[10px] font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full hover:bg-white/10 transition-colors">{opt}</button>
                                            ))}
                                        </div>
                                        <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Tell AI what to change…" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#f0b429]/40 text-white min-h-[80px] resize-none" />
                                        <button disabled={!customPrompt.trim() || isRegenerating} onClick={async () => {
                                            if (!projectId || !customPrompt.trim()) return; setIsRegenerating(true);
                                            try {
                                                await submitPrompt(projectId, customPrompt);
                                                const { job_id } = await startRender(projectId, { aspectRatio: '16:9', subtitles: false, mood: 'cinematic', is_draft: true });
                                                const BASE = 'http://127.0.0.1:8000'; const { getAuthToken } = await import('@/lib/api'); const token = await getAuthToken();
                                                const interval = setInterval(async () => { try { const res = await fetch(`${BASE}/jobs/${job_id}`, { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { const d = await res.json(); if (d.state === 'done') { clearInterval(interval); setIsRegenerating(false); setDraftKey(p => p + 1); getProject(projectId).then(setProject).catch(console.error); } else if (d.state === 'failed') { clearInterval(interval); setIsRegenerating(false); } } } catch {} }, 2500);
                                            } catch { setIsRegenerating(false); }
                                        }} className="mt-3 w-full py-2.5 bg-[#f0b429]/10 border border-[#f0b429]/30 text-[#f0b429] font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#f0b429]/20 transition-all disabled:opacity-30 flex items-center justify-center space-x-2">
                                            {isRegenerating ? (<><div className="w-3.5 h-3.5 border border-[#f0b429] border-t-transparent rounded-full animate-spin" /><span>Generating…</span></>) : <span>Apply &amp; Regenerate</span>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="mt-auto pt-2">
                                <button disabled={isPaying} onClick={handlePaymentAndRender} className="w-full bg-gradient-to-r from-[#f0b429] to-[#d49917] text-black py-4 rounded-2xl font-bold text-base hover:opacity-90 transition-all shadow-[0_0_30px_rgba(240,180,41,0.2)] disabled:opacity-40 flex flex-col items-center space-y-0.5">
                                    {isPaying ? (
                                        <span className="flex items-center space-x-2"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /><span>Processing…</span></span>
                                    ) : (
                                        <>
                                            <span className="flex items-center">Render Final Video <ArrowRight className="ml-2 w-4 h-4" /></span>
                                            <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                                                {process.env.NODE_ENV === 'development' ? 'Free in Dev Mode' : 'Pay ₹199'}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatPill({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
    return (
        <div className="bg-[#080808] border border-white/5 rounded-xl p-3">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-xl font-bebas-neue tracking-wider ${gold ? 'text-[#f0b429]' : 'text-white'}`}>{value}</p>
        </div>
    );
}
