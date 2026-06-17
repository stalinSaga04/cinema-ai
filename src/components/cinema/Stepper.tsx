'use client';

import { StepId } from '@/lib/types';
import { cn } from '@/lib/utils';

const STEPS: { id: StepId; label: string }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'upload', label: 'Upload' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'directors-table', label: 'Review' },
    { id: 'render', label: 'Render' },
    { id: 'download', label: 'Download' },
];

interface StepperProps {
    activeStep: StepId;
}

export default function Stepper({ activeStep }: StepperProps) {
    const activeIndex = STEPS.findIndex(s => s.id === activeStep);

    return (
        <div className="flex items-center gap-2 px-4 py-3">
            {STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center flex-1">
                    <div className={cn(
                        "h-1.5 w-full rounded-full transition-all duration-500",
                        i < activeIndex ? "bg-purple-500" :
                        i === activeIndex ? "bg-white" :
                        "bg-white/10"
                    )} />
                </div>
            ))}
        </div>
    );
}
