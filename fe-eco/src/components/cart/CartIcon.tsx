import React from 'react';
import { Badge, IconButton } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface CartIconProps {
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  size?: 'small' | 'medium' | 'large';
}

const CartIcon: React.FC<CartIconProps> = ({ color = 'inherit', size = 'medium' }) => {
  const navigate = useNavigate();
  const totalItems = useSelector((state: any) => state.cart.totalItems);
  const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/cart');
  };

  return (
    <IconButton 
      onClick={handleCartClick}
      color={color}
      size={size}
      title="Giỏ hàng"
    >
      <Badge 
        badgeContent={totalItems} 
        color="error"
        max={99}
        showZero={false}
      >
        <ShoppingCart />
      </Badge>
    </IconButton>
  );
};

export default CartIcon;
