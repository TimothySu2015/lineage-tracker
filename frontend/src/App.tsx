import { useState, useEffect, useCallback } from 'react';
import type { Slot, Summary, AppSetting, StatsResponse, Consumable, CashShopPurchase } from './types';
import * as api from './services/api';
import Toast from './components/Toast';
import ExchangeRateBar from './components/equipment/ExchangeRateBar';
import EquipmentTable from './components/equipment/EquipmentTable';
import SlotDetailModal from './components/equipment/SlotDetailModal';
import AddSlotModal from './components/equipment/AddSlotModal';
import StatsPanel from './components/equipment/StatsPanel';
import CategoryStatsCards from './components/consumable/CategoryStatsCards';
import ConsumableTable from './components/consumable/ConsumableTable';
import AddConsumableForm from './components/consumable/AddConsumableForm';
import ShopCategoryCards from './components/shop/ShopCategoryCards';
import ShopCardList from './components/shop/ShopCardList';
import AddShopForm from './components/shop/AddShopForm';

type Tab = 'equipment' | 'consumable' | 'shop';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function App() {
  const [tab, setTab] = useState<Tab>('equipment');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [settings, setSettings] = useState<AppSetting | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [shopPurchases, setShopPurchases] = useState<CashShopPurchase[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showAddConsumable, setShowAddConsumable] = useState(false);
  const [showAddShop, setShowAddShop] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(true);

  const showError = useCallback((msg: string) => setToast({ message: msg, type: 'error' }), []);
  const showSuccess = useCallback((msg: string) => setToast({ message: msg, type: 'success' }), []);

  const loadAll = useCallback(async () => {
    try {
      const [sl, sm, st, cs, sp, statsData] = await Promise.all([
        api.getSlots(),
        api.getSummary(),
        api.getSettings(),
        api.getConsumables(),
        api.getShopPurchases(),
        api.getStats(),
      ]);
      setSlots(sl);
      setSummary(sm);
      setSettings(st);
      setConsumables(cs);
      setShopPurchases(sp);
      setStats(statsData);
    } catch {
      showError('無法連線至後端，請確認後端服務已啟動');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const defaultRate = settings?.defaultExchangeRate ?? 10000;

  const handleSlotUpdated = (updated: Slot) => {
    setSlots(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (selectedSlot?.id === updated.id) setSelectedSlot(updated);
    api.getStats().then(setStats).catch(() => {});
  };

  const handleSlotDetailClose = () => {
    setSelectedSlot(null);
    api.getSlots().then(setSlots).catch(() => {});
    api.getStats().then(setStats).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">天堂經典記帳系統</h1>
          <p className="text-sm text-gray-500 mt-1">Lineage Classic Financial Tracker</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">裝備淨投資</p>
            <p className="text-lg font-bold text-indigo-700 mt-1">
              {fmt(stats?.equipment.netInvestmentTwd ?? 0)} TWD
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">消耗品支出</p>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {fmt(stats?.consumable.totalTwd ?? 0)} TWD
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">商城購買</p>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {fmt(stats?.shop.totalTwd ?? 0)} TWD
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500">累計儲值</p>
            <p className="text-lg font-bold text-gray-800 mt-1">
              {fmt(summary?.totalDeposit ?? 0)} TWD
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b mb-4">
          {(['equipment', 'consumable', 'shop'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'equipment' ? '裝備' : t === 'consumable' ? '消耗品' : '商城購買'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">載入中...</div>
        ) : (
          <>
            {/* Equipment Tab */}
            {tab === 'equipment' && (
              <div className="space-y-4">
                {settings && (
                  <ExchangeRateBar
                    rate={defaultRate}
                    onRateChange={r => setSettings(prev => prev ? { ...prev, defaultExchangeRate: r } : prev)}
                  />
                )}
                {/* Equipment Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">總淨投資</p>
                      <p className="font-bold text-indigo-700">{fmt(stats.equipment.netInvestmentTwd)} TWD</p>
                    </div>
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">成功成本</p>
                      <p className="font-bold text-green-700">{fmt(stats.equipment.successCostTwd)} TWD</p>
                    </div>
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">失敗損失</p>
                      <p className="font-bold text-red-700">{fmt(stats.equipment.failLossTwd)} TWD</p>
                    </div>
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs text-gray-500">已回收</p>
                      <p className="font-bold text-gray-700">{fmt(stats.equipment.recoveredTwd)} TWD</p>
                    </div>
                  </div>
                )}
                <EquipmentTable slots={slots} slotBreakdown={stats?.equipment.slotBreakdown} onSlotClick={setSelectedSlot} />
                <button onClick={() => setShowAddSlot(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                  + 新增部位
                </button>
                {stats && <StatsPanel stats={stats.equipment} />}
              </div>
            )}

            {/* Consumable Tab */}
            {tab === 'consumable' && (
              <div className="space-y-4">
                <CategoryStatsCards stats={stats?.consumable ?? null} />
                {showAddConsumable ? (
                  <AddConsumableForm
                    defaultRate={defaultRate}
                    onAdded={c => {
                      setConsumables(prev => [c, ...prev]);
                      setShowAddConsumable(false);
                      api.getStats().then(setStats).catch(() => {});
                      showSuccess('新增成功');
                    }}
                    onError={showError}
                    onCancel={() => setShowAddConsumable(false)}
                  />
                ) : (
                  <button onClick={() => setShowAddConsumable(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                    + 新增消耗品
                  </button>
                )}
                <ConsumableTable
                  consumables={consumables}
                  onDeleted={id => {
                    setConsumables(prev => prev.filter(c => c.id !== id));
                    api.getStats().then(setStats).catch(() => {});
                  }}
                  onError={showError}
                />
              </div>
            )}

            {/* Shop Tab */}
            {tab === 'shop' && (
              <div className="space-y-4">
                <ShopCategoryCards stats={stats?.shop ?? null} />
                {showAddShop ? (
                  <AddShopForm
                    onAdded={p => {
                      setShopPurchases(prev => [p, ...prev]);
                      setShowAddShop(false);
                      api.getStats().then(setStats).catch(() => {});
                      showSuccess('新增成功');
                    }}
                    onError={showError}
                    onCancel={() => setShowAddShop(false)}
                  />
                ) : (
                  <button onClick={() => setShowAddShop(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                    + 新增商城購買
                  </button>
                )}
                <ShopCardList
                  purchases={shopPurchases}
                  onDeleted={id => {
                    setShopPurchases(prev => prev.filter(p => p.id !== id));
                    api.getStats().then(setStats).catch(() => {});
                  }}
                  onError={showError}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Slot Detail Modal */}
      {selectedSlot && (
        <SlotDetailModal
          slot={selectedSlot}
          defaultRate={defaultRate}
          onClose={handleSlotDetailClose}
          onSlotUpdated={handleSlotUpdated}
        />
      )}

      {/* Add Slot Modal */}
      {showAddSlot && (
        <AddSlotModal
          onAdded={slot => {
            setSlots(prev => [...prev, slot]);
            setShowAddSlot(false);
            showSuccess('新增部位成功');
          }}
          onClose={() => setShowAddSlot(false)}
          onError={showError}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
