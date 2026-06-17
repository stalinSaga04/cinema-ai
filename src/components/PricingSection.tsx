'use client';

import { Check, ArrowRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingSection() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/auth');
  };

  return (
    <section className="py-24 w-full px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* FREE PLAN */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl relative flex flex-col h-full">
          <h3 className="text-3xl font-bebas-neue tracking-wider mb-2 text-white">FREE</h3>
          <div className="text-5xl font-black mb-6">₹0</div>
          <ul className="space-y-4 mb-8 flex-1">
            <PricingFeature text="1 project/month" />
            <PricingFeature text="60 sec watermarked output" />
            <PricingFeature text="Full AI analysis" />
          </ul>
          <button 
            onClick={handleStart}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center border-2 border-gray-600 text-gray-300 hover:bg-white/5 transition-colors"
          >
            Start Free <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* MOST POPULAR (₹199) */}
        <div className="bg-[#0a0a0a] border border-[#f0b429]/50 p-8 rounded-3xl relative flex flex-col h-full transform md:-translate-y-4 shadow-[0_0_40px_rgba(240,180,41,0.15)]">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f0b429] text-black font-bold text-xs uppercase tracking-wider py-1 px-4 rounded-full flex items-center">
            <Zap className="w-3 h-3 mr-1" /> Most Popular
          </div>
          <h3 className="text-3xl font-bebas-neue tracking-wider mb-2 text-[#f0b429]">PAY PER RENDER</h3>
          <div className="text-5xl font-black mb-1">₹199</div>
          <div className="text-sm text-gray-400 mb-6 font-medium tracking-wide">one-time payment</div>
          <ul className="space-y-4 mb-8 flex-1">
            <PricingFeature text="2 projects (no expiry)" />
            <PricingFeature text="Up to 20 min output" />
            <PricingFeature text="No watermark" />
            <PricingFeature text="Both styles" />
          </ul>
          <p className="text-xs text-center text-[#f0b429]/80 mb-4 font-medium uppercase tracking-widest">Less than one Swiggy order</p>
          <button 
            onClick={handleStart}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center bg-gradient-to-r from-[#f0b429] to-[#d49917] text-black hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(240,180,41,0.3)]"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* PRO CREATORS (₹299/mo) */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl relative flex flex-col h-full">
          <h3 className="text-3xl font-bebas-neue tracking-wider mb-2 text-white">FOR CREATORS</h3>
          <div className="text-5xl font-black mb-1">₹299<span className="text-xl text-gray-500 font-medium">/mo</span></div>
          <div className="text-sm text-gray-400 mb-6 font-medium tracking-wide">billed monthly</div>
          <ul className="space-y-4 mb-8 flex-1">
            <PricingFeature text="10 projects/month" />
            <PricingFeature text="Up to 30 min output" />
            <PricingFeature text="No watermark" />
            <PricingFeature text="Priority render" />
            <PricingFeature text="Early access to new styles" />
          </ul>
          <p className="text-xs text-center text-gray-500 mb-4 font-medium uppercase tracking-widest">₹30 per video</p>
          <button 
            onClick={handleStart}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center border-2 border-[#f0b429] text-[#f0b429] hover:bg-[#f0b429]/10 transition-colors"
          >
            Subscribe <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

      </div>

      <div className="mt-16 text-center text-gray-400 font-medium max-w-3xl mx-auto">
        "All plans include: Full AI analysis · Silence removal · B-roll matching · Director's Table · Reverse script"
      </div>
    </section>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start text-gray-300 font-medium">
      <Check className="h-5 w-5 text-[#f0b429] mr-3 shrink-0" />
      <span>{text}</span>
    </li>
  );
}
