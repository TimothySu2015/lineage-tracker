import type {
  Summary, Slot, Transaction, Consumable, CashShopPurchase,
  Preset, AppSetting, StatsResponse,
  TransactionType, PaymentCurrency, ConsumableCategory, CashShopCategory
} from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Summary
export const getSummary = () => request<Summary>('/api/summary');
export const updateSummary = (body: { totalDefense: number; totalDeposit: number; balance: number }) =>
  request<Summary>('/api/summary', { method: 'PUT', body: JSON.stringify(body) });

// Slots
export const getSlots = () => request<Slot[]>('/api/slots');
export const createSlot = (body: { name: string; englishName: string; safeValue: number; displayOrder?: number }) =>
  request<Slot>('/api/slots', { method: 'POST', body: JSON.stringify(body) });
export const updateSlot = (id: number, body: { name?: string; englishName?: string; safeValue?: number }) =>
  request<Slot>(`/api/slots/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteSlot = (id: number) =>
  request<void>(`/api/slots/${id}`, { method: 'DELETE' });

// Transactions
export const getTransactions = (slotId: number) =>
  request<Transaction[]>(`/api/slots/${slotId}/transactions`);
export const createTransaction = (slotId: number, body: {
  type: TransactionType; itemDescription: string;
  paymentCurrency: PaymentCurrency; paymentAmount: number; exchangeRate: number;
  disappeared?: boolean | null; note?: string | null; occurredAt: string;
}) => request<Transaction>(`/api/slots/${slotId}/transactions`, { method: 'POST', body: JSON.stringify(body) });
export const updateTransaction = (id: number, body: Partial<{
  type: TransactionType; itemDescription: string;
  paymentCurrency: PaymentCurrency; paymentAmount: number; exchangeRate: number;
  disappeared: boolean | null; note: string | null; occurredAt: string;
}>) => request<Transaction>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteTransaction = (id: number) =>
  request<void>(`/api/transactions/${id}`, { method: 'DELETE' });

// Consumables
export const getConsumables = (params?: { category?: ConsumableCategory; from?: string; to?: string }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  const q = qs.toString();
  return request<Consumable[]>(`/api/consumables${q ? `?${q}` : ''}`);
};
export const createConsumable = (body: {
  name: string; category: ConsumableCategory; quantity: number;
  paymentCurrency: PaymentCurrency; paymentAmount: number; exchangeRate: number;
  note?: string | null; occurredAt: string;
}) => request<Consumable>('/api/consumables', { method: 'POST', body: JSON.stringify(body) });
export const updateConsumable = (id: number, body: Partial<{
  name: string; category: ConsumableCategory; quantity: number;
  paymentCurrency: PaymentCurrency; paymentAmount: number; exchangeRate: number;
  note: string | null; occurredAt: string;
}>) => request<Consumable>(`/api/consumables/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteConsumable = (id: number) =>
  request<void>(`/api/consumables/${id}`, { method: 'DELETE' });

// Cash Shop Purchases
export const getShopPurchases = (params?: { category?: CashShopCategory; from?: string; to?: string }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  const q = qs.toString();
  return request<CashShopPurchase[]>(`/api/shop-purchases${q ? `?${q}` : ''}`);
};
export const createShopPurchase = (body: {
  productName: string; category: CashShopCategory; description?: string | null;
  amount: number; note?: string | null; occurredAt: string;
}) => request<CashShopPurchase>('/api/shop-purchases', { method: 'POST', body: JSON.stringify(body) });
export const updateShopPurchase = (id: number, body: Partial<{
  productName: string; category: CashShopCategory; description: string | null;
  amount: number; note: string | null; occurredAt: string;
}>) => request<CashShopPurchase>(`/api/shop-purchases/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteShopPurchase = (id: number) =>
  request<void>(`/api/shop-purchases/${id}`, { method: 'DELETE' });

// Presets
export const getPresets = (slotId: number) =>
  request<Preset[]>(`/api/presets/${slotId}`);
export const createPreset = (body: { slotId: number; itemName: string }) =>
  request<Preset>('/api/presets', { method: 'POST', body: JSON.stringify(body) });
export const deletePreset = (id: number) =>
  request<void>(`/api/presets/${id}`, { method: 'DELETE' });

// App Settings
export const getSettings = () => request<AppSetting>('/api/settings');
export const updateSettings = (body: { defaultExchangeRate: number }) =>
  request<AppSetting>('/api/settings', { method: 'PUT', body: JSON.stringify(body) });

// Stats
export const getStats = () => request<StatsResponse>('/api/stats');
