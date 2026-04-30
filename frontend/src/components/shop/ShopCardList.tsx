import { useState } from 'react';
import type { CashShopPurchase } from '../../types';
import ConfirmDialog from '../ConfirmDialog';
import * as api from '../../services/api';

interface ShopCardListProps {
  purchases: CashShopPurchase[];
  onDeleted: (id: number) => void;
  onError: (msg: string) => void;
}

const catBadge: Record<string, string> = {
  Subscription: 'bg-purple-100 text-purple-800',
  Bundle: 'bg-yellow-100 text-yellow-800',
  Cosmetic: 'bg-pink-100 text-pink-800',
  Convenience: 'bg-blue-100 text-blue-800',
};
const catLabel: Record<string, string> = {
  Subscription: '訂閱', Bundle: '禮包', Cosmetic: '外觀', Convenience: '便利'
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function ShopCardList({ purchases, onDeleted, onError }: ShopCardListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await api.deleteShopPurchase(deleteId);
      onDeleted(deleteId);
    } catch (err) {
      onError(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeleteId(null);
    }
  };

  if (purchases.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">尚無商城購買記錄</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {purchases.map(p => (
          <div key={p.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catBadge[p.category]}`}>
                    {catLabel[p.category]}
                  </span>
                  <span className="font-medium text-gray-800">{p.productName}</span>
                  <span className="text-sm font-bold text-gray-700">{fmt(p.amount)} TWD</span>
                </div>
                {p.description && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{p.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(p.occurredAt).toLocaleDateString('zh-TW')}</p>
                {p.note && <p className="text-xs text-gray-400">{p.note}</p>}
              </div>
              <button onClick={() => setDeleteId(p.id)} className="text-red-400 hover:text-red-600 text-xs ml-2 flex-shrink-0">
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>
      {deleteId !== null && (
        <ConfirmDialog
          message="確定要刪除這筆商城購買記錄嗎？"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
