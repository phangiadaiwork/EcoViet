export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  parent_id?: string;
  isDeleted: boolean;
  createAt: string;
  updateAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  category_id: string;
  images: string[];
  slug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  weight?: number;
  dimensions?: string;
  brand?: string;
  tags?: string[];
  average_rating: number;
  total_reviews: number;
  isDeleted: boolean;
  createAt: string;
  updateAt: string;
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  createAt: string;
  updateAt: string;
  product: Product;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  shipping_fee: number;
  tax_amount: number;
  discount_amount: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  billing_name?: string;
  billing_email?: string;
  billing_phone?: string;
  billing_address?: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  notes?: string;
  createAt: string;
  updateAt: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  createAt: string;
  updateAt: string;
  product: Product;
}
