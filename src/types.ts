export type MenuItemCategory = 'coffee' | 'non-coffee' | 'food' | 'dessert';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  description: string;
  price: number;
  tags: string[];
  isAvailable: boolean;
  rating?: number;
  imageColor?: string;
  imageUrl?: string;
  isHotAvailable?: boolean;
  isIcedAvailable?: boolean;
  isBest?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  temperature?: 'Hot' | 'Iced' | 'Normal';
  sugarLevel?: 'No Sugar' | 'Less Sugar' | 'Normal' | 'Extra Sugar';
  notes?: string;
}

export interface GuestReview {
  id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  reply?: string; // Optional admin reply
}

export interface CashierOrder {
  id: string;
  items: CartItem[];
  customerName: string;
  tableNumberOrType: string; // 'Table 3', 'Takeaway', 'Delivery'
  totalAmount: number;
  status: 'Pending' | 'On Process' | 'Completed' | 'Cancelled';
  paymentMethod: 'Cash' | 'QRIS' | 'Card' | 'Bank Transfer';
  timestamp: string;
}

export interface OutpostProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  hours: string;
  historyTitle: string;
  historyContent: string;
}
