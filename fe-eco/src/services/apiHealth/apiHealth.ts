import axios from "../../utils/axiosCustomize";

/**
 * Ping backend server để giữ cho server không bị ngủ
 */
export const callPingServer = () => {
    return axios.get("/health/ping");
}

/**
 * Kiểm tra health của server
 */
export const callHealthCheck = () => {
    return axios.get("/health");
}

/**
 * Kiểm tra health của database
 */
export const callDatabaseHealth = () => {
    return axios.get("/health/db");
}
