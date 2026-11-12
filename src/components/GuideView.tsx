import { useState } from 'react';
import data from '../data/cianjur-data.json';
import { useApp } from '../context/AppContext';
import { getVisualUrl } from '../utils/visuals';
import { formatDistance } from '../utils/time';

type GuideSection = 'all' | 'event' | 'rute' | 'toilet' | 'aturan' | 'oleh2' | 'galeri';

const SOUVENIR_IDS = new Set(['CUL-04', 'CUL-05', 'CUL-06', 'CUL-11', 'CUL-12', 'CUL-13']);

export default function GuideView() {
  const { setActiveTab, setMapFocus } = useApp();
  const [section, setSection] = useState<GuideSection>('all');
  const [lightboxItem, setLightboxItem] = useState<{ title: string; sub: string; url: string } | null>(null);

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
              Pusat Informasi & Panduan Pengunjung
            </h2>
            <p className="text-xs text-earth-500">
              Event Alun-Alun & Bomero, Rute Stasiun, Toilet, Tata Tertib K5, Oleh-Oleh & Galeri Foto
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: 'all' as GuideSection, label: 'Semua Info' },
            { id: 'event' as GuideSection, label: 'Event & Bomero' },
            { id: 'rute' as GuideSection, label: 'Panduan Stasiun & Rute' },
            { id: 'toilet' as GuideSection, label: 'Lokasi Toilet (4)' },
            { id: 'aturan' as GuideSection, label: 'Aturan & Tata Tertib' },
            { id: 'oleh2' as GuideSection, label: 'Oleh-Oleh Khas (6)' },
            { id: 'galeri' as GuideSection, label: 'Galeri Foto' },
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

      {/* 1. EVENT YANG SEDANG BERLANGSUNG (ALUN-ALUN & BOMERO CITY WALK) */}
      {(section === 'all' || section === 'event') && (
        <section className="space-y-3 animate-view-enter">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-earth-900">
                Event & Keramaian (Alun-Alun & Bomero City Walk)
              </h3>
              <p className="text-xs text-earth-600">
                Agenda rutin harian, kuliner malam Bomero City Walk, dan pentas budaya akhir pekan
              </p>
            </div>
            <button
              type="button"
              onClick={() => showRouteOnMap('RTE-BOMERO', [-6.821327, 107.141917])}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold active:scale-95 transition-all"
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
                category: ev.id === 'EVT-01' ? 'bomero' : 'event',
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
                    {ev.id === 'EVT-01' && (
                      <button
                        type="button"
                        onClick={() => showRouteOnMap('RTE-BOMERO', ev.coords)}
                        className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold active:scale-95 transition-all"
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

      {/* 2. PANDUAN DARI STASIUN KA CIANJUR & RUTE KE BOMERO */}
      {(section === 'all' || section === 'rute') && (
        <section className="space-y-3 animate-view-enter">
          <div>
            <h3 className="text-base font-bold text-earth-900">
              Panduan Rute dari Stasiun Cianjur & Akses ke Bomero City Walk
            </h3>
            <p className="text-xs text-earth-600">
              Langkah demi langkah jalan kaki beserta garis rute interaktif di peta
            </p>
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
                Lokasi Toilet & Tempat Wudhu di Sekitar Alun-Alun (4 Titik)
              </h3>
              <p className="text-xs text-earth-600">
                Daftar posisi toilet pengunjung & fasilitas wudhu beserta penanda WC di peta
              </p>
            </div>
            <button
              type="button"
              onClick={() => showPointOnMap(data.app_config.center_coords, 'toilet')}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold active:scale-95 transition-all"
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
                    <span className="inline-block text-[10px] font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
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
                        className="bg-sky-50 text-sky-900 border border-sky-200 text-[11px] px-2 py-0.5 rounded-lg"
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
                    className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold active:scale-95 transition-all"
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

      {/* 4. ATURAN & TATA TERTIB + JAM OPERASIONAL */}
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

          {/* Jam Operasional Box */}
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

          {/* 6 Aturan Tata Tertib */}
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

      {/* 5. REKOMENDASI OLEH-OLEH KHAS CIANJUR */}
      {(section === 'all' || section === 'oleh2') && (
        <section className="space-y-3 animate-view-enter">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-earth-900">
                Rekomendasi Oleh-Oleh Khas Cianjur ({souvenirs.length} Destinasi)
              </h3>
              <p className="text-xs text-earth-600">
                Buah tangan legendaris sekitar Alun-Alun: Tauco 1880, Roti Tan Keng Cu 1926, Manisan, & Beras Pandanwangi
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
                        <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
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
                      className="py-2 px-3 rounded-xl bg-islam-600 hover:bg-islam-700 text-white text-xs font-semibold active:scale-95 transition-all"
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

      {/* 6. GALERI FOTO & SPOT INSTAGRAMABLE */}
      {(section === 'all' || section === 'galeri') && (
        <section className="space-y-3 animate-view-enter">
          <div>
            <h3 className="text-base font-bold text-earth-900">
              Galeri Foto & Spot Dokumentasi Alun-Alun Cianjur
            </h3>
            <p className="text-xs text-earth-600">
              Klik pada gambar untuk memperbesar tampilan layar penuh
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
