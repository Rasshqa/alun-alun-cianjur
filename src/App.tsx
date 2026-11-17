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

function TopHeader({
  onOpenAbout,
  onOpenMitra,
}: {
  onOpenAbout: () => void;
  onOpenMitra: () => void;
}) {
  const { questState, setActiveTab } = useApp();
  const entryGateObj = data.gates.find((g) => g.id === questState.entry_gate);

  return (
    <header className="bg-sundanese-dark text-white border-b border-gold-500/35 shrink-0">
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenAbout}
          className="min-w-0 flex-1 flex items-center gap-2.5 text-left group"
          aria-label="Tentang SADAYA: Social Project Mojang Jajaka Kabupaten Cianjur"
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
            onClick={onOpenMitra}
            className="min-h-10 px-2.5 sm:px-3 py-1.5 rounded-xl bg-earth-800/90 hover:bg-earth-700 active:scale-95 text-gold-300 text-[11px] sm:text-xs font-semibold border border-gold-500/40 transition-all duration-200 shadow-xs flex items-center gap-1.5"
            aria-label="Lihat Mitra dan Sponsor Resmi SADAYA"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span className="hidden sm:inline">Mitra &amp; Sponsor</span>
            <span className="sm:hidden">Mitra</span>
          </button>

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
  onOpenMitra,
  onDismiss,
}: {
  onOpenModal: () => void;
  onOpenMitra: () => void;
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
              SADAYA: Sarana Digital Wisata, Budaya & Lingkungan Asri
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-earth-200 mt-0.5 leading-snug truncate">
            Inisiatif digital Mojang Jajaka Kabupaten Cianjur (Kelompok 6 Swaranusa) untuk panduan wisata sejarah, kuliner &amp; oleh-oleh, dan Budaya K5 Alun-Alun Cianjur.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMitra}
            className="px-2.5 py-1 rounded-lg bg-gold-500 hover:bg-gold-400 text-earth-900 text-[11px] font-bold border border-gold-400 transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5 shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-earth-900" />
            <span>Mitra Resmi</span>
          </button>
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

function SponsorRibbon({ onOpenMitra }: { onOpenMitra: () => void }) {
  return (
    <div className="bg-sundanese-dark/95 text-white border-b border-gold-500/30 px-3 sm:px-6 py-1.5 shrink-0 shadow-xs">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span>Mitra Pendukung:</span>
          </span>
          <button
            type="button"
            onClick={onOpenMitra}
            className="text-[11px] font-semibold text-earth-100 hover:text-gold-300 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer text-left"
          >
            <span>BPR Cianjur</span>
            <span className="text-gold-500/60">◆</span>
            <span>PT Sultan Putra Assamil</span>
            <span className="text-gold-500/60">◆</span>
            <span>Di Makeupin Ajeng</span>
            <span className="text-gold-500/60">◆</span>
            <span>Dekranasda</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenMitra}
          className="text-[10px] font-bold text-gold-300 hover:text-gold-200 shrink-0 underline ml-1 cursor-pointer whitespace-nowrap"
        >
          Lihat Profil
        </button>
      </div>
    </div>
  );
}

function SadayaAboutModal({
  onClose,
  onGoToGuide,
  onOpenMitra,
}: {
  onClose: () => void;
  onGoToGuide: () => void;
  onOpenMitra: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
            className="w-7 h-7 rounded-full bg-earth-800 hover:bg-earth-700 text-earth-200 text-sm flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-gold-400"
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
                <strong>Pelestarian Budaya:</strong> Ensiklopedia dan pemandu suara 17 ikon sejarah 3 Pilar Budaya Cianjur (<em>Ngaos, Mamaos, Maenpo</em>) beserta rekomendasi oleh-oleh khas Cianjur.
              </li>
              <li>
                <strong>Lingkungan Asri (Budaya K5):</strong> Edukasi ketertiban kawasan, 17 titik tempat sampah terpilah, serta gamifikasi Misi Ksatria K5 berhadiah sertifikat digital.
              </li>
            </ul>
          </div>

          {/* Mitra & Sponsor Acknowledgment */}
          <div className="bg-earth-100/90 rounded-xl p-3 border border-earth-200/90 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-earth-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-islam-700" />
                <span>Mitra &amp; Sponsor Resmi SADAYA</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMitra();
                }}
                className="text-[11px] font-bold text-islam-700 hover:underline"
              >
                Lihat Semua Mitra
              </button>
            </div>
            <p className="text-[11px] text-earth-700 leading-snug">
              Didukung oleh <strong>BPR Cianjur</strong>, <strong>PT Sultan Putra Assamil</strong>, <strong>Di Makeupin Ajeng</strong>, <strong>Dekranasda Kab. Cianjur</strong>, serta mitra kuliner <strong>Mochi Mommi</strong>, <strong>Bubur Sampurna</strong>, &amp; <strong>Tauco Cap Meong</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onGoToGuide}
              className="flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs font-semibold active:scale-95 transition-all text-center"
            >
              Isi Kehadiran &amp; Panduan
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

