import React from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { Delete } from '@mui/icons-material';
import { clearCart } from '../../redux/cart/cartSlice';
import CartIcon from '../../components/cart/CartIcon';

const CartDemo: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const totalItems = useSelector((state: any) => state.cart.totalItems);
  const totalAmount = useSelector((state: any) => state.cart.totalAmount);
  const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
  const isSyncing = useSelector((state: any) => state.cart.isSyncing);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Cart Demo & Status
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Cart Status</Typography>
          <CartIcon />
        </Box>
        
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Is Syncing:</strong> {isSyncing ? 'Yes' : 'No'}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Total Items:</strong> {totalItems}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Total Amount:</strong> {formatPrice(totalAmount)}
        </Typography>
        
        {cartItems.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleClearCart}
          >
            Clear Cart
          </Button>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cart Items ({cartItems.length})
        </Typography>
        
        {cartItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No items in cart. Add products from the products page.
          </Typography>
        ) : (
          cartItems.map((item: any) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <img 
                src={item.image} 
                alt={item.name}
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                onError={(e: any) => {
                  e.target.src = '/images/placeholder-product.svg';
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {item.quantity} | Price: {formatPrice(item.salePrice || item.price)}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold">
                {formatPrice((item.salePrice || item.price) * item.quantity)}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default CartDemo;
