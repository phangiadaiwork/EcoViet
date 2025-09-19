import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    InputAdornment,
    Link,
    CircularProgress
} from '@mui/material';
import {
    ShoppingBag,
    Phone,
    ArrowBack,
    Lock
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { callSendOtp, callVerifyOtp, callResetPassword } from '../../services/apiUser/apiAuth';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: new password

    const handleSendOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!phone) {
            toast.error('Vui lòng nhập số điện thoại');
            return;
        }

        if (!/^[0-9]{10,11}$/.test(phone.replace(/\D/g, ''))) {
            toast.error('Số điện thoại không hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            await callSendOtp(phone);
            setStep(2);
            toast.success('Mã OTP đã được gửi đến số điện thoại của bạn!');
        } catch (error: any) {
            console.error('Send OTP error:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error('Vui lòng nhập mã OTP');
            return;
        }

        setIsLoading(true);
        try {
            await callVerifyOtp(phone, otp);
            setStep(3);
            toast.success('Xác thực OTP thành công!');
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            const errorMessage = error?.response?.data?.message || 'Mã OTP không đúng';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!newPassword) {
            toast.error('Vui lòng nhập mật khẩu mới');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsLoading(true);
        try {
            await callResetPassword(phone, newPassword);
            toast.success('Đặt lại mật khẩu thành công!');
            navigate('/login');
        } catch (error: any) {
            console.error('Reset password error:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={24}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                textDecoration: 'none',
                                mb: 2
                            }}
                        >
                            <ShoppingBag 
                                sx={{ 
                                    fontSize: 40, 
                                    color: 'primary.main',
                                    filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3))'
                                }} 
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                ECom
                            </Typography>
                        </Box>
                        
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                            Quên mật khẩu
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {step === 1 && 'Nhập số điện thoại để nhận mã OTP'}
                            {step === 2 && 'Nhập mã OTP đã gửi đến số điện thoại'}
                            {step === 3 && 'Đặt mật khẩu mới cho tài khoản'}
                        </Typography>
                    </Box>

                    {/* Step 1: Phone Input */}
                    {step === 1 && (
                        <Box component="form" onSubmit={handleSendOtp}>
                            <TextField
                                fullWidth
                                label="Số điện thoại"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0123456789"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{
                                    mb: 3,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #1976D2 90%)',
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Gửi mã OTP'
                                )}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        textDecoration: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    <ArrowBack fontSize="small" />
                                    Quay lại đăng nhập
                                </Link>
                            </Box>
                        </Box>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <Box>
                            <TextField
                                fullWidth
                                label="Mã OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Nhập 6 chữ số"
                                inputProps={{ maxLength: 6 }}
                                sx={{ mb: 3 }}
                            />

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                                Mã OTP đã được gửi đến số <strong>{phone}</strong>
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                onClick={handleVerifyOtp}
                                sx={{
                                    mb: 2,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #1976D2 90%)',
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Xác thực OTP'
                                )}
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setStep(1)}
                                sx={{ mb: 3 }}
                            >
                                Quay lại
                            </Button>
                        </Box>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <Box component="form" onSubmit={handleResetPassword}>
                            <TextField
                                fullWidth
                                label="Mật khẩu mới"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Xác nhận mật khẩu mới"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{
                                    mb: 3,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #1976D2 90%)',
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Đặt lại mật khẩu'
                                )}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPasswordPage;
