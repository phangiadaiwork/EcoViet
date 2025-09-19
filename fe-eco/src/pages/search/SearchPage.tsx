import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    InputBase,
    IconButton,
    Typography,
    Chip,
    Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();

    const popularSearches = [
        'Thuốc cảm cúm',
        'Vitamin',
        'Khẩu trang',
        'Thuốc giảm đau',
        'Sữa bột',
        'Dầu gội',
        'Kem dưỡng da',
        'Thuốc ho'
    ];

    const handleSearch = (searchTerm: string) => {
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleSearch(searchValue);
    };

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2 }}
                >
                    <ArrowBackIosIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tìm kiếm
                </Typography>
            </Box>

            {/* Search Bar */}
            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    mb: 4,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'white'
                }}
            >
                <InputBase
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    sx={{
                        ml: 1,
                        flex: 1,
                        fontSize: '1rem'
                    }}
                    autoFocus
                />
                <IconButton
                    type="submit"
                    sx={{
                        p: 1,
                        color: 'primary.main'
                    }}
                >
                    <SearchIcon />
                </IconButton>
            </Paper>

            {/* Popular Searches */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUpIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Tìm kiếm phổ biến
                    </Typography>
                </Box>
                <Grid container spacing={1}>
                    {popularSearches.map((search, index) => (
                        <Grid item key={index}>
                            <Chip
                                label={search}
                                onClick={() => handleSearch(search)}
                                sx={{
                                    borderRadius: 2,
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'white'
                                    }
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default SearchPage;
