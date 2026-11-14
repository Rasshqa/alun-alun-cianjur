import { useState, useEffect, lazy, Suspense, Component, type ReactNode, type ComponentType } from 'react';
import { AppProvider, useApp, type TabId } from './context/AppContext';
import data from './data/cianjur-data.json';
import { SADAYA_LOGO_FALLBACK_SVG } from './utils/visuals';

function safeLazy<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
  sectionLabel: string,
) {
  return lazy(async () => {
    try {
      return await importer();
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 350));
        return await importer();
      } catch {
        const FallbackView = (() => (
          <div className="p-6 my-6 mx-4 heritage-card rounded-2xl text-center space-y-3">
            <h3 className="font-heritage text-base font-bold text-earth-900">
              Gagal Memuat Modul {sectionLabel}
            </h3>
            <p className="text-xs text-earth-600 max-w-md mx-auto leading-relaxed">
              Koneksi jaringan sedang tidak stabil atau berkas halaman diperbarui. Silakan muat ulang halaman untuk melanjutkan.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Muat Ulang Halaman
            </button>
          </div>
        )) as unknown as T;
        return { default: FallbackView };
      }
    }
  });
}

class ViewErrorBoundary extends Component<
  { children: ReactNode; resetKey?: string; onResetToMap?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { resetKey?: string }) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-6 mx-4 heritage-card rounded-2xl text-center space-y-3">
          <h3 className="font-heritage text-base font-bold text-earth-900">
            Tampilan Sedang Dipulihkan
          </h3>
          <p className="text-xs text-earth-600 max-w-md mx-auto leading-relaxed">
            Terjadi kendala teknis saat merender bagian ini. Data kunjungan dan progres misi Anda tetap aman.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Coba Lagi
            </button>
            {this.props.onResetToMap && (
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.onResetToMap?.();
                }}
                className="px-4 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-semibold active:scale-95 transition-all"
              >
                Kembali ke Peta
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import MapView from './components/MapView';
import HeritageView from './components/HeritageView';
import CulinaryView from './components/CulinaryView';
import HotelView from './components/HotelView';
import GuideView from './components/GuideView';
import QuestView from './components/QuestView';
const AdminMapper = safeLazy(() => import('./components/AdminMapper'), 'Admin Mapper');

const SPLASH_STORAGE_KEY = 'sadaya_splash_last_shown_at';
const SPLASH_SESSION_KEY = 'sadaya_splash_session_seen';
const SPLASH_TTL_MS = 3 * 60 * 60 * 1000; // 3 jam

