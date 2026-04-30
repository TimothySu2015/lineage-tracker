import { useState } from 'react';
import type { Consumable } from '../../types';
import ConfirmDialog from '../ConfirmDialog';
import * as api from '../../services/api';

interface ConsumableTableProps {
  consumables: Consumable[];
  onDeleted: (id: number) => void;
  onError: (msg: string) => void;
}

const catBadge: Record<string, string> = {
  Hunting: 'bg-green-100 text-green-800',
  Convenience: 'bg-blue-100 text-blue-800',
  Cosmetic: 'bg-pink-100 text-pink-800',
};
const catLabel: Record<string, string> = {
  Hunting: '打獵', Convenience: '便利', Cosmetic: '外觀'
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function ConsumableTable({ consumables, onDeleted, onError }: ConsumableTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.deleteConsumable(deleteId);
      onDeleted(deleteId);
    } catch (err) {
      onError(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeleteId(null);
    }
  };

  if (consumables.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">尚無消耗品記錄</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">日期</th>
              <th className="text-left px-4 py-3 font-medium">品項</th>
              <th className="text-center px-4 py-3 font-medium">分類</th>
              <th className="text-right px-4 py-3 font-medium">數量</th>
              <th className="text-right px-4 py-3 font-medium">金額</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {consumables.map(c => {
              const twd = c.paymentCurrency === 'TWD' ? c.paymentAmount : c.paymentAmount / c.exchangeRate;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{new Date(c.occurredAt).toLocaleDateString('zh-TW')}</td>
                  <td className="px-4 py-3 text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${catBadge[c.category]}`}>
                      {catLabel[c.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    <div>{fmt(c.paymentAmount)} {c.paymentCurrency}</div>
                    <div className="text-xs text-gray-400">{fmt(twd)} TWD</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteId(c.id)} className="text-red-400 hover:text-red-600 text-xs">刪除</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {deleteId !== null && (
        <ConfirmDialog
          message="確定要刪除這筆消耗品記錄嗎？"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
