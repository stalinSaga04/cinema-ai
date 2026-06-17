'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { createProject, uploadClip, startAnalysis } from '@/lib/api';
import {
    Film, Video, Headphones, Presentation, BookOpen, Monitor, Calendar,
    Clapperboard, MoreHorizontal, Upload, X, Loader2, ArrowRight, Zap, Play,
    ChevronDown, ChevronUp, Settings, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CONTENT_TYPES = [
    { id: 'podcast',      label: 'Podcast',      icon: Headphones },
    { id: 'tutorial',     label: 'Tutorial',     icon: Presentation },
    { id: 'vlog',         label: 'Vlog',         icon: Video },
    { id: 'lecture',      label: 'Lecture',      icon: BookOpen },
    { id: 'product_demo', label: 'Product Demo', icon: Monitor },
    { id: 'event',        label: 'Event',        icon: Calendar },
    { id: 'youtube',      label: 'YouTube',      icon: Clapperboard },
    { id: 'other',        label: 'Other',        icon: MoreHorizontal },
];
const STYLES = [
    { id: 'cinematic', label: 'Cinematic', desc: 'Slow, dramatic' },
    { id: 'fast_cut',  label: 'Fast Cut',  desc: 'Energetic' },
];
const OUTPUT_LENGTHS = [
    { id: 'short',     label: 'Short (< 5 min)' },
    { id: 'medium',    label: 'Medium (5-15 min)' },
    { id: 'long',      label: 'Long (15-30 min)' },
    { id: 'ai_decide', label: 'AI Decide' },
];
const MODES = [
    { id: 'highlight',  label: 'Highlight',  multiplier: '1.0x', ratio: 0.15, icon: Zap,          color: 'text-amber-400',  desc: 'Fast & punchy. Best for Reels.' },
    { id: 'smart_trim', label: 'Smart Trim', multiplier: '1.2x', ratio: 0.75, icon: Film,         color: 'text-blue-400',   desc: 'Clean video. Removes pauses.' },
    { id: 'story',      label: 'Story Mode', multiplier: '1.5x', ratio: 0.85, icon: Clapperboard, color: 'text-purple-400', desc: 'Full narrative & AI flow.' },
];
const PLAN_LIMITS = { max_upload_clips: 5, max_upload_minutes: 10, max_output_minutes: 2 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => { window.URL.revokeObjectURL(video.src); resolve(video.duration); };
        video.src = URL.createObjectURL(file);
    });

