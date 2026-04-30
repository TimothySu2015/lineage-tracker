import type { Transaction } from '../../types';
import ConfirmDialog from '../ConfirmDialog';
import { useState } from 'react';
import * as api from '../../services/api';

interface TransactionTimelineProps {
  transactions: Transaction[];
  onDeleted: (id: number) => void;
  onError: (msg: string) => void;
}

const typeLabel: Record<string, string> = {
  Buy: '購買', Enhance: '強化', Sell: '出售', Fail: '失敗'
};
const typeBg: Record<string, string> = {
  Buy: 'bg-green-100 text-green-800',
  Enhance: 'bg-blue-100 text-blue-800',
  Sell: 'bg-yellow-100 text-yellow-800',
  Fail: 'bg-red-100 text-red-800'
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function TransactionTimeline({ transactions, onDeleted, onError }: TransactionTimelineProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.deleteTransaction(deleteId);
      onDeleted(deleteId);
    } catch (err) {
      onError(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeleteId(null);
    }
  };

  if (transactions.length === 0) {
    return <p className="text-gray-400 text-sm py-4 text-center">尚無交易記錄</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {[...transactions].reverse().map(tx => (
          <div key={tx.id} className="border rounded-lg p-3 bg-white flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBg[tx.type]}`}>
                  {typeLabel[tx.type]}
                </span>
                {tx.type === 'Fail' && tx.disappeared !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tx.disappeared ? 'bg-red-200 text-red-900' : 'bg-gray-100 text-gray-700'}`}>
                    {tx.disappeared ? '消失' : '保留'}
                  </span>
                )}
                <span className="text-sm font-medium text-gray-800">{tx.itemDescription}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {tx.paymentCurrency === 'Adena'
                  ? `${fmt(tx.paymentAmount)} Adena (~${fmt(tx.paymentAmount / tx.exchangeRate)} TWD)`
                  : `${fmt(tx.paymentAmount)} TWD (~${fmt(tx.paymentAmount * tx.exchangeRate)} Adena)`}
                <span className="mx-2">·</span>
                {new Date(tx.occurredAt).toLocaleDateString('zh-TW')}
              </div>
              {tx.note && <p className="text-xs text-gray-400 mt-1">{tx.note}</p>}
            </div>
            <button onClick={() => setDeleteId(tx.id)}
              className="text-red-400 hover:text-red-600 text-xs ml-2 flex-shrink-0">刪除</button>
          </div>
        ))}
      </div>
      {deleteId !== null && (
        <ConfirmDialog
          message="確定要刪除這筆交易記錄嗎？"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
