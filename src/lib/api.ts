import { Project, JobStatus, AIPauseQuestion, ScriptResponse, RenderSettings, RenderResponse } from './types';
import { supabase } from './supabase';

// FORCE 127.0.0.1 to bypass stale Next.js `.env` cache and Chrome IPv6 resolution bugs
const API_BASE_URL = 'http://127.0.0.1:8000';

// ───── Auth Token Management ─────

export async function getAuthToken(): Promise<string | null> {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const devToken = localStorage.getItem('dev_token');
        if (devToken) return devToken;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
    
    // Dev fallback: always return DEV_TOKEN so backend's dev bypass works
    if (process.env.NODE_ENV === 'development') return 'DEV_TOKEN';
    return null;
}

export async function logout(): Promise<void> {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        localStorage.removeItem('dev_token');
    }
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
}

// ───── Helpers ─────

async function getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = await getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function handleResponse(response: Response) {
    if (response.status === 401) {
        logout();
        if (typeof window !== 'undefined') {
            window.location.href = '/auth';
        }
        throw new Error('Session expired. Please log in again.');
    }
    
    if (!response.ok) {
        let errorMsg = `API Request Failed: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.detail) {
                errorMsg = typeof errorData.detail === 'string' 
                    ? errorData.detail 
                    : JSON.stringify(errorData.detail);
            }
        } catch (e) {
            // No JSON body
        }
        throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return null;
}

// ───── Projects ─────

export async function getProjects(): Promise<Project[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects`, { headers });
    return handleResponse(response);
}

export async function getUserUsage(): Promise<{ plan: string, usage_minutes_used: number, usage_minutes_limit: number }> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/usage`, { headers });
    return handleResponse(response);
}

export async function getAdminStats(): Promise<any> {
    const headers = await getHeaders();
    headers['X-Admin-Key'] = 'cinema-ai-admin-2025'; // Dev key — change in prod
    const response = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
    return handleResponse(response);
}

export async function createProject(
    name: string, 
    content_type: string, 
    style: string, 
    output_preference: string,
    mode: string
): Promise<Project> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, content_type, style, output_preference, mode }),
    });
    return handleResponse(response);
}

export async function getProjectStatus(projectId: string): Promise<any> {
    const headers = await getHeaders();
    delete headers['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/status`, { headers });
    return handleResponse(response);
}

// ───── Clips ─────

export async function uploadClip(
    projectId: string,
    file: File,
    onProgress: (progress: number) => void
): Promise<{ filename: string }> {
    const token = await getAuthToken();
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        xhr.open("POST", `${API_BASE_URL}/projects/${projectId}/upload`, true);
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                onProgress((event.loaded / event.total) * 100);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    resolve(xhr.responseText as any);
                }
            } else {
                let serverError = xhr.responseText;
                try {
                    const parsed = JSON.parse(xhr.responseText);
                    serverError = parsed.detail || parsed.message || xhr.responseText;
                } catch (e) {}
                reject(new Error(`Upload failed with status ${xhr.status}: ${serverError}`));
            }
        };

        xhr.onerror = () => reject(new Error('Upload failed due to network error'));
        xhr.send(formData);
    });
}

// ───── Jobs ─────

export async function startAnalysis(projectId: string): Promise<{ job_id: string }> {
    const headers = await getHeaders();
    delete headers['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analyze`, { 
        method: 'POST',
        headers
    });
    return handleResponse(response);
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
    const headers = await getHeaders();
    delete headers['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, { headers });
    return handleResponse(response);
}

// ───── Director's Table ─────

export async function getProject(projectId: string): Promise<Project> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, { headers });
    return handleResponse(response);
}

export async function getClips(projectId: string): Promise<any[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/clips`, { headers });
    return handleResponse(response);
}

export async function getAIPause(projectId: string): Promise<{ questions: AIPauseQuestion[] }> {
    const headers = await getHeaders();
    delete headers['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/ai-pause`, { headers });
    return handleResponse(response);
}

export async function submitAnswers(projectId: string, answers: Record<string, string>): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/answers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers }),
    });
    await handleResponse(response);
}

export async function submitPrompt(projectId: string, prompt: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/prompts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt }),
    });
    await handleResponse(response);
}

// Legacy alias
export async function approveAIPause(projectId: string, answers: Record<string, string>): Promise<void> {
    return submitAnswers(projectId, answers);
}

// ───── Script ─────

export async function getScript(projectId: string): Promise<ScriptResponse> {
    const headers = await getHeaders();
    delete headers['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/script`, { headers });
    if (!response.ok) throw new Error('Failed to get script');
    return response.json();
}

// ───── Payment ─────

export async function createPaymentOrder(projectId: string): Promise<{ order_id: string; amount: number }> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/verify-tier`, {
        method: 'POST',
        headers,
    });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Payment failed (${response.status}): ${text}`);
    }
    return response.json();
}

// Legacy alias
export async function payProject(projectId: string): Promise<void> {
    await createPaymentOrder(projectId);
}

// ───── Render ─────

export async function startRender(projectId: string, settings: RenderSettings): Promise<RenderResponse> {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/finalize-video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(settings),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Render failed (${response.status}): ${text}`);
    }
    return response.json();
}

// ───── Download ─────

export function getDownloadUrl(filename: string): string {
    return `${API_BASE_URL}/download/${filename}`;
}
