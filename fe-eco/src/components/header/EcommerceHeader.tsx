import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Box,
    Container,
    InputBase,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Search as SearchIcon,
    ShoppingCart,
    FavoriteBorder,
    Menu as MenuIcon,
    ShoppingBag,
    Home,
    Category,
    LocalOffer,
    ContactSupport,
    Login,
    PersonAdd,
    Dashboard,
    Logout,
    AccountCircle,
    Receipt
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { styled, alpha } from '@mui/material/styles';
import { doLogoutAction } from '../../redux/account/accountSlice';
import { callLogout } from '../../services/apiUser/apiAuth';
import { toast } from 'react-toastify';

const SearchContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.spacing(3),
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '20ch',
            '&:focus': {
                width: '30ch',
            },
        },
    },
}));

const EcommerceHeader = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
    const user = useSelector((state: any) => state.account.user);
    const cartTotalItems = useSelector((state: any) => state.cart.totalItems);
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleUserMenuOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = async () => {
        try {
            await callLogout();
            dispatch(doLogoutAction());
            if (typeof window !== 'undefined') localStorage.removeItem('access_token');
            toast.success('Đăng xuất thành công');
            navigate('/');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi đăng xuất');
        }
        handleUserMenuClose();
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const menuItems = [
        { text: 'Trang chủ', icon: <Home />, path: '/' },
        { text: 'Sản phẩm', icon: <ShoppingBag />, path: '/products' },
        { text: 'Danh mục', icon: <Category />, path: '/categories' },
        { text: 'Khuyến mãi', icon: <LocalOffer />, path: '/promotions' },
        { text: 'Liên hệ', icon: <ContactSupport />, path: '/contact' }
    ];

    const drawer = (
        <Box sx={{ width: 250 }} role="presentation">
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ECom Store
                </Typography>
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                {!isAuthenticated ? (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                                <ListItemIcon><Login /></ListItemIcon>
                                <ListItemText primary="Đăng nhập" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                                <ListItemIcon><PersonAdd /></ListItemIcon>
                                <ListItemText primary="Đăng ký" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate('/profile'); setMobileOpen(false); }}>
                                <ListItemIcon><AccountCircle /></ListItemIcon>
                                <ListItemText primary="Tài khoản" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate('/orders'); setMobileOpen(false); }}>
                                <ListItemIcon><Receipt /></ListItemIcon>
                                <ListItemText primary="Đơn hàng của tôi" />
                            </ListItemButton>
                        </ListItem>
                        {user?.roleId === 1 && (
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => { navigate('/admin'); setMobileOpen(false); }}>
                                    <ListItemIcon><Dashboard /></ListItemIcon>
                                    <ListItemText primary="Quản lý" />
                                </ListItemButton>
                            </ListItem>
                        )}
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon><Logout /></ListItemIcon>
                                <ListItemText primary="Đăng xuất" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar 
                position="sticky" 
                sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        {/* Logo */}
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textDecoration: 'none',
                                color: 'inherit',
                                flexShrink: 0
                            }}
                        >
                            <ShoppingBag sx={{ fontSize: 32 }} />
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                ECom
                            </Typography>
                        </Box>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 2, mx: 4 }}>
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.text}
                                        color="inherit"
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            fontWeight: 600,
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                transform: 'translateY(-1px)'
                                            }
                                        }}
                                    >
                                        {item.text}
                                    </Button>
                                ))}
                            </Box>
                        )}

                        {/* Search Bar */}
                        <Box
                            component="form"
                            onSubmit={handleSearch}
                            sx={{ flexGrow: 1, maxWidth: 400, mx: 2 }}
                        >
                            <SearchContainer>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Tìm kiếm sản phẩm..."
                                    inputProps={{ 'aria-label': 'search' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </SearchContainer>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Wishlist */}
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/wishlist')}
                                sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <Badge badgeContent={0} color="error">
                                    <FavoriteBorder />
                                </Badge>
                            </IconButton>

                            {/* Shopping Cart */}
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/cart')}
                                sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <Badge badgeContent={cartTotalItems} color="error">
                                    <ShoppingCart />
                                </Badge>
                            </IconButton>

                            {/* User Menu */}
                            {!isMobile && (
                                <>
                                    {isAuthenticated ? (
                                        <IconButton
                                            color="inherit"
                                            onClick={handleUserMenuOpen}
                                            sx={{ ml: 1 }}
                                        >
                                            <Avatar 
                                                src={`user?.avatar`} 
                                                alt={user?.name}
                                                sx={{ width: 32, height: 32 }}
                                            >
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                    ) : (
                                        <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                                            <Button
                                                color="inherit"
                                                variant="outlined"
                                                onClick={() => navigate('/login')}
                                                sx={{
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                    '&:hover': {
                                                        borderColor: 'white',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                                    }
                                                }}
                                            >
                                                Đăng nhập
                                            </Button>
                                            <Button
                                                color="inherit"
                                                variant="contained"
                                                onClick={() => navigate('/register')}
                                                sx={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.3)'
                                                    }
                                                }}
                                            >
                                                Đăng ký
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* User Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                    <AccountCircle sx={{ mr: 2 }} />
                    Tài khoản của tôi
                </MenuItem>
                <MenuItem onClick={() => { navigate('/orders'); handleUserMenuClose(); }}>
                    <Receipt sx={{ mr: 2 }} />
                    Đơn hàng của tôi
                </MenuItem>
                {user?.roleId === 1 && (
                    <MenuItem onClick={() => { navigate('/admin'); handleUserMenuClose(); }}>
                        <Dashboard sx={{ mr: 2 }} />
                        Quản lý hệ thống
                    </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 2 }} />
                    Đăng xuất
                </MenuItem>
            </Menu>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: 250,
                        borderRadius: '0 20px 20px 0',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default EcommerceHeader;
