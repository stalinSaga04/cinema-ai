'use client';

import { useRouter } from 'next/navigation';
import { Play, ArrowRight, Upload, BrainCircuit, CheckSquare, Download, ShieldCheck, Mail, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import PricingSection from '@/components/PricingSection';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    localStorage.removeItem('cinema_ai_workspace_state');
    router.push('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-white selection:bg-[#f0b429]/30 overflow-hidden font-dm-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#f0b429]/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#f0b429]/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      {/* Nav */}
      <nav className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="bg-gradient-to-br from-[#f0b429]/20 to-[#d49917]/10 p-2.5 rounded-xl border border-white/10">
            <Film className="h-6 w-6 text-[#f0b429]" />
          </div>
          <span className="text-3xl font-regular tracking-wide text-white font-bebas-neue pt-1">
            CINEMA AI
          </span>
        </div>
        <button
          onClick={handleStart}
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-2 rounded-full font-bold transition-all flex items-center text-sm"
        >
          Login
        </button>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-40 px-6 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 rounded-full bg-[#f0b429] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0b429]">V1 Director Console Active</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl font-bebas-neue tracking-wider leading-[0.85] text-white"
            >
              THE AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b429] to-[#d49917]">DIRECTOR.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-2xl text-gray-400 max-w-2xl mt-4 leading-relaxed font-dm-sans"
            >
              Skip the timeline. Let the AI analyze your raw footage, answer 3 questions, and download a masterpiece.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center lg:justify-start"
            >
              <button
                onClick={handleStart}
                className="group bg-gradient-to-r from-[#f0b429] to-[#d49917] text-black px-10 py-5 rounded-3xl font-bold text-xl md:text-2xl transition-all flex items-center justify-center hover:opacity-95 active:scale-95 shadow-[0_0_50px_rgba(240,180,41,0.25)]"
              >
                START YOUR EDIT <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Illustrative Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, x: 40, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative"
          >
            <div className="relative aspect-square">
                <img 
                    src="/cinema_ai_director_hero_1775231710417.png" 
                    alt="AI Director Visual" 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_80px_rgba(240,180,41,0.15)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </section>

        {/* Before/After Visual Placeholder */}
        <section className="py-10 w-full px-6 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center"
          >
            <div className="w-1/2 h-full flex flex-col items-center justify-center border-r border-white/5 bg-black/50">
              <span className="text-gray-500 font-bebas-neue text-2xl tracking-widest mb-2">RAW 30MIN</span>
              <p className="text-sm text-gray-600 text-center px-4">Multiple takes, silence, unorganized b-roll.</p>
            </div>
            <div className="w-1/2 h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f0b429]/10 to-transparent">
              <span className="text-[#f0b429] font-bebas-neue text-3xl tracking-widest mb-2">EDITED 8MIN</span>
              <p className="text-sm text-gray-300 text-center px-4">Paced, color-graded, production-ready.</p>
            </div>
          </motion.div>
        </section>

        {/* How It Works (4 steps) */}
        <section className="py-24 w-full px-6 max-w-5xl mx-auto">
          <h2 className="text-5xl font-bebas-neue text-center mb-16 tracking-wide">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StepCard number="01" title="Upload clips from your phone" icon={<Upload className="h-8 w-8 text-[#f0b429]" />} />
            <StepCard number="02" title="AI analyzes every frame" icon={<BrainCircuit className="h-8 w-8 text-[#f0b429]" />} />
            <StepCard number="03" title="You approve 3 decisions" icon={<CheckSquare className="h-8 w-8 text-[#f0b429]" />} />
            <StepCard number="04" title="Download your edited video" icon={<Download className="h-8 w-8 text-[#f0b429]" />} />
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <section className="py-24 w-full px-6 max-w-3xl mx-auto">
          <h2 className="text-5xl font-bebas-neue text-center mb-12 tracking-wide">FAQ</h2>
          <div className="space-y-6">
            <FaqItem q="What is one project?" a="One upload session = one final edited video." />
            <FaqItem q="What if I don't like the result?" a="First re-render is always free." />
            <FaqItem q="Do I own my video?" a="Yes. 100%. Always." />
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 w-full px-6 border-t border-white/5 bg-black/40">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
            <TrustBadge text="You own your content" />
            <TrustBadge text="No hidden fees" />
            <TrustBadge text="Footage deleted after 30 days" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6 relative z-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center space-x-6">
            <Link href="/terms" className="text-sm font-medium text-gray-500 hover:text-white transition-colors">/terms</Link>
            <Link href="/privacy" className="text-sm font-medium text-gray-500 hover:text-white transition-colors">/privacy</Link>
            <Link href="/refund" className="text-sm font-medium text-gray-500 hover:text-white transition-colors">/refund</Link>
            <Link href="/copyright" className="text-sm font-medium text-gray-500 hover:text-white transition-colors">/copyright</Link>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 text-sm font-medium border border-white/10 px-4 py-2 rounded-full">
            <Mail className="w-4 h-4" />
            <span>Grievance Officer: grievance@cinemaai.io</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, icon }: { number: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col items-start relative hover:border-[#f0b429]/30 transition-colors">
      <span className="absolute top-4 right-4 text-4xl font-bebas-neue text-white/5">{number}</span>
      <div className="bg-white/5 p-4 rounded-xl mb-6 border border-white/10">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white relative z-10">{title}</h3>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl">
      <h4 className="text-xl font-bold mb-2 text-white">{q}</h4>
      <p className="text-gray-400">{a}</p>
    </div>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-2 text-gray-400 font-medium">
      <ShieldCheck className="w-5 h-5 text-[#f0b429]" />
      <span>{text}</span>
    </div>
  );
}
