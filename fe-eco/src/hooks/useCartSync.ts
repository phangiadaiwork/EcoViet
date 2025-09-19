import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../redux/cart/cartSlice';

export const useCartSync = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
  const cartItems = useSelector((state: any) => state.cart.items);
  const isSyncing = useSelector((state: any) => state.cart.isSyncing);
  const lastSyncError = useSelector((state: any) => state.cart.lastSyncError);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch cart from server when user logs in
      dispatch(fetchCart() as any);
    }
  }, [isAuthenticated, dispatch]);

  return {
    cartItems,
    isSyncing,
    lastSyncError,
    isAuthenticated
  };
};

export default useCartSync;
