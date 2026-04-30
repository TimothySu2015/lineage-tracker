import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CashShopPurchase, CashShopCategory } from '../../types';
import * as api from '../../services/api';

interface AddShopFormProps {
  onAdded: (p: CashShopPurchase) => void;
  onError: (msg: string) => void;
  onCancel: () => void;
}

export default function AddShopForm({ onAdded, onError, onCancel }: AddShopFormProps) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<CashShopCategory>('Subscription');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) { onError('請輸入商品名稱'); return; }
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 0) { onError('金額格式錯誤'); return; }

    setLoading(true);
    try {
      const p = await api.createShopPurchase({
        productName: productName.trim(), category,
        description: description.trim() || null,
        amount: amt, note: note.trim() || null,
        occurredAt: new Date(occurredAt).toISOString(),
      });
      onAdded(p);
      setProductName(''); setDescription(''); setAmount(''); setNote('');
    } catch (err) {
      onError(err instanceof Error ? err.message : '新增失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <h4 className="font-medium text-gray-700">新增商城購買</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">商品名稱</label>
          <input type="text" value={productName} onChange={e => setProductName(e.target.value)}
            maxLength={100} className="w-full border rounded px-2 py-1.5 text-sm mt-0.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500">分類</label>
          <select value={category} onChange={e => setCategory(e.target.value as CashShopCategory)}
            className="w-full border rounded px-2 py-1.5 text-sm mt-0.5">
            <option value="Subscription">訂閱</option>
            <option value="Bundle">禮包</option>
            <option value="Cosmetic">外觀</option>
            <option value="Convenience">便利</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500">金額 (TWD)</label>
        <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-sm mt-0.5" />
      </div>
      <div>
        <label className="text-xs text-gray-500">描述</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          maxLength={500} rows={3}
          className="w-full border rounded px-2 py-1.5 text-sm mt-0.5 resize-none" />
      </div>
      <div>
        <label className="text-xs text-gray-500">日期時間</label>
        <input type="datetime-local" value={occurredAt} onChange={e => setOccurredAt(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-sm mt-0.5" />
      </div>
      <div>
        <label className="text-xs text-gray-500">備註</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} maxLength={200}
          className="w-full border rounded px-2 py-1.5 text-sm mt-0.5" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? '新增中...' : '新增'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border rounded text-sm hover:bg-gray-50">取消</button>
      </div>
    </form>
  );
}
