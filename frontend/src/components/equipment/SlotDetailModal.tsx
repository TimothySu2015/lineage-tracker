import { useState, useEffect } from 'react';
import type { Slot, Transaction, Preset } from '../../types';
import Modal from '../Modal';
import TransactionTimeline from './TransactionTimeline';
import AddTransactionForm from './AddTransactionForm';
import * as api from '../../services/api';

interface SlotDetailModalProps {
  slot: Slot;
  defaultRate: number;
  onClose: () => void;
  onSlotUpdated: (slot: Slot) => void;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function SlotDetailModal({ slot, defaultRate, onClose, onSlotUpdated }: SlotDetailModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSafe, setEditingSafe] = useState(false);
  const [safeValue, setSafeValue] = useState(String(slot.safeValue));

  useEffect(() => {
    Promise.all([
      api.getTransactions(slot.id),
      api.getPresets(slot.id),
    ]).then(([txs, ps]) => {
      setTransactions(txs);
      setPresets(ps);
    }).catch(() => setError('載入失敗')).finally(() => setLoading(false));
  }, [slot.id]);

  const netCostTwd = transactions.reduce((sum, tx) => {
    const twd = tx.paymentCurrency === 'TWD'
      ? tx.paymentAmount
      : tx.paymentAmount / tx.exchangeRate;
    if (tx.type === 'Sell') return sum - twd;
    return sum + twd;
  }, 0);

  const handleSaveSafe = async () => {
    const n = parseInt(safeValue, 10);
    if (isNaN(n) || n < 0 || n > 9) return;
    const updated = await api.updateSlot(slot.id, { safeValue: n });
    onSlotUpdated(updated);
    setEditingSafe(false);
  };

  return (
    <Modal title={`${slot.name} (${slot.englishName})`} onClose={onClose}>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="bg-gray-50 rounded p-3">
          <p className="text-gray-500 text-xs">當前裝備</p>
          <p className="font-medium text-gray-800">{slot.currentItem ?? '空槽'}</p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-gray-500 text-xs">淨成本</p>
          <p className={`font-medium ${netCostTwd > 2000 ? 'text-red-700' : 'text-gray-800'}`}>
            {fmt(netCostTwd)} TWD
          </p>
        </div>
        <div className="bg-gray-50 rounded p-3 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs">安定值</p>
            {editingSafe ? (
              <div className="flex gap-2 items-center mt-1">
                <input type="number" min="0" max="9" value={safeValue}
                  onChange={e => setSafeValue(e.target.value)}
                  className="w-16 border rounded px-1 py-0.5 text-sm" />
                <button onClick={handleSaveSafe} className="text-xs text-indigo-600 hover:underline">儲存</button>
                <button onClick={() => setEditingSafe(false)} className="text-xs text-gray-400 hover:underline">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800">+{slot.safeValue}</p>
                <button onClick={() => setEditingSafe(true)} className="text-xs text-indigo-400 hover:underline">編輯</button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-gray-500 text-xs">交易數</p>
          <p className="font-medium text-gray-800">{transactions.length}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-4">載入中...</p>
      ) : (
        <>
          <div className="mb-4">
            <AddTransactionForm
              slotId={slot.id}
              defaultRate={defaultRate}
              presets={presets}
              onAdded={tx => setTransactions(prev => [...prev, tx])}
              onError={setError}
            />
          </div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">交易紀錄</h4>
          <TransactionTimeline
            transactions={transactions}
            onDeleted={id => setTransactions(prev => prev.filter(t => t.id !== id))}
            onError={setError}
          />
        </>
      )}
    </Modal>
  );
}
