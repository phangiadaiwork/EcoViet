import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent } from '@mui/material';

const ApiTest: React.FC = () => {
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testProductsAPI = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://be-ecom-2hfk.onrender.com/api/v1/products?page=1&limit=5');
            const data = await response.json();
            setTestResult({
                status: response.status,
                data: data,
                url: 'https://be-ecom-2hfk.onrender.com/api/v1/products?page=1&limit=5'
            });
        } catch (error: any) {
            setTestResult({
                error: error.message,
                url: 'https://be-ecom-2hfk.onrender.com/api/v1/products?page=1&limit=5'
            });
        } finally {
            setLoading(false);
        }
    };

    const testCategoriesAPI = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://be-ecom-2hfk.onrender.com/api/v1/categories');
            const data = await response.json();
            setTestResult({
                status: response.status,
                data: data,
                url: 'https://be-ecom-2hfk.onrender.com/api/v1/categories'
            });
        } catch (error: any) {
            setTestResult({
                error: error.message,
                url: 'https://be-ecom-2hfk.onrender.com/api/v1/categories'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                API Test
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button 
                    variant="contained" 
                    onClick={testProductsAPI}
                    disabled={loading}
                >
                    Test Products API
                </Button>
                <Button 
                    variant="contained" 
                    onClick={testCategoriesAPI}
                    disabled={loading}
                >
                    Test Categories API
                </Button>
            </Box>

            {testResult && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Test Result:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            URL: {testResult.url}
                        </Typography>
                        {testResult.status && (
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Status: {testResult.status}
                            </Typography>
                        )}
                        <pre style={{ 
                            background: '#f5f5f5', 
                            padding: '16px', 
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '400px'
                        }}>
                            {JSON.stringify(testResult, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default ApiTest;
