import React, { useState, useEffect } from 'react';
import { Badge, IconButton } from '@mui/material';
import { Receipt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { callGetUserOrders } from '../../services/apiOrders/apiOrders';

const OrdersBadge: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPendingOrders();
        }
    }, [isAuthenticated]);

    const fetchPendingOrders = async () => {
        try {
            const response = await callGetUserOrders({ 
                page: 1, 
                limit: 100, 
                status: 'PENDING' 
            });
            
            if (response?.data) {
                setPendingOrdersCount(response.data.data?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching pending orders:', error);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <IconButton
            color="inherit"
            onClick={() => navigate('/orders')}
            sx={{ 
                color: 'white',
                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                }
            }}
        >
            <Badge 
                badgeContent={pendingOrdersCount} 
                color="error"
                max={99}
            >
                <Receipt />
            </Badge>
        </IconButton>
    );
};

export default OrdersBadge;
