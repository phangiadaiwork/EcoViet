# E-Commerce Full Stack Application

A modern, full-featured e-commerce platform built with NestJS backend and React frontend, supporting multiple payment gateways and comprehensive product management.

## Architecture Overview

```
E-Commerce Platform
├── Backend (NestJS)
│   ├── REST API with JWT Authentication
│   ├── PostgreSQL Database with Prisma ORM
│   ├── Payment Gateway Integration (PayPal, VNPay)
│   ├── File Upload & Management
│   └── Admin Dashboard APIs
└── Frontend (React + Vite)
    ├── Server-Side Rendering (SSR)
    ├── Redux State Management
    ├── Material-UI Components
    ├── Responsive Design
    └── Shopping Cart & Checkout
```

## Key Features

### Customer Features
- **Product Catalog**: Browse products with search, filtering, and categorization
- **Shopping Cart**: Add/remove items, quantity management, persistent cart
- **Secure Checkout**: Multi-step checkout process with order review
- **Payment Options**: 
  - PayPal (International payments)
  - VNPay (Vietnam domestic payments)
- **Order Management**: Track orders, view order history
- **User Account**: Profile management, order history, wishlist
- **Product Reviews**: Rate and review purchased products
- **Newsletter Subscription**: Marketing email integration

### Admin Features
- **Product Management**: CRUD operations, inventory tracking, SEO optimization
- **Category Management**: Hierarchical categories with image support
- **Order Processing**: Order status management, payment tracking
- **Customer Management**: User accounts, analytics, communication
- **Analytics Dashboard**: Sales reports, customer insights
- **Email Marketing**: Newsletter campaigns, customer engagement

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin/Customer role separation
- **Two-Factor Authentication**: SMS-based 2FA support
- **Input Validation**: Comprehensive data validation and sanitization
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security

## Technology Stack

### Backend (be/)
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, Passport.js
- **File Upload**: Multer
- **Payment**: PayPal SDK, VNPay Integration
- **Email**: Nodemailer, Mailchimp
- **Validation**: Class Validator & Transformer
- **Security**: Helmet, CORS, Throttler
- **Documentation**: Auto-generated API docs

### Frontend (fe-eco/)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Rendering**: Server-Side Rendering (SSR)
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: SCSS, CSS Modules
- **Notifications**: React Toastify

### Database Schema
- **Users**: Customer accounts with roles and 2FA
- **Products**: Full product catalog with SEO
- **Categories**: Hierarchical category system
- **Orders**: Complete order management
- **Payments**: Multi-gateway payment tracking
- **Cart**: Persistent shopping cart
- **Reviews**: Product rating system
- **Wishlist**: Customer favorites

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup (be/)
```bash
# Navigate to backend directory
cd be

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET, payment gateway credentials

# Run database migrations
npm run db:reset

# Seed admin account and initial data
npm run seed:admin

# Start development server
npm run dev
```

### Frontend Setup (fe-eco/)
```bash
# Navigate to frontend directory
cd fe-eco

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure API endpoint and frontend URL

# Start development server
npm run dev
```

### Production Build
```bash
# Backend
cd be
npm run build
npm run start:prod

# Frontend
cd fe-eco
npm run build
npm run serve
```

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"

# PayPal
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
PAYPAL_MODE="sandbox" # or "live"

# VNPay
VNPAY_TMN_CODE="your-vnpay-terminal-code"
VNPAY_HASH_SECRET="your-vnpay-hash-secret"
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"

# SMS (Vonage)
VONAGE_API_KEY="your-vonage-api-key"
VONAGE_API_SECRET="your-vonage-api-secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL="http://localhost:3001"
VITE_FRONTEND_URL="http://localhost:3000"

# Image Upload
VITE_UPLOAD_URL="http://localhost:3001/images"
```

## API Endpoints

### Authentication
```
POST /api/v1/auth/login          # User login
POST /api/v1/auth/register       # User registration
POST /api/v1/auth/logout         # User logout
POST /api/v1/auth/refresh        # Refresh JWT token
```

### Products & Categories
```
GET    /api/v1/products          # List products (with filters)
GET    /api/v1/products/:id      # Get product details
POST   /api/v1/products          # Create product (Admin)
PUT    /api/v1/products/:id      # Update product (Admin)
DELETE /api/v1/products/:id      # Delete product (Admin)

GET    /api/v1/categories        # List categories
POST   /api/v1/categories        # Create category (Admin)
```

### Cart & Orders
```
GET    /api/v1/cart              # Get user cart
POST   /api/v1/cart              # Add item to cart
PUT    /api/v1/cart/:id          # Update cart item
DELETE /api/v1/cart/:id          # Remove cart item

