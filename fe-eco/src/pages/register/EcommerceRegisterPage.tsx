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
    FormControlLabel,
    Checkbox,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    ShoppingBag,
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Person,
    Phone,
    Google,
    Facebook,
    Apple,
    CheckCircle
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { callRegister, callSendOtp, callVerifyOtp } from '../../services/apiUser/apiAuth';
import { toast } from 'react-toastify';

const EcommerceRegisterPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });

    const steps = ['Thông tin cá nhân', 'Xác thực OTP', 'Tạo mật khẩu', 'Hoàn thành'];

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        
        // Special handling for OTP field
        if (field === 'otp') {
            // Only allow numeric input for OTP
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [field]: numericValue
            }));
            
            // Clear error when user starts typing correct format
            if (errors[field as keyof typeof errors]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: ''
                }));
            }
        } else {
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
        }
    };

    const validateStep = (step: number) => {
        const newErrors = { ...errors };
        let isValid = true;

        switch (step) {
            case 0: // Personal info
                if (!formData.fullName.trim()) {
                    newErrors.fullName = 'Họ và tên là bắt buộc';
                    isValid = false;
                }
                if (!formData.email) {
                    newErrors.email = 'Email là bắt buộc';
                    isValid = false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    newErrors.email = 'Email không hợp lệ';
                    isValid = false;
                }
                if (!formData.phone) {
                    newErrors.phone = 'Số điện thoại là bắt buộc';
                    isValid = false;
                } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
                    newErrors.phone = 'Số điện thoại không hợp lệ';
                    isValid = false;
                }
                break;
            
            case 1: // OTP Verification
                if (!otpVerified) {
                    newErrors.otp = 'Vui lòng xác thực OTP';
                    isValid = false;
                }
                break;
            
            case 2: // Password
                if (!formData.password) {
                    newErrors.password = 'Mật khẩu là bắt buộc';
                    isValid = false;
                } else if (formData.password.length < 6) {
                    newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
                    isValid = false;
                }
                if (!formData.confirmPassword) {
                    newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
                    isValid = false;
                } else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
                    isValid = false;
                }
                break;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            // Validate personal info and send OTP
            if (validateStep(activeStep)) {
                await handleSendOtp();
            }
        } else if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        try {
            const response = await callSendOtp(formData.phone);
            
            if (response?.data) {
                setActiveStep(1);
                toast.success('Mã OTP đã được gửi đến số điện thoại của bạn');
            } else {
                throw new Error('Không nhận được phản hồi từ server');
            }
        } catch (error: any) {
            console.error('Send OTP error:', error);
            
            let errorMessage = 'Không thể gửi OTP. Vui lòng thử lại';
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            // Don't change step if OTP sending failed
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp.trim()) {
            setErrors(prev => ({ ...prev, otp: 'Vui lòng nhập mã OTP' }));
            toast.error('Vui lòng nhập mã OTP');
            return;
        }

        if (formData.otp.length !== 6) {
            setErrors(prev => ({ ...prev, otp: 'Mã OTP phải có 6 chữ số' }));
            toast.error('Mã OTP phải có 6 chữ số');
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const response = await callVerifyOtp(formData.phone, formData.otp);
            if (response?.data) {
                setOtpVerified(true);
                setErrors(prev => ({ ...prev, otp: '' })); // Clear error when successful
                toast.success('Xác thực OTP thành công');
                setActiveStep(2);
            }
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            
            let errorMessage = 'Mã OTP không đúng';
            
            // Parse specific error messages from backend
            if (error?.response?.data?.message) {
                const backendMessage = error.response.data.message;
                
                // Always use the backend message first
                errorMessage = backendMessage;
                
                // Then customize for better UX
                if (backendMessage.includes('không tồn tại') || backendMessage.includes('hết hạn')) {
                    errorMessage = 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại mã OTP mới';
                } else if (backendMessage.includes('không đúng')) {
                    errorMessage = 'Mã OTP không đúng. Vui lòng kiểm tra lại';
                }
            } else if (error?.response?.data) {
                // Fallback: try to get any error message from response data
                errorMessage = error.response.data.error || error.response.data.toString() || errorMessage;
            } else if (error?.message) {
                // Fallback: use error message
                errorMessage = error.message;
            }
            
            
            // Force show toast error
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            setErrors(prev => ({ ...prev, otp: errorMessage }));
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!agreedToTerms) {
            toast.error('Vui lòng đồng ý với điều khoản sử dụng');
            return;
        }

        if (!validateStep(1)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await callRegister(
                formData.email,
                formData.password,
                formData.fullName,
                'Male', // gender - mặc định là Male
                formData.phone,
                '' // address - để trống hoặc có thể thêm field
            );
            
            if (response?.data) {
                setActiveStep(3); // Chuyển sang step hoàn thành
                toast.success('Đăng ký thành công!');
                
                // Auto redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                throw new Error('Đăng ký thất bại');
            }
        } catch (error: any) {
            console.error('Register error:', error);
            const errorMessage = error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        toast.info(`Tính năng đăng ký bằng ${provider} sẽ được cập nhật sớm!`);
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <TextField
                            fullWidth
                            label="Họ và tên"
                            value={formData.fullName}
                            onChange={handleInputChange('fullName')}
                            error={!!errors.fullName}
                            helperText={errors.fullName}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            error={!!errors.email}
                            helperText={errors.email}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

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
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Xác thực số điện thoại
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Chúng tôi đã gửi mã OTP đến số điện thoại {formData.phone}
                        </Typography>

                        <TextField
                            fullWidth
                            label="Mã OTP"
                            value={formData.otp}
                            onChange={handleInputChange('otp')}
                            error={!!errors.otp}
                            helperText={errors.otp || 'Nhập mã OTP gồm 6 chữ số'}
                            placeholder="Nhập 6 chữ số"
                            inputProps={{ 
                                maxLength: 6,
                                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                            }}
                            sx={{ 
                                mb: 3,
                                '& .MuiFormHelperText-root': {
                                    textAlign: 'center',
                                    fontSize: '0.875rem'
                                },
                                '& .MuiFormHelperText-root.Mui-error': {
                                    color: 'error.main',
                                    fontWeight: 500
                                }
                            }}
                        />

                        {/* Error Alert */}
                        {errors.otp && (
                            <Box 
                                sx={{ 
                                    p: 2, 
                                    mb: 2, 
                                    backgroundColor: 'error.light', 
                                    border: '1px solid',
                                    borderColor: 'error.main',
                                    borderRadius: 1,
                                    color: 'error.contrastText'
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center' }}>
                                    ⚠️ {errors.otp}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="outlined"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || !formData.otp.trim()}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            {isVerifyingOtp ? (
                                <CircularProgress size={20} />
                            ) : (
                                'Xác thực OTP'
                            )}
                        </Button>

                        <Button
                            variant="text"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            size="small"
                        >
                            {isSendingOtp ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                        </Button>
                    </Box>
                );

            case 2:
                return (
                    <Box>
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
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Xác nhận mật khẩu"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleInputChange('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    Tôi đồng ý với{' '}
                                    <Link component={RouterLink} to="/terms" sx={{ textDecoration: 'none' }}>
                                        Điều khoản sử dụng
                                    </Link>
                                    {' '}và{' '}
                                    <Link component={RouterLink} to="/privacy" sx={{ textDecoration: 'none' }}>
                                        Chính sách bảo mật
                                    </Link>
                                </Typography>
                            }
                            sx={{ mb: 2 }}
                        />
                    </Box>
                );

            case 3:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircle 
                            sx={{ 
                                fontSize: 80, 
                                color: 'success.main', 
                                mb: 2,
                                filter: 'drop-shadow(0 2px 8px rgba(76, 175, 80, 0.3))'
                            }} 
                        />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                            Đăng ký thành công!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600
                            }}
                        >
                            Đăng nhập ngay
                        </Button>
                    </Box>
                );

            default:
                return null;
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
                            Tạo tài khoản mới
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Tham gia ECom để trải nghiệm mua sắm tuyệt vời
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    {activeStep < 2 && (
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.slice(0, 2).map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    )}

                    {/* Form Content */}
                    <Box component="form" onSubmit={handleSubmit}>
                        {renderStepContent(activeStep)}

                        {/* Navigation Buttons */}
                        {activeStep < 3 && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                {activeStep > 0 && activeStep !== 1 && (
                                    <Button
                                        onClick={handleBack}
                                        variant="outlined"
                                        sx={{ flex: 1 }}
                                    >
                                        Quay lại
                                    </Button>
                                )}
                                {activeStep === 0 ? (
                                    <Button
                                        onClick={handleNext}
                                        variant="contained"
                                        disabled={isSendingOtp}
                                        sx={{ 
                                            flex: 1,
                                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                        }}
                                    >
                                        {isSendingOtp ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'Gửi OTP'
                                        )}
                                    </Button>
                                ) : activeStep === 1 ? (
                                    // OTP step - buttons are handled in renderStepContent
                                    null
                                ) : activeStep === 2 ? (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={isLoading || !agreedToTerms}
                                        sx={{
                                            flex: 1,
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
                                            'Hoàn thành đăng ký'
                                        )}
                                    </Button>
                                ) : null}
                            </Box>
                        )}

                        {/* Social Registration */}
                        {activeStep === 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Divider sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Hoặc đăng ký bằng
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
                        )}

                        {/* Login Link */}
                        {activeStep < 2 && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Đã có tài khoản?{' '}
                                    <Link
                                        component={RouterLink}
                                        to="/login"
                                        sx={{
                                            fontWeight: 600,
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Đăng nhập ngay
                                    </Link>
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default EcommerceRegisterPage;
