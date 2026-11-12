import { useState, useRef, useCallback, useEffect } from 'react';
import data from '../data/cianjur-data.json';
import { useApp } from '../context/AppContext';
import { haversine } from '../utils/haversine';

const { missions, trash_bins } = data;
const MAX_XP = missions.reduce((s, m) => s + m.xp_reward, 0);

const MISSION_HINT_COORDS: Record<
  string,
  { label: string; coords: [number, number]; zoom: number }
> = {
  'MSN-01': {
    label: 'Lihat Masjid Agung Cianjur di Peta',
    coords: [-6.82098, 107.13932],
    zoom: 19,
  },
  'MSN-02': {
    label: 'Lihat Lonceng Batavia 1774 di Peta',
    coords: [-6.82172, 107.13962],
    zoom: 19,
  },
  'MSN-03': {
    label: 'Lihat Titik Tong Sampah K5 di Peta',
    coords: [-6.82112, 107.13972],
    zoom: 19,
  },
  'MSN-04': {
    label: 'Lihat Tauco Cap Meong di Peta',
    coords: [-6.818657, 107.142727],
    zoom: 18,
  },
  'MSN-05': {
    label: 'Lihat Bumi Ageung Cikidang di Peta',
    coords: [-6.822441, 107.143152],
    zoom: 18,
  },
};

const CONFETTI_OFFSETS = [
  { tx: '-35px', end: '-65px', color: '#C8A951' },
  { tx: '-20px', end: '-40px', color: '#2E7D32' },
  { tx: '-8px', end: '-15px', color: '#E0CA7A' },
  { tx: '8px', end: '18px', color: '#4CAF50' },
  { tx: '22px', end: '45px', color: '#C8A951' },
  { tx: '36px', end: '70px', color: '#1B5E20' },
];

type Toast = { msg: string; key: number };

