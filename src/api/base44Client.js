const API_BASE = 'https://collateral-backend.gangaa.workers.dev/api';
const MAX_UPLOAD_BYTES = 700 * 1024;

const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

const createEntityApi = (entityName) => ({
    list: async (sort = '-created_date', limit = 200) => {
        const query = new URLSearchParams({ sort, limit: String(limit) });
        return request(`/entities/${entityName}?${query.toString()}`, { method: 'GET' });
    },
    create: async (data) => request(`/entities/${entityName}`, { method: 'POST', body: JSON.stringify(data) }),
    update: async (id, data) => request(`/entities/${entityName}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
});

const toDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export const base44 = {
    entities: {
        Collateral: createEntityApi('Collateral'),
        Borrower: createEntityApi('Borrower'),
        Branch: createEntityApi('Branch'),
        Valuation: createEntityApi('Valuation'),
        LegalCheck: createEntityApi('LegalCheck'),
        AuditLog: createEntityApi('AuditLog'),
        ApprovalRequest: createEntityApi('ApprovalRequest'),
        User: createEntityApi('User'),
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                if (file.size > MAX_UPLOAD_BYTES) {
                    throw new Error('File is too large. Maximum supported size is 700 KB.');
                }

                const contentBase64 = await toDataUrl(file);
                return request('/integrations/core/upload-file', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: file.name,
                        type: file.type,
                        contentBase64,
                    }),
                });
            },
        },
    },
    auth: {
        me: async () => request('/auth/me', { method: 'GET' }),
        logout: (redirectUrl) => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('base44_access_token');
                localStorage.removeItem('token');
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            }
        },
        redirectToLogin: (redirectUrl) => {
            if (typeof window !== 'undefined' && redirectUrl) {
                window.location.href = redirectUrl;
            }
        },
    },
};
