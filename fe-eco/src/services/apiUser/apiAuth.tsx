import axios from "../../utils/axiosCustomize";

export const callRegister = (email: string, password: string, name: string, gender: string, phone: string, address: string) => {
    return axios.post("/api/v1/auth/public-register", { name, email, password, phone, gender, address });
}

export const callLogin = (email: string, password: string) => {
    return axios.post("/api/v1/auth/login", { email, password })
}

export const callPhoneLogin = (phone: string, password: string) => {
    return axios.post("/api/v1/auth/phone-login", { phone, password })
}

export const callSendOtp = (phone: string) => {
    return axios.post("/api/v1/auth/send-otp", { phone })
}

export const callVerifyOtp = (phone: string, otp: string) => {
    return axios.post("/api/v1/auth/verify-otp", { phone, otp })
}

export const callVerify2FA = (sessionId: string, code: string) => {
    return axios.post("/api/v1/auth/verify-2fa", { sessionId, code })
}

export const callResetPassword = (phone: string, newPassword: string) => {
    return axios.post("/api/v1/auth/reset-password", { phone, newPassword })
}

export const callForgotPasswordSendOtp = (phone: string) => {
    return axios.post("/api/v1/auth/forgot-password/send-otp", { phone })
}

export const callForgotPasswordVerifyOtp = (phone: string, otp: string) => {
    return axios.post("/api/v1/auth/forgot-password/verify-otp", { phone, otp })
}

export const callFetchAccount = (): Promise<any> => {
    return axios.get("/api/v1/auth/account");
}

export const callLogout = () => {
    return axios.post("/api/v1/auth/logout");
}

export const callUpdateInfo = (name: string, phone: string, avatar: string) => {
    return axios.put("/api/v1/auth/account", { name, phone, avatar });
}
