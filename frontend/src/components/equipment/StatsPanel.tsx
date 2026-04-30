import type { EquipmentStats } from '../../types';

interface StatsPanelProps {
  stats: EquipmentStats;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function StatsPanel({ stats }: StatsPanelProps) {
  const { slotBreakdown } = stats;
  if (slotBreakdown.length === 0) return null;

  const maxCost = Math.max(...slotBreakdown.map(s => s.netCostTwd));

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">部位淨成本佔比</h3>
      <div className="space-y-2">
        {slotBreakdown.map(s => (
          <div key={s.slotId} className="flex items-center gap-3 text-sm">
            <span className="w-20 text-gray-600 text-right flex-shrink-0">{s.slotName}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${maxCost > 0 ? (s.netCostTwd / maxCost) * 100 : 0}%` }}
              />
            </div>
            <span className="w-24 text-right text-gray-600">
              {fmt(s.netCostTwd)} <span className="text-gray-400 text-xs">({Math.round(s.ratio * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
