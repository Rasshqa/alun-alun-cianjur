import { useState, useEffect, useMemo } from 'react';
import data from '../data/cianjur-data.json';
import { useApp } from '../context/AppContext';
import { formatDistance } from '../utils/time';
import { getVisualUrl, getFallbackVisualUrl } from '../utils/visuals';

type HeritageIcon = (typeof data.heritage_icons)[number];
type ZoneFilter = 'ALL' | 'INTERNAL' | 'EXTERNAL';

const ZONE_OPTIONS: { value: ZoneFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'INTERNAL', label: 'Dalam Alun-Alun' },
  { value: 'EXTERNAL', label: 'Sekitar Kota' },
];

const PILAR_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Semua Pilar' },
  { value: 'NGAOS', label: 'Ngaos' },
  { value: 'MAMAOS', label: 'Mamaos' },
  { value: 'MAENPO', label: 'Maenpo' },
  { value: 'HERITAGE', label: 'Sejarah Kota' },
];

const PILAR_BADGE: Record<string, string> = {
  NGAOS: 'bg-islam-100 text-islam-700',
  MAMAOS: 'bg-gold-300/40 text-earth-800',
  MAENPO: 'bg-earth-200 text-earth-800',
  HERITAGE: 'bg-earth-100 text-earth-700',
};

const PILAR_DISPLAY: Record<string, string> = {
  NGAOS: 'Pilar Ngaos',
  MAMAOS: 'Pilar Mamaos',
  MAENPO: 'Pilar Maenpo',
  HERITAGE: 'Sejarah Kota',
};

const ZONE_BADGE: Record<string, { label: string; cls: string }> = {
  INTERNAL: { label: 'Dalam Alun-Alun', cls: 'bg-islam-50 text-islam-700 border border-islam-300' },
  EXTERNAL: { label: 'Sekitar Kota', cls: 'bg-earth-100 text-earth-600 border border-earth-300' },
};

