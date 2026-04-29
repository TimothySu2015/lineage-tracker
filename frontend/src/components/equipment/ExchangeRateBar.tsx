import { useState } from 'react';
import * as api from '../../services/api';

interface ExchangeRateBarProps {
  rate: number;
  onRateChange: (rate: number) => void;
}

export default function ExchangeRateBar({ rate, onRateChange }: ExchangeRateBarProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(rate));

  const handleSave = async () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n <= 0) return;
    await api.updateSettings({ defaultExchangeRate: n });
    onRateChange(n);
    setEditing(false);
  };

  return (
    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-3 text-sm">
      <span className="font-medium">預設匯率：</span>
      {editing ? (
        <>
          <input
            type="number"
            min="1"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-28 px-2 py-1 rounded text-gray-900 text-sm"
          />
          <button onClick={handleSave} className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-blue-50">
            儲存
          </button>
          <button onClick={() => setEditing(false)} className="px-2 py-1 text-blue-200 hover:text-white">
            取消
          </button>
        </>
      ) : (
        <>
          <span>1 TWD = {new Intl.NumberFormat('en-US').format(rate)} Adena</span>
          <button onClick={() => { setValue(String(rate)); setEditing(true); }} className="underline text-blue-100 hover:text-white">
            編輯
          </button>
        </>
      )}
    </div>
  );
}
