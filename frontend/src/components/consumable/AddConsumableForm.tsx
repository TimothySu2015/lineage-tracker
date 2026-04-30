import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Consumable, ConsumableCategory, PaymentCurrency } from '../../types';
import * as api from '../../services/api';

interface AddConsumableFormProps {
  defaultRate: number;
  onAdded: (c: Consumable) => void;
  onError: (msg: string) => void;
  onCancel: () => void;
}

export default function AddConsumableForm({ defaultRate, onAdded, onError, onCancel }: AddConsumableFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ConsumableCategory>('Hunting');
  const [quantity, setQuantity] = useState('1');
  const [currency, setCurrency] = useState<PaymentCurrency>('Adena');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(String(defaultRate));
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { onError('請輸入品項名稱'); return; }
    const qty = parseInt(quantity, 10);
    const amt = parseInt(amount, 10);
    const exRate = parseInt(rate, 10);
    if (qty < 1) { onError('數量必須 >= 1'); return; }
    if (isNaN(amt) || amt < 0) { onError('金額格式錯誤'); return; }
    if (isNaN(exRate) || exRate <= 0) { onError('匯率必須 > 0'); return; }

    setLoading(true);
    try {
      const c = await api.createConsumable({
        name: name.trim(), category, quantity: qty,
        paymentCurrency: currency, paymentAmount: amt, exchangeRate: exRate,
        note: note.trim() || null,
        occurredAt: new Date(occurredAt).toISOString(),
      });
      onAdded(c);
      setName(''); setAmount(''); setNote(''); setQuantity('1');
    } catch (err) {
      onError(err instanceof Error ? err.message : '新增失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <h4 className="font-medium text-gray-700">新增消耗品</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">品項名稱</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            maxLength={100} className="w-full border rounded px-2 py-1.5 text-sm mt-0.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500">分類</label>
          <select value={category} onChange={e => setCategory(e.target.value as ConsumableCategory)}
            className="w-full border rounded px-2 py-1.5 text-sm mt-0.5">
            <option value="Hunting">打獵</option>
            <option value="Convenience">便利</option>
            <option value="Cosmetic">外觀</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">數量</label>
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-sm mt-0.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500">幣別</label>
          <select value={currency} onChange={e => setCurrency(e.target.value as PaymentCurrency)}
            className="w-full border rounded px-2 py-1.5 text-sm mt-0.5">
            <option value="Adena">Adena</option>
            <option value="TWD">TWD</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">金額</label>
          <div className="flex items-center gap-1 mt-0.5">
            <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 border rounded px-2 py-1.5 text-sm" />
            <span className="text-sm text-gray-500 whitespace-nowrap">{currency === 'Adena' ? '天幣' : '元'}</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">匯率</label>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-sm text-gray-500 whitespace-nowrap">1 元台幣 =</span>
            <input type="number" min="1" value={rate} onChange={e => setRate(e.target.value)}
              className="flex-1 border rounded px-2 py-1.5 text-sm" />
            <span className="text-sm text-gray-500 whitespace-nowrap">天幣</span>
          </div>
        </div>
      </div>
      {amount !== '' && rate !== '' && !isNaN(parseInt(amount, 10)) && !isNaN(parseInt(rate, 10)) && parseInt(rate, 10) > 0 && (
        <p className="text-xs text-gray-400">
          {currency === 'Adena'
            ? `≈ NT$ ${new Intl.NumberFormat('en-US').format(Math.round(parseInt(amount, 10) / parseInt(rate, 10)))}`
            : `≈ ${new Intl.NumberFormat('en-US').format(Math.round(parseInt(amount, 10) * parseInt(rate, 10)))} 天幣`
          }
        </p>
      )}
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
