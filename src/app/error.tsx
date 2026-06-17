'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // We can log the error to an error reporting service like Sentry here in the future
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center font-dm-sans p-6">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                <div className="w-[50vw] h-[50vw] bg-red-500/5 rounded-full blur-[100px] absolute" />
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 bg-[#0a0a0a] border border-red-500/20 rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.05)]"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                
                <h1 className="text-3xl font-bebas-neue tracking-widest text-white mb-2">
                    SOMETHING WENT WRONG
                </h1>
                
                <p className="text-gray-400 mb-8 font-medium">
                    Our AI encountered an unexpected glitch in the matrix. Don't worry, your data is safe.
                </p>

                {/* Show technical error only in development, hide from real users eventually */}
                <div className="bg-black/50 border border-white/5 rounded-lg p-4 mb-8 text-left overflow-x-auto">
                    <p className="text-red-400 font-mono text-xs">
                        {error.message || "Unknown rendering error occurred."}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gradient-to-r from-[#f0b429] to-[#d49917] text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                        <Home className="w-4 h-4 mr-2" /> Return to Dashboard
                    </button>
                </div>
            </motion.div>
            
            <footer className="absolute bottom-8 text-xs font-bold tracking-widest uppercase text-gray-600">
                Cinema AI Support
            </footer>
        </div>
    );
}
