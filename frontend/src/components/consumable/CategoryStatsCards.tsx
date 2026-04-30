import type { ConsumableStats } from '../../types';

interface CategoryStatsCardsProps {
  stats: ConsumableStats | null;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function CategoryStatsCards({ stats }: CategoryStatsCardsProps) {
  const cards = [
    { label: '打獵 Hunting', color: 'bg-green-50 border-green-200 text-green-800', value: stats?.byCategory.hunting ?? 0 },
    { label: '便利 Convenience', color: 'bg-blue-50 border-blue-200 text-blue-800', value: stats?.byCategory.convenience ?? 0 },
    { label: '外觀 Cosmetic', color: 'bg-pink-50 border-pink-200 text-pink-800', value: stats?.byCategory.cosmetic ?? 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`rounded-lg border p-3 ${c.color}`}>
          <p className="text-xs font-medium">{c.label}</p>
          <p className="text-xl font-bold mt-1">{fmt(c.value)} TWD</p>
        </div>
      ))}
    </div>
  );
}
