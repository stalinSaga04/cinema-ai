'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getJobStatus, getProject } from '@/lib/api';
import { motion } from 'framer-motion';
import { Download, Film, Share2, RefreshCw, FileVideo, Sparkles } from 'lucide-react';
import { Project } from '@/lib/types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function DoneScreen() {
    const router = useRouter();
    const { jobId, projectId, setCurrentStep, resetWorkspace } = useStore();
    
    const [isDone, setIsDone] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatDuration = (seconds: number | undefined | null) => {
        if (!seconds || seconds <= 0) return '–';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    useEffect(() => {
        if (!mounted) return;
        if (!jobId || !projectId) {
            router.push('/workspace');
            return;
        }
        setCurrentStep('done');

        // Poll job status until render completes
        const interval = setInterval(async () => {
            try {
                const status = await getJobStatus(jobId);

                if (status.state === 'done') {
                    clearInterval(interval);
                    setIsDone(true);

                    // Try to get the download URL from project's final_url first
                    try {
                        const { getAuthToken } = await import('@/lib/api');
                        const token = await getAuthToken();

                        // Fetch project for real stats & final_url
                        const proj = await getProject(projectId);
                        setProject(proj);

                        // Build download URL
                        const finalUrl: string | undefined = (proj as any).final_url;
                        if (finalUrl) {
                            const url = finalUrl.startsWith('/') ? `${API_BASE_URL}${finalUrl}` : finalUrl;
                            setDownloadUrl(url);
                        } else {
                            // Fallback: use filename from job message
                            const filename = status.message;
                            if (filename && filename.endsWith('.mp4')) {
                                setDownloadUrl(`${API_BASE_URL}/download/${filename}`);
                            }
                        }
                    } catch (e) {
                        console.error('Failed to fetch project data:', e);
                        // Still fallback to job message filename
                        const filename = status.message;
                        if (filename && filename.endsWith('.mp4')) {
                            setDownloadUrl(`${API_BASE_URL}/download/${filename}`);
                        }
                    }
                } else if (status.state === 'failed') {
                    clearInterval(interval);
                    alert('Render Failed: ' + (status.message || 'Unknown Error'));
                    router.push('/workspace/review');
                }
            } catch (error) {
                console.error('Polling error', error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [mounted, jobId, projectId, router, setCurrentStep]);

    const handleDownload = () => {
        if (!downloadUrl) return;
        // Open in new tab so auth header issue is bypassed
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `cinema-ai-render.mp4`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportFCPXML = () => {
        if (!projectId) return;
        const exportUrl = `${API_BASE_URL}/projects/${projectId}/export/fcpxml`;
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = `cinema-ai-timeline.fcpxml`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isDone) {
        return (
            <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center font-dm-sans">
                {/* Background Ambience */}
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[60vw] h-[60vw] bg-[#f0b429]/10 rounded-full blur-[100px] absolute animate-pulse" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <FileVideo className="w-16 h-16 text-[#f0b429] animate-bounce mb-6" />
                    <h2 className="text-4xl font-bebas-neue tracking-widest text-[#f0b429] mb-4">RENDERING YOUR MASTERPIECE</h2>
                    <p className="text-gray-400 font-medium max-w-xs text-center">
                        Applying cinematic cuts, color grading, and final polish. This takes a few minutes.
                    </p>
                    <div className="w-48 h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-[#f0b429] to-[#d49917]"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white font-dm-sans flex flex-col pt-12">
            
            {/* Glow */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center">
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 1 }}
                    className="w-[80vw] h-[80vw] max-w-2xl max-h-2xl bg-gradient-to-b from-[#f0b429]/20 to-transparent rounded-full blur-[80px] absolute"
                />
            </div>

            <main className="relative z-10 max-w-xl mx-auto p-6 w-full flex-1 flex flex-col">
                <div className="flex flex-col items-center text-center space-y-6 mb-12">
                    <div className="w-20 h-20 bg-[#f0b429] rounded-3xl flex items-center justify-center text-black shadow-[0_0_50px_rgba(240,180,41,0.4)] mb-2">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <h1 className="text-6xl font-bebas-neue tracking-widest">IT'S A WRAP!</h1>
                    <p className="text-gray-400 font-medium">Your masterpiece is ready for the world.</p>
                </div>

                {/* Real Stats from DB */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 mb-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">Final Length</div>
                            <div className="text-2xl font-bebas-neue tracking-wider">
                                {formatDuration(project?.estimated_duration || project?.duration)}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">Silence Removed</div>
                            <div className="text-2xl font-bebas-neue tracking-wider text-green-400">
                                {formatDuration(project?.silence_removed)}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">Cuts Made</div>
                            <div className="text-2xl font-bebas-neue tracking-wider">{project?.cuts_count ?? '–'}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">Style</div>
                            <div className="text-2xl font-bebas-neue tracking-wider text-[#f0b429] capitalize">
                                {project?.style || 'Cinematic'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleDownload}
                            disabled={!downloadUrl}
                            className="bg-gradient-to-r from-[#f0b429] to-[#d49917] text-black py-4 rounded-2xl font-bold flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(240,180,41,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            {downloadUrl ? 'Export MP4' : 'Preparing...'}
                        </button>

                        <button
                            onClick={handleExportFCPXML}
                            className="bg-[#1f1f1f] text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-[#2a2a2a] transition-colors border border-white/10"
                        >
                            <FileVideo className="w-5 h-5 mr-2 text-blue-400" />
                            Export XML Timeline
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push('/workspace/review')}
                            className="bg-white/5 border border-white/10 py-3 rounded-2xl font-bold flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Edit Again
                        </button>
                        <button
                            onClick={() => {
                                resetWorkspace();
                                router.push('/workspace');
                            }}
                            className="bg-white/5 border border-white/10 py-3 rounded-2xl font-bold flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <Film className="w-4 h-4 mr-2" /> New Project
                        </button>
                    </div>
                </div>

                <div className="mt-12 bg-[#0a0a0a] border border-[#f0b429]/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(240,180,41,0.05)]">
                    <Share2 className="w-6 h-6 text-[#f0b429] mx-auto mb-3" />
                    <h3 className="font-bold mb-2">Share your creation</h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                        Tag <span className="text-[#f0b429] font-bold">@cinemaai.io</span> on Instagram or X. We feature the best edits every week!
                    </p>
                </div>
            </main>

            <footer className="mt-auto py-8 text-center text-xs font-bold tracking-widest uppercase text-gray-600 border-t border-white/5">
                Project saved 30 days · cinemaai.io
            </footer>
        </div>
    );
}
