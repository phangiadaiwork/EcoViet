import axios from '../../utils/axiosCustomize';

// Get user profile
export const callGetProfile = () => {
    return axios.get('/api/v1/users/profile');
};

// Update user profile
export const callUpdateProfile = (data: any) => {
    return axios.put('/api/v1/users/profile', data);
};

// Upload avatar
export const callUploadAvt = (file: File) => {
    const formData = new FormData();
    formData.append('fileImg', file);
    
    return axios.post('/api/v1/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Get 2FA status
export const callGet2FAStatus = () => {
    return axios.get('/api/v1/users/2fa/status');
};

// Toggle 2FA
export const callToggle2FA = (data: { enabled: boolean; password?: string }) => {
    return axios.post('/api/v1/users/2fa/toggle', data);
};

// Change password
export const callChangePassword = (data: { currentPassword: string; newPassword: string }) => {
    return axios.post('/api/v1/users/change-password', data);
};

// Delete account
export const callDeleteAccount = (password: string) => {
    return axios.delete('/api/v1/users/account', {
        data: { password }
    });
};
