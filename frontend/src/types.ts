export type TransactionType = 'Buy' | 'Enhance' | 'Sell' | 'Fail';
export type PaymentCurrency = 'Adena' | 'TWD';
export type ConsumableCategory = 'Hunting' | 'Convenience' | 'Cosmetic';
export type CashShopCategory = 'Subscription' | 'Bundle' | 'Cosmetic' | 'Convenience';

export interface Summary {
  id: number;
  updateDate: string;
  totalDefense: number;
  totalDeposit: number;
  balance: number;
}

export interface Slot {
  id: number;
  name: string;
  englishName: string;
  displayOrder: number;
  safeValue: number;
  isBuiltIn: boolean;
  currentItem: string | null;
}

export interface Transaction {
  id: number;
  slotId: number;
  type: TransactionType;
  itemDescription: string;
  paymentCurrency: PaymentCurrency;
  paymentAmount: number;
  exchangeRate: number;
  disappeared: boolean | null;
  note: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface Consumable {
  id: number;
  name: string;
  category: ConsumableCategory;
  quantity: number;
  paymentCurrency: PaymentCurrency;
  paymentAmount: number;
  exchangeRate: number;
  note: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface CashShopPurchase {
  id: number;
  productName: string;
  category: CashShopCategory;
  description: string | null;
  amount: number;
  note: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface Preset {
  id: number;
  slotId: number;
  itemName: string;
}

export interface AppSetting {
  id: number;
  defaultExchangeRate: number;
}

export interface SlotBreakdown {
  slotId: number;
  slotName: string;
  currentItem: string | null;
  netCostTwd: number;
  netCostAdena: number;
  ratio: number;
  transactionCount: number;
}

export interface EquipmentStats {
  netInvestmentTwd: number;
  netInvestmentAdena: number;
  successCostTwd: number;
  failLossTwd: number;
  recoveredTwd: number;
  slotBreakdown: SlotBreakdown[];
}

export interface ConsumableCategoryStats {
  hunting: number;
  convenience: number;
  cosmetic: number;
}

export interface ConsumableStats {
  totalTwd: number;
  byCategory: ConsumableCategoryStats;
}

export interface ShopCategoryStats {
  subscription: number;
  bundle: number;
  cosmetic: number;
  convenience: number;
}

export interface ShopStats {
  totalTwd: number;
  byCategory: ShopCategoryStats;
}

export interface StatsResponse {
  equipment: EquipmentStats;
  consumable: ConsumableStats;
  shop: ShopStats;
}
