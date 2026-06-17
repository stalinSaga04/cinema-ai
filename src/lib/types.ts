export type StepId = 'setup' | 'upload' | 'analyze' | 'directors-table' | 'render' | 'download';

export interface Project {
    id: string;
    name: string;
    status: string;
    content_type?: string;
    style?: string;
    output_preference?: string;
    duration?: number;
    estimated_duration?: number;
    cuts_count?: number;
    silence_removed?: number;
    draft_url?: string;
    final_url?: string;
    created_at: string;
}


export interface JobStatus {
    job_id: string;
    state: 'pending' | 'running' | 'done' | 'failed';
    progress: number;
    message: string;
}

export interface AIPauseQuestion {
    id: string;
    question: string;
    options?: string[];
    answer?: string;
}

export interface ScriptResponse {
    project_id: string;
    script: string;
    storyboard: Scene[];
}

export interface Scene {
    id: number;
    description: string;
    thumbnail?: string;
}

export interface RenderSettings {
    aspectRatio: '16:9' | '9:16' | '1:1';
    subtitles: boolean;
    mood: string;
    is_draft?: boolean;
}

export interface RenderResponse {
    job_id: string;
    status: string;
}

export interface ClipReport {
    name: string;
    used: boolean;
    reason?: string;
    type?: string;
    score?: number;
}

export interface WorkspaceState {
    projectId: string | null;
    activeStep: StepId;
    jobId: string | null;
    uploadedFiles: string[];
    scriptText: string;
    questions: AIPauseQuestion[];
    outputFilename: string | null;
    contentType: string;
    style: string;
    outputPreference: string;
    clipReport: ClipReport[];
    draftUrl: string | null;
    paid: boolean;
}
