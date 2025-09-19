import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { PaymentTwoTone, Security } from '@mui/icons-material';

interface PayPalPaymentProps {
  amount: number;
  orderId: string;
  currency?: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: any) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  orderId,
  currency = 'USD',
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    // Load PayPal SDK
    loadPayPalScript();
  }, []);

  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      renderPayPalButton();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sandbox_client_id'}&currency=${currency}`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
      renderPayPalButton();
    };
    script.onerror = () => {
      setError('Không thể tải PayPal SDK');
    };
    document.body.appendChild(script);
  };

  const renderPayPalButton = () => {
    if (!window.paypal || !document.getElementById('paypal-button-container')) {
      return;
    }

    window.paypal.Buttons({
      createOrder: async (_data: any, _actions: any) => {
        try {
          setLoading(true);
          
          // Gọi API backend để tạo PayPal order
          const response = await fetch('/api/v1/payments/paypal/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
            },
            body: JSON.stringify({
              order_id: orderId,
              amount: amount,
              currency: currency,
              description: `Payment for order ${orderId}`
            })
          });

          if (!response.ok) {
            throw new Error('Failed to create PayPal order');
          }

          const orderData = await response.json();
          return orderData.payment_id;

        } catch (err: any) {
          setError(err.message);
          onPaymentError(err);
          throw err;
        } finally {
          setLoading(false);
        }
      },

      onApprove: async (data: any, _actions: any) => {
        try {
          setLoading(true);

          // Gọi API backend để execute payment
          const response = await fetch('/api/v1/payments/paypal/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
            },
            body: JSON.stringify({
              payment_id: data.orderID,
              payer_id: data.payerID,
              order_id: orderId
            })
          });

          if (!response.ok) {
            throw new Error('Failed to execute PayPal payment');
          }

          const result = await response.json();
          onPaymentSuccess(result);

        } catch (err: any) {
          setError(err.message);
          onPaymentError(err);
        } finally {
          setLoading(false);
        }
      },

      onError: (err: any) => {
        setError('PayPal payment error');
        onPaymentError(err);
      },

      onCancel: (_data: any) => {
        setError('Payment was cancelled');
        onPaymentError(new Error('Payment cancelled'));
      }
    }).render('#paypal-button-container');
  };

  const handleDirectPayPal = async () => {
    setLoading(true);
    setError('');

    try {
      // Tạo PayPal payment trực tiếp
      const response = await fetch('/api/v1/payments/paypal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: amount,
          currency: currency,
          description: `Payment for order ${orderId}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal payment');
      }

      const result = await response.json();
      
      if (result.approval_url) {
        // Chuyển hướng đến PayPal
        window.location.href = result.approval_url;
      } else {
        throw new Error('No approval URL received');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to create PayPal payment');
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PaymentTwoTone sx={{ mr: 1, color: '#0070ba' }} />
          <Typography variant="h6">
            PayPal Payment
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Amount: <strong>{amount.toFixed(2)} {currency}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {/* PayPal Button Container */}
        {paypalLoaded && (
          <Box sx={{ mb: 2 }}>
            <div id="paypal-button-container"></div>
          </Box>
        )}

        {/* Fallback button */}
        {!paypalLoaded && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleDirectPayPal}
              disabled={loading}
              sx={{ 
                backgroundColor: '#0070ba',
                '&:hover': { backgroundColor: '#005ea6' },
                minWidth: 200 
              }}
            >
              {loading ? 'Processing...' : 'Pay with PayPal'}
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <Security sx={{ fontSize: 16, mr: 1 }} />
            <strong>Secure International Payment:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Protected by PayPal Buyer Protection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Supports major credit cards and PayPal balance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Available in 200+ countries and regions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Multi-currency support (USD, EUR, GBP, etc.)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PayPalPayment;
