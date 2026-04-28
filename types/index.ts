export type UserRole = "buyer" | "seller";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

export type ProductCondition = "new" | "like_new" | "good" | "fair";
export type ProductCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "bags"
  | "accessories"
  | "activewear"
  | "formal";

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand: string;
  size: string;
  condition: ProductCondition;
  stock: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  seller?: Profile;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export type OrderStatus =
  | "order_received"
  | "being_prepared"
  | "packed"
  | "sent"
  | "on_the_way"
  | "delivered";

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  total_price: number;
  shipping_address: string;
  shipping_city: string;
  payment_method: "cod" | "qris" | "mastercard";
  expedition?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  buyer?: Profile;
  seller?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  product?: Product;
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory | "";
  size?: string;
  condition?: ProductCondition | "";
  sortBy?: "newest" | "price_asc" | "price_desc";
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}