export default function QuestView() {
  const { questState, updateQuest, setActiveTab, setMapFocus } = useApp();
  const { visitor_nickname, total_xp, completed_missions, unlocked_badges } = questState;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsFallback, setGpsFallback] = useState(true);
  const [selectedBin, setSelectedBin] = useState(trash_bins[0].cluster_name);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    const key = Date.now();
    setToast({ msg, key });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const completeMission = useCallback(
    (mission: (typeof missions)[0], extraPartial?: Partial<typeof questState>) => {
      setCelebratingId(mission.id);
      setTimeout(() => setCelebratingId((prev) => (prev === mission.id ? null : prev)), 1600);
      updateQuest({
        total_xp: total_xp + mission.xp_reward,
        completed_missions: [...completed_missions, mission.id],
        unlocked_badges: [...unlocked_badges, mission.badge_name],
        ...extraPartial,
      });
      showToast(`Misi "${mission.title}" selesai! +${mission.xp_reward} XP`);
    },
    [total_xp, completed_missions, unlocked_badges, updateQuest, showToast],
  );

  const handleQuizSubmit = (mission: (typeof missions)[0]) => {
    const raw = (answers[mission.id] ?? '').toLowerCase().trim();
    if (!raw) return;
    if (mission.answer_key.some((k) => raw.includes(k))) {
      completeMission(mission);
      setAnswers((p) => ({ ...p, [mission.id]: '' }));
    } else {
      setShakeId(mission.id);
      setTimeout(() => setShakeId((prev) => (prev === mission.id ? null : prev)), 420);
      showToast('Jawaban belum tepat. Coba baca petunjuk sejarahnya di Peta!');
    }
  };

  const handleGpsCheckin = (mission: (typeof missions)[0]) => {
    if (!navigator.geolocation) {
      setGpsFallback(true);
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const threshold = accuracy > 30 ? 50 : 35;
        const nearBin = trash_bins.find(
          (bin) => haversine(latitude, longitude, bin.coords[0], bin.coords[1]) <= threshold,
        );
        if (nearBin) {
          completeMission(mission, {
            trash_checkins_count: questState.trash_checkins_count + 1,
            last_trash_bin_id: nearBin.id,
          });
        } else {
          setGpsFallback(true);
          showToast(
            `Kamu belum berada di dekat tong sampah (radius ${threshold}m). Pilih klaster manual di bawah.`,
          );
        }
      },
      () => {
        setGpsLoading(false);
        setGpsFallback(true);
        showToast('GPS tidak tersedia. Gunakan pilihan klaster tong sampah manual.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleManualCheckin = (mission: (typeof missions)[0]) => {
    const foundBin = trash_bins.find((b) => b.cluster_name === selectedBin) ?? trash_bins[0];
    if (selectedBin) {
      completeMission(mission, {
        trash_checkins_count: questState.trash_checkins_count + 1,
        last_trash_bin_id: foundBin.id,
      });
    }
  };

  const renderCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#5D4037');
    grad.addColorStop(1, '#3E2723');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = '#C8A951';
    ctx.fillRect(60, 120, 960, 4);
    ctx.fillRect(60, 1796, 960, 4);
    ctx.fillRect(60, 120, 4, 1680);
    ctx.fillRect(1016, 120, 4, 1680);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('SERTIFIKAT BUDAYA', 540, 290);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#E0CA7A';
    ctx.fillText('Alun-Alun & Taman Alun-Alun Cianjur', 540, 365);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = 'italic 28px sans-serif';
    ctx.fillText('"Ngaos · Mamaos · Maenpo · Sugih Mukti"', 540, 425);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px sans-serif';
    ctx.fillText('Diberikan kepada:', 540, 535);

    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(visitor_nickname || 'Pengunjung Santun', 540, 620);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#E0CA7A';
    ctx.fillText(`Total Skor: ${total_xp} / ${MAX_XP} XP`, 540, 735);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px sans-serif';
    ctx.fillText('Lencana Kehormatan yang Diraih:', 540, 850);

    ctx.font = '28px sans-serif';
    unlocked_badges.forEach((badge, i) => {
      ctx.fillText(`★ ${badge}`, 540, 915 + i * 54);
    });

    const taglineY = Math.max(1340, 915 + unlocked_badges.length * 54 + 110);
    ctx.font = 'italic 34px sans-serif';
    ctx.fillStyle = '#E0CA7A';
    ctx.fillText('Hatur nuhun, Sobat Cianjur!', 540, taglineY);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#D7CCC8';
    ctx.fillText('Portal Pintar & Ksatria Kebersihan K5 Cianjur', 540, taglineY + 55);
  }, [visitor_nickname, total_xp, unlocked_badges]);

  useEffect(() => {
    if (total_xp >= 350) {
      renderCertificate();
    }
  }, [total_xp, renderCertificate]);

  const downloadCertificate = () => {
    renderCertificate();
    updateQuest({ certificate_claimed: true });
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sertifikat-${visitor_nickname || 'cianjur'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const pct = Math.min(100, Math.round((total_xp / MAX_XP) * 100));
  const isDone = (id: string) => completed_missions.includes(id);

  return (
    <div className="pb-28 md:pb-32 space-y-4 px-3.5 sm:px-6 pt-3.5">
      {/* Progress & XP Hero Section */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-earth-200 shadow-xs space-y-3.5 animate-card-cascade">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-earth-900">
              Misi Jelajah & Ksatria K5
            </h2>
            <p className="text-xs text-earth-500 mt-0.5">
              Raih minimal 350 XP untuk membuka Sertifikat Budaya Digital
            </p>
          </div>
          <span className="shrink-0 text-xs sm:text-sm font-bold text-islam-700 bg-islam-50 px-3 py-1 rounded-xl border border-islam-200 whitespace-nowrap">
            {total_xp} / {MAX_XP} XP
          </span>
        </div>

        <input
          type="text"
          value={visitor_nickname}
          onChange={(e) => updateQuest({ visitor_nickname: e.target.value })}
          placeholder="Ketik nama panggilan untuk Sertifikat Budaya..."
          className="w-full min-w-0 bg-earth-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-islam-600 transition-shadow"
        />

        <div className="space-y-1.5">
          <div className="relative w-full bg-earth-100 rounded-full h-3.5 overflow-hidden">
            {/* 350 XP Threshold Marker (50%) */}
            <div
              className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-earth-400/60 z-10"
              title="Batas Sertifikat Budaya (350 XP)"
            />
            <div
              className="animate-xp-shimmer h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-earth-500 flex-wrap">
            <span>
              {completed_missions.length}/{missions.length} misi selesai
            </span>
            <span className={total_xp >= 350 ? 'font-bold text-islam-700' : ''}>
              {total_xp >= 350
                ? 'Sertifikat Budaya Terbuka!'
                : `Kurang ${350 - total_xp} XP untuk sertifikat`}
            </span>
          </div>
        </div>

        {unlocked_badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {unlocked_badges.map((b) => (
              <span
                key={b}
                className="text-xs font-medium bg-islam-50 text-islam-700 px-2.5 py-1 rounded-full border border-islam-300 animate-card-cascade"
              >
                ★ {b}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Responsive Mission Cards Grid (1 col on mobile, 2 cols on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-start">
        {missions.map((m, idx) => {
          const done = isDone(m.id);
          const hint = MISSION_HINT_COORDS[m.id];
          const isCelebrating = celebratingId === m.id;
          const isShaking = shakeId === m.id;

          return (
            <article
              key={m.id}
              style={{ animationDelay: `${(idx + 1) * 55}ms` }}
              className={`animate-card-cascade relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-md ${
                done
                  ? 'border-islam-300 bg-islam-50/25'
                  : 'border-earth-200 hover:border-earth-300'
              }`}
            >
              {/* Floating +XP & Confetti Celebration on Completion */}
              {isCelebrating && (
                <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center z-20">
                  <span className="animate-xp-float bg-gold-500 text-earth-900 font-extrabold text-xs px-3 py-1 rounded-full shadow-md border border-white">
                    +{m.xp_reward} XP!
                  </span>
                  {CONFETTI_OFFSETS.map((c, i) => (
                    <span
                      key={i}
                      className="confetti-particle absolute top-3 w-2 h-2 rounded-full"
                      style={
                        {
                          background: c.color,
                          '--tx': c.tx,
                          '--tx-end': c.end,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              )}

              <div className="p-4 sm:p-5 space-y-3">
                {/* Header: Title + XP Pill */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {done && (
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-islam-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        ✓
                      </span>
                    )}
                    <h3 className="font-semibold text-earth-900 text-sm sm:text-base leading-snug break-words">
                      {m.title}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-bold whitespace-nowrap px-2.5 py-0.5 rounded-full ${
                      done ? 'bg-islam-100 text-islam-700' : 'bg-gold-300/35 text-earth-900'
                    }`}
                  >
                    {done ? `Selesai (+${m.xp_reward} XP)` : `+${m.xp_reward} XP`}
                  </span>
                </div>

                {/* Metadata Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="shrink-0 text-[11px] font-semibold bg-islam-100 text-islam-700 px-2.5 py-0.5 rounded-full">
                    {m.pilar}
                  </span>
                  <span className="text-[11px] text-earth-500 break-words">
                    Lencana: {m.badge_name}
                  </span>
                </div>

                {/* Question / Instruction */}
                <p className="text-xs sm:text-sm text-earth-700 leading-relaxed">{m.question}</p>

                {/* Map Shortcut Link */}
                {!done && hint && (
                  <button
                    type="button"
                    onClick={() => {
                      setMapFocus({ coords: hint.coords, zoom: hint.zoom });
                      setActiveTab('peta');
                    }}
                    className="text-xs font-semibold text-islam-700 hover:text-islam-800 hover:underline inline-flex items-center gap-1 py-0.5 text-left"
                  >
                    <span>→ {hint.label}</span>
                  </button>
                )}

                {/* QUIZ Input Row (Zero Overflow on 320px+) */}
                {!done && m.verification_type === 'QUIZ' && (
                  <div className={`flex gap-2 ${isShaking ? 'animate-shake' : ''}`}>
                    <input
                      type="text"
                      value={answers[m.id] ?? ''}
                      onChange={(e) => setAnswers((p) => ({ ...p, [m.id]: e.target.value }))}
                      placeholder="Ketik jawaban..."
                      className={`min-w-0 flex-1 bg-earth-50 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        isShaking
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                          : 'border-earth-200 focus:ring-earth-400'
                      }`}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuizSubmit(m)}
                    />
                    <button
                      onClick={() => handleQuizSubmit(m)}
                      className="shrink-0 min-h-10 bg-earth-800 hover:bg-earth-900 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Jawab
                    </button>
                  </div>
                )}

                {/* GPS TRASH CHECKIN Row (Zero Clipping on All Screens) */}
                {!done && m.verification_type === 'GPS_TRASH_CHECKIN' && (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleGpsCheckin(m)}
                      disabled={gpsLoading}
                      className="w-full min-h-10 bg-islam-600 hover:bg-islam-700 active:scale-[0.99] text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all disabled:opacity-50"
                    >
                      {gpsLoading
                        ? 'Mencari lokasi GPS...'
                        : 'Verifikasi Lokasi GPS di Dekat Tong Sampah'}
                    </button>

                    {gpsFallback && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                        <select
                          value={selectedBin}
                          onChange={(e) => setSelectedBin(e.target.value)}
                          aria-label="Pilih klaster tong sampah"
                          className="w-full sm:flex-1 min-w-0 truncate bg-earth-50 border border-earth-200 rounded-xl px-3 py-2.5 text-xs text-earth-900 focus:outline-none focus:ring-2 focus:ring-earth-400"
                        >
                          {trash_bins.map((bin) => (
                            <option key={bin.id} value={bin.cluster_name}>
                              {bin.cluster_name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleManualCheckin(m)}
                          className="w-full sm:w-auto shrink-0 min-h-10 bg-earth-800 hover:bg-earth-900 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                        >
                          Konfirmasi
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Unlocked Cultural Certificate Preview & Download */}
      {total_xp >= 350 && (
        <section className="animate-card-cascade bg-earth-900 rounded-2xl p-5 sm:p-6 space-y-4 border border-gold-500/40 shadow-lg">
          <div className="text-center space-y-1">
            <h3 className="text-gold-400 font-bold text-base sm:text-lg">
              Sertifikat Budaya Digital
            </h3>
            <p className="text-earth-200 text-xs sm:text-sm">
              Selamat! Kamu telah mengumpulkan {total_xp} XP. Unduh sertifikat ukuran IG Story
              (1080×1920):
            </p>
          </div>

          <div className="mx-auto w-56 sm:w-64 rounded-xl overflow-hidden border border-gold-500/50 shadow-xl bg-earth-800 transition-transform duration-300 hover:scale-[1.02]">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          <div className="max-w-sm mx-auto">
            <button
              onClick={downloadCertificate}
              className="w-full min-h-11 bg-gold-500 hover:bg-gold-400 active:scale-[0.98] text-earth-900 font-bold text-sm py-3 rounded-xl shadow-sm transition-all"
            >
              Unduh Sertifikat (.PNG)
            </button>
          </div>
        </section>
      )}

      {toast && (
        <div
          key={toast.key}
          className="fixed bottom-20 md:bottom-24 left-4 right-4 max-w-md mx-auto bg-earth-900 text-white text-xs font-medium px-4 py-3 rounded-xl text-center z-50 shadow-xl border border-gold-500/30 animate-view-enter"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
