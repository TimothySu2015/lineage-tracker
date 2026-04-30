import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Transaction, TransactionType, PaymentCurrency, Preset } from '../../types';
import * as api from '../../services/api';

interface AddTransactionFormProps {
  slotId: number;
  defaultRate: number;
  presets: Preset[];
  onAdded: (tx: Transaction) => void;
  onError: (msg: string) => void;
}

export default function AddTransactionForm({ slotId, defaultRate, presets, onAdded, onError }: AddTransactionFormProps) {
  const [type, setType] = useState<TransactionType>('Buy');
  const [itemDescription, setItemDescription] = useState('');
  const [currency, setCurrency] = useState<PaymentCurrency>('Adena');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(String(defaultRate));
  const [disappeared, setDisappeared] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    const exRate = parseInt(rate, 10);
    if (!itemDescription.trim()) { onError('請輸入裝備名稱'); return; }
    if (isNaN(amt) || amt < 0) { onError('金額格式錯誤'); return; }
    if (isNaN(exRate) || exRate <= 0) { onError('匯率必須 > 0'); return; }
    if (type === 'Fail' && disappeared === null) { onError('Fail 交易必須選擇是否消失'); return; }

    setLoading(true);
    try {
      const tx = await api.createTransaction(slotId, {
        type, itemDescription: itemDescription.trim(),
        paymentCurrency: currency, paymentAmount: amt, exchangeRate: exRate,
        disappeared: type === 'Fail' ? disappeared : null,
        note: note.trim() || null,
        occurredAt: new Date(occurredAt).toISOString(),
      });
      onAdded(tx);
      setItemDescription('');
      setAmount('');
      setNote('');
    } catch (err) {
      onError(err instanceof Error ? err.message : '新增失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <h4 className="font-medium text-gray-700">新增交易</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">交易類型</label>
          <select value={type} onChange={e => setType(e.target.value as TransactionType)}
            className="w-full border rounded px-2 py-1.5 text-sm">
            <option value="Buy">Buy 購買</option>
            <option value="Enhance">Enhance 強化</option>
            <option value="Sell">Sell 出售</option>
            <option value="Fail">Fail 失敗</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">幣別</label>
          <select value={currency} onChange={e => setCurrency(e.target.value as PaymentCurrency)}
            className="w-full border rounded px-2 py-1.5 text-sm">
            <option value="Adena">Adena 天幣</option>
            <option value="TWD">TWD 台幣</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500">裝備名稱</label>
        {presets.length > 0 ? (
          <select value={itemDescription} onChange={e => setItemDescription(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-sm">
            <option value="">-- 選擇或輸入 --</option>
            {presets.map(p => <option key={p.id} value={p.itemName}>{p.itemName}</option>)}
          </select>
        ) : null}
        <input type="text" value={itemDescription} onChange={e => setItemDescription(e.target.value)}
          placeholder="e.g. +0 法師頭 → +1 法師頭" maxLength={100}
          className="w-full border rounded px-2 py-1.5 text-sm mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">金額</label>
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">匯率 (1 TWD = X Adena)</label>
          <input type="number" min="1" value={rate} onChange={e => setRate(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-sm" />
        </div>
      </div>
      {type === 'Fail' && (
        <div>
          <label className="text-xs text-gray-500">裝備是否消失？</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="disappeared" checked={disappeared === true} onChange={() => setDisappeared(true)} /> 消失
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="disappeared" checked={disappeared === false} onChange={() => setDisappeared(false)} /> 保留
            </label>
          </div>
        </div>
      )}
      <div>
        <label className="text-xs text-gray-500">日期時間</label>
        <input type="datetime-local" value={occurredAt} onChange={e => setOccurredAt(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="text-xs text-gray-500">備註</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} maxLength={200}
          className="w-full border rounded px-2 py-1.5 text-sm" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
        {loading ? '新增中...' : '新增交易'}
      </button>
    </form>
  );
}
