import { useState, useMemo } from 'react';
import data from '../data/cianjur-data.json';
import { getOpenStatus, formatDistance } from '../utils/time';
import { useApp } from '../context/AppContext';

export default function CulinaryView() {
  const { setActiveTab, setMapFocus } = useApp();
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const spots = useMemo(() => {
    const q = search.trim().toLowerCase();
    const withStatus = data.culinary_spots.map((spot) => ({
      ...spot,
      status: getOpenStatus(spot.open_days, spot.open_time, spot.close_time),
    }));

    const filtered = withStatus.filter((s) => {
      if (onlyOpen && !s.status.isOpen) return false;
      if (
        q &&
        !`${s.name} ${s.address} ${s.signature_menu.join(' ')} ${s.history_note}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (onlyOpen && a.status.isOpen !== b.status.isOpen) {
        return a.status.isOpen ? -1 : 1;
      }
      return a.distance_m - b.distance_m;
    });
  }, [onlyOpen, search]);

  const handleShowOnMap = (coords: number[]) => {
    setMapFocus({ coords: [coords[0], coords[1]], zoom: 18 });
    setActiveTab('peta');
  };

  return (
    <div className="px-4 pt-3 pb-24 space-y-3">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari kuliner khas: Geco, Tan Keng Cu, Bubur, Sate Maranggi..."
        className="w-full bg-white border border-earth-200 rounded-xl px-3.5 py-2.5 text-xs text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-islam-600"
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-earth-600">
          {spots.length} kuliner legendaris · terdekat dari Alun-Alun
        </span>
        <button
          type="button"
          onClick={() => setOnlyOpen((v) => !v)}
          className={`px-3.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
            onlyOpen
              ? 'bg-islam-600 text-white'
              : 'bg-earth-100 text-earth-700 border border-earth-200'
          }`}
        >
          Buka Sekarang
        </button>
      </div>

      {spots.length === 0 && (
        <div className="bg-white rounded-xl border border-earth-200 p-6 text-center space-y-2">
          <p className="text-sm font-medium text-earth-700">
            Tidak ada tempat kuliner yang cocok dengan filter saat ini.
          </p>
          <button
            type="button"
            onClick={() => {
              setOnlyOpen(false);
              setSearch('');
            }}
            className="px-4 py-2 rounded-lg bg-earth-800 text-white text-xs font-semibold"
          >
            Tampilkan Semua Kuliner
          </button>
        </div>
      )}

      {spots.map((spot) => {
        const expanded = expandedId === spot.id;
        return (
          <div
            key={spot.id}
            onClick={() => setExpandedId(expanded ? null : spot.id)}
            className="bg-white rounded-xl border border-earth-200 p-4 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-earth-900 text-base leading-snug">
                {spot.name}
              </h3>
              <span
                className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  spot.status.isOpen
                    ? 'bg-islam-100 text-islam-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {spot.status.label}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-earth-600">
              <span>{formatDistance(spot.distance_m)}</span>
              <span>·</span>
              <span>~{Math.max(1, Math.round(spot.distance_m / 75))} mnt jalan</span>
              <span>·</span>
              <span className="font-medium text-earth-800">{spot.price_range}</span>
            </div>

            <p className="mt-1 text-xs text-earth-500">
              Jam buka: {spot.open_time} – {spot.close_time} WIB
            </p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {spot.signature_menu.map((menu) => (
                <span
                  key={menu}
                  className="bg-earth-100 text-earth-800 text-[11px] px-2 py-0.5 rounded-md"
                >
                  {menu}
                </span>
              ))}
            </div>

            {expanded && (
              <div
                className="mt-3 pt-3 border-t border-earth-100 space-y-2 text-xs text-earth-700"
                onClick={(e) => e.stopPropagation()}
              >
                <p>
                  <span className="font-medium text-earth-900">Alamat:</span> {spot.address}
                </p>
                <p className="leading-relaxed">{spot.history_note}</p>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleShowOnMap(spot.coords)}
                    className="flex-1 min-h-10 py-2 px-3 rounded-lg bg-earth-100 text-earth-800 font-medium text-xs text-center active:bg-earth-200"
                  >
                    Lihat di Peta
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.coords[0]},${spot.coords[1]}`}
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
