import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Slot } from '../../types';
import Modal from '../Modal';
import * as api from '../../services/api';

interface AddSlotModalProps {
  onAdded: (slot: Slot) => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

export default function AddSlotModal({ onAdded, onClose, onError }: AddSlotModalProps) {
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [safeValue, setSafeValue] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { onError('請輸入部位名稱'); return; }
    setLoading(true);
    try {
      const slot = await api.createSlot({
        name: name.trim(),
        englishName: englishName.trim() || name.trim(),
        safeValue: parseInt(safeValue, 10) || 0,
      });
      onAdded(slot);
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : '新增失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="新增部位" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">部位名稱 (中文)</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            maxLength={50} className="w-full border rounded px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-sm text-gray-600">部位英文名</label>
          <input type="text" value={englishName} onChange={e => setEnglishName(e.target.value)}
            maxLength={50} className="w-full border rounded px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-sm text-gray-600">安定值 (0-9)</label>
          <input type="number" min="0" max="9" value={safeValue} onChange={e => setSafeValue(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mt-1" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? '新增中...' : '確認新增'}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 py-2 border rounded text-sm font-medium hover:bg-gray-50">
            取消
          </button>
        </div>
      </form>
    </Modal>
  );
}
