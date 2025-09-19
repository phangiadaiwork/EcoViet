import { createBrowserRouter, createMemoryRouter } from 'react-router-dom';
import Home from "./pages/home/ModernEcommerceHomePage";
import EcommerceLoginPage from "./pages/login/EcommerceLoginPage";
import EcommerceRegisterPage from "./pages/register/EcommerceRegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import NotFound from "./components/notFound";
import ProtectedRouteAdmin from "./components/protectedRoute/admin";
import LayoutManagement from "./components/layoutManagement";
import AdminDashboard from "./pages/admin";
import NewCartPage from "./pages/cart/NewCartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import AdminCategories from "./pages/admin/categories";
import AdminProducts from "./pages/admin/products";
import SearchPage from "./pages/search/SearchPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";
import MyOrdersPage from "./pages/orders/MyOrdersPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProductDetailPage from "./pages/products/detailproduct";
import ProductsPage from "./pages/products/productspage";
import Layout from './components/layout/EComLayout';
import EmailMarketingAdmin from './pages/admin/EmailMarketingAdmin';


const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      }, 
      {
        path: "products/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "cart",
        element: <NewCartPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "payment/success",
        element: <PaymentSuccess />,
      },
      {
        path: "payment/cancel",
        element: <PaymentCancel />,
      },
      {
        path: "orders",
        element: <MyOrdersPage />,
      },
      {
        path: "orders/:orderId",
        element: <OrderDetailPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      }
    ]
  },
  {
    path: "/login",
    element: <EcommerceLoginPage />,
  },
  {
    path: "/register", 
    element: <EcommerceRegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRouteAdmin>
        <LayoutManagement />
      </ProtectedRouteAdmin>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <AdminDashboard />
      },
      {
        path: "categories",
        element: <AdminCategories />
      },
      {
        path: "products", 
        element: <AdminProducts />
      },
      {
        path: "email-marketing",
        element: <EmailMarketingAdmin />
      },
    ]
  },
];

export function createRouter() {
  return createBrowserRouter(routes);
}

export function createServerRouter(location: string) {
  return createMemoryRouter(routes, {
    initialEntries: [location],
  });
}