import { useState, useMemo } from 'react';
import data from '../data/cianjur-data.json';
import { formatDistance, formatPrice } from '../utils/time';
import { useApp } from '../context/AppContext';

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
    <div className="px-4 pt-3 pb-24 space-y-3">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari hotel atau jalan di sekitar Alun-Alun..."
        className="w-full bg-white border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-islam-600"
      />

      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={`shrink-0 px-3.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                sortBy === opt.key
                  ? 'bg-earth-800 text-white'
                  : 'bg-earth-100 text-earth-700 border border-earth-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {FACILITY_FILTERS.map((fac) => (
            <button
              key={fac}
              type="button"
              onClick={() => setFacility(fac)}
              className={`shrink-0 px-3 min-h-8 rounded-full text-xs font-medium transition-colors ${
                facility === fac
                  ? 'bg-islam-600 text-white'
                  : 'bg-white text-earth-600 border border-earth-200'
              }`}
            >
              {fac}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-earth-500">
        Menampilkan {hotels.length} dari {data.hotels.length} rekomendasi penginapan
      </p>

      {hotels.length === 0 && (
        <div className="bg-white rounded-xl border border-earth-200 p-6 text-center space-y-2">
          <p className="text-sm font-medium text-earth-700">
            Tidak ada hotel dengan filter tersebut.
          </p>
          <button
            type="button"
            onClick={() => {
              setFacility('Semua');
              setSearch('');
            }}
            className="px-4 py-2 rounded-lg bg-earth-800 text-white text-xs font-semibold"
          >
            Reset Filter Hotel
          </button>
        </div>
      )}

      {hotels.map((hotel) => {
        const expanded = expandedId === hotel.id;
        return (
          <div
            key={hotel.id}
            onClick={() => setExpandedId(expanded ? null : hotel.id)}
            className="bg-white rounded-xl border border-earth-200 p-4 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-earth-900 text-base leading-snug">
                    {hotel.name}
                  </h3>
                  {hotel.distance_m <= 800 && (
                    <span className="bg-islam-50 text-islam-700 border border-islam-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Bisa Jalan Kaki
                    </span>
                  )}
                </div>
              </div>

              <span className="shrink-0 bg-gold-400/20 text-earth-900 font-bold text-xs px-2 py-0.5 rounded-md">
                ★ {hotel.rating.toFixed(1)}
              </span>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-xs text-earth-600">
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
                  className="bg-earth-100 text-earth-700 text-[11px] px-2 py-0.5 rounded-md"
                >
                  {fac}
                </span>
              ))}
            </div>

            {expanded && (
              <div
                className="mt-3 pt-3 border-t border-earth-100 space-y-2 text-xs text-earth-700"
                onClick={(e) => e.stopPropagation()}
              >
                <p>
                  <span className="font-medium text-earth-900">Alamat:</span> {hotel.address}
                </p>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleShowOnMap(hotel.coords)}
                    className="flex-1 min-h-10 py-2 px-3 rounded-lg bg-earth-100 text-earth-800 font-medium text-xs text-center active:bg-earth-200"
                  >
                    Lihat di Peta
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.coords[0]},${hotel.coords[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-10 py-2 px-3 rounded-lg bg-islam-600 text-white font-medium text-xs text-center flex items-center justify-center active:bg-islam-700"
                  >
                    Rute Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
