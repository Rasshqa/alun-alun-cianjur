import { useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp, type TabId } from './context/AppContext';
import data from './data/cianjur-data.json';

const MapView = lazy(() => import('./components/MapView'));
const HeritageView = lazy(() => import('./components/HeritageView'));
const CulinaryView = lazy(() => import('./components/CulinaryView'));
const HotelView = lazy(() => import('./components/HotelView'));
const QuestView = lazy(() => import('./components/QuestView'));
const AdminMapper = lazy(() => import('./components/AdminMapper'));

function TopHeader() {
  const { parkStatus, questState, setActiveTab } = useApp();
  const isOpen = parkStatus.park_status === 'OPEN';
  const entryGateObj = data.gates.find((g) => g.id === questState.entry_gate);

  return (
    <header className="bg-earth-900 text-white border-b border-earth-800 shrink-0">
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-base font-bold tracking-tight text-white truncate">
              Portal Alun-Alun Cianjur
            </span>
            <span
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOpen ? 'bg-islam-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {isOpen ? 'BUKA' : 'TERBATAS'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-earth-300 truncate mt-0.5">
            {entryGateObj
              ? `Gerbang Aktif: ${entryGateObj.name}`
              : 'Ngaos · Mamaos · Maenpo · Ksatria K5'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('misi')}
          className="shrink-0 min-h-10 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-earth-800 hover:bg-earth-700 active:scale-95 border border-gold-500/40 text-left transition-all duration-200 shadow-xs"
          aria-label="Lihat progres misi dan XP"
        >
          <div className="text-xs sm:text-sm font-bold text-gold-400 leading-none">
            {questState.total_xp} XP
          </div>
          <div className="text-[10px] text-earth-300 mt-0.5 whitespace-nowrap">
            {questState.completed_missions.length}/{data.missions.length} Misi
          </div>
        </button>
      </div>

      <div
        className={`px-3 sm:px-6 py-1.5 text-center text-[11px] sm:text-xs font-medium text-white ${
          isOpen ? 'bg-islam-700' : 'bg-amber-600'
        }`}
      >
        {parkStatus.status_message}
      </div>
    </header>
  );
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  {
    id: 'peta',
    label: 'Peta',
    icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
  },
  {
    id: 'sejarah',
    label: 'Sejarah',
    icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
  {
    id: 'kuliner',
    label: 'Kuliner',
    icon: 'M11 3a1 1 0 1 0-2 0v4a4 4 0 0 0 3 3.87V19H9v2h6v-2h-3v-8.13A4 4 0 0 0 15 7V3a1 1 0 1 0-2 0v4a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3z',
  },
  {
    id: 'hotel',
    label: 'Hotel',
    icon: 'M3 21V7a2 2 0 0 1 2-2h6v4h6a2 2 0 0 1 2 2v10H3zm4-12v2h2V9H7zm0 4v2h2v-2H7zm6 0v2h2v-2h-2z',
  },
  {
    id: 'misi',
    label: 'Misi',
    icon: 'M5 3l3.5 2L12 3l3.5 2L19 3v13l-3.5 2L12 20l-3.5-2L5 20V3z',
  },
];

function BottomNav() {
  const { activeTab, setActiveTab } = useApp();
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTab),
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 md:bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[540px] bg-white/95 backdrop-blur-md border-t md:border border-earth-200/90 md:rounded-2xl md:shadow-[0_10px_35px_rgba(62,39,35,0.16)] pb-[env(safe-area-inset-bottom)] md:pb-0 z-40 overflow-hidden">
      <div className="relative flex w-full">
        {/* Sliding active background indicator */}
        <div
          className="absolute inset-y-1 left-0 w-1/5 px-1 transition-transform duration-300 ease-out pointer-events-none"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          <div className="w-full h-full rounded-xl bg-islam-50 border border-islam-200/70" />
        </div>

        {/* Sliding top accent bar */}
        <div
          className="absolute top-0 left-0 w-1/5 h-0.5 bg-islam-600 transition-transform duration-300 ease-out pointer-events-none"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />

        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 transition-all duration-200 active:scale-95 ${
                active ? 'text-islam-700' : 'text-earth-500 hover:text-earth-800'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
                  active ? '-translate-y-0.5 scale-110' : ''
                }`}
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={active ? 0 : 1.6}
              >
                <path d={tab.icon} />
              </svg>
              <span
                className={`text-[10px] sm:text-[11px] leading-tight transition-all duration-200 ${
                  active ? 'font-bold text-islam-700' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TabContent() {
  const { activeTab } = useApp();
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-earth-500 text-sm animate-pulse">
          Memuat halaman...
        </div>
      }
    >
      <main key={activeTab} className="flex-1 flex flex-col min-w-0 animate-view-enter">
        {activeTab === 'peta' && <MapView />}
        {activeTab === 'sejarah' && <HeritageView />}
        {activeTab === 'kuliner' && <CulinaryView />}
        {activeTab === 'hotel' && <HotelView />}
        {activeTab === 'misi' && <QuestView />}
      </main>
    </Suspense>
  );
}

function AppShell() {
  const { setMapFocus, updateQuest } = useApp();

  useEffect(() => {
    const rawGate = new URLSearchParams(window.location.search).get('gate');
    if (!rawGate) return;
    const aliasMap: Record<string, string> = {
      'GRB-01': 'suroso',
      'GRB-02': 'masjid-selatan',
      'GRB-03': 'masjid-utara',
    };
    const gateId = aliasMap[rawGate] ?? rawGate;
    const found = data.gates.find((g) => g.id === gateId);
    if (found) {
      setMapFocus({ coords: found.coords as [number, number], zoom: 19 });
      updateQuest({ entry_gate: found.id });
    }
  }, [setMapFocus, updateQuest]);

  return (
    <div className="min-h-dvh bg-earth-100/80 flex flex-col">
      <div className="w-full max-w-6xl mx-auto min-h-dvh flex flex-col bg-earth-50 shadow-sm lg:border-x lg:border-earth-200/80">
        <TopHeader />
        <TabContent />
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  const isAdmin =
    new URLSearchParams(window.location.search).get('mode') === 'admin' ||
    window.location.pathname === '/admin-mapper';
  return (
    <AppProvider>
      <Suspense fallback={<div className="p-4 text-center text-earth-500 text-sm">Memuat...</div>}>
        {isAdmin ? <AdminMapper /> : <AppShell />}
      </Suspense>
    </AppProvider>
  );
}
