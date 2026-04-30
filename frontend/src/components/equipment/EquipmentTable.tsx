import type { Slot, SlotBreakdown } from '../../types';

interface EquipmentTableProps {
  slots: Slot[];
  slotBreakdown?: SlotBreakdown[];
  onSlotClick: (slot: Slot) => void;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function EquipmentTable({ slots, slotBreakdown = [], onSlotClick }: EquipmentTableProps) {
  const costMap = new Map(slotBreakdown.map(s => [s.slotId, s]));

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-4 py-3 font-medium">部位</th>
            <th className="text-left px-4 py-3 font-medium">當前裝備</th>
            <th className="text-center px-4 py-3 font-medium">安定值</th>
            <th className="text-right px-4 py-3 font-medium">淨成本 (TWD)</th>
            <th className="text-right px-4 py-3 font-medium">交易數</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {slots.map(slot => {
            const breakdown = costMap.get(slot.id);
            return (
              <tr key={slot.id}
                onClick={() => onSlotClick(slot)}
                className="hover:bg-indigo-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {slot.name}
                  {!slot.isBuiltIn && <span className="ml-1 text-xs text-gray-400">(自訂)</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {slot.currentItem ?? <span className="text-gray-300">空槽</span>}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">+{slot.safeValue}</td>
                <td className={`px-4 py-3 text-right font-medium ${breakdown && breakdown.netCostTwd > 2000 ? 'text-red-700' : 'text-gray-700'}`}>
                  {breakdown ? fmt(breakdown.netCostTwd) : '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {breakdown ? breakdown.transactionCount : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