const formatDuration = (sec: number): string => {
    if (sec <= 0) return '0s';
    const m = Math.floor(sec / 60), s = Math.round(sec % 60);
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m} min`;
    return `${m}m ${s}s`;
};

// ─── Toast System ─────────────────────────────────────────────────────────────
type ToastType = 'error' | 'success' | 'info';
interface Toast { id: number; message: string; type: ToastType; }

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
    const icons = { error: AlertCircle, success: CheckCircle, info: Info };
    const colors = {
        error:   { bg: 'bg-red-500/10',   border: 'border-red-500/30',   text: 'text-red-400'   },
        success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
        info:    { bg: 'bg-blue-500/10',  border: 'border-blue-500/30',  text: 'text-blue-400'  },
    };
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => {
                    const Icon = icons[t.type];
                    const c = colors[t.type];
                    return (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 60, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.9 }}
                            className={`pointer-events-auto flex items-center space-x-3 ${c.bg} border ${c.border} backdrop-blur-xl rounded-2xl px-5 py-4 shadow-2xl max-w-sm`}
                        >
                            <Icon className={`w-5 h-5 ${c.text} shrink-0`} />
                            <p className={`text-sm font-bold ${c.text}`}>{t.message}</p>
                            <button onClick={() => onRemove(t.id)} className="ml-2 text-gray-600 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// ─── Accordion ────────────────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden mb-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                    <span className="font-bold text-xs tracking-widest uppercase text-gray-300">{title}</span>
                    {badge && <span className="text-[10px] font-bold bg-[#f0b429] text-black px-2 py-0.5 rounded-full">{badge}</span>}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4">
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkspaceSetup() {
    const router = useRouter();
    const { setProjectId, setJobId, setCurrentStep } = useStore();
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [name, setName]             = useState('');
    const [cType, setCType]           = useState('vlog');
    const [style, setStyle]           = useState('cinematic');
    const [mode, setMode]             = useState('highlight');
    const [outputPref, setOutputPref] = useState('ai_decide');
    const [files, setFiles]           = useState<File[]>([]);
    const [totalDurationSec, setTotalDurationSec] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress]     = useState<{ [key: string]: number }>({});
    const fileInputRef                = useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [showPaywallModal, setShowPaywallModal] = useState(false);
    const [usageErrorMsg, setUsageErrorMsg] = useState('');

    // ── UX Validation State ──
    const [nameError, setNameError]   = useState(false); // red shake on name
    const [fileError, setFileError]   = useState(false); // pulse on upload zone
    const [toasts, setToasts]         = useState<Toast[]>([]);
    let toastId = useRef(0);

    const addToast = useCallback((message: string, type: ToastType = 'error') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    const currentMode      = MODES.find(m => m.id === mode);
    const rawEstimate      = totalDurationSec * (currentMode?.ratio ?? 0.55);
    const planCapSec       = PLAN_LIMITS.max_output_minutes * 60;
    const estimatedOutputSec = Math.min(rawEstimate, planCapSec);
    const isOverPlanCap    = rawEstimate > planCapSec;
    const isOverClipLimit  = files.length > PLAN_LIMITS.max_upload_clips;

    useEffect(() => { setCurrentStep('setup'); }, [setCurrentStep]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        if (files.length + newFiles.length > 15) {
            addToast('Maximum 15 clips allowed per project.', 'error');
            return;
        }
        let addedSec = 0;
        for (const f of newFiles) addedSec += await getVideoDuration(f);
        setFiles(prev => [...prev, ...newFiles]);
        setTotalDurationSec(prev => prev + addedSec);
        setFileError(false);
        addToast(`${newFiles.length} clip${newFiles.length > 1 ? 's' : ''} added!`, 'success');
    };

    const removeFile = async (index: number) => {
        const dur = await getVideoDuration(files[index]);
        setFiles(prev => prev.filter((_, i) => i !== index));
        setTotalDurationSec(prev => Math.max(0, prev - dur));
    };

    // ── Smart Start: validate BEFORE submitting ──
    const handleAnalyze = async () => {
        // 1. Validate project name
        if (!name.trim()) {
            setNameError(true);
            setTimeout(() => setNameError(false), 820);
            nameInputRef.current?.focus();
            addToast('Give your project a name first!', 'error');
            return;
        }
        // 2. Validate files
        if (files.length === 0) {
            setFileError(true);
            setTimeout(() => setFileError(false), 820);
            addToast('Upload at least one video clip.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const project = await createProject(name, cType, style, outputPref, mode);
            setProjectId(project.id);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                await uploadClip(project.id, file, (prog) => {
                    setProgress(prev => ({ ...prev, [file.name]: prog }));
                });
            }

            addToast('All clips uploaded! Starting AI analysis…', 'success');
            const { job_id } = await startAnalysis(project.id);
            setJobId(job_id);
            setCurrentStep('analyzing');
            router.push('/workspace/analyzing');
        } catch (error: any) {
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('balance') || msg.includes('limit') || msg.includes('usage') || msg.includes('quota')) {
                setUsageErrorMsg(error.message);
                setShowPaywallModal(true);
            } else {
                addToast(error.message || 'Something went wrong. Please try again.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Readiness Checklist ──
    const hasName  = name.trim().length > 0;
    const hasFiles = files.length > 0;
    const canStart = hasName && hasFiles && !isSubmitting;

    return (
        <div className="min-h-screen bg-[#080808] text-white font-dm-sans flex flex-col overflow-hidden">
            {/* Toast Overlay */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* ── NAV ── */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a] shrink-0 z-40">
                <div className="flex items-center space-x-2">
                    <Film className="h-5 w-5 text-[#f0b429]" />
                    <span className="font-bebas-neue tracking-widest text-xl pt-1">CINEMA AI</span>
                </div>
                {/* Readiness indicators */}
                <div className="flex items-center space-x-4">
                    <ReadinessChip done={hasName} label="Project Named" />
                    <ReadinessChip done={hasFiles} label="Clips Added" />
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] h-[calc(100vh-64px)]">

                {/* ─────────── LEFT CANVAS ─────────── */}
                <div className="flex flex-col p-8 overflow-y-auto scrollbar-hide">
                    <div className="mb-8">
                        <h2 className="text-5xl font-bebas-neue tracking-wide mb-1">Director's <span className="text-[#f0b429]">Canvas</span></h2>
                        <p className="text-gray-500 text-sm">Drop your raw footage. AI will do the rest.</p>
                    </div>

                    <input type="file" multiple accept="video/mp4,video/quicktime" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />

                    {/* UPLOAD ZONE */}
                    {files.length === 0 ? (
                        <motion.div
                            animate={fileError ? { x: [0, -10, 10, -8, 8, -4, 0] } : {}}
                            transition={{ duration: 0.5 }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex-1 min-h-[280px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group ${
                                fileError
                                    ? 'border-red-500/70 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                                    : 'border-white/10 hover:border-[#f0b429]/50 hover:bg-[#f0b429]/5 bg-white/[0.01]'
                            }`}
                        >
                            <div className={`p-5 rounded-full mb-5 transition-all ${fileError ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-[#f0b429]/15 group-hover:shadow-[0_0_40px_rgba(240,180,41,0.15)]'}`}>
                                <Upload className={`w-10 h-10 transition-colors ${fileError ? 'text-red-400' : 'text-gray-400 group-hover:text-[#f0b429]'}`} />
                            </div>
                            <span className={`font-bold text-xl mb-1 transition-colors ${fileError ? 'text-red-400' : 'text-white'}`}>
                                {fileError ? 'Please add at least one clip' : 'Click to upload clips'}
                            </span>
                            <span className="text-sm text-gray-600 font-medium">MP4 or MOV · Up to 10 mins (Free)</span>
                        </motion.div>
                    ) : (
                        <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {files.map((file, idx) => (
                                        <motion.div
                                            key={`${file.name}-${idx}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-[#0f0f0f] border border-white/8 p-4 rounded-2xl flex flex-col group hover:border-[#f0b429]/30 transition-all relative overflow-hidden min-h-[110px]"
                                        >
                                            {progress[file.name] !== undefined && (
                                                <div className="absolute inset-0 bg-[#f0b429]/8 transition-all duration-300 z-0" style={{ width: `${progress[file.name]}%` }} />
                                            )}
                                            <div className="flex justify-between items-start z-10 mb-auto">
                                                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center cursor-pointer group/play hover:bg-[#f0b429]/20 transition-colors" onClick={() => setPreviewFile(file)}>
                                                    <Film className="w-4 h-4 text-gray-500 group-hover/play:opacity-0 absolute transition-opacity" />
                                                    <Play className="w-4 h-4 text-[#f0b429] opacity-0 group-hover/play:opacity-100 absolute transition-opacity ml-0.5" />
                                                </div>
                                                {!isSubmitting && (
                                                    <button onClick={() => removeFile(idx)} className="p-1.5 rounded-full text-gray-600 hover:bg-red-500/20 hover:text-red-400 transition-all">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="z-10 mt-3">
                                                <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                                <p className="text-xs text-gray-600 mt-0.5 font-bold">
                                                    {(file.size / 1048576).toFixed(1)} MB
                                                    {progress[file.name] === 100 && <span className="text-green-400 ml-1">✓ Uploaded</span>}
                                                    {progress[file.name] !== undefined && progress[file.name] < 100 && (
                                                        <span className="text-[#f0b429] ml-1">{Math.round(progress[file.name])}%</span>
                                                    )}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {!isSubmitting && files.length < 15 && (
                                    <motion.div
                                        whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/8 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#f0b429]/40 hover:bg-[#f0b429]/5 transition-all p-4 min-h-[110px]"
                                    >
                                        <Upload className="w-5 h-5 text-gray-600 mb-2" />
                                        <span className="font-bold text-[10px] uppercase tracking-widest text-gray-600">Add More</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ESTIMATE PANEL */}
                    {files.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-white/[0.025] border border-white/8 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Footage Uploaded</p>
                                    <p className="text-2xl font-bold text-white">{formatDuration(totalDurationSec)}</p>
                                </div>
                                <div className="text-2xl text-gray-700 font-thin">→</div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Estimated Output</p>
                                    <p className={`text-2xl font-bold ${isOverPlanCap ? 'text-amber-400' : 'text-[#f0b429]'}`}>~{formatDuration(estimatedOutputSec)}</p>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${isOverPlanCap ? 'bg-amber-400' : 'bg-[#f0b429]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (estimatedOutputSec / planCapSec) * 100)}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                            {isOverPlanCap && (
                                <p className="text-[10px] text-amber-400 font-bold mt-2">
                                    ⚠ Output capped at {formatDuration(planCapSec)} (Free plan). <span className="underline cursor-pointer">Upgrade for more.</span>
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* START BUTTON */}
                    <div className="mt-6">
                        <motion.button
                            onClick={handleAnalyze}
                            disabled={isSubmitting}
                            whileTap={canStart ? { scale: 0.98 } : {}}
                            className={`relative w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center transition-all overflow-hidden group ${
                                canStart
                                    ? 'bg-[#f0b429] text-black shadow-[0_0_50px_rgba(240,180,41,0.25)] hover:shadow-[0_0_70px_rgba(240,180,41,0.4)] hover:bg-[#ffcc44] cursor-pointer'
                                    : 'bg-white/5 text-gray-600 border border-white/8 cursor-not-allowed'
                            }`}
                        >
                            {canStart && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            )}
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin w-5 h-5 mr-3" />PREPARING AI...</>
                            ) : canStart ? (
                                <>START DIRECTOR'S TABLE <ArrowRight className="ml-3 w-6 h-6" /></>
                            ) : (
                                /* Smart hint: tell user exactly what's missing */
                                <span className="text-sm uppercase tracking-widest">
                                    {!hasName && !hasFiles ? '← Name your project & add clips' :
                                     !hasName ? '← Name your project first' :
                                     '↑ Add at least one video clip'}
                                </span>
                            )}
                        </motion.button>

                        {process.env.NODE_ENV === 'development' && (
                            <button onClick={() => { setProjectId('test-project-123'); setJobId('test-job-123'); setCurrentStep('review'); router.push('/workspace/review'); }}
                                className="mt-3 w-full text-gray-600 hover:text-[#f0b429] text-[10px] font-bold uppercase tracking-widest transition-colors text-center">
                                Skip to Review (DEV MODE) →
                            </button>
                        )}
                    </div>
                </div>

                {/* ─────────── RIGHT SIDEBAR ─────────── */}
                <div className="border-l border-white/5 overflow-y-auto p-6 scrollbar-hide">
                    <div className="flex items-center space-x-2 text-gray-500 mb-6">
                        <Settings className="w-4 h-4" />
                        <h3 className="font-bebas-neue tracking-widest text-xl">Configuration</h3>
                    </div>

                    {/* PROJECT NAME — most critical field */}
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1 mb-2 block">
                            Project Identity <span className="text-red-500">*</span>
                        </label>
                        <motion.div
                            animate={nameError ? { x: [0, -12, 12, -8, 8, -4, 0] } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); if (e.target.value) setNameError(false); }}
                                placeholder="e.g. My Cinematic Vlog"
                                maxLength={80}
                                className={`w-full rounded-xl p-4 text-white outline-none transition-all text-base font-bold placeholder-gray-700 ${
                                    nameError
                                        ? 'bg-red-500/10 border-2 border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                                        : hasName
                                            ? 'bg-green-500/5 border-2 border-green-500/30'
                                            : 'bg-white/5 border border-white/10 focus:border-[#f0b429]/50 focus:shadow-[0_0_20px_rgba(240,180,41,0.1)]'
                                }`}
                            />
                        </motion.div>
                        <div className="flex justify-between mt-1.5">
                            <p className={`text-[10px] font-bold ${nameError ? 'text-red-400' : 'text-transparent'}`}>
                                ⚠ Project name is required
                            </p>
                            <p className="text-[10px] text-gray-700">{name.length}/80</p>
                        </div>
                    </div>

                    {/* Editing Mode */}
                    <Accordion title="01. Editing Mode" defaultOpen={true} badge={MODES.find(m => m.id === mode)?.label}>
                        <div className="space-y-2">
                            {MODES.map(m => (
                                <button key={m.id} onClick={() => setMode(m.id)}
                                    className={`w-full p-4 rounded-xl text-left transition-all border flex items-center space-x-4 ${
                                        mode === m.id ? 'bg-[#f0b429]/10 border-[#f0b429]/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                    }`}>
                                    <div className={`p-2.5 rounded-lg bg-white/5 ${mode === m.id ? 'border border-[#f0b429]/30' : ''}`}>
                                        <m.icon className={`w-5 h-5 ${mode === m.id ? 'text-[#f0b429]' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold text-sm ${mode === m.id ? 'text-white' : 'text-gray-400'}`}>{m.label}</div>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">{m.multiplier} Speed · {m.desc}</div>
                                    </div>
                                    {mode === m.id && <div className="w-2 h-2 rounded-full bg-[#f0b429] shadow-[0_0_8px_rgba(240,180,41,0.8)]" />}
                                </button>
                            ))}
                        </div>
                    </Accordion>

                    {/* Narrative Context */}
                    <Accordion title="02. Narrative Context" badge={cType}>
                        <div className="grid grid-cols-2 gap-2">
                            {CONTENT_TYPES.map(t => (
                                <button key={t.id} onClick={() => setCType(t.id)}
                                    className={`p-3 rounded-xl flex flex-col items-center justify-center space-y-1.5 border transition-all ${
                                        cType === t.id ? 'bg-[#f0b429]/10 border-[#f0b429]/40 text-[#f0b429]' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:bg-white/5'
                                    }`}>
                                    <t.icon className={`h-5 w-5 ${cType === t.id ? 'text-[#f0b429]' : 'text-gray-700'}`} />
                                    <span className={`font-bold text-[10px] uppercase tracking-wider ${cType === t.id ? 'text-white' : ''}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </Accordion>

                    {/* Aesthetic Style */}
                    <Accordion title="03. Aesthetic Style" badge={style.replace('_', ' ')}>
                        <div className="space-y-2">
                            {STYLES.map(s => (
                                <button key={s.id} onClick={() => setStyle(s.id)}
                                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                                        style === s.id ? 'bg-[#f0b429]/10 border-[#f0b429]/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                    }`}>
                                    <div className={`font-bold text-sm ${style === s.id ? 'text-white' : 'text-gray-400'}`}>{s.label}</div>
                                    <div className="text-xs text-gray-600 font-medium mt-0.5">{s.desc}</div>
                                </button>
                            ))}
                        </div>
                    </Accordion>

                    {/* Target Length */}
                    <Accordion title="04. Target Length" badge={outputPref.replace('_', ' ')}>
                        <div className="grid grid-cols-2 gap-2">
                            {OUTPUT_LENGTHS.map(o => (
                                <button key={o.id} onClick={() => setOutputPref(o.id)}
                                    className={`p-3 rounded-xl text-center border transition-all ${
                                        outputPref === o.id ? 'bg-[#f0b429]/10 border-[#f0b429]/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                    }`}>
                                    <span className={`font-bold text-[10px] uppercase tracking-wider ${outputPref === o.id ? 'text-white' : 'text-gray-500'}`}>{o.label}</span>
                                </button>
                            ))}
                        </div>
                    </Accordion>
                </div>
            </main>

            {/* ── VIDEO PREVIEW MODAL ── */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
                        onClick={() => setPreviewFile(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="relative max-w-5xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={e => e.stopPropagation()}>
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={() => setPreviewFile(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <video src={URL.createObjectURL(previewFile)} controls autoPlay className="w-full max-h-[80vh] aspect-video object-contain" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── PAYWALL MODAL ── */}
            <AnimatePresence>
                {showPaywallModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="max-w-lg w-full bg-[#0a0a0a] rounded-3xl border border-[#f0b429]/20 p-8 text-center shadow-[0_0_50px_rgba(240,180,41,0.08)]">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bebas-neue tracking-wider text-white mb-2">Out of Minutes</h2>
                            <p className="text-gray-400 text-sm mb-8">{usageErrorMsg || "You don't have enough minutes to process this video."}</p>
                            <div className="space-y-3">
                                <button className="w-full py-4 rounded-xl font-bold text-black bg-[#f0b429] hover:bg-[#ffcc44] transition-colors">
                                    UPGRADE TO CREATOR (₹499/mo)
                                </button>
                                <button className="w-full py-4 rounded-xl font-bold text-[#f0b429] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    BUY TOP-UP (+15 MINS FOR ₹99)
                                </button>
                            </div>
                            <button onClick={() => setShowPaywallModal(false)} className="mt-6 text-xs font-bold text-gray-600 tracking-widest uppercase hover:text-white transition-colors">
                                Cancel & Go Back
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ReadinessChip({ done, label }: { done: boolean; label: string }) {
    return (
        <motion.div animate={{ opacity: done ? 1 : 0.4 }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                done ? 'border-green-500/40 text-green-400 bg-green-500/5' : 'border-white/8 text-gray-600'
            }`}>
            {done ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
            <span>{label}</span>
        </motion.div>
    );
}
