import { useState, useEffect, useRef, useMemo } from 'react';
import data from '../data/cianjur-data.json';
import { useApp } from '../context/AppContext';
import { formatDistance } from '../utils/time';

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

const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export default function HeritageView() {
  const { setActiveTab, setMapFocus } = useApp();
  const [zone, setZone] = useState<ZoneFilter>('ALL');
  const [pilar, setPilar] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
    };
  }, []);

  const stopAudio = () => {
    if (speechSupported) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeakingId(null);
  };

  const toggleAudio = (icon: HeritageIcon) => {
    if (!speechSupported) return;
    if (speakingId === icon.id) {
      stopAudio();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${icon.name}. ${icon.summary}`);
    u.lang = 'id-ID';
    u.rate = 0.95;
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    utteranceRef.current = u;
    setSpeakingId(icon.id);
    window.speechSynthesis.speak(u);
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
    <div className="px-4 pt-3 pb-24 space-y-3">
      {/* Search Input */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari ikon sejarah: Al-Qur'an, Lonceng, Bojongmeron, Bumi Ageung..."
        className="w-full bg-white border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-islam-600"
      />

      {/* Zone filter pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {ZONE_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setZone(o.value)}
            className={`px-3.5 min-h-9 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              zone === o.value
                ? 'bg-earth-800 text-white'
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Pilar filter pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {PILAR_OPTIONS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPilar(p.value)}
            className={`px-3 min-h-8 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              pilar === p.value
                ? 'bg-islam-600 text-white'
                : 'bg-white text-earth-600 border border-earth-200 hover:bg-earth-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-earth-500">
        Menampilkan {filtered.length} dari {data.heritage_icons.length} ikon sejarah & cagar budaya
      </p>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-earth-200 p-6 text-center space-y-2">
          <p className="text-sm font-medium text-earth-700">Tidak ada ikon sejarah yang cocok.</p>
          <button
            onClick={() => {
              setZone('ALL');
              setPilar('ALL');
              setSearch('');
            }}
            className="px-4 py-2 rounded-lg bg-earth-800 text-white text-xs font-semibold"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-2.5">
        {filtered.map((icon) => {
          const isOpen = expandedId === icon.id;
          const isSpeaking = speakingId === icon.id;
          const zb = ZONE_BADGE[icon.zone];

          return (
            <div
              key={icon.id}
              className="bg-white rounded-xl border border-earth-200 overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => handleCardToggle(icon.id)}
                className="w-full text-left p-3.5 flex items-start justify-between gap-2"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PILAR_BADGE[icon.pilar_tag] ?? 'bg-earth-100 text-earth-700'}`}>
                      {PILAR_DISPLAY[icon.pilar_tag] ?? icon.pilar_tag}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${zb.cls}`}>
                      {zb.label}
                    </span>
                    <span className="text-[10px] text-earth-400">
                      {icon.year_built}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-earth-900 leading-snug">
                    {icon.name}
                  </h3>

                  {icon.zone === 'EXTERNAL' && (
                    <p className="text-xs text-earth-500">
                      {icon.address ? `${icon.address} · ` : ''}
                      {formatDistance(icon.distance_m)} dari Alun-Alun
                    </p>
                  )}
                </div>

                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-earth-400 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-earth-100 space-y-3">
                  <p className="text-xs text-earth-700 leading-relaxed">
                    {icon.summary}
                  </p>

                  {speechSupported && (
                    <button
                      type="button"
                      onClick={() => toggleAudio(icon)}
                      className={`w-full flex items-center justify-center gap-2 min-h-10 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        isSpeaking
                          ? 'bg-amber-600 text-white'
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
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                            <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
                          </svg>
                          Dengarkan Sejarah
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewOnMap(icon)}
                      className="flex-1 flex items-center justify-center gap-1.5 min-h-10 py-2 px-3 rounded-lg text-xs font-medium bg-islam-600 text-white hover:bg-islam-700 transition-colors"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
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
                        className="flex-1 flex items-center justify-center gap-1.5 min-h-10 py-2 px-3 rounded-lg text-xs font-medium bg-gold-400/30 text-earth-800 border border-gold-500 hover:bg-gold-400/50 transition-colors"
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
    </div>
  );
}
