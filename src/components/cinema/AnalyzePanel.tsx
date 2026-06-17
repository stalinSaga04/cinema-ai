'use client';

import { Loader2, ArrowRight, CheckCircle2, Clock, BrainCircuit } from 'lucide-react';
import { JobStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyzePanelProps {
    jobStatus: JobStatus | null;
    onComplete: () => void;
}

const ANALYSIS_STEPS = [
    { id: 'scenes', label: 'Analyzing Frames & Lighting', delay: 0 },
    { id: 'transcription', label: 'Extracting Speech & Transcripts', delay: 1 },
    { id: 'script', label: 'Building the Narrative Arc', delay: 2 },
    { id: 'metadata', label: 'Selecting the Best B-Rolls', delay: 3 },
];

export default function AnalyzePanel({ jobStatus, onComplete }: AnalyzePanelProps) {
    const currentProgress = jobStatus?.progress ?? 0;
    const isDone = jobStatus?.state === 'done';
    const isFailed = jobStatus?.state === 'failed';

    return (
        <div className="max-w-md mx-auto w-full space-y-10">
            <div className="text-center space-y-6">
                
                <div className="relative inline-flex items-center justify-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-purple-500/30 border-t-purple-500 w-32 h-32 mx-auto"
                    />
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                       <BrainCircuit className={cn("h-10 w-10 text-purple-400", !isDone && !isFailed && "animate-pulse")} />
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-black text-white mb-2">
                        {isDone ? 'Draft Ready!' : isFailed ? 'Analysis Failed' : 'AI is Thinking...'}
                    </h2>
                    <p className="text-gray-400">
                        {jobStatus?.message || 'Please wait while our director analyzes your footage.'}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {ANALYSIS_STEPS.map((step, index) => {
                    const stepProgress = (index + 1) * 25;
                    const isCompleted = currentProgress >= stepProgress;
                    const isCurrent = currentProgress >= index * 25 && currentProgress < stepProgress;
                    const isWaiting = currentProgress < index * 25;

                    return (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: step.delay * 0.1 }}
                            key={step.id}
                            className={cn(
                                "flex items-center p-4 rounded-2xl border transition-all duration-500",
                                isCompleted ? "bg-green-500/10 border-green-500/30" :
                                isCurrent ? "bg-purple-900/30 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.1)]" :
                                "bg-white/5 border-white/5 opacity-50"
                            )}
                        >
                            <div className="mr-4 h-8 w-8 rounded-xl flex items-center justify-center bg-black/50 border border-white/5">
                                {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                ) : isCurrent ? (
                                    <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                                ) : (
                                    <Clock className="h-4 w-4 text-gray-600" />
                                )}
                            </div>
                            <span className={cn("flex-1 font-bold text-sm", isCurrent ? "text-white" : "text-gray-400")}>
                                {step.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {isDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40"
                    >
                        <button
                            onClick={onComplete}
                            className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center group"
                        >
                            Review Director's Cut
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
