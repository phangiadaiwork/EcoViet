import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    Avatar,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Paper,
    Tab,
    Tabs,
    CircularProgress,
    IconButton,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar
} from '@mui/material';
import {
    Person,
    Security,
    PhotoCamera,
    Edit,
    Save,
    Cancel,
    Shield,
    Email,
    Phone,
    LocationOn,
    Visibility,
    VisibilityOff,
    Notifications
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
// import { RootState } from '../../redux/store';
import { doUpdateInfoAction } from '../../redux/account/accountSlice';
import { 
    callGetProfile,
    callUpdateProfile,
    callGet2FAStatus,
    callToggle2FA,
    callUploadAvt 
} from '../../services/apiUser/apiInfo';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ProfilePage: React.FC = () => {
    const dispatch = useDispatch();
    // const user = useSelector((state: any) => state.account.user);

    // State for tabs
    const [tabValue, setTabValue] = useState(0);

    // State for profile data
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // State for profile editing
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        gender: 'Male',
        description: '',
        newsletter_subscribed: false
    });

    // State for avatar
    const [avatar, setAvatar] = useState('');
    const [previewAvatar, setPreviewAvatar] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // State for 2FA
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // State for notifications
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Load profile data on component mount
    useEffect(() => {
        loadProfileData();
        load2FAStatus();
    }, []);

    const loadProfileData = async () => {
        try {
            setIsLoading(true);
            const response = await callGetProfile();
            if (response?.data) {
                const userData = response.data;
                setProfileData(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    gender: userData.gender || 'Male',
                    description: userData.description || '',
                    newsletter_subscribed: userData.newsletter_subscribed || false
                });
                setAvatar(userData.avatar || '');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Không thể tải thông tin profile');
        } finally {
            setIsLoading(false);
        }
    };

    const load2FAStatus = async () => {
        try {
            const response = await callGet2FAStatus();
            if (response?.data) {
                setTwoFAEnabled(response.data.enabled);
            }
        } catch (error) {
            console.error('Error loading 2FA status:', error);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSelectChange = (field: string) => (event: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.checked
        }));
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 2MB');
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const uploadRes = await callUploadAvt(file);
            if (uploadRes?.data) {
                setAvatar(uploadRes.data);
                setPreviewAvatar(uploadRes.data);
                toast.success('Cập nhật ảnh đại diện thành công');
                
                // Update avatar immediately
                await callUpdateProfile({ avatar: uploadRes.data });
                dispatch(doUpdateInfoAction({ avatar: uploadRes.data }));
            }
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error('Cập nhật ảnh đại diện thất bại');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        // Validate required fields
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập họ tên');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Email không hợp lệ');
            return;
        }

        if (!formData.phone.trim()) {
            toast.error('Vui lòng nhập số điện thoại');
            return;
        }

        const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error('Số điện thoại không hợp lệ');
            return;
        }

        setIsSaving(true);
        try {
            const response = await callUpdateProfile(formData);

            if (response?.data) {
                // Update Redux store
                dispatch(doUpdateInfoAction(formData));
                
                setProfileData((prev: any) => ({ ...prev, ...formData }));
                setIsEditing(false);
                setSuccessMessage('Cập nhật thông tin thành công');
                setShowSuccessAlert(true);
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            const errorMessage = error?.response?.data?.message || 'Cập nhật thông tin thất bại';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (profileData) {
            setFormData({
                name: profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                address: profileData.address || '',
                gender: profileData.gender || 'Male',
                description: profileData.description || '',
                newsletter_subscribed: profileData.newsletter_subscribed || false
            });
        }
        setIsEditing(false);
        setPreviewAvatar('');
    };

    const handle2FAToggle = async () => {
        if (twoFAEnabled) {
            // Disable 2FA - require password confirmation
            setShow2FADialog(true);
        } else {
            // Enable 2FA - direct action
            await toggle2FA(true);
        }
    };

    const toggle2FA = async (enabled: boolean, password?: string) => {
        setIs2FALoading(true);
        try {
            const payload: any = { enabled };
            if (!enabled && password) {
                payload.password = password;
            }

            const response = await callToggle2FA(payload);

            if (response?.data) {
                setTwoFAEnabled(response.data.enabled);
                setShow2FADialog(false);
                setConfirmPassword('');
                toast.success(response.data.message);
            }
        } catch (error: any) {
            console.error('Error toggling 2FA:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra với 2FA';
            toast.error(errorMessage);
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleConfirm2FADisable = async () => {
        if (!confirmPassword) {
            toast.error('Vui lòng nhập mật khẩu');
            return;
        }

        await toggle2FA(false, confirmPassword);
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Đang tải thông tin...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
                Hồ sơ cá nhân
            </Typography>

            <Snackbar
                open={showSuccessAlert}
                autoHideDuration={3000}
                onClose={() => setShowSuccessAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setShowSuccessAlert(false)} 
                    severity="success" 
                    sx={{ width: '100%' }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            <Grid container spacing={4}>
                {/* Left Column - Avatar and Basic Info */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                <Avatar
                                    src={previewAvatar || avatar}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        border: '4px solid',
                                        borderColor: 'primary.main',
                                        fontSize: '3rem'
                                    }}
                                >
                                    {profileData?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                
                                <IconButton
                                    component="label"
                                    disabled={isUploadingAvatar}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        width: 40,
                                        height: 40
                                    }}
                                >
                                    {isUploadingAvatar ? (
                                        <CircularProgress size={20} sx={{ color: 'white' }} />
                                    ) : (
                                        <PhotoCamera />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleAvatarChange}
                                    />
                                </IconButton>
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                {profileData?.name}
                            </Typography>
                            
                            <Chip 
                                label={profileData?.role?.name}
                                color="primary" 
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ textAlign: 'left', mt: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Email sx={{ mr: 2, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        {profileData?.email}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        {profileData?.phone}
                                    </Typography>
                                </Box>
                                
                                {profileData?.address && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {profileData.address}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* 2FA Security Card */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Shield sx={{ mr: 2, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Bảo mật
                                </Typography>
                            </Box>
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={twoFAEnabled}
                                        onChange={handle2FAToggle}
                                        disabled={is2FALoading}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Xác thực 2 bước (2FA)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {twoFAEnabled 
                                                ? 'Đang bật - Tài khoản được bảo vệ'
                                                : 'Đang tắt - Khuyến nghị bật để bảo mật'
                                            }
                                        </Typography>
                                    </Box>
                                }
                                sx={{ alignItems: 'flex-start', ml: 0 }}
                            />
                            
                            {is2FALoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Profile Details */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={tabValue} onChange={handleTabChange}>
                                    <Tab 
                                        label="Thông tin cá nhân" 
                                        icon={<Person />} 
                                        iconPosition="start"
                                    />
                                    <Tab 
                                        label="Cài đặt" 
                                        icon={<Security />} 
                                        iconPosition="start"
                                    />
                                </Tabs>
                            </Box>

                            <TabPanel value={tabValue} index={0}>
                                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Thông tin cá nhân
                                    </Typography>
                                    
                                    {!isEditing ? (
                                        <Button
                                            variant="outlined"
                                            startIcon={<Edit />}
                                            onClick={() => setIsEditing(true)}
                                            sx={{ ml: 'auto' }}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <Box sx={{ ml: 'auto' }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Cancel />}
                                                onClick={handleCancelEdit}
                                                sx={{ mr: 2 }}
                                                disabled={isSaving}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Đang lưu...' : 'Lưu'}
                                            </Button>
                                        </Box>
                                    )}
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Họ và tên"
                                            value={formData.name}
                                            onChange={handleInputChange('name')}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange('email')}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Số điện thoại"
                                            value={formData.phone}
                                            onChange={handleInputChange('phone')}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth disabled={!isEditing}>
                                            <InputLabel>Giới tính</InputLabel>
                                            <Select
                                                value={formData.gender}
                                                label="Giới tính"
                                                onChange={handleSelectChange('gender')}
                                            >
                                                <MenuItem value="Male">Nam</MenuItem>
                                                <MenuItem value="Female">Nữ</MenuItem>
                                                <MenuItem value="Other">Khác</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Địa chỉ"
                                            value={formData.address}
                                            onChange={handleInputChange('address')}
                                            disabled={!isEditing}
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Mô tả"
                                            multiline
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleInputChange('description')}
                                            disabled={!isEditing}
                                            placeholder="Giới thiệu về bản thân..."
                                        />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Cài đặt tài khoản
                                </Typography>

                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Notifications sx={{ mr: 2, color: 'primary.main' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            Thông báo
                                        </Typography>
                                    </Box>
                                    
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.newsletter_subscribed}
                                                onChange={handleSwitchChange('newsletter_subscribed')}
                                                disabled={!isEditing}
                                                color="primary"
                                            />
                                        }
                                        label="Nhận thông báo qua email về sản phẩm mới và khuyến mãi"
                                    />
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Shield sx={{ mr: 2, color: 'primary.main' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            Bảo mật nâng cao
                                        </Typography>
                                    </Box>
                                    
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={twoFAEnabled}
                                                onChange={handle2FAToggle}
                                                disabled={is2FALoading}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body1">
                                                    Xác thực 2 bước (2FA)
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Thêm lớp bảo mật cho tài khoản của bạn
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ alignItems: 'flex-start' }}
                                    />
                                    
                                    {is2FALoading && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    )}
                                </Paper>
                            </TabPanel>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 2FA Disable Confirmation Dialog */}
            <Dialog 
                open={show2FADialog} 
                onClose={() => setShow2FADialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Shield sx={{ mr: 2, color: 'warning.main' }} />
                        Xác nhận tắt 2FA
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Tắt xác thực 2 bước sẽ làm giảm mức độ bảo mật cho tài khoản của bạn.
                    </Alert>
                    
                    <TextField
                        fullWidth
                        label="Mật khẩu hiện tại"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        InputProps={{
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
                    />
                </DialogContent>
                
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setShow2FADialog(false)}
                        disabled={is2FALoading}
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="contained" 
                        color="warning"
                        onClick={handleConfirm2FADisable}
                        disabled={is2FALoading || !confirmPassword}
                        startIcon={is2FALoading ? <CircularProgress size={16} /> : undefined}
                    >
                        {is2FALoading ? 'Đang xử lý...' : 'Tắt 2FA'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProfilePage;