POST   /api/v1/orders            # Create order
GET    /api/v1/orders            # Get user orders
GET    /api/v1/orders/:id        # Get order details
```

### Payments
```
POST   /api/v1/payments/vnpay/create     # Create VNPay payment
GET    /api/v1/payments/vnpay/return     # VNPay callback
POST   /api/v1/payments/paypal/create    # Create PayPal payment
POST   /api/v1/payments/paypal/execute   # Execute PayPal payment
```

## Database Schema

### Core Tables
- `Users`: Customer accounts and admin users
- `Roles`: User role management
- `Products`: Product catalog with SEO fields
- `Categories`: Hierarchical category structure
- `Orders`: Order management system
- `OrderItems`: Order line items
- `Payments`: Payment transaction records
- `CartItems`: Shopping cart persistence
- `Reviews`: Product reviews and ratings
- `Wishlist`: Customer favorites

### Key Relationships
- Users → Orders (One-to-Many)
- Orders → OrderItems (One-to-Many)
- Products → Reviews (One-to-Many)
- Categories → Products (One-to-Many)
- Users → CartItems (One-to-Many)

## Frontend Structure

```
fe-eco/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── cart/           # Cart-related components
│   │   ├── header/         # Navigation components
│   │   ├── product/        # Product display components
│   │   └── payment/        # Payment components
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Authentication pages
│   │   ├── cart/           # Shopping cart pages
│   │   ├── products/       # Product listing/detail pages
│   │   └── orders/         # Order management pages
│   ├── redux/              # State management
│   │   ├── account/        # User account state
│   │   └── cart/           # Shopping cart state
│   ├── services/           # API service layers
│   │   ├── apiEcommerce/   # E-commerce APIs
│   │   └── apiAdmin/       # Admin APIs
│   └── utils/              # Utility functions
```

## Authentication & Authorization

### JWT Authentication Flow
1. User login with credentials
2. Server validates and returns JWT token
3. Token stored in Redux + localStorage
4. Token sent in Authorization header for protected routes
5. Server validates token and extracts user info

### Role-Based Access Control
- **Customer**: Product browsing, cart, orders, profile
- **Admin**: Full CRUD access, analytics, user management

### Two-Factor Authentication
- SMS-based OTP verification
- Integration with Vonage SMS service
- Optional security enhancement

## Payment Integration

### VNPay (Vietnam)
- Domestic payment gateway for Vietnamese customers
- Support for major Vietnamese banks
- Real-time payment verification
- Automatic order status updates

### PayPal (International)
- Global payment processing
- Credit card and PayPal balance support
- Multi-currency transactions
- Secure payment execution flow

### Payment Flow
1. Customer completes checkout
2. Order created with PENDING status
3. Payment gateway redirects to payment page
4. Customer completes payment
5. Gateway webhook/callback updates order status
6. Email confirmation sent
7. Cart cleared automatically

## Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Enhanced tablet experience
- **Desktop**: Full-featured desktop interface
- **PWA Ready**: Progressive Web App capabilities

## Deployment

### Backend Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm run serve
```

### Docker Support (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## Testing

```bash
# Backend tests
cd be
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report

# Frontend tests
cd fe-eco
npm run test          # Component tests
```

## Performance Optimizations

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequent queries
- **Rate Limiting**: API request throttling
- **Image Optimization**: Compressed product images
- **Database Connection Pooling**: Efficient connection management

### Frontend
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Lazy Loading**: Optimized image loading
- **Bundle Optimization**: Vite build optimizations
- **State Persistence**: Redux persist for better UX
- **Server-Side Rendering**: Improved SEO and initial load

## SEO Features

- **Meta Tags**: Dynamic meta titles, descriptions, keywords
- **Product Schema**: Structured data for products
- **Sitemap Generation**: Automatic XML sitemap
- **Clean URLs**: SEO-friendly URLs with slugs
- **OpenGraph**: Social media sharing optimization

## Security Measures

- **Input Validation**: Comprehensive validation using class-validator
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention
- **Helmet**: Security headers middleware
- **Environment Variables**: Sensitive data protection

## Analytics & Monitoring

- **Sales Analytics**: Revenue, order, and customer metrics
- **Performance Monitoring**: API response times and errors
- **User Behavior**: Page views, conversion tracking
- **Inventory Alerts**: Low stock notifications
- **Email Campaign Analytics**: Newsletter performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure code passes linting and formatting

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions:
- Email: phangiadai.work@gmail.com
- Phone: +84 375 098 759
- Chat: Available in admin dashboard

## Roadmap

### Upcoming Features
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Real-time business intelligence
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Subscription Products**: Recurring payment support
- [ ] **Advanced Search**: Elasticsearch integration
- [ ] **Social Login**: Google, Facebook authentication
- [ ] **Inventory Management**: Advanced stock tracking
- [ ] **Affiliate Program**: Partner commission system

### Version History
- **v1.0.0** (Current): Core e-commerce functionality
- **v0.9.0**: Beta testing phase
- **v0.8.0**: Payment integration
- **v0.7.0**: Admin dashboard
- **v0.6.0**: Shopping cart implementation

---

Built with ❤️ by Phan Gia Dai

**Last Updated**: September 2025
