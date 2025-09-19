import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { doGetAccountAction } from '../redux/account/accountSlice';
import { callFetchAccount } from '../services/apiUser/apiAuth';
import { useServerKeepAlive } from './useServerKeepAlive';

export function useClientSideEffects() {
  const dispatch = useDispatch();
  const isClient = typeof window !== 'undefined';

  useServerKeepAlive({
    onSuccess: () => isClient && console.log('[App] Server ping thành công'),
    onError: (error) => isClient && console.warn('[App] Server ping thất bại:', error.message)
  });

  useEffect(() => {
    if (!isClient) return;

    const getAccount = async () => {
      const res = await callFetchAccount();
      if (res && res.data) {
        dispatch(doGetAccountAction(res.data));
      }
    };

    getAccount();
  }, [dispatch, isClient]);
} 