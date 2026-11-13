import { useState, useEffect } from 'react';
import data from '../data/cianjur-data.json';
import { useApp } from '../context/AppContext';
import { getVisualUrl } from '../utils/visuals';
import { formatDistance } from '../utils/time';

type GuideSection = 'all' | 'sadaya' | 'hadir' | 'event' | 'rute' | 'toilet' | 'aturan' | 'oleh2' | 'galeri';

interface AttendanceEntry {
  id: string;
  name: string;
  origin: string;
  purpose: string;
  groupSize: string;
  note: string;
  timestamp: string;
}

const ATTENDANCE_STORAGE_KEY = 'cianjur_attendance_v1';

const DEFAULT_ATTENDANCE: AttendanceEntry[] = [
  {
    id: 'ATT-01',
    name: 'Kang Deden & Keluarga',
    origin: 'Cianjur Kota',
    purpose: 'Event Pameran Malam Minggu & Kuliner Bomero',
    groupSize: 'Keluarga (3–5 org)',
    note: 'Suasana malam minggu di bunderan dan Bomero ramai dan tertib.',
    timestamp: 'Malam Minggu',
  },
  {
    id: 'ATT-02',
    name: 'Teh Rina',
    origin: 'Sukabumi (via KA Siliwangi)',
    purpose: "Wisata Sejarah (Tugu Al-Qur'an & 99 Tiang)",
    groupSize: 'Berdua',
    note: 'Jalan kaki dari Stasiun Cianjur cuma 6 menit sampai Alun-Alun.',
    timestamp: 'Hari Ini',
  },
];

const PURPOSE_OPTIONS = [
  'Event Pameran Malam Minggu & Kuliner Bomero',
  'Rekreasi & Jalan-Jalan Keluarga',
  "Wisata Sejarah (Tugu Al-Qur'an, 99 Tiang, Cagar Budaya)",
  'Ibadah & Ziarah Masjid Agung Cianjur',
  'Berburu Oleh-Oleh Khas Cianjur (Tauco, Roti, Manisan)',
  'Olahraga / Tugas Studi / Survei Lapangan',
];

const GROUP_OPTIONS = ['Sendiri (1 org)', 'Berdua (2 org)', 'Keluarga (3–5 org)', 'Rombongan (>5 org)'];

const SOUVENIR_IDS = new Set(['CUL-04', 'CUL-05', 'CUL-06', 'CUL-11', 'CUL-12', 'CUL-13']);

