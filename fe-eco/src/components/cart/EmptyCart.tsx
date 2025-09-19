import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid
} from '@mui/material';
import {
  ShoppingCartOutlined,
  ArrowBack,
  Store
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EmptyCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <ShoppingCartOutlined 
            sx={{ 
              fontSize: 120, 
              color: 'grey.300',
              mb: 2 
            }} 
          />
          
          <Typography variant="h4" gutterBottom color="text.secondary">
            Giỏ hàng trống
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Bạn chưa có sản phẩm nào trong giỏ hàng. 
            Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
          </Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              size="large"
              startIcon={<Store />}
              onClick={() => navigate('/products')}
              sx={{ minWidth: 150 }}
            >
              Mua sắm ngay
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ minWidth: 150 }}
            >
              Về trang chủ
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            💡 Gợi ý cho bạn
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Xem các sản phẩm mới nhất<br/>
            • Khám phá các danh mục sản phẩm<br/>
            • Tìm kiếm sản phẩm yêu thích<br/>
            • Đăng ký nhận thông báo khuyến mãi
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmptyCart;
