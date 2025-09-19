import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    IconButton,
    InputAdornment,
    Link,
    Divider,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    ShoppingBag,
    Visibility,
    VisibilityOff,
    Lock,
    Phone,
    Google,
    Facebook,
    Apple,
    Security
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { callPhoneLogin, callVerify2FA } from '../../services/apiUser/apiAuth';
import { doLoginAction } from '../../redux/account/accountSlice';
import { toast } from 'react-toastify';

const EcommerceLoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.account.user);
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);

    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        phone: '',
        password: ''
    });

    // 2FA Dialog states
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [twoFACode, setTwoFACode] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [isVerifying2FA, setIsVerifying2FA] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirect based on role or to home
            if (user.roleId === 1) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            phone: '',
            password: ''
        };

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            // Only phone login
            const response = await callPhoneLogin(formData.phone, formData.password);
            
            if (response?.data) {
                // Check if 2FA is required
                if (response.data.requireTwoFactor) {
                    setSessionId(response.data.sessionId);
                    setShow2FADialog(true);
                    toast.info(response.data.message);
                } else {
                    // Normal login success
                    if (typeof window !== 'undefined') localStorage.setItem('access_token', response.data.access_token);
                    dispatch(doLoginAction(response.data.user));
                    toast.success('Đăng nhập thành công!');
                }
            } else {
                throw new Error('Đăng nhập thất bại');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error?.response?.data?.message || 'Số điện thoại hoặc mật khẩu không đúng';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!twoFACode.trim()) {
            toast.error('Vui lòng nhập mã xác thực 2FA');
            return;
        }

        setIsVerifying2FA(true);
        try {
            const response = await callVerify2FA(sessionId, twoFACode);
            
            if (response?.data) {
                localStorage.setItem('access_token', response.data.access_token);
                dispatch(doLoginAction(response.data.user));
                toast.success('Đăng nhập thành công!');
                setShow2FADialog(false);
            }
        } catch (error: any) {
            console.error('2FA verification error:', error);
            const errorMessage = error?.response?.data?.message || 'Mã xác thực không đúng';
            toast.error(errorMessage);
        } finally {
            setIsVerifying2FA(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        toast.info(`Tính năng đăng nhập bằng ${provider} sẽ được cập nhật sớm!`);
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
                            Chào mừng trở lại
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Đăng nhập để tiếp tục mua sắm
                        </Typography>
                    </Box>

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {/* Phone Input */}
                        <TextField
                            fullWidth
                            label="Số điện thoại"
                            value={formData.phone}
                            onChange={handleInputChange('phone')}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Phone color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ textAlign: 'right', mb: 3 }}>
                            <Link
                                component={RouterLink}
                                to="/forgot-password"
                                variant="body2"
                                sx={{ textDecoration: 'none' }}
                            >
                                Quên mật khẩu?
                            </Link>
                        </Box>

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
                                'Đăng nhập'
                            )}
                        </Button>

                        {/* Social Login */}
                        <Box sx={{ mb: 3 }}>
                            <Divider sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Hoặc đăng nhập bằng
                                </Typography>
                            </Divider>

                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleSocialLogin('Google')}
                                        sx={{
                                            py: 1.5,
                                            borderColor: '#db4437',
                                            color: '#db4437',
                                            '&:hover': {
                                                borderColor: '#db4437',
                                                backgroundColor: 'rgba(219, 68, 55, 0.04)'
                                            }
                                        }}
                                    >
                                        <Google />
                                    </Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleSocialLogin('Facebook')}
                                        sx={{
                                            py: 1.5,
                                            borderColor: '#4267B2',
                                            color: '#4267B2',
                                            '&:hover': {
                                                borderColor: '#4267B2',
                                                backgroundColor: 'rgba(66, 103, 178, 0.04)'
                                            }
                                        }}
                                    >
                                        <Facebook />
                                    </Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleSocialLogin('Apple')}
                                        sx={{
                                            py: 1.5,
                                            borderColor: '#000',
                                            color: '#000',
                                            '&:hover': {
                                                borderColor: '#000',
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        <Apple />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Register Link */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Chưa có tài khoản?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/register"
                                    sx={{
                                        fontWeight: 600,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Đăng ký ngay
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* 2FA Verification Dialog */}
                <Dialog 
                    open={show2FADialog} 
                    onClose={() => setShow2FADialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                        <Security sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Xác thực 2FA
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Nhập mã xác thực được gửi đến số điện thoại của bạn
                        </Typography>
                    </DialogTitle>
                    
                    <DialogContent sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Mã xác thực 2FA"
                            value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value)}
                            placeholder="Nhập 6 chữ số"
                            inputProps={{ 
                                maxLength: 6,
                                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                            }}
                            sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Mã sẽ hết hạn sau 5 phút
                        </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button 
                            onClick={() => setShow2FADialog(false)}
                            variant="outlined"
                            sx={{ mr: 1 }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleVerify2FA}
                            variant="contained"
                            disabled={isVerifying2FA || !twoFACode.trim()}
                            sx={{ 
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                minWidth: 120
                            }}
                        >
                            {isVerifying2FA ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                'Xác thực'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default EcommerceLoginPage;
