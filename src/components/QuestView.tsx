import { useState, useRef, useCallback, useEffect } from 'react';
import data from '../data/cianjur-data.json';
import { useApp } from '../context/AppContext';
import { haversine } from '../utils/haversine';

const { missions, trash_bins } = data;
const MAX_XP = missions.reduce((s, m) => s + m.xp_reward, 0);

const MISSION_HINT_COORDS: Record<string, { label: string; coords: [number, number]; zoom: number }> = {
  'MSN-01': { label: 'Lihat Masjid Agung Cianjur di Peta', coords: [-6.82098, 107.13932], zoom: 19 },
  'MSN-02': { label: 'Lihat Lonceng Batavia 1774 di Peta', coords: [-6.82172, 107.13962], zoom: 19 },
  'MSN-03': { label: 'Lihat Titik Tong Sampah K5 di Peta', coords: [-6.82112, 107.13972], zoom: 19 },
  'MSN-04': { label: 'Lihat Tauco Cap Meong di Peta', coords: [-6.818657, 107.142727], zoom: 18 },
  'MSN-05': { label: 'Lihat Bumi Ageung Cikidang di Peta', coords: [-6.822441, 107.143152], zoom: 18 },
};

type Toast = { msg: string; key: number };

export default function QuestView() {
  const { questState, updateQuest, setActiveTab, setMapFocus } = useApp();
  const { visitor_nickname, total_xp, completed_missions, unlocked_badges } = questState;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsFallback, setGpsFallback] = useState(false);
  const [selectedBin, setSelectedBin] = useState(trash_bins[0].cluster_name);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    const key = Date.now();
    setToast({ msg, key });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const completeMission = useCallback(
    (mission: (typeof missions)[0], extraPartial?: Partial<typeof questState>) => {
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
          showToast(`Kamu belum berada di dekat tong sampah (radius ${threshold}m). Pilih klaster manual di bawah.`);
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
    <div className="pb-24 space-y-4 px-4 pt-3">
      <section className="bg-white rounded-xl p-4 border border-earth-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-earth-900">Misi Jelajah & Ksatria K5</h2>
            <p className="text-xs text-earth-500">
              Raih minimal 350 XP untuk membuka Sertifikat Budaya Digital
            </p>
          </div>
          <span className="text-sm font-bold text-islam-700 bg-islam-50 px-2.5 py-1 rounded-lg border border-islam-200 whitespace-nowrap">
            {total_xp} / {MAX_XP} XP
          </span>
        </div>

        <input
          type="text"
          value={visitor_nickname}
          onChange={(e) => updateQuest({ visitor_nickname: e.target.value })}
          placeholder="Ketik nama panggilan untuk Sertifikat Budaya..."
          className="w-full bg-earth-50 border border-earth-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-islam-600"
        />

        <div className="w-full bg-earth-100 rounded-full h-3">
          <div
            className="bg-gold-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-earth-500">
          <span>
            {completed_missions.length}/{missions.length} misi selesai
          </span>
          <span>
            {total_xp >= 350
              ? 'Sertifikat Budaya Terbuka!'
              : `Kurang ${350 - total_xp} XP untuk sertifikat`}
          </span>
        </div>

        {unlocked_badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {unlocked_badges.map((b) => (
              <span
                key={b}
                className="text-xs font-medium bg-islam-50 text-islam-700 px-2.5 py-1 rounded-full border border-islam-300"
              >
                ★ {b}
              </span>
            ))}
          </div>
        )}
      </section>

      {missions.map((m) => {
        const done = isDone(m.id);
        const hint = MISSION_HINT_COORDS[m.id];
        return (
          <article
            key={m.id}
            className={`relative bg-white rounded-xl border overflow-hidden transition-colors ${
              done ? 'border-islam-300 bg-islam-50/20' : 'border-earth-200'
            }`}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {done && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-islam-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                  <h3 className="font-semibold text-earth-900 text-sm leading-snug">{m.title}</h3>
                </div>
                <span
                  className={`text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full ${
                    done ? 'bg-islam-100 text-islam-700' : 'bg-gold-300/30 text-earth-900'
                  }`}
                >
                  {done ? `Selesai (+${m.xp_reward} XP)` : `+${m.xp_reward} XP`}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium bg-islam-100 text-islam-700 px-2 py-0.5 rounded-full">
                  {m.pilar}
                </span>
                <span className="text-[11px] text-earth-500">Lencana: {m.badge_name}</span>
              </div>

              <p className="text-xs text-earth-700 leading-relaxed">{m.question}</p>

              {!done && hint && (
                <button
                  type="button"
                  onClick={() => {
                    setMapFocus({ coords: hint.coords, zoom: hint.zoom });
                    setActiveTab('peta');
                  }}
                  className="text-xs font-medium text-islam-700 hover:underline flex items-center gap-1"
                >
                  <span>→ {hint.label}</span>
                </button>
              )}

              {!done && m.verification_type === 'QUIZ' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={answers[m.id] ?? ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, [m.id]: e.target.value }))}
                    placeholder="Ketik jawaban..."
                    className="flex-1 bg-earth-50 border border-earth-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-earth-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleQuizSubmit(m)}
                  />
                  <button
                    onClick={() => handleQuizSubmit(m)}
                    className="min-h-10 bg-earth-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg active:bg-earth-900"
                  >
                    Jawab
                  </button>
                </div>
              )}

              {!done && m.verification_type === 'GPS_TRASH_CHECKIN' && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleGpsCheckin(m)}
                    disabled={gpsLoading}
                    className="w-full min-h-10 bg-islam-600 text-white text-xs font-semibold py-2.5 rounded-lg active:bg-islam-700 disabled:opacity-50"
                  >
                    {gpsLoading ? 'Mencari lokasi GPS...' : 'Verifikasi Lokasi GPS di Dekat Tong Sampah'}
                  </button>

                  {gpsFallback && (
                    <div className="flex gap-2">
                      <select
                        value={selectedBin}
                        onChange={(e) => setSelectedBin(e.target.value)}
                        className="flex-1 bg-earth-50 border border-earth-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-earth-400"
                      >
                        {trash_bins.map((bin) => (
                          <option key={bin.id} value={bin.cluster_name}>
                            {bin.cluster_name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleManualCheckin(m)}
                        className="min-h-10 bg-earth-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg active:bg-earth-900"
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

      {total_xp >= 350 && (
        <section className="bg-earth-900 rounded-2xl p-5 space-y-4 border border-gold-500/40 shadow-lg">
          <div className="text-center space-y-1">
            <h3 className="text-gold-400 font-bold text-base">Sertifikat Budaya Digital</h3>
            <p className="text-earth-200 text-xs">
              Selamat! Kamu telah mengumpulkan {total_xp} XP. Unduh sertifikat ukuran IG Story (1080×1920):
            </p>
          </div>

          <div className="mx-auto w-56 rounded-xl overflow-hidden border border-gold-500/50 shadow-md bg-earth-800">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          <button
            onClick={downloadCertificate}
            className="w-full min-h-11 bg-gold-500 text-earth-900 font-bold text-sm py-3 rounded-xl active:bg-gold-400 shadow-sm"
          >
            Unduh Sertifikat (.PNG)
          </button>
        </section>
      )}

      {toast && (
        <div
          key={toast.key}
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-earth-900 text-white text-xs font-medium px-4 py-3 rounded-xl text-center z-50 shadow-lg"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
