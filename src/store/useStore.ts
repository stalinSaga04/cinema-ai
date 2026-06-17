import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StepId = 'setup' | 'upload' | 'analyzing' | 'review' | 'done';

export interface WorkspaceState {
  projectId: string | null;
  currentStep: StepId;
  uploadedClips: string[];
  aiAnswers: Record<string, string>;
  paymentStatus: boolean;
  
  // Job IDs / draft urls
  jobId: string | null;
  draftUrl: string | null;
  finalUrl: string | null;
  
  // Actions
  setProjectId: (id: string | null) => void;
  setCurrentStep: (step: StepId) => void;
  addUploadedClip: (clip: string) => void;
  setAiAnswers: (answers: Record<string, string>) => void;
  setPaymentStatus: (status: boolean) => void;
  setJobId: (id: string | null) => void;
  setDraftUrl: (url: string | null) => void;
  setFinalUrl: (url: string | null) => void;
  resetWorkspace: () => void;
}

export const useStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      projectId: null,
      currentStep: 'setup',
      uploadedClips: [],
      aiAnswers: {},
      paymentStatus: false,
      jobId: null,
      draftUrl: null,
      finalUrl: null,

      setProjectId: (id) => set({ projectId: id }),
      setCurrentStep: (step) => set({ currentStep: step }),
      addUploadedClip: (clip) => set((state) => ({ uploadedClips: [...state.uploadedClips, clip] })),
      setAiAnswers: (answers) => set({ aiAnswers: answers }),
      setPaymentStatus: (status) => set({ paymentStatus: status }),
      setJobId: (id) => set({ jobId: id }),
      setDraftUrl: (url) => set({ draftUrl: url }),
      setFinalUrl: (url) => set({ finalUrl: url }),
      
      resetWorkspace: () => set({
        projectId: null,
        currentStep: 'setup',
        uploadedClips: [],
        aiAnswers: {},
        paymentStatus: false,
        jobId: null,
        draftUrl: null,
        finalUrl: null,
      }),
    }),
    {
      name: 'cinema-ai-storage',
    }
  )
);