export default function HeritageView() {
  const { setActiveTab, setMapFocus } = useApp();
  const [zone, setZone] = useState<ZoneFilter>('ALL');
  const [pilar, setPilar] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [audioFallbackId, setAudioFallbackId] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<{
    title: string;
    sub: string;
    url: string;
  } | null>(null);

  const speechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  const stopAudio = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  const toggleAudio = (icon: HeritageIcon) => {
    if (!speechSupported) {
      setAudioFallbackId(icon.id);
      setExpandedId(icon.id);
      return;
    }

    if (speakingId === icon.id) {
      stopAudio();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${icon.name}. ${icon.summary}`);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;

      utterance.onend = () => {
        setSpeakingId(null);
      };
      utterance.onerror = () => {
        setSpeakingId(null);
        setAudioFallbackId(icon.id);
        setExpandedId(icon.id);
      };

      setAudioFallbackId(null);
      setSpeakingId(icon.id);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingId(null);
      setAudioFallbackId(icon.id);
      setExpandedId(icon.id);
    }
  };

  const handleCardToggle = (id: string) => {
    if (expandedId === id) {
      if (speakingId === id) stopAudio();
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleViewOnMap = (icon: HeritageIcon) => {
    stopAudio();
    setMapFocus({ coords: icon.coords as [number, number], zoom: 18 });
    setActiveTab('peta');
  };

  const handleGoToQuiz = () => {
    stopAudio();
    setActiveTab('misi');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qCompact = q.replace(/[\s'-]+/g, '');
    return data.heritage_icons.filter((item) => {
      if (zone !== 'ALL' && item.zone !== zone) return false;
      if (pilar !== 'ALL' && item.pilar_tag.toUpperCase() !== pilar) return false;
      if (q) {
        const hay = `${item.name} ${item.pilar_tag} ${item.summary} ${item.address ?? ''}`.toLowerCase();
        const hayCompact = hay.replace(/[\s'-]+/g, '');
        if (!hay.includes(q) && !hayCompact.includes(qCompact)) return false;
      }
      return true;
    });
  }, [zone, pilar, search]);

  return (
    <div className="px-3.5 sm:px-6 pt-3.5 pb-28 md:pb-32 space-y-3.5">
      {/* Search Input & Filter Controls */}
      <div className="heritage-card rounded-2xl p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heritage text-base sm:text-lg font-bold text-earth-900">
            Ensiklopedia Ikon Sejarah &amp; 3 Pilar Budaya Cianjur
          </h2>
          <span className="text-[11px] font-semibold text-islam-700 bg-islam-50 border border-islam-200 px-2.5 py-0.5 rounded-full shrink-0">
            {data.heritage_icons.length} Ikon
          </span>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari ikon sejarah: Al-Qur'an, Lonceng, Bojongmeron, Bumi Ageung..."
          className="w-full min-w-0 bg-earth-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-islam-600 transition-shadow"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Zone filter pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {ZONE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setZone(o.value)}
                className={`shrink-0 px-3.5 min-h-9 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  zone === o.value
                    ? 'bg-earth-800 text-gold-300 border border-gold-500/50 shadow-xs'
                    : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Pilar filter pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {PILAR_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPilar(p.value)}
                className={`shrink-0 px-3 min-h-8 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  pilar === p.value
                    ? 'bg-islam-700 text-white shadow-xs'
                    : 'bg-white text-earth-600 border border-earth-200 hover:bg-earth-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-earth-600 px-0.5">
        Menampilkan {filtered.length} dari {data.heritage_icons.length} ikon sejarah &amp; cagar budaya
      </p>

      {filtered.length === 0 && (
        <div className="heritage-card rounded-2xl p-6 text-center space-y-2 animate-view-enter">
          <p className="text-sm font-medium text-earth-700">Tidak ada ikon sejarah yang cocok.</p>
          <button
            onClick={() => {
              setZone('ALL');
              setPilar('ALL');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-earth-800 text-white text-xs font-semibold active:scale-95 transition-transform"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Responsive Cards Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-start">
        {filtered.map((icon, idx) => {
          const isOpen = expandedId === icon.id;
          const isSpeaking = speakingId === icon.id;
          const zb = ZONE_BADGE[icon.zone];
          const visualUrl = getVisualUrl({
            id: icon.id,
            title: icon.name,
            subtitle: `${PILAR_DISPLAY[icon.pilar_tag] ?? icon.pilar_tag} · ${icon.year_built}`,
            category: icon.pilar_tag,
            photoUrl: icon.photo_url,
          });

          return (
            <div
              key={icon.id}
              style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
              className="animate-card-cascade heritage-card rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
            >
              <div
                className="relative h-36 bg-earth-900 overflow-hidden group cursor-pointer"
                onClick={() =>
                  setLightboxItem({
                    title: icon.name,
                    sub: `${PILAR_DISPLAY[icon.pilar_tag] ?? icon.pilar_tag} · Tahun ${icon.year_built}`,
                    url: visualUrl,
                  })
                }
              >
                <img
                  src={visualUrl}
                  alt={icon.name}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getFallbackVisualUrl({
                      id: icon.id,
                      title: icon.name,
                      subtitle: `${PILAR_DISPLAY[icon.pilar_tag] ?? icon.pilar_tag} · ${icon.year_built}`,
                      category: icon.pilar_tag,
                    });
                  }}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Perbesar Foto
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCardToggle(icon.id)}
                className="w-full text-left p-4 flex items-start justify-between gap-2.5"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        PILAR_BADGE[icon.pilar_tag] ?? 'bg-earth-100 text-earth-700'
                      }`}
                    >
                      {PILAR_DISPLAY[icon.pilar_tag] ?? icon.pilar_tag}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${zb.cls}`}>
                      {zb.label}
                    </span>
                    <span className="text-[10px] text-earth-400">{icon.year_built}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-earth-900 leading-snug break-words">
                    {icon.name}
                  </h3>

                  {icon.zone === 'EXTERNAL' && (
                    <p className="text-xs text-earth-500 break-words">
                      {icon.address ? `${icon.address} · ` : ''}
                      {formatDistance(icon.distance_m)} dari Alun-Alun
                    </p>
                  )}
                </div>

                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-earth-400 shrink-0 mt-1 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-earth-800' : ''
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1.5 border-t border-earth-100 space-y-3 animate-view-enter">
                  <p className="text-xs sm:text-sm text-earth-700 leading-relaxed">
                    {icon.summary}
                  </p>

                  {audioFallbackId === icon.id && (
                    <div className="bg-gold-300/20 border border-gold-500/35 text-earth-800 rounded-xl px-3 py-2 text-[11px] font-medium">
                      Suara otomatis tidak tersedia di perangkat ini — silakan baca narasi sejarah di atas.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleAudio(icon)}
                    className={`w-full flex items-center justify-center gap-2 min-h-10 py-2 px-3 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                      isSpeaking
                        ? 'bg-earth-800 text-white'
                        : 'bg-earth-100 text-earth-800 hover:bg-earth-200'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        Hentikan Audio
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                          <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                          <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
                        </svg>
                        Dengarkan Sejarah
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewOnMap(icon)}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 min-h-10 py-2 px-3 rounded-xl text-xs font-semibold bg-islam-600 text-white hover:bg-islam-700 active:scale-95 transition-all"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                        <path
                          fillRule="evenodd"
                          d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Lihat di Peta
                    </button>

                    {icon.quiz_id && (
                      <button
                        type="button"
                        onClick={handleGoToQuiz}
                        className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 min-h-10 py-2 px-3 rounded-xl text-xs font-semibold bg-gold-400/35 text-earth-900 border border-gold-500 hover:bg-gold-400/50 active:scale-95 transition-all"
                      >
                        Jawab Kuis (+XP)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightboxItem && (
        <div
          className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-view-enter"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl border border-earth-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxItem.url}
              alt={lightboxItem.title}
              width={800}
              height={500}
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getFallbackVisualUrl({
                  id: 'ICN-01',
                  title: lightboxItem.title,
                  subtitle: lightboxItem.sub,
                  category: 'heritage',
                });
              }}
              className="w-full max-h-[65dvh] object-contain bg-earth-900 shrink-0"
            />
            <div className="p-4 flex items-start justify-between gap-3 overflow-y-auto">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-earth-900 text-sm sm:text-base break-words">{lightboxItem.title}</h4>
                <p className="text-xs text-earth-600 mt-0.5 break-words">{lightboxItem.sub}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-earth-800 text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
