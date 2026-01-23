
const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    // Profile & Balance
    getProfile: async () => {
        const res = await fetch(`${API_URL}/profile/`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    },

    updateProfile: async (data: any) => {
        const res = await fetch(`${API_URL}/profile/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Cases
    getCases: async () => {
        const res = await fetch(`${API_URL}/cases/`, { headers: getHeaders() });
        return res.json();
    },

    saveCase: async (caseData: any) => {
        const res = await fetch(`${API_URL}/cases/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(caseData)
        });
        if (!res.ok) throw new Error('Failed to save case');
        return res.json();
    },

    deleteCase: async (id: number | string) => {
        await fetch(`${API_URL}/cases/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    },

    // Documents
    getDocuments: async () => {
        const res = await fetch(`${API_URL}/documents/`, { headers: getHeaders() });
        return res.json();
    },

    uploadDocument: async (file: File, name: string, type: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('type', type);

        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/documents/`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        return res.json();
    },

    deleteDocument: async (id: string | number) => {
        const token = localStorage.getItem('authToken');
        await fetch(`${API_URL}/documents/${id}/`, {
            method: 'DELETE',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
    },

    // Transactions
    topUp: async (amount: number) => {
        const res = await fetch(`${API_URL}/transactions/topup/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount })
        });
        return res.json();
    },

    getTransactions: async () => {
        const res = await fetch(`${API_URL}/transactions/`, { headers: getHeaders() });
        return res.json();
    }
};