export default function GuideView() {
  const { setActiveTab, setMapFocus, questState, updateQuest } = useApp();
  const [section, setSection] = useState<GuideSection>('all');
  const [lightboxItem, setLightboxItem] = useState<{ title: string; sub: string; url: string } | null>(null);

  // Optional Visitor Attendance State
  const [entries, setEntries] = useState<AttendanceEntry[]>(() => {
    try {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_ATTENDANCE;
  });

  const [visitorName, setVisitorName] = useState(questState.visitor_nickname || '');
  const [visitorOrigin, setVisitorOrigin] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState(PURPOSE_OPTIONS[0]);
  const [visitorGroup, setVisitorGroup] = useState(GROUP_OPTIONS[2]);
  const [visitorNote, setVisitorNote] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore storage errors
    }
  }, [entries]);

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = visitorName.trim() || 'Pengunjung Alun-Alun';
    const cleanOrigin = visitorOrigin.trim() || 'Cianjur & Sekitarnya';
    const newEntry: AttendanceEntry = {
      id: `ATT-${Date.now()}`,
      name: cleanName,
      origin: cleanOrigin,
      purpose: visitorPurpose,
      groupSize: visitorGroup,
      note: visitorNote.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
    setEntries((prev) => [newEntry, ...prev.slice(0, 19)]);
    if (visitorName.trim() && !questState.visitor_nickname) {
      updateQuest({ visitor_nickname: visitorName.trim() });
    }
    setVisitorNote('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 4000);
  };

  const souvenirs = data.culinary_spots.filter((s) => SOUVENIR_IDS.has(s.id));

  const showRouteOnMap = (routeId: string, coords: number[]) => {
    setMapFocus({
      coords: [coords[0], coords[1]],
      zoom: 17,
      routeId,
    });
    setActiveTab('peta');
  };

  const showPointOnMap = (coords: number[], layer?: 'toilet' | 'culinary' | 'heritage') => {
    setMapFocus({
      coords: [coords[0], coords[1]],
      zoom: 18,
      layer,
    });
    setActiveTab('peta');
  };

  return (
    <div className="px-3.5 sm:px-6 pt-3.5 pb-28 md:pb-32 space-y-5">
      {/* Section Filter Chips */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-earth-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-earth-900">
              Pusat Informasi SADAYA, Kehadiran & Panduan Pengunjung
            </h2>
            <p className="text-xs text-earth-500">
              Profil SADAYA, Kehadiran Opsional, Event Malam Minggu, Rute Stasiun, Toilet, Oleh-Oleh & Galeri
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: 'all' as GuideSection, label: 'Semua Info' },
            { id: 'sadaya' as GuideSection, label: 'Tentang SADAYA' },
            { id: 'hadir' as GuideSection, label: 'Kehadiran (Opsional)' },
            { id: 'event' as GuideSection, label: 'Event Malam Minggu' },
            { id: 'rute' as GuideSection, label: 'Panduan Stasiun & Rute' },
            { id: 'toilet' as GuideSection, label: `Lokasi Toilet (${data.toilets.length})` },
            { id: 'oleh2' as GuideSection, label: 'Oleh-Oleh Khas (6)' },
            { id: 'galeri' as GuideSection, label: 'Galeri Foto' },
            { id: 'aturan' as GuideSection, label: 'Tata Tertib' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={`shrink-0 min-h-8 px-3.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                section === tab.id
                  ? 'bg-earth-800 text-white shadow-xs'
                  : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PROFIL SADAYA — SOCIAL PROJECT MOJANG JAJAKA KABUPATEN CIANJUR */}
      {(section === 'all' || section === 'sadaya') && (
        <section className="animate-view-enter">
          <div className="bg-earth-900 text-white rounded-2xl border border-earth-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center gap-4">
            <img
              src="/sadaya-logo.jpg"
              alt="Logo SADAYA — Sarana Digital Wisata, Budaya, dan Lingkungan Asri"
              onClick={() =>
                setLightboxItem({
                  title: 'SADAYA — Sarana Digital Wisata, Budaya, dan Lingkungan Asri',
                  sub: 'Social Project Mojang Jajaka Kabupaten Cianjur (Kelompok 6 Swaranusa)',
                  url: '/sadaya-logo.jpg',
                })
              }
              className="w-40 sm:w-48 h-auto rounded-xl bg-white p-1.5 border-2 border-gold-500 shrink-0 cursor-pointer hover:scale-[1.02] transition-transform"
            />
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-gold-500 text-earth-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Social Project · Mojang Jajaka Kabupaten Cianjur
                </span>
                <span className="bg-earth-800 text-gold-300 border border-gold-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  Kelompok 6 · Swaranusa
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gold-400 leading-snug">
                SADAYA (Sarana Digital Wisata, Budaya, dan Lingkungan Asri)
              </h3>
              <p className="text-xs sm:text-sm text-earth-200 leading-relaxed">
                <strong>SADAYA</strong> merupakan salah satu <strong>Social Project dari Mojang Jajaka Kabupaten Cianjur</strong> yang mengintegrasikan informasi wisata kawasan Alun-Alun Cianjur, edukasi sejarah 3 Pilar Budaya (<em>Ngaos, Mamaos, Maenpo</em>), promosi UMKM kuliner & oleh-oleh khas Cianjur, serta gerakan menjaga kebersihan dan ketertiban lingkungan asri (Budaya K5).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 0. KEHADIRAN / BUKU TAMU PENGUNJUNG (OPSIONAL) */}
      {(section === 'all' || section === 'hadir') && (
        <section className="space-y-3 animate-view-enter">
          <div className="bg-white rounded-2xl border border-earth-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-earth-900">
                    Daftar Kehadiran Pengunjung Alun-Alun
                  </h3>
                  <span className="bg-islam-50 text-islam-700 border border-islam-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Bersifat Opsional
                  </span>
                </div>
                <p className="text-xs text-earth-600 mt-0.5">
                  Isi kehadiran singkat untuk mencatat tujuan kunjungan Anda ke Alun-Alun Cianjur (boleh dilewati jika sedang terburu-buru)
                </p>
              </div>
              <span className="text-xs font-semibold text-earth-500">
                {entries.length} kunjungan tercatat
              </span>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-earth-800 mb-1">
                  Nama Pengunjung / Perwakilan (Opsional)
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Contoh: Kang Fauzan / Teh Siti"
                  className="w-full h-10 px-3 rounded-xl bg-earth-50 border border-earth-200 text-xs sm:text-sm text-earth-900 focus:outline-none focus:border-islam-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-800 mb-1">
                  Asal Daerah / Kota (Opsional)
                </label>
                <input
                  type="text"
                  value={visitorOrigin}
                  onChange={(e) => setVisitorOrigin(e.target.value)}
                  placeholder="Contoh: Cianjur / Bandung / Jakarta"
                  className="w-full h-10 px-3 rounded-xl bg-earth-50 border border-earth-200 text-xs sm:text-sm text-earth-900 focus:outline-none focus:border-islam-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-800 mb-1">
                  Ke Alun-Alun Buat Apa? (Tujuan Kunjungan)
                </label>
                <select
                  value={visitorPurpose}
                  onChange={(e) => setVisitorPurpose(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-earth-50 border border-earth-200 text-xs sm:text-sm text-earth-900 focus:outline-none focus:border-islam-600"
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-800 mb-1">
                  Datang Bersama Siapa?
                </label>
                <select
                  value={visitorGroup}
                  onChange={(e) => setVisitorGroup(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-earth-50 border border-earth-200 text-xs sm:text-sm text-earth-900 focus:outline-none focus:border-islam-600"
                >
                  {GROUP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                <input
                  type="text"
                  value={visitorNote}
                  onChange={(e) => setVisitorNote(e.target.value)}
                  placeholder="Kesan / pesan singkat kunjungan Anda (opsional)..."
                  className="flex-1 h-10 px-3 rounded-xl bg-earth-50 border border-earth-200 text-xs sm:text-sm text-earth-900 focus:outline-none focus:border-islam-600"
                />
                <button
                  type="submit"
                  className="shrink-0 h-10 px-5 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs sm:text-sm font-semibold active:scale-95 transition-all"
                >
                  Catat Kehadiran
                </button>
              </div>
            </form>

            {submittedNotice && (
              <div className="bg-islam-50 border border-islam-200 text-islam-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold">
                Terima kasih! Kehadiran & tujuan kunjungan Anda telah tercatat di buku tamu SADAYA Alun-Alun Cianjur.
              </div>
            )}

            {/* Recent Attendance List */}
            <div className="pt-2 border-t border-earth-100 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-earth-500">
                Kunjungan Terbaru Pengunjung
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {entries.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="bg-earth-50/80 border border-earth-200/80 rounded-xl p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-earth-900">{item.name}</span>
                      <span className="text-[10px] text-earth-500">
                        {item.origin} · {item.timestamp}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-islam-700">
                      Tujuan: {item.purpose} ({item.groupSize})
                    </div>
                    {item.note && (
                      <p className="text-xs text-earth-600 italic">"{item.note}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 1. EVENT YANG SEDANG BERLANGSUNG (MALAM MINGGU DI BUNDERAN ALUN-ALUN & BOMERO) */}
      {(section === 'all' || section === 'event') && (
        <section className="space-y-3 animate-view-enter">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-earth-900">
                Event Sedang Berlangsung: Pameran Malam Minggu Bunderan & Bomero
              </h3>
              <p className="text-xs text-earth-600">
                Setiap Malam Minggu diadakan event pameran UMKM & keramaian di daerah Bunderan Alun-Alun hingga Bomero City Walk
              </p>
            </div>
            <button
              type="button"
              onClick={() => showRouteOnMap('RTE-BOMERO', [-6.821327, 107.141917])}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Tampilkan Rute ke Bomero di Peta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.events.map((ev) => {
              const visualUrl = getVisualUrl({
                id: ev.id,
                title: ev.title,
                subtitle: ev.badge,
                category: ev.id === 'EVT-01' || ev.id === 'EVT-02' ? 'bomero' : 'event',
                photoUrl: ev.photo_url,
              });
              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="relative h-36 bg-earth-900 overflow-hidden group cursor-pointer"
                      onClick={() =>
                        setLightboxItem({
                          title: ev.title,
                          sub: `${ev.location} · ${ev.schedule}`,
                          url: visualUrl,
                        })
                      }
                    >
                      <img
                        src={visualUrl}
                        alt={ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 right-2.5 bg-gold-500 text-earth-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {ev.badge}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="inline-block text-[10px] font-semibold bg-earth-100 text-earth-700 px-2.5 py-0.5 rounded-full">
                        {ev.category}
                      </span>
                      <h4 className="font-bold text-earth-900 text-sm sm:text-base leading-snug">
                        {ev.title}
                      </h4>
                      <p className="text-xs font-medium text-islam-700">{ev.schedule}</p>
                      <p className="text-xs text-earth-500">Lokasi: {ev.location}</p>
                      <p className="text-xs text-earth-700 leading-relaxed">{ev.summary}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => showPointOnMap(ev.coords)}
                      className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs font-semibold active:scale-95 transition-all"
                    >
                      Lihat Titik di Peta
                    </button>
                    {(ev.id === 'EVT-01' || ev.id === 'EVT-02') && (
                      <button
                        type="button"
                        onClick={() => showRouteOnMap('RTE-BOMERO', ev.coords)}
                        className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs font-semibold active:scale-95 transition-all"
                      >
                        Rute Jalan Kaki (210m)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. PANDUAN DARI STASIUN KA CIANJUR (BERAPA LAMA?) & RUTE KE BOMERO */}
      {(section === 'all' || section === 'rute') && (
        <section className="space-y-3 animate-view-enter">
          <div>
            <h3 className="text-base font-bold text-earth-900">
              Panduan dari Stasiun Cianjur ke Alun-Alun (Berapa Lama?) & Rute Bomero
            </h3>
            <p className="text-xs text-earth-600">
              Estimasi waktu tempuh dari daerah Stasiun Kereta Api Cianjur beserta langkah rute jalan kaki
            </p>
          </div>

          {/* Ringkasan Cepat: Berapa Lama dari Stasiun ke Alun-Alun? — Consistent earth/gold theme */}
          <div className="bg-earth-900 text-white rounded-2xl p-4 space-y-2.5 border border-earth-800">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                Berapa Lama dari Stasiun Cianjur ke Alun-Alun? (Jarak ±485 Meter)
              </h4>
              <span className="text-[11px] bg-earth-800 border border-earth-700 px-2.5 py-0.5 rounded-full text-earth-200">
                Stasiun Cianjur · Jl. Yulius Usman
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-earth-800/90 border border-earth-700 rounded-xl p-3">
                <div className="text-xs text-earth-200">Jalan Kaki Santai</div>
                <div className="text-base font-bold text-gold-400">±6 – 7 Menit</div>
                <div className="text-[11px] text-earth-300 mt-0.5">
                  485 meter via trotoar Jl. Yulius Usman → Jl. Mangunsarkoro (Bomero)
                </div>
              </div>
              <div className="bg-earth-800/90 border border-earth-700 rounded-xl p-3">
                <div className="text-xs text-earth-200">Naik Becak / Ojek</div>
                <div className="text-base font-bold text-gold-400">±2 Menit</div>
                <div className="text-[11px] text-earth-300 mt-0.5">
                  Tersedia tepat di pintu keluar Stasiun Cianjur (Rp10.000 – Rp15.000)
                </div>
              </div>
              <div className="bg-earth-800/90 border border-earth-700 rounded-xl p-3">
                <div className="text-xs text-earth-200">Dari Alun-Alun ke Bomero</div>
                <div className="text-base font-bold text-gold-400">±3 Menit</div>
                <div className="text-[11px] text-earth-300 mt-0.5">
                  210 meter jalan kaki langsung lewat sayap timur taman
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {data.routes.map((rt) => (
              <div
                key={rt.id}
                className="bg-white rounded-2xl border border-earth-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className="inline-block text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full mb-1"
                        style={{ background: rt.color }}
                      >
                        Jarak {rt.distance_m} meter · {rt.duration_walk}
                      </span>
                      <h4 className="font-bold text-earth-900 text-base leading-snug">{rt.title}</h4>
                      <p className="text-xs text-earth-500 mt-0.5">{rt.subtitle}</p>
                    </div>
                  </div>

                  <div className="bg-earth-50 border border-earth-200 rounded-xl p-3 text-xs text-earth-700 leading-relaxed">
                    <span className="font-semibold text-earth-900">Info Transportasi: </span>
                    {rt.transport_info}
                  </div>

                  <div className="space-y-2.5">
                    {rt.steps.map((s) => (
                      <div key={s.step} className="flex items-start gap-2.5">
                        <span
                          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: rt.color }}
                        >
                          {s.step}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-earth-900">{s.title}</div>
                          <p className="text-xs text-earth-600 leading-relaxed mt-0.5">{s.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => showRouteOnMap(rt.id, rt.waypoints[0])}
                    className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-white text-xs font-semibold active:scale-95 transition-all"
                    style={{ background: rt.color }}
                  >
                    Tampilkan Garis Rute di Peta
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${rt.waypoints[0][0]},${rt.waypoints[0][1]}&destination=${rt.waypoints[rt.waypoints.length - 1][0]},${rt.waypoints[rt.waypoints.length - 1][1]}&travelmode=walking`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs font-semibold text-center active:scale-95 transition-all"
                  >
                    Google Maps
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. DAERAH TOILET & TEMPAT WUDHU SEBELAH MANA SAJA */}
      {(section === 'all' || section === 'toilet') && (
        <section className="space-y-3 animate-view-enter">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-earth-900">
                Lokasi WC / Toilet di Kawasan Alun-Alun ({data.toilets.length} Titik)
              </h3>
              <p className="text-xs text-earth-600">
                Daftar posisi toilet pengunjung & fasilitas wudhu beserta penanda WC di peta
              </p>
            </div>
            <button
              type="button"
              onClick={() => showPointOnMap(data.app_config.center_coords, 'toilet')}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Tampilkan Semua Pin Toilet di Peta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.toilets.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-earth-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block text-[10px] font-bold bg-islam-50 text-islam-700 border border-islam-200 px-2.5 py-0.5 rounded-full">
                      Pin Peta: WC · {t.id}
                    </span>
                    <span className="text-[11px] font-medium text-earth-500">{t.open_hours}</span>
                  </div>
                  <h4 className="font-bold text-earth-900 text-sm sm:text-base leading-snug">
                    {t.name}
                  </h4>
                  <p className="text-xs text-earth-700 leading-relaxed">
                    <span className="font-semibold text-earth-900">Patokan Lokasi: </span>
                    {t.location_hint}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {t.facilities.map((fac) => (
                      <span
                        key={fac}
                        className="bg-earth-50 text-earth-800 border border-earth-200 text-[11px] px-2 py-0.5 rounded-lg"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => showPointOnMap(t.coords, 'toilet')}
                    className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs font-semibold active:scale-95 transition-all"
                  >
                    Lihat Posisi Toilet di Peta
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${t.coords[0]},${t.coords[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs font-semibold active:scale-95 transition-all"
                  >
                    Rute Maps
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. REKOMENDASI OLEH-OLEH KHAS CIANJUR */}
      {(section === 'all' || section === 'oleh2') && (
        <section className="space-y-3 animate-view-enter">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-earth-900">
                Rekomendasi Oleh-Oleh Terdekat & Khas Cianjur ({souvenirs.length} Destinasi)
              </h3>
              <p className="text-xs text-earth-600">
                Buah tangan khas Cianjur terdekat dari Alun-Alun: Tauco 1880, Roti Tan Keng Cu 1926, Manisan, & Beras Pandanwangi
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('kuliner')}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Buka Katalog Kuliner & Oleh-Oleh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {souvenirs.map((item) => {
              const visualUrl = getVisualUrl({
                id: item.id,
                title: item.name,
                subtitle: 'Oleh-Oleh Khas Cianjur',
                category: 'souvenir',
              });
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="relative h-32 bg-earth-900 overflow-hidden group cursor-pointer"
                      onClick={() =>
                        setLightboxItem({
                          title: item.name,
                          sub: `${item.address} · ${item.price_range}`,
                          url: visualUrl,
                        })
                      }
                    >
                      <img
                        src={visualUrl}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-earth-500">
                        <span className="font-semibold text-earth-900 bg-gold-300/35 border border-gold-500/40 px-2 py-0.5 rounded-full">
                          {formatDistance(item.distance_m)} dari Alun-Alun
                        </span>
                        <span>{item.open_time}–{item.close_time}</span>
                      </div>
                      <h4 className="font-bold text-earth-900 text-sm leading-snug">{item.name}</h4>
                      <p className="text-xs font-semibold text-islam-700">{item.price_range}</p>
                      <p className="text-xs text-earth-600 line-clamp-2">{item.history_note}</p>
                    </div>
                  </div>
                  <div className="px-3.5 pb-3.5 pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => showPointOnMap(item.coords, 'culinary')}
                      className="flex-1 py-2 px-3 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs font-semibold active:scale-95 transition-all"
                    >
                      Lihat di Peta
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${item.coords[0]},${item.coords[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-islam-700 hover:bg-islam-600 text-white text-xs font-semibold active:scale-95 transition-all"
                    >
                      Maps
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. GALERI FOTO & SPOT IKON ALUN-ALUN */}
      {(section === 'all' || section === 'galeri') && (
        <section className="space-y-3 animate-view-enter">
          <div>
            <h3 className="text-base font-bold text-earth-900">
              Galeri Foto & Spot Dokumentasi Daerah Alun-Alun Cianjur
            </h3>
            <p className="text-xs text-earth-600">
              Tugu Al-Qur'an, 99 Tiang Asmaul Husna, Koloseum Maenpo, dan Bomero (klik gambar untuk memperbesar)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {data.photo_gallery.map((g) => {
              const visualUrl = getVisualUrl({
                id: g.id,
                title: g.title,
                subtitle: g.category,
                category: g.title,
                photoUrl: g.photo_url,
              });
              return (
                <div
                  key={g.id}
                  onClick={() =>
                    setLightboxItem({
                      title: g.title,
                      sub: `${g.category} — ${g.caption}`,
                      url: visualUrl,
                    })
                  }
                  className="bg-white rounded-2xl border border-earth-200 overflow-hidden shadow-xs cursor-pointer group hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="relative h-40 bg-earth-900 overflow-hidden">
                    <img
                      src={visualUrl}
                      alt={g.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/65 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      Perbesar
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <span className="inline-block text-[10px] font-semibold text-islam-700 bg-islam-50 px-2 py-0.5 rounded-full">
                      {g.category}
                    </span>
                    <h4 className="font-bold text-earth-900 text-sm leading-snug">{g.title}</h4>
                    <p className="text-xs text-earth-600 leading-relaxed">{g.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. ATURAN & TATA TERTIB + JAM OPERASIONAL (OPSIONAL) */}
      {(section === 'all' || section === 'aturan') && (
        <section className="space-y-3 animate-view-enter">
          <div>
            <h3 className="text-base font-bold text-earth-900">
              Aturan Tata Tertib & Jam Operasional Alun-Alun Cianjur
            </h3>
            <p className="text-xs text-earth-600">
              Pedoman resmi Budaya K5 (Kebersihan, Keindahan, Ketertiban, Keamanan, Kekeluargaan)
            </p>
          </div>

          <div className="bg-earth-900 text-white rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Jam Operasional Kawasan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {data.park_rules.opening_hours.map((oh) => (
                <div
                  key={oh.days}
                  className="bg-earth-800/90 border border-earth-700 rounded-xl p-3 space-y-1"
                >
                  <div className="text-xs font-semibold text-earth-200">{oh.days}</div>
                  <div className="text-sm font-bold text-gold-400">{oh.hours}</div>
                  <div className="text-[11px] text-earth-300 leading-snug">{oh.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.park_rules.rules.map((rule, idx) => (
              <div
                key={rule.id}
                className="bg-white rounded-2xl border border-earth-200 p-4 shadow-xs space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-islam-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-earth-900 text-xs sm:text-sm leading-snug">
                    {rule.title}
                  </h4>
                </div>
                <p className="text-xs text-earth-600 leading-relaxed pl-8">{rule.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-view-enter"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-earth-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightboxItem.url} alt={lightboxItem.title} className="w-full h-auto" />
            <div className="p-4 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-earth-900 text-sm sm:text-base">{lightboxItem.title}</h4>
                <p className="text-xs text-earth-600 mt-0.5">{lightboxItem.sub}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="px-3 py-1.5 rounded-xl bg-earth-800 text-white text-xs font-semibold"
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
