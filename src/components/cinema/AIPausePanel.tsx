'use client';

import { useState } from 'react';
import { AIPauseQuestion } from '@/lib/types';
import { submitAnswers, submitPrompt, payProject } from '@/lib/api';
import { 
    Sparkles, ArrowRight, ArrowLeft, Loader2, Play, 
    CheckCircle2, XCircle, ChevronDown, ChevronUp, Send,
    CreditCard, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AIPausePanelProps {
    projectId: string;
    questions: AIPauseQuestion[];
    onComplete: (paid: boolean) => void;
}

export default function AIPausePanel({ projectId, questions, onComplete }: AIPausePanelProps) {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [promptSent, setPromptSent] = useState(false);
    const [phase, setPhase] = useState<'questions' | 'review' | 'pay'>('questions');

    const handleAnswerChange = (qId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
        // Auto-advance after short delay
        if (currentQ < questions.length - 1) {
            setTimeout(() => setCurrentQ(prev => prev + 1), 400);
        }
    };

    const handleSubmitAnswers = async () => {
        setIsSubmitting(true);
        try {
            await submitAnswers(projectId, answers);
            setPhase('review');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendPrompt = async () => {
        if (!prompt.trim()) return;
        try {
            await submitPrompt(projectId, prompt);
            setPromptSent(true);
            setPrompt('');
        } catch(e) { console.error(e); }
    };

    const handlePay = async () => {
        setIsSubmitting(true);
        try {
            await payProject(projectId);
            onComplete(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const q = questions[currentQ];
    const allAnswered = Object.keys(answers).length >= questions.length;

    return (
        <div className="max-w-lg mx-auto space-y-6 w-full">
            
            {/* 60-sec Draft Video Player */}
            <div className="relative aspect-video bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Play className="h-16 w-16 text-white/30 mb-3" />
                    <p className="text-gray-500 font-bold text-sm">60-Second Draft Preview</p>
                </div>
                {/* Watermark Bar */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 bg-black/60 flex items-center justify-center">
                    <span className="text-white/50 text-xs font-bold tracking-[0.3em] uppercase">Cinema AI — cinemaai.io</span>
                </div>
                <div className="absolute top-4 left-4 inline-flex items-center space-x-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">FREE PREVIEW</span>
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* ───── PHASE 1: Questions one at a time ───── */}
                {phase === 'questions' && questions.length > 0 && q && (
                    <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                                <span className="text-sm font-bold text-gray-400">Question {currentQ + 1} of {questions.length}</span>
                            </div>
                            <div className="flex space-x-1">
                                {questions.map((_, i) => (
                                    <div key={i} className={cn(
                                        "w-8 h-1.5 rounded-full transition-all",
                                        i < currentQ ? "bg-purple-500" : i === currentQ ? "bg-white" : "bg-white/10"
                                    )} />
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6 leading-snug">{q.question}</h3>
                            
                            {q.options ? (
                                <div className="space-y-3">
                                    {q.options.map(option => (
                                        <button
                                            type="button"
                                            key={option}
                                            onClick={() => handleAnswerChange(q.id, option)}
                                            className={cn(
                                                "w-full px-5 py-4 rounded-2xl border text-left transition-all font-medium focus:outline-none",
                                                answers[q.id] === option
                                                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                                                    : "bg-black/50 text-gray-300 border-white/10 hover:border-purple-500/50 hover:text-white"
                                            )}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 min-h-[80px] focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-gray-600 resize-none"
                                        placeholder="Type your response..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    />
                                    <button
                                        onClick={() => {
                                            if (currentQ < questions.length - 1) setCurrentQ(prev => prev + 1);
                                        }}
                                        disabled={!answers[q.id]}
                                        className="w-full bg-white/10 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-30"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-3">
                            {currentQ > 0 && (
                                <button onClick={() => setCurrentQ(prev => prev - 1)}
                                    className="w-1/4 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                            )}
                            {allAnswered && (
                                <button onClick={handleSubmitAnswers} disabled={isSubmitting}
                                    className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Submit & Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ───── If no questions, show review directly ───── */}
                {phase === 'questions' && questions.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                        <p className="text-gray-400 mb-6">Draft is ready! No questions from the AI this time.</p>
                        <button onClick={() => setPhase('review')}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold"
                        >
                            Continue →
                        </button>
                    </motion.div>
                )}

                {/* ───── PHASE 2: Review + Prompt + Pay ───── */}
                {phase === 'review' && (
                    <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Clip Report Summary */}
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <h3 className="font-bold text-white mb-3 flex items-center">
                                <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> Clip Report
                            </h3>
                            <p className="text-sm text-gray-400">
                                AI selected the best moments from your footage. Full clip report will be available after render.
                            </p>
                        </div>

                        {/* Director's Voice Prompt (Collapsible) */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <button onClick={() => setShowPrompt(!showPrompt)}
                                className="w-full p-5 flex items-center justify-between text-left"
                            >
                                <div>
                                    <h3 className="font-bold text-white">Director's Voice</h3>
                                    <p className="text-xs text-gray-500">Add specific instructions (Tamil + English)</p>
                                </div>
                                {showPrompt ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                            </button>
                            
                            {showPrompt && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-5 pb-5 space-y-3">
                                    <textarea
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        placeholder='e.g. "intro la vai shot 2", "slow motion at beach scene"'
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 min-h-[80px] text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    />
                                    <button onClick={handleSendPrompt} disabled={!prompt.trim() || promptSent}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4 mr-2" /> {promptSent ? 'Prompt Queued ✓' : 'Queue Prompt'}
                                    </button>
                                    <p className="text-xs text-gray-600">Prompts are queued free. They'll be applied during final render.</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 rounded-3xl p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.1)]">
                            <h3 className="text-2xl font-black text-white mb-2">Unlock Full Video</h3>
                            <p className="text-sm text-purple-200 mb-6">Remove watermark & get full-length render.</p>

                            {/* Pricing Tiers */}
                            <div className="space-y-3 mb-6">
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <span className="block text-white font-bold">Free</span>
                                        <span className="block text-xs text-gray-400">1 project/month • 60s watermarked</span>
                                    </div>
                                    <span className="text-sm font-bold text-green-400">Current</span>
                                </div>
                                <div className="bg-purple-900/30 border border-purple-500/40 rounded-2xl p-4 flex items-center justify-between ring-2 ring-purple-500/30">
                                    <div>
                                        <span className="block text-white font-bold">Starter</span>
                                        <span className="block text-xs text-purple-200">2 projects • 20 min each • No watermark</span>
                                    </div>
                                    <span className="text-lg font-black text-white">₹199</span>
                                </div>
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <span className="block text-white font-bold">Pro</span>
                                        <span className="block text-xs text-gray-400">10/month • 30 min • Priority render</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-300">₹299/mo</span>
                                </div>
                            </div>

                            <button onClick={handlePay} disabled={isSubmitting}
                                className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center disabled:opacity-50 shadow-xl"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CreditCard className="h-5 w-5 mr-2" />}
                                Pay ₹199 & Render
                            </button>
                            
                            <button onClick={() => onComplete(false)}
                                className="w-full mt-3 text-xs text-gray-500 hover:text-white transition-colors underline py-2"
                            >
                                Dev Bypass: Skip Payment → Render
                            </button>

                            <div className="flex items-center justify-center mt-4 space-x-2 text-gray-600">
                                <Shield className="h-3 w-3" />
                                <span className="text-[10px] font-medium">Secured by Razorpay • UPI / Card accepted</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