function SadayaMitraModal({
  onClose,
  onGoToMapDekranasda,
  onGoToCulinary,
}: {
  onClose: () => void;
  onGoToMapDekranasda: () => void;
  onGoToCulinary: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-view-enter"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sadaya-mitra-title"
    >
      <div
        className="bg-[#FAF6F0] rounded-2xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl border border-gold-500/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-sundanese-dark text-white p-3.5 sm:p-5 flex items-start justify-between gap-3 border-b border-gold-500/35 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-block bg-gold-500 text-earth-900 text-[10px] font-bold px-2 py-0.5 rounded-md leading-tight">
                Kemitraan Resmi
              </span>
              <span className="text-[11px] text-gold-300 font-semibold">
                Mojang Jajaka Kab. Cianjur · Swaranusa
              </span>
            </div>
            <h2 id="sadaya-mitra-title" className="font-heritage text-base sm:text-xl font-bold text-gold-300 leading-tight">
              Mitra &amp; Sponsor Resmi SADAYA
            </h2>
            <p className="text-[11px] sm:text-xs text-earth-200 mt-0.5">
              Sinergi Lembaga Keuangan, Pelaku Bisnis, UMKM Kuliner, dan Kerajinan Daerah Alun-Alun Cianjur
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-earth-800 hover:bg-earth-700 text-earth-200 text-sm flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Tutup dialog Mitra"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-earth-800 leading-relaxed overflow-y-auto">
          {/* Unified Partner Cards without category silos */}
          <div className="space-y-3">
            {/* PT BPR Cianjur Jabar (Perseroda) */}
            <div className="bg-white rounded-xl p-3.5 border border-earth-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-14 h-11 bg-earth-50 rounded-lg p-1 flex items-center justify-center shrink-0 border border-earth-200">
                    <img
                      src="/sponsors/bpr-cianjur.png"
                      alt="Logo BPR Cianjur"
                      width={60}
                      height={40}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-earth-900 text-sm">
                      PT BPR Cianjur Jabar (Perseroda)
                    </h3>
                    <span className="text-[10px] text-earth-600 font-medium">
                      BUMD Lembaga Keuangan Daerah
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded-md">
                  OJK &amp; LPS
                </span>
              </div>
              <p className="text-xs text-earth-700 leading-relaxed">
                Menyediakan produk simpanan (Tabungan SIUNIK berbasis NIK e-KTP, Deposito Berjangka) serta penyaluran kredit modal usaha bagi UMKM lokal dan fasilitas jemput setoran ke nasabah.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                <a
                  href="https://www.instagram.com/infobprcianjur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 font-semibold transition-all active:scale-95"
                >
                  Instagram: @infobprcianjur
                </a>
                <a
                  href="https://bprcianjur.co.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 border border-earth-200 font-semibold transition-all active:scale-95"
                >
                  Situs: bprcianjur.co.id
                </a>
              </div>
            </div>

            {/* PT Sultan Putra Assamil */}
            <div className="bg-white rounded-xl p-3.5 border border-earth-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-14 h-11 bg-[#172554] rounded-lg p-1 flex items-center justify-center shrink-0 border border-blue-900">
                    <img
                      src="/sponsors/sultan-putra-assamil.png"
                      alt="Logo PT Sultan Putra Assamil"
                      width={60}
                      height={40}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-earth-900 text-sm">
                      PT Sultan Putra Assamil
                    </h3>
                    <span className="text-[10px] text-earth-600 font-medium">
                      Biro Perjalanan &amp; Bus Pariwisata
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-md">
                  Transportasi &amp; Wisata
                </span>
              </div>
              <p className="text-xs text-earth-700 leading-relaxed">
                Jasa transportasi darat sewa armada bus pariwisata eksekutif nyaman dan aman, paket tour domestik hingga mancanegara, serta kontraktor umum berbasis di Cianjur.
              </p>
              <div className="text-[11px] text-earth-600">
                Wilayah Operasional: Cianjur, Jawa Barat, hingga rute mancanegara.
              </div>
            </div>

            {/* Di Makeupin Ajeng */}
            <div className="bg-white rounded-xl p-3.5 border border-earth-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-14 h-11 bg-[#FCE7F3] rounded-lg p-1 flex items-center justify-center shrink-0 border border-pink-200">
                    <img
                      src="/sponsors/dimakeupin-ajeng.png"
                      alt="Logo Di Makeupin Ajeng"
                      width={60}
                      height={40}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-earth-900 text-sm">
                      Di Makeupin Ajeng
                    </h3>
                    <span className="text-[10px] text-earth-600 font-medium">
                      Professional Makeup Artist (MUA)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-pink-100 text-pink-900 font-bold px-2 py-0.5 rounded-md">
                  Tata Rias
                </span>
              </div>
              <p className="text-xs text-earth-700 leading-relaxed">
                Tata rias profesional di Cianjur untuk wedding adat Sunda siger/modern, wisuda, lamaran, prewedding, photoshoot, dan tata rias Mojang Jajaka.
              </p>
              <div className="pt-0.5 text-[11px]">
                <a
                  href="https://www.instagram.com/dimakeupinajeng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 font-semibold transition-all active:scale-95"
                >
                  Instagram: @dimakeupinajeng
                </a>
              </div>
            </div>

            {/* Dekranasda Kabupaten Cianjur */}
            <div className="bg-white rounded-xl p-3.5 border border-earth-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-14 h-11 bg-earth-50 rounded-lg p-1 flex items-center justify-center shrink-0 border border-earth-200">
                    <img
                      src="/sponsors/dekranasda.png"
                      alt="Logo Dekranasda Kabupaten Cianjur"
                      width={60}
                      height={60}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-earth-900 text-sm">
                      Dekranasda Kabupaten Cianjur
                    </h3>
                    <span className="text-[10px] text-earth-600 font-medium">
                      Dewan Kerajinan Nasional Daerah
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded-md">
                  Pusat Kriya &amp; UMKM
                </span>
              </div>
              <p className="text-xs text-earth-700 leading-relaxed">
                Pembinaan perajin kriya dan promosi produk unggulan: Batik Khas Cianjur (Hayam Pelung &amp; 3 Pilar), Anyaman Bambu Tradisional, dan Lampion Kaca Patri Gentur.
              </p>
              <div className="bg-amber-50/80 rounded-lg p-2.5 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="text-[11px] text-earth-800">
                  <span className="font-bold text-amber-950">Lokasi: </span>
                  Kompleks Pendopo Kab. Cianjur, Jl. Siti Jenab No. 31 (50m seberang selatan Alun-Alun).
                </div>
                <button
                  type="button"
                  onClick={onGoToMapDekranasda}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-earth-800 hover:bg-earth-900 text-gold-300 text-xs font-bold active:scale-95 transition-all"
                >
                  Buka Titik di Peta
                </button>
              </div>
            </div>

            {/* Mitra Kuliner Prioritas */}
            <div className="bg-white rounded-xl p-3.5 border border-earth-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-bold text-earth-900 text-sm">
                  Mitra Resmi Kuliner &amp; Oleh-Oleh Prioritas
                </h3>
                <button
                  type="button"
                  onClick={onGoToCulinary}
                  className="text-[11px] font-bold text-islam-700 hover:underline"
                >
                  Buka Tab Kuliner
                </button>
              </div>
              <div className="text-xs text-earth-700 flex flex-wrap gap-2">
                <span className="bg-earth-100 px-2.5 py-1 rounded-md font-semibold text-earth-800">
                  Mochi Mommi (Mochi Khas Cianjur Sejak 2012)
                </span>
                <span className="bg-earth-100 px-2.5 py-1 rounded-md font-semibold text-earth-800">
                  Bubur Ayam Sampurna (Bojongmeron 1975)
                </span>
                <span className="bg-earth-100 px-2.5 py-1 rounded-md font-semibold text-earth-800">
                  Tauco Cap Meong (Sejak 1880)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirstVisitSponsorPopup({
  onClose,
  onOpenFullMitra,
}: {
  onClose: () => void;
  onOpenFullMitra: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[2100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-view-enter"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-visit-sponsor-title"
    >
      <div
        className="bg-[#FAF6F0] rounded-2xl max-w-xl w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl border border-gold-500/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-sundanese-dark text-white p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-gold-500/35 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block bg-gold-500 text-earth-900 text-[10px] font-bold px-2 py-0.5 rounded-md leading-tight">
                Mitra Resmi SADAYA
              </span>
              <span className="text-[11px] text-gold-300 font-semibold">
                Mojang Jajaka Kab. Cianjur · Swaranusa
              </span>
            </div>
            <h2
              id="first-visit-sponsor-title"
              className="font-heritage text-base sm:text-xl font-bold text-gold-300 leading-tight"
            >
              Selamat Datang di Portal SADAYA
            </h2>
            <p className="text-[11px] sm:text-xs text-earth-200 leading-snug">
              Sarana Digital Wisata, Budaya, dan Lingkungan Asri Alun-Alun Cianjur didukung oleh mitra terpercaya:
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-earth-800 hover:bg-earth-700 text-earth-200 text-sm flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Tutup sambutan mitra"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm text-earth-800 leading-relaxed overflow-y-auto">
          <p className="text-xs text-earth-700">
            Apresiasi dan kehormatan kami kepada mitra resmi yang berkolaborasi mendukung pelayanan publik, pariwisata, dan pelestarian budaya Cianjur:
          </p>

          <div className="space-y-2.5">
            {/* BPR Cianjur */}
            <div className="bg-white rounded-xl p-3 border border-earth-200/90 flex items-center gap-3 shadow-2xs">
              <div className="w-16 h-12 bg-earth-50 rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-earth-200">
                <img
                  src="/sponsors/bpr-cianjur.png"
                  alt="Logo BPR Cianjur"
                  width={80}
                  height={50}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-earth-900 text-xs sm:text-sm">
                    PT BPR Cianjur Jabar (Perseroda)
                  </h3>
                  <span className="text-[9px] bg-sky-100 text-sky-900 font-bold px-1.5 py-0.2 rounded">
                    BUMD Perbankan
                  </span>
                </div>
                <p className="text-[11px] text-earth-600 line-clamp-2 mt-0.5">
                  Layanan simpanan terpercaya (SIUNIK KTP &amp; Deposito) dan kredit permodalan usaha bagi masyarakat serta UMKM Cianjur.
                </p>
              </div>
            </div>

            {/* PT Sultan Putra Assamil */}
            <div className="bg-white rounded-xl p-3 border border-earth-200/90 flex items-center gap-3 shadow-2xs">
              <div className="w-16 h-12 bg-[#172554] rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-blue-900">
                <img
                  src="/sponsors/sultan-putra-assamil.png"
                  alt="Logo PT Sultan Putra Assamil"
                  width={80}
                  height={50}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-earth-900 text-xs sm:text-sm">
                    PT Sultan Putra Assamil
                  </h3>
                  <span className="text-[9px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.2 rounded">
                    Transportasi &amp; Wisata
                  </span>
                </div>
                <p className="text-[11px] text-earth-600 line-clamp-2 mt-0.5">
                  Jasa transportasi armada bus pariwisata eksekutif, paket tur domestik-mancanegara, dan kontraktor umum berbasis di Cianjur.
                </p>
              </div>
            </div>

            {/* Di Makeupin Ajeng */}
            <div className="bg-white rounded-xl p-3 border border-earth-200/90 flex items-center gap-3 shadow-2xs">
              <div className="w-16 h-12 bg-[#FCE7F3] rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-pink-200">
                <img
                  src="/sponsors/dimakeupin-ajeng.png"
                  alt="Logo Di Makeupin Ajeng"
                  width={80}
                  height={50}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-earth-900 text-xs sm:text-sm">
                    Di Makeupin Ajeng
                  </h3>
                  <span className="text-[9px] bg-pink-100 text-pink-900 font-bold px-1.5 py-0.2 rounded">
                    Professional MUA
                  </span>
                </div>
                <p className="text-[11px] text-earth-600 line-clamp-2 mt-0.5">
                  Jasa tata rias profesional di Cianjur untuk wedding adat Sunda/modern, wisuda, lamaran, prewedding, dan photoshoot.
                </p>
              </div>
            </div>

            {/* Dekranasda Kabupaten Cianjur */}
            <div className="bg-white rounded-xl p-3 border border-earth-200/90 flex items-center gap-3 shadow-2xs">
              <div className="w-16 h-12 bg-earth-50 rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-earth-200">
                <img
                  src="/sponsors/dekranasda.png"
                  alt="Logo Dekranasda Kabupaten Cianjur"
                  width={60}
                  height={60}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-earth-900 text-xs sm:text-sm">
                    Dekranasda Kabupaten Cianjur
                  </h3>
                  <span className="text-[9px] bg-red-100 text-red-900 font-bold px-1.5 py-0.2 rounded">
                    Pusat Kriya &amp; UMKM
                  </span>
                </div>
                <p className="text-[11px] text-earth-600 line-clamp-2 mt-0.5">
                  Lembaga pembina perajin kriya Batik Cianjur, Anyaman Bambu, dan Lampion Gentur di Kompleks Pendopo (50m dari Alun-Alun).
                </p>
              </div>
            </div>

            {/* Kuliner & Oleh-Oleh Prioritas */}
            <div className="bg-white rounded-xl p-3 border border-earth-200/90 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-earth-900 text-xs">
                  Mitra Resmi Kuliner &amp; Oleh-Oleh Prioritas
                </h3>
                <span className="text-[9px] bg-gold-100 text-earth-900 font-bold px-1.5 py-0.2 rounded">
                  Kuliner Legendaris
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-earth-800">
                <span className="bg-earth-100 px-2 py-0.5 rounded-md font-medium">
                  Mochi Mommi (Sejak 2012)
                </span>
                <span className="bg-earth-100 px-2 py-0.5 rounded-md font-medium">
                  Bubur Ayam Sampurna (1975)
                </span>
                <span className="bg-earth-100 px-2 py-0.5 rounded-md font-medium">
                  Tauco Cap Meong (Sejak 1880)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-earth-800 hover:bg-earth-900 text-gold-300 text-xs font-bold active:scale-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              Jelajahi Portal SADAYA
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullMitra();
              }}
              className="py-2.5 px-4 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-900 text-xs font-semibold active:scale-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-earth-400"
            >
              Lihat Profil Lengkap Mitra
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
  const [showMitraModal, setShowMitraModal] = useState(false);
  const [showFirstVisitPopup, setShowFirstVisitPopup] = useState(false);

  useEffect(() => {
    if (!showSplash) {
      const hasSeen = sessionStorage.getItem('sadaya_first_visit_sponsor_seen');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setShowFirstVisitPopup(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [showSplash]);

  const handleCloseFirstVisitPopup = () => {
    setShowFirstVisitPopup(false);
    sessionStorage.setItem('sadaya_first_visit_sponsor_seen', 'true');
  };

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
        <TopHeader
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenMitra={() => setShowMitraModal(true)}
        />
        {showIntroBanner && (
          <SadayaIntroBanner
            onOpenModal={() => setShowAboutModal(true)}
            onOpenMitra={() => setShowMitraModal(true)}
            onDismiss={() => setShowIntroBanner(false)}
          />
        )}
        <SponsorRibbon onOpenMitra={() => setShowMitraModal(true)} />
        <TabContent />
        <BottomNav />
      </div>

      {showFirstVisitPopup && (
        <FirstVisitSponsorPopup
          onClose={handleCloseFirstVisitPopup}
          onOpenFullMitra={() => {
            handleCloseFirstVisitPopup();
            setShowMitraModal(true);
          }}
        />
      )}

      {showAboutModal && (
        <SadayaAboutModal
          onClose={() => setShowAboutModal(false)}
          onGoToGuide={() => {
            setShowAboutModal(false);
            setActiveTab('panduan');
          }}
          onOpenMitra={() => setShowMitraModal(true)}
        />
      )}

      {showMitraModal && (
        <SadayaMitraModal
          onClose={() => setShowMitraModal(false)}
          onGoToMapDekranasda={() => {
            setShowMitraModal(false);
            setMapFocus({ coords: [-6.82205, 107.13965], zoom: 19, layer: 'heritage' });
            setActiveTab('peta');
          }}
          onGoToCulinary={() => {
            setShowMitraModal(false);
            setActiveTab('kuliner');
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
