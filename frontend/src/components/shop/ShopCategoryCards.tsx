import type { ShopStats } from '../../types';

interface ShopCategoryCardsProps {
  stats: ShopStats | null;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function ShopCategoryCards({ stats }: ShopCategoryCardsProps) {
  const cards = [
    { label: '訂閱 Subscription', color: 'bg-purple-50 border-purple-200 text-purple-800', value: stats?.byCategory.subscription ?? 0 },
    { label: '禮包 Bundle', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', value: stats?.byCategory.bundle ?? 0 },
    { label: '外觀 Cosmetic', color: 'bg-pink-50 border-pink-200 text-pink-800', value: stats?.byCategory.cosmetic ?? 0 },
    { label: '便利 Convenience', color: 'bg-blue-50 border-blue-200 text-blue-800', value: stats?.byCategory.convenience ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(c => (
        <div key={c.label} className={`rounded-lg border p-3 ${c.color}`}>
          <p className="text-xs font-medium">{c.label}</p>
          <p className="text-xl font-bold mt-1">{fmt(c.value)} TWD</p>
        </div>
      ))}
    </div>
  );
}
