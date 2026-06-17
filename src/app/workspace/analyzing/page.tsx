'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getJobStatus } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, AudioWaveform, Eye, Scissors, Sparkles, Music, Zap } from 'lucide-react';

// Each step shown to the user — maps to real AI pipeline stages
const AI_STEPS = [
    { icon: AudioWaveform,  label: 'Transcribing Speech',    detail: 'Converting every spoken word into text…',       pct: 12  },
    { icon: Eye,         label: 'Scanning Visual Frames', detail: 'Detecting scenes, motion, and emotion cues…',   pct: 25  },
    { icon: Scissors,    label: 'Removing Silence',       detail: 'Cutting dead air and filler words…',            pct: 42  },
    { icon: BrainCircuit,label: 'Story Intelligence',     detail: 'Finding the narrative arc and key moments…',    pct: 58  },
    { icon: Music,       label: 'Scoring Emotion',        detail: 'Detecting energy peaks for music sync…',        pct: 73  },
    { icon: Sparkles,    label: 'Building Your Edit',     detail: 'Assembling the timeline cut-by-cut…',           pct: 88  },
    { icon: Zap,         label: 'Finalising Draft',       detail: 'Applying colour grade and audio polish…',       pct: 96  },
];

export default function AnalyzingScreen() {
    const router = useRouter();
    const { jobId, projectId, setCurrentStep } = useStore();
    const [displayProgress, setDisplayProgress] = useState(0);
    const [stepIdx, setStepIdx] = useState(0);
    const [isDone, setIsDone] = useState(false);
    const [mounted, setMounted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!jobId || !projectId) { router.push('/workspace'); return; }
        setCurrentStep('analyzing');
    }, [mounted, jobId, projectId, router, setCurrentStep]);

    // Drive stepIdx from real progress
    useEffect(() => {
        const idx = AI_STEPS.findIndex((s, i) => {
            const next = AI_STEPS[i + 1];
            return displayProgress >= s.pct && (!next || displayProgress < next.pct);
        });
        if (idx >= 0) setStepIdx(idx);
    }, [displayProgress]);

    // Poll backend
    useEffect(() => {
        if (!jobId) return;
        let localFakeProgress = 0;

        intervalRef.current = setInterval(async () => {
            try {
                const statusData = await getJobStatus(jobId);
                const backendProgress = statusData.progress ?? 0;

                if (statusData.state === 'done') {
                    setDisplayProgress(100);
                    setIsDone(true);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setTimeout(() => router.push('/workspace/review'), 1500);
                    return;
                }
                if (statusData.state === 'failed') {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    router.push('/workspace');
                    return;
                }

                if (backendProgress > 0) {
                    setDisplayProgress(backendProgress);
                } else {
                    localFakeProgress = Math.min(localFakeProgress + Math.random() * 1.8, 94);
                    setDisplayProgress(Math.floor(localFakeProgress));
                }
            } catch (err) {
                console.error('Polling error', err);
            }
        }, 2000);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [jobId, router]);

    const currentStep = AI_STEPS[Math.min(stepIdx, AI_STEPS.length - 1)];
    const StepIcon = currentStep.icon;

    return (
        <div className="min-h-screen bg-[#080808] text-white font-dm-sans flex flex-col items-center justify-center relative overflow-hidden p-6">

            {/* ── Ambient glow layers ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-2xl max-h-2xl bg-[#f0b429]/15 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.08, 0.2, 0.08] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute top-1/3 left-1/3 w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[100px]"
                />
            </div>

            <main className="relative z-10 w-full max-w-lg flex flex-col items-center">

                {/* ── Big Orbital Brain ── */}
                <div className="relative flex items-center justify-center mb-12">
                    {/* Outer slow ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-52 h-52 rounded-full border border-[#f0b429]/15"
                        style={{ borderStyle: 'dashed' }}
                    />
                    {/* Middle ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-36 h-36 rounded-full border border-[#f0b429]/25"
                    />
                    {/* Inner pulse ring */}
                    <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute w-24 h-24 bg-[#f0b429]/20 rounded-full blur-sm"
                    />
                    {/* Icon box */}
                    <motion.div
                        animate={{ scale: [0.97, 1.03, 0.97] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="relative w-20 h-20 bg-[#0d0d0d] border border-[#f0b429]/40 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(240,180,41,0.25)]"
                    >
                        <BrainCircuit className="w-10 h-10 text-[#f0b429]" />
                    </motion.div>

                    {/* Orbiting dots */}
                    {[0, 72, 144, 216, 288].map((deg, i) => (
                        <motion.div
                            key={i}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8 + i, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-52 h-52 flex items-center justify-start"
                            style={{ transformOrigin: 'center' }}
                        >
                            <div
                                className="w-2 h-2 rounded-full bg-[#f0b429]"
                                style={{
                                    transform: `rotate(${deg}deg) translateX(96px)`,
                                    opacity: 0.6 - i * 0.08,
                                    boxShadow: '0 0 6px rgba(240,180,41,0.8)'
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* ── Step Cards Row ── */}
                <div className="flex items-center space-x-2 mb-10 overflow-x-auto pb-2 scrollbar-hide w-full justify-center">
                    {AI_STEPS.map((step, i) => {
                        const isActive = i === stepIdx && !isDone;
                        const isDonePast = i < stepIdx || isDone;
                        return (
                            <motion.div
                                key={i}
                                animate={{ opacity: isActive ? 1 : isDonePast ? 0.5 : 0.2, scale: isActive ? 1.05 : 1 }}
                                className={`flex-shrink-0 flex flex-col items-center space-y-1.5 px-3 py-2 rounded-2xl border transition-all ${
                                    isActive ? 'border-[#f0b429]/50 bg-[#f0b429]/10' : 'border-white/5 bg-white/[0.02]'
                                }`}
                            >
                                <step.icon className={`w-4 h-4 ${isActive ? 'text-[#f0b429]' : isDonePast ? 'text-green-400' : 'text-gray-600'}`} />
                                <span className={`text-[8px] font-bold uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                    {isDonePast && !isActive ? '✓' : step.label.split(' ')[0]}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Active Step Detail ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isDone ? 'done' : stepIdx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="text-center mb-8"
                    >
                        {isDone ? (
                            <>
                                <p className="text-4xl font-bebas-neue tracking-widest text-[#f0b429] mb-1">EDIT READY ✦</p>
                                <p className="text-gray-400 text-sm">Preparing your Director's Table…</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold text-white mb-1">{currentStep.label}</p>
                                <p className="text-gray-500 text-sm font-medium">{currentStep.detail}</p>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* ── Progress Bar ── */}
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs font-bold tracking-widest text-[#f0b429]/70 font-bebas-neue">
                        <span>AI ANALYSIS</span>
                        <span>{Math.floor(displayProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[#d49917] via-[#f0b429] to-[#ffd966]"
                            animate={{ width: `${displayProgress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* ── Fun fact while waiting ── */}
                <p className="mt-12 text-xs text-gray-700 font-medium text-center max-w-xs">
                    Your AI director is analysing every frame using the same techniques Walter Murch used to edit Apocalypse Now.
                </p>
            </main>
        </div>
    );
}
