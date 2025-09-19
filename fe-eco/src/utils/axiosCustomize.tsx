import axios from 'axios';
import nProgress from 'nprogress';

nProgress.configure({
    showSpinner: false,
    trickleSpeed: 100
})


const baseUrl = import.meta.env.VITE_BACKEND_URL;
const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

instance.defaults.headers.common = {
    'Authorization': typeof window !== 'undefined' && localStorage.getItem("access_token") ? `Bearer ${localStorage.getItem("access_token")}` : ''
}

const handleRefreshToken = async () => {
    const res = await instance.get("/api/v1/auth/refresh");
    if (res && res.data) {
        return res.data.access_token;
    }
    else {
        null;
    }
}
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    if (typeof window !== 'undefined') {
        nProgress.start();
    }

    if (typeof window !== "undefined" && window.localStorage.getItem("access_token")) {
        config.headers.Authorization = "Bearer " + window.localStorage.getItem("access_token");
    }

    return config;
}, function (error) {
    if (typeof window !== 'undefined') {
        nProgress.done();
    }
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    if (typeof window !== 'undefined') {
        nProgress.done();
    }
    return response && response.data ? response.data : response;
}, async function (error) {
    if (typeof window !== 'undefined') {
        nProgress.done();
    }

    // Các đoạn xử lý token refresh và 401 vẫn giữ nguyên
    if (error.config && error.response && +error.response.statusCode === 401 && !error.config.headers[NO_RETRY_HEADER]) {
        const access_token = await handleRefreshToken();
        error.config.headers[NO_RETRY_HEADER] = "true";
        if (access_token) {
            error.config.headers['Authorization'] = `Bearer ${access_token}`;
            if (typeof window !== 'undefined') localStorage.setItem("access_token", access_token);
            return instance.request(error.config);
        }
    }

    if (error.config && error.response
        && +error.response.status === 400
        && error.config.url === "/api/v1/auth/refresh"
        && typeof window !== 'undefined' && window.location.pathname !== "/login"
    ) {
        if (window.location.pathname !== "/"
            && !window.location.pathname.startsWith("specialty")
            && !window.location.pathname.startsWith("clinic")
            && !window.location.pathname.startsWith("doctor")
        ) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
        }
    }

    return error?.response?.data ?? Promise.reject(error);
});




export default instance;
