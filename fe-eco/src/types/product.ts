// Product interface definitions

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  createAt?: string;
  createdAt?: string;
  user_id?: string;
  product_id?: string;
  user: User;
  verified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription?: string;
  price: number;
  salePrice?: number;
  sale_price?: string; // API field
  image?: string;
  images?: string[];
  stock?: number;
  sku?: string;
  brand?: string;
  weight?: string;
  dimensions?: string;
  category: Category | string;
  category_id?: string;
  reviews?: Review[];
  reviewCount?: number;
  rating?: number;
  features?: string[];
  specifications?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  meta_title?: string; // API field
  meta_description?: string; // API field
  meta_keywords?: string; // API field
  isDeleted?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createAt?: string; // API field
  updateAt?: string; // API field
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductResponse {
  data: Product;
  message?: string;
}
