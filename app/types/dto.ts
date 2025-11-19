export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  imageId: number;
  productId: number;
  imageUrl: string;
  isMain: boolean;
}

export interface Category {
  categoryId: number;
  name: string;
  parentCategoryId?: number;
}

export interface Cart {
  cartId: number;
  memberId: number;
  productId: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  memberId?: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface CartRequestDTO {
  productId: number;
  quantity: number;
}

export interface SignupRequestDTO {
  email: string;
  name: string;
  phone: string;
  address: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
}

export interface ProductResponseDTO {
  product: Product;
  images: ProductImage[];
  category: Category;
  likeCount: number;
  isLiked: boolean;
  isWished: boolean;
}

export interface ProductSummaryDTO {
  product: Product;
  productImage: ProductImage;
}

export interface CartItemWithProduct extends Cart {
  product?: Product;
  image?: ProductImage;
}

export interface ProductDetail extends ProductResponseDTO {}

export interface OrderRequestDTO {
  items: OrderItemDTO[]; // 주문 항목 리스트
}

export interface OrderItemDTO {
  productId: number; // 상품 ID
  quantity: number; // 수량
  price: number; // 상품 가격
}
