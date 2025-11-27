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
  productSizeId: number;
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
  kakaoId?: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface ProductSizeDTO {
  size: string;
  productSizeId: number;
}

export interface ProductResponseDTO {
  product: Product;
  images: ProductImage[];
  sizes: ProductSizeDTO[]; // 수정: 문자열 배열 -> 객체 배열
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
  image?: { imageUrl: string };
  size?: string;
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

export interface UpdateRequestDTO {
  memberId?: number; // 선택: 수정할 회원 ID, 서버에서 세션 기반으로 처리 가능
  name?: string; // 이름 수정 가능
  phone?: string; // 전화번호 수정 가능
  address?: string; // 주소 수정 가능
  password?: string; // 비밀번호 변경 시 입력, 선택 사항
}
