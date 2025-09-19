import React from 'react';
import {
    Card,
    CardContent,
    Box,
    Skeleton
} from '@mui/material';

const ProductCardSkeleton: React.FC = () => {
    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
        }}>
            <Box sx={{ position: 'relative' }}>
                <Skeleton variant="rectangular" height={200} />
                <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    display: 'flex',
                    gap: 1
                }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                </Box>
            </Box>
            
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={16} width="60%" sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Skeleton variant="text" width={80} height={24} />
                    <Skeleton variant="text" width={60} height={20} />
                </Box>
                
                <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
            </CardContent>
        </Card>
    );
};

export default ProductCardSkeleton;
