import { useEffect, useRef } from 'react';
import { callPingServer } from '../services/apiHealth/apiHealth';

interface UseServerKeepAliveOptions {
  /**
   * Interval ping (milliseconds) - mặc định 4 phút
   */
  interval?: number;
  /**
   * Có enable ping hay không - mặc định true
   */
  enabled?: boolean;
  /**
   * Callback khi ping thành công
   */
  onSuccess?: () => void;
  /**
   * Callback khi ping thất bại
   */
  onError?: (error: any) => void;
}

/**
 * Hook để tự động ping server nhằm giữ cho server không bị ngủ
 * Sử dụng interval 4 phút (nhỏ hơn 5 phút để đảm bảo server không bị ngủ)
 */
export const useServerKeepAlive = (options: UseServerKeepAliveOptions = {}) => {
  const {
    interval = Number(import.meta.env.VITE_SERVER_PING_INTERVAL) || 4 * 60 * 1000, // 4 phút
    enabled = import.meta.env.VITE_SERVER_PING_ENABLED === 'true' ? (options.enabled ?? true) : false,
    onSuccess,
    onError
  } = options;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPingRef = useRef<Date | null>(null);

  const pingServer = async () => {
    try {
      console.log('[KeepAlive] Pinging server...', new Date().toISOString());
      const response = await callPingServer();
      lastPingRef.current = new Date();
      console.log('[KeepAlive] Server ping successful:', response.data);
      onSuccess?.();
    } catch (error) {
      console.error('[KeepAlive] Server ping failed:', error);
      onError?.(error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Ping ngay lập tức khi component mount
    pingServer();

    // Thiết lập ping định kỳ
    intervalRef.current = setInterval(pingServer, interval);

    // Cleanup khi unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    lastPing: lastPingRef.current,
    pingNow: pingServer
  };
};
