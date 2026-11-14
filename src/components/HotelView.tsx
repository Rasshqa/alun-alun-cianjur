import { useState, useMemo } from 'react';
import data from '../data/cianjur-data.json';
import { formatDistance, formatPrice } from '../utils/time';
import { useApp } from '../context/AppContext';
import { getVisualUrl } from '../utils/visuals';

type SortKey = 'distance' | 'price' | 'rating';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'distance', label: 'Terdekat' },
  { key: 'price', label: 'Termurah' },
  { key: 'rating', label: 'Rating Tertinggi' },
];

const FACILITY_FILTERS = ['Semua', 'Kolam Renang', 'WiFi', 'Parkir', 'Restoran', 'AC'];

export default function HotelView() {
  const { setActiveTab, setMapFocus } = useApp();
  const [sortBy, setSortBy] = useState<SortKey>('distance');
  const [facility, setFacility] = useState('Semua');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<{ title: string; sub: string; url: string } | null>(null);

  const hotels = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = data.hotels.filter((h) => {
      if (
        facility !== 'Semua' &&
        !h.facilities.some((f) => f.toLowerCase().includes(facility.toLowerCase()))
      ) {
        return false;
      }
      if (
        q &&
        !`${h.name} ${h.address} ${h.facilities.join(' ')}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'distance') return a.distance_m - b.distance_m;
      if (sortBy === 'price') return a.price_start_idr - b.price_start_idr;
      return b.rating - a.rating;
    });
  }, [sortBy, facility, search]);

  const handleShowOnMap = (coords: number[]) => {
    setMapFocus({ coords: [coords[0], coords[1]], zoom: 17 });
    setActiveTab('peta');
  };

  return (
    <div className="px-3.5 sm:px-6 pt-3.5 pb-28 md:pb-32 space-y-3.5">
      <div className="heritage-card rounded-2xl p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heritage text-base sm:text-lg font-bold text-earth-900">
            Akomodasi &amp; Hotel Terdekat dari Alun-Alun Cianjur
          </h2>
          <span className="text-[11px] font-semibold text-earth-800 bg-gold-300/35 border border-gold-500/40 px-2.5 py-0.5 rounded-full shrink-0">
            {data.hotels.length} Penginapan
          </span>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari hotel atau jalan di sekitar Alun-Alun..."
          className="w-full min-w-0 bg-earth-50 border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-islam-600 transition-shadow"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortBy(opt.key)}
                className={`shrink-0 px-3.5 min-h-9 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  sortBy === opt.key
                    ? 'bg-earth-800 text-gold-300 border border-gold-500/50 shadow-xs'
                    : 'bg-earth-100 text-earth-700 border border-earth-200 hover:bg-earth-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {FACILITY_FILTERS.map((fac) => (
              <button
                key={fac}
                type="button"
                onClick={() => setFacility(fac)}
                className={`shrink-0 px-3 min-h-8 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  facility === fac
                    ? 'bg-islam-700 text-white shadow-xs'
                    : 'bg-white text-earth-600 border border-earth-200 hover:bg-earth-100'
                }`}
              >
                {fac}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-earth-600 px-0.5">
        Menampilkan {hotels.length} dari {data.hotels.length} rekomendasi penginapan
      </p>

      {hotels.length === 0 && (
        <div className="heritage-card rounded-2xl p-6 text-center space-y-2 animate-view-enter">
          <p className="text-sm font-medium text-earth-700">
            Tidak ada hotel dengan filter tersebut.
          </p>
          <button
            type="button"
            onClick={() => {
              setFacility('Semua');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-earth-800 text-white text-xs font-semibold active:scale-95 transition-transform"
          >
            Reset Filter Hotel
          </button>
        </div>
      )}

      {/* Responsive Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-start">
        {hotels.map((hotel, idx) => {
          const expanded = expandedId === hotel.id;
          const visualUrl = getVisualUrl({
            id: hotel.id,
            title: hotel.name,
            subtitle: `Rating ★ ${hotel.rating.toFixed(1)} · ${formatDistance(hotel.distance_m)}`,
            category: 'hotel',
            photoUrl: hotel.photo_url,
          });
          return (
            <div
              key={hotel.id}
              style={{ animationDelay: `${Math.min(idx, 10) * 45}ms` }}
              onClick={() => setExpandedId(expanded ? null : hotel.id)}
              className="animate-card-cascade heritage-card rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <div
                className="relative h-36 bg-earth-900 overflow-hidden group"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxItem({
                    title: hotel.name,
                    sub: `${hotel.address} · Mulai ${formatPrice(hotel.price_start_idr)}/malam`,
                    url: visualUrl,
                  });
                }}
              >
                <img
                  src={visualUrl}
                  alt={hotel.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Perbesar Foto
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-earth-900 text-base leading-snug break-words">
                        {hotel.name}
                      </h3>
                      {hotel.distance_m <= 800 && (
                        <span className="bg-islam-50 text-islam-700 border border-islam-300 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                          Bisa Jalan Kaki
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 bg-gold-400/25 text-earth-900 font-bold text-xs px-2.5 py-0.5 rounded-lg">
                    ★ {hotel.rating.toFixed(1)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 flex-wrap text-xs text-earth-600">
                  <span>{formatDistance(hotel.distance_m)} dari Alun-Alun</span>
                  <span className="font-semibold text-earth-900">
                    Mulai {formatPrice(hotel.price_start_idr)}{' '}
                    <span className="font-normal text-earth-500">/ malam</span>
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {hotel.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="bg-earth-100 text-earth-700 text-[11px] px-2 py-0.5 rounded-lg"
                    >
                      {fac}
                    </span>
                  ))}
                </div>

                {expanded && (
                  <div
                    className="mt-3.5 pt-3 border-t border-earth-100 space-y-2.5 text-xs text-earth-700 animate-view-enter"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="break-words">
                      <span className="font-semibold text-earth-900">Alamat:</span> {hotel.address}
                    </p>

                    <div className="pt-1.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleShowOnMap(hotel.coords)}
                        className="flex-1 min-w-[115px] min-h-10 py-2 px-3 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 font-semibold text-xs text-center active:scale-95 transition-all"
                      >
                        Lihat di Peta
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.coords[0]},${hotel.coords[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[115px] min-h-10 py-2 px-3 rounded-xl bg-islam-600 hover:bg-islam-700 text-white font-semibold text-xs text-center flex items-center justify-center active:scale-95 transition-all"
                      >
                        Rute Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>
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
