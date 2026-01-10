import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const uploadVideo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE}/upload`, formData);
    return response.data;
};

export const getStatus = async (videoId: string) => {
    const response = await axios.get(`${API_BASE}/status/${videoId}`);
    return response.data;
};

export const getResult = async (videoId: string) => {
    const response = await axios.get(`${API_BASE}/result/${videoId}`);
    return response.data;
};

export const compareTakes = async (videoIds: string[], referenceScript?: string) => {
    const response = await axios.post(`${API_BASE}/compare`, {
        video_ids: videoIds,
        reference_script: referenceScript
    });
    return response.data;
};