function shouldShowSplashOnMount(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const navEntries = window.performance?.getEntriesByType?.('navigation') as
      | PerformanceNavigationTiming[]
      | undefined;
    if (navEntries && navEntries.length > 0 && navEntries[0].type === 'reload') {
      return false;
    }
    if (window.sessionStorage.getItem(SPLASH_SESSION_KEY) === '1') {
      return false;
    }
    const lastShownRaw = window.localStorage.getItem(SPLASH_STORAGE_KEY);
    if (lastShownRaw) {
      const elapsed = Date.now() - Number(lastShownRaw);
      if (!Number.isNaN(elapsed) && elapsed >= 0 && elapsed < SPLASH_TTL_MS) {
        window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
        return false;
      }
    }
    const nowStr = String(Date.now());
    window.localStorage.setItem(SPLASH_STORAGE_KEY, nowStr);
    window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

function SadayaSplashScreen({ onFinish }: { onFinish: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 2200);
    const doneTimer = window.setTimeout(() => onFinish(), 2650);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setExiting(true);
    window.setTimeout(() => onFinish(), 320);
  };

  return (
    <div
      className={`fixed inset-0 z-[3000] bg-sundanese-dark text-white flex flex-col items-center justify-between p-6 select-none overflow-hidden transition-all duration-500 ease-out ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="status"
      aria-label="Memuat SADAYA Alun-Alun Cianjur"
    >
      {/* Decorative rotating Sundanese Kawung & Islamic geometric mandala rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 400 400"
          className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] text-gold-500/15 animate-splash-orbit"
          fill="none"
        >
          <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
          <rect x="72" y="72" width="256" height="256" stroke="currentColor" strokeWidth="1" />
          <rect
            x="72"
            y="72"
            width="256"
            height="256"
            stroke="currentColor"
            strokeWidth="1"
            transform="rotate(45 200 200)"
          />
        </svg>
        <svg
          viewBox="0 0 320 320"
          className="absolute w-[250px] h-[250px] sm:w-[340px] sm:h-[340px] text-gold-400/20 animate-splash-orbit-rev"
          fill="none"
        >
          <circle cx="160" cy="160" r="136" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M160 24 L296 160 L160 296 L24 160 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Top cultural header */}
      <div className="relative z-10 flex items-center gap-2 pt-2 text-[10px] sm:text-xs tracking-[0.22em] uppercase text-gold-300 font-semibold">
        <span className="w-6 h-px bg-gold-500/60" />
        <span>Tatar Santri · Kabupaten Cianjur</span>
        <span className="w-6 h-px bg-gold-500/60" />
      </div>

      {/* Center Logo & Editorial Identity */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md my-auto animate-splash-logo">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(250,246,240,0.22)_0%,rgba(200,169,81,0.12)_45%,transparent_72%)] blur-md" />
          <img
            src="/sadaya-logo.png"
            alt="Logo SADAYA"
            width={480}
            height={311}
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = SADAYA_LOGO_FALLBACK_SVG;
            }}
            className="relative w-44 sm:w-52 h-auto object-contain sadaya-crest-glow"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-islam-700/90 border border-gold-400/50 text-gold-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2.5 shadow-sm">
          <span>Ngaos</span>
          <span className="text-gold-400">◆</span>
          <span>Mamaos</span>
          <span className="text-gold-400">◆</span>
          <span>Maenpo</span>
        </div>

        <h1 className="font-heritage text-2xl sm:text-4xl font-bold text-gold-300 tracking-tight leading-tight">
          SADAYA Cianjur
        </h1>
        <p className="text-xs sm:text-sm font-medium text-earth-100 mt-1.5 max-w-xs sm:max-w-sm leading-relaxed">
          Sarana Digital Wisata, Budaya &amp; Lingkungan Asri Kawasan Alun-Alun Cianjur
        </p>

        {/* Progress Bar */}
        <div className="w-48 sm:w-56 h-1.5 bg-earth-800/90 rounded-full overflow-hidden mt-6 border border-gold-500/30 p-[1px]">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-islam-500 via-gold-400 to-gold-300 animate-splash-progress" />
        </div>
      </div>

      {/* Bottom Attribution & Skip */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between gap-3 pb-1 text-[11px] text-earth-200">
        <span className="truncate">Mojang Jajaka Kab. Cianjur · Kelompok 6 Swaranusa</span>
        <button
          type="button"
          onClick={handleSkip}
          className="px-3 py-1 rounded-full bg-earth-800/90 hover:bg-earth-700 text-gold-300 font-semibold border border-gold-500/40 transition-colors shrink-0"
        >
          Masuk →
        </button>
      </div>
    </div>
  );
}

function TopHeader({ onOpenAbout }: { onOpenAbout: () => void }) {
  const { questState, setActiveTab } = useApp();
  const entryGateObj = data.gates.find((g) => g.id === questState.entry_gate);

  return (
    <header className="bg-sundanese-dark text-white border-b border-gold-500/35 shrink-0">
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenAbout}
          className="min-w-0 flex-1 flex items-center gap-2.5 text-left group"
          aria-label="Tentang SADAYA — Social Project Mojang Jajaka Kabupaten Cianjur"
        >
          <div className="w-12 h-10 sm:w-14 sm:h-11 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/sadaya-logo.png"
              alt="Logo SADAYA"
              width={480}
              height={311}
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = SADAYA_LOGO_FALLBACK_SVG;
              }}
              className="w-full h-full object-contain sadaya-crest-glow"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-heritage text-sm sm:text-lg font-bold tracking-tight text-gold-300 truncate">
                SADAYA
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-earth-200 truncate">
                · Alun-Alun Cianjur
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-earth-200/90 truncate mt-0.5">
              {entryGateObj
                ? `Gerbang Aktif: ${entryGateObj.name}`
                : 'Sarana Digital Wisata, Budaya & Lingkungan Asri'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('panduan')}
            className="min-h-10 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-islam-700 hover:bg-islam-600 active:scale-95 text-white text-[11px] sm:text-xs font-semibold border border-islam-500/50 transition-all duration-200 shadow-xs"
            aria-label="Isi kehadiran pengunjung opsional"
          >
            Isi Kehadiran
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('misi')}
            className="min-h-10 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-earth-800/90 hover:bg-earth-700 active:scale-95 border border-gold-500/45 text-left transition-all duration-200 shadow-xs tabular-nums"
            aria-label="Lihat progres misi dan XP"
          >
            <div className="text-xs sm:text-sm font-bold text-gold-300 leading-none">
              {questState.total_xp} XP
            </div>
            <div className="text-[10px] text-earth-200 mt-0.5 whitespace-nowrap">
              {questState.completed_missions.length}/{data.missions.length} Misi
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

function SadayaIntroBanner({
  onOpenModal,
  onDismiss,
}: {
  onOpenModal: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="bg-earth-800 text-white border-b border-gold-500/30 px-3 sm:px-6 py-2 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-block bg-gold-500 text-earth-900 text-[10px] font-bold px-2 py-0.5 rounded-md leading-tight">
              Social Project Mojang Jajaka Kab. Cianjur
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-gold-300 truncate">
              SADAYA — Sarana Digital Wisata, Budaya & Lingkungan Asri
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-earth-200 mt-0.5 leading-snug truncate">
            Inisiatif digital Mojang Jajaka Kabupaten Cianjur (Kelompok 6 Swaranusa) untuk panduan wisata sejarah, kuliner & oleh-oleh, dan Budaya K5 Alun-Alun Cianjur.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenModal}
            className="px-2.5 py-1 rounded-lg bg-earth-700 hover:bg-earth-600 text-gold-300 text-[11px] font-semibold border border-gold-500/30 transition-all whitespace-nowrap"
          >
            Tentang SADAYA
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-6 h-6 rounded-full bg-earth-700 hover:bg-earth-600 text-earth-200 text-xs flex items-center justify-center shrink-0"
            aria-label="Sembunyikan banner pengantar SADAYA"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

function SadayaAboutModal({
  onClose,
  onGoToGuide,
}: {
  onClose: () => void;
  onGoToGuide: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-view-enter"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sadaya-modal-title"
    >
      <div
        className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl border border-gold-500/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-sundanese-dark text-white p-3.5 sm:p-5 flex items-start justify-between gap-3 border-b border-gold-500/35 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-18 h-12 sm:w-22 sm:h-14 shrink-0 flex items-center justify-center">
              <img
                src="/sadaya-logo.png"
                alt="Logo SADAYA"
                width={480}
                height={311}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = SADAYA_LOGO_FALLBACK_SVG;
                }}
                className="w-full h-full object-contain sadaya-crest-glow"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block bg-gold-500 text-earth-900 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 leading-tight">
                Social Project · Mojang Jajaka Kab. Cianjur
              </span>
              <h2
                id="sadaya-modal-title"
                className="font-heritage text-sm sm:text-lg font-bold text-gold-300 leading-tight"
              >
                SADAYA Cianjur
              </h2>
              <p className="text-[11px] sm:text-xs text-earth-200 mt-0.5 leading-snug">
                Sarana Digital Wisata, Budaya, dan Lingkungan Asri
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-earth-800 hover:bg-earth-700 text-earth-200 text-sm flex items-center justify-center shrink-0"
            aria-label="Tutup dialog Tentang SADAYA"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-earth-800 leading-relaxed overflow-y-auto">
          <p>
            <strong>SADAYA (Sarana Digital Wisata, Budaya, dan Lingkungan Asri)</strong> merupakan salah satu <strong>Social Project dari Mojang Jajaka Kabupaten Cianjur</strong> (Kelompok 6 Swaranusa) yang dirancang sebagai pusat informasi digital terpadu bagi masyarakat dan wisatawan di kawasan Alun-Alun Cianjur.
          </p>
          <div className="heritage-card rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="font-bold text-earth-900">Pilar Utama Program SADAYA:</div>
            <ul className="list-disc pl-4 space-y-1 text-earth-700">
              <li>
                <strong>Wisata &amp; Aksesibilitas:</strong> Peta interaktif Alun-Alun, titik lokasi toilet, panduan waktu tempuh dari Stasiun Cianjur (6 menit jalan kaki), serta event pameran Malam Minggu di Bunderan &amp; Bomero City Walk.
              </li>
              <li>
                <strong>Pelestarian Budaya:</strong> Ensiklopedia dan pemandu suara 16 ikon sejarah 3 Pilar Budaya Cianjur (<em>Ngaos, Mamaos, Maenpo</em>) beserta rekomendasi oleh-oleh khas Cianjur.
              </li>
              <li>
                <strong>Lingkungan Asri (Budaya K5):</strong> Edukasi ketertiban kawasan, 17 titik tempat sampah terpilah, serta gamifikasi Misi Ksatria K5 berhadiah sertifikat digital.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onGoToGuide}
              className="flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Isi Kehadiran & Buka Panduan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Mulai Jelajahi
            </button>
          </div>
        </div>
      </div>
    </div>
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
    id: 'panduan',
    label: 'Panduan',
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
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
    <nav className="fixed bottom-0 inset-x-0 md:bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[620px] bg-white/95 backdrop-blur-md border-t md:border border-earth-200/90 md:rounded-2xl md:shadow-[0_10px_35px_rgba(62,39,35,0.16)] pb-[env(safe-area-inset-bottom)] md:pb-0 z-40 overflow-hidden">
      <div className="relative flex w-full">
        {/* Sliding active background indicator */}
        <div
          className="absolute inset-y-1 left-0 w-1/6 px-0.5 transition-transform duration-300 ease-out pointer-events-none"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          <div className="w-full h-full rounded-xl bg-islam-50 border border-islam-200/70" />
        </div>

        {/* Sliding top accent bar */}
        <div
          className="absolute top-0 left-0 w-1/6 h-0.5 bg-islam-600 transition-transform duration-300 ease-out pointer-events-none"
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
  const { activeTab, setActiveTab } = useApp();
  return (
    <ViewErrorBoundary resetKey={activeTab} onResetToMap={() => setActiveTab('peta')}>
      <main key={activeTab} className="flex-1 flex flex-col min-w-0 min-h-0">
        {activeTab === 'peta' && <MapView />}
        {activeTab === 'sejarah' && <HeritageView />}
        {activeTab === 'kuliner' && <CulinaryView />}
        {activeTab === 'hotel' && <HotelView />}
        {activeTab === 'panduan' && <GuideView />}
        {activeTab === 'misi' && <QuestView />}
      </main>
    </ViewErrorBoundary>
  );
}

function AppShell() {
  const { activeTab, setMapFocus, updateQuest, setActiveTab } = useApp();
  const [showSplash, setShowSplash] = useState(shouldShowSplashOnMount);
  const [showIntroBanner, setShowIntroBanner] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);

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
    <div
      className={`bg-sundanese-light flex flex-col ${
        activeTab === 'peta' ? 'h-dvh overflow-hidden' : 'min-h-dvh'
      }`}
    >
      {showSplash && <SadayaSplashScreen onFinish={() => setShowSplash(false)} />}
      <div
        className={`w-full max-w-6xl mx-auto flex flex-col bg-sundanese-light shadow-md lg:border-x lg:border-gold-500/30 ${
          activeTab === 'peta' ? 'h-dvh overflow-hidden' : 'min-h-dvh'
        }`}
      >
        <TopHeader onOpenAbout={() => setShowAboutModal(true)} />
        {showIntroBanner && (
          <SadayaIntroBanner
            onOpenModal={() => setShowAboutModal(true)}
            onDismiss={() => setShowIntroBanner(false)}
          />
        )}
        <TabContent />
        <BottomNav />
      </div>

      {showAboutModal && (
        <SadayaAboutModal
          onClose={() => setShowAboutModal(false)}
          onGoToGuide={() => {
            setShowAboutModal(false);
            setActiveTab('panduan');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const isAdmin =
    new URLSearchParams(window.location.search).get('mode') === 'admin' ||
    window.location.pathname === '/admin-mapper';
  return (
    <ViewErrorBoundary>
      <AppProvider>
        <Suspense fallback={<div className="p-4 text-center text-earth-500 text-sm">Memuat...</div>}>
          {isAdmin ? <AdminMapper /> : <AppShell />}
        </Suspense>
      </AppProvider>
    </ViewErrorBoundary>
  );
}
