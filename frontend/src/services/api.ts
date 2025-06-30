import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:8000',
  });

export interface Lead {
    id: number;
    name: string;
    company: string;
    industry: string;
    size: number;
    source: string;
    created_at: string;
    summary: string;
    lead_quality: string;
}

export interface EventData {
    user_id: number;
    action: string;
    metadata: { [key: string]: any };
}

export const get_leads = async (industry?: string, minSize?: number, maxSize?: number): Promise<Lead[]> => {
    const params = new URLSearchParams();

    if (industry) params.append('industry', industry);
    if (minSize !== undefined) params.append('min_size', minSize.toString());
    if (maxSize !== undefined) params.append('max_size', maxSize.toString());
    
    const response = await api.get(`/api/leads?${params.toString()}`);
    return response.data;
};

export const post_events = async (event: EventData) => {
    await api.post('/api/events', event);
};

export default api;