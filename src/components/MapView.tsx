import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  Marker,
  Tooltip,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import data from '../data/cianjur-data.json';
import { useApp } from '../context/AppContext';
import { haversine } from '../utils/haversine';
import { formatDistance, formatPrice, getOpenStatus } from '../utils/time';
import { getFallbackVisualUrl } from '../utils/visuals';

type Category = 'all' | 'trash' | 'toilet' | 'heritage' | 'culinary' | 'hotel' | 'gate';
type ViewScope = 'alun-alun' | 'city';

interface SheetData {
  id: string;
  name: string;
  category: Exclude<Category, 'all'>;
  categoryLabel: string;
  categoryColor: string;
  subLabel?: string;
  detail: string;
  distance: number | null;
  coords: [number, number];
  photoUrl?: string | null;
  audioScript?: string;
  quizId?: string | null;
  openStatus?: { isOpen: boolean; label: string };
}

const OVERLAY_BOUNDS: [[number, number], [number, number]] = [
  [-6.82235, 107.1387],
  [-6.81875, 107.1421],
];

function isInsideOverlayBounds(coords: [number, number]): boolean {
  const [lat, lng] = coords;
  return (
    lat >= OVERLAY_BOUNDS[0][0] &&
    lat <= OVERLAY_BOUNDS[1][0] &&
    lng >= OVERLAY_BOUNDS[0][1] &&
    lng <= OVERLAY_BOUNDS[1][1]
  );
}

const PILAR_LABEL: Record<string, string> = {
  NGAOS: 'Pilar Ngaos',
  MAMAOS: 'Pilar Mamaos',
  MAENPO: 'Pilar Maenpo',
  HERITAGE: 'Cagar Budaya',
};

const COLORS: Record<Exclude<Category, 'all'>, string> = {
  trash: '#2E7D32',
  toilet: '#5D4037',
  heritage: '#C8A951',
  culinary: '#6D4C41',
  hotel: '#4E342E',
  gate: '#3E2723',
};

const LABELS: Record<Exclude<Category, 'all'>, string> = {
  trash: 'TS',
  toilet: 'WC',
  heritage: 'SJ',
  culinary: 'KL',
  hotel: 'HT',
  gate: 'GB',
};

function makeIcon(category: Exclude<Category, 'all'>, active = false) {
  const color = COLORS[category];
  const label = LABELS[category];
  const size = category === 'gate' ? 30 : category === 'trash' ? 26 : 28;
  const activeCls = active ? 'marker-pin-active' : '';
  const border = active ? '3px solid #FEF08A' : '2.5px solid #ffffff';

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="${activeCls}" style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${border};box-shadow:0 2px 6px rgba(0,0,0,0.38);display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:700;font-size:11px;font-family:system-ui,sans-serif;letter-spacing:-0.3px;transition:transform 0.2s ease">${label}</div>`,
  });
}

const defaultIcons: Record<Exclude<Category, 'all'>, L.DivIcon> = {
  trash: makeIcon('trash', false),
  toilet: makeIcon('toilet', false),
  heritage: makeIcon('heritage', false),
  culinary: makeIcon('culinary', false),
  hotel: makeIcon('hotel', false),
  gate: makeIcon('gate', false),
};

const activeIcons: Record<Exclude<Category, 'all'>, L.DivIcon> = {
  trash: makeIcon('trash', true),
  toilet: makeIcon('toilet', true),
  heritage: makeIcon('heritage', true),
  culinary: makeIcon('culinary', true),
  hotel: makeIcon('hotel', true),
  gate: makeIcon('gate', true),
};

interface MarkerItem {
  id: string;
  coords: [number, number];
  category: Exclude<Category, 'all'>;
  isInternal: boolean;
  searchKeywords: string;
  sheet: SheetData;
}

function buildMarkers(): MarkerItem[] {
  const items: MarkerItem[] = [];

  for (const g of data.gates) {
    items.push({
      id: g.id,
      coords: g.coords as [number, number],
      category: 'gate',
      isInternal: true,
      searchKeywords: `${g.name} gerbang ${g.welcome}`.toLowerCase(),
      sheet: {
        id: g.id,
        name: g.name,
        category: 'gate',
        categoryLabel: 'Gerbang Utama',
        categoryColor: COLORS.gate,
        detail: g.welcome,
        distance: null,
        coords: g.coords as [number, number],
        photoUrl: (g as { photo_url?: string | null }).photo_url ?? null,
      },
    });
  }

  for (const t of data.toilets) {
    items.push({
      id: t.id,
      coords: t.coords as [number, number],
      category: 'toilet',
      isInternal: true,
      searchKeywords: `${t.name} ${t.location_hint} ${t.facilities.join(' ')} toilet wc kamar mandi`.toLowerCase(),
      sheet: {
        id: t.id,
        name: t.name,
        category: 'toilet',
        categoryLabel: 'Fasilitas Toilet',
        categoryColor: COLORS.toilet,
        subLabel: t.open_hours,
        detail: `${t.location_hint}. Fasilitas: ${t.facilities.join(', ')}.`,
        distance: null,
        coords: t.coords as [number, number],
        photoUrl: (t as { photo_url?: string | null }).photo_url ?? null,
      },
    });
  }

  for (const h of data.heritage_icons) {
    const coords = h.coords as [number, number];
    const inDenah = h.zone === 'INTERNAL' || isInsideOverlayBounds(coords);
    items.push({
      id: h.id,
      coords,
      category: 'heritage',
      isInternal: inDenah,
      searchKeywords: `${h.name} ${h.pilar_tag} ${h.address ?? ''} ${h.summary} sejarah`.toLowerCase(),
      sheet: {
        id: h.id,
        name: h.name,
        category: 'heritage',
        categoryLabel: `Sejarah · ${PILAR_LABEL[h.pilar_tag] ?? h.pilar_tag}`,
        categoryColor: COLORS.heritage,
        subLabel: `Tahun ${h.year_built}${h.address ? ` · ${h.address}` : ' · Area Dalam Alun-Alun'}`,
        detail: h.summary,
        distance: h.distance_m,
        coords,
        photoUrl: h.photo_url ?? null,
        audioScript: `${h.name}. ${h.summary}`,
        quizId: h.quiz_id,
      },
    });
  }

  for (const c of data.culinary_spots) {
    const status = getOpenStatus(c.open_days, c.open_time, c.close_time);
    items.push({
      id: c.id,
      coords: c.coords as [number, number],
      category: 'culinary',
      isInternal: false,
      searchKeywords: `${c.name} ${c.address} ${c.signature_menu.join(' ')} kuliner makanan oleh-oleh`.toLowerCase(),
      sheet: {
        id: c.id,
        name: c.name,
        category: 'culinary',
        categoryLabel: 'Kuliner & Oleh-Oleh',
        categoryColor: COLORS.culinary,
        subLabel: `${c.price_range} · Jam ${c.open_time}–${c.close_time}`,
        detail: `${c.address}. Menu andalan: ${c.signature_menu.join(', ')}. ${c.history_note}`,
        distance: c.distance_m,
        coords: c.coords as [number, number],
        photoUrl: c.photo_url ?? null,
        openStatus: status,
      },
    });
  }

  for (const h of data.hotels) {
    items.push({
      id: h.id,
      coords: h.coords as [number, number],
      category: 'hotel',
      isInternal: false,
      searchKeywords: `${h.name} ${h.address} ${h.facilities.join(' ')} hotel penginapan`.toLowerCase(),
      sheet: {
        id: h.id,
        name: h.name,
        category: 'hotel',
        categoryLabel: `Hotel · Rating ${h.rating}`,
        categoryColor: COLORS.hotel,
        subLabel: `Mulai ${formatPrice(h.price_start_idr)}/malam`,
        detail: `${h.address}. Fasilitas: ${h.facilities.join(', ')}.`,
        distance: h.distance_m,
        coords: h.coords as [number, number],
        photoUrl: h.photo_url ?? null,
      },
    });
  }

  for (const b of data.trash_bins) {
    items.push({
      id: b.id,
      coords: b.coords as [number, number],
      category: 'trash',
      isInternal: true,
      searchKeywords: `${b.cluster_name} ${b.landmark_hint} ${b.bin_type} tong sampah`.toLowerCase(),
      sheet: {
        id: b.id,
        name: b.cluster_name,
        category: 'trash',
        categoryLabel: 'Titik Tong Sampah K5',
        categoryColor: COLORS.trash,
        subLabel: b.bin_type,
        detail: b.landmark_hint,
        distance: null,
        coords: b.coords as [number, number],
      },
    });
  }

  return items;
}

const ALL_MARKERS = buildMarkers();

function MapController({
  mapRef,
}: {
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMap();
  const { mapFocus } = useApp();

  useEffect(() => {
    mapRef.current = map;
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, mapRef]);

  useEffect(() => {
    if (mapFocus) {
      map.flyTo(mapFocus.coords, mapFocus.zoom, { duration: 1.0 });
    }
  }, [mapFocus, map]);

  return null;
}

export default function MapView() {
  const { mapFocus, setActiveTab } = useApp();
  const initialMatch = useMemo(() => {
    if (!mapFocus) return null;
    return (
      ALL_MARKERS.find(
        (m) =>
          Math.abs(m.coords[0] - mapFocus.coords[0]) < 0.00001 &&
          Math.abs(m.coords[1] - mapFocus.coords[1]) < 0.00001,
      ) ?? null
    );
  }, [mapFocus]);

  const [filter, setFilter] = useState<Category>(() => (mapFocus?.layer as Category) ?? 'all');
  const [scope, setScope] = useState<ViewScope>(() =>
    mapFocus?.routeId || (initialMatch && !initialMatch.isInternal) ? 'city' : 'alun-alun',
  );
  const [showOverlay, setShowOverlay] = useState(true);
  const [sheet, setSheet] = useState<SheetData | null>(() => initialMatch?.sheet ?? null);
  const [routeLine, setRouteLine] = useState<[number, number][] | null>(null);
  const [activeGuideRouteId, setActiveGuideRouteId] = useState<string | null>(
    () => mapFocus?.routeId ?? null,
  );
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [sheetAudioNotice, setSheetAudioNotice] = useState<string | null>(null);
  const [useFallbackTiles, setUseFallbackTiles] = useState(false);
  const tileErrorCountRef = useRef(0);
  const mapRef = useRef<L.Map | null>(null);

  const center = useMemo<[number, number]>(
    () => mapFocus?.coords ?? (data.app_config.center_coords as [number, number]),
    [],
  );

  const activeGuideRoute = useMemo(
    () => data.routes.find((r) => r.id === activeGuideRouteId) ?? null,
    [activeGuideRouteId],
  );

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (mapFocus?.layer) {
      setFilter(mapFocus.layer as Category);
    }
    if (mapFocus?.routeId) {
      setActiveGuideRouteId(mapFocus.routeId);
      setScope('city');
    }
    if (!initialMatch) return;
    setScope(initialMatch.isInternal ? 'alun-alun' : 'city');
    if (!mapFocus?.layer) setFilter('all');
    setSheet(initialMatch.sheet);
  }, [initialMatch, mapFocus]);

  const scopedMarkers = useMemo(
    () => (scope === 'alun-alun' ? ALL_MARKERS.filter((m) => m.isInternal) : ALL_MARKERS),
    [scope],
  );

  const visible = useMemo(
    () => (filter === 'all' ? scopedMarkers : scopedMarkers.filter((m) => m.category === filter)),
    [scopedMarkers, filter],
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const qCompact = q.replace(/[\s'-]+/g, '');
    return ALL_MARKERS.filter((m) => {
      const hayCompact = m.searchKeywords.replace(/[\s'-]+/g, '');
      return m.searchKeywords.includes(q) || hayCompact.includes(qCompact);
    }).slice(0, 6);
  }, [searchQuery]);

  const filterPills = useMemo(() => {
    const counts = (cat: Exclude<Category, 'all'>) =>
      scopedMarkers.filter((m) => m.category === cat).length;

    if (scope === 'alun-alun') {
      return [
        { id: 'all' as Category, label: 'Semua Taman', count: scopedMarkers.length },
        { id: 'toilet' as Category, label: 'Toilet', count: data.toilets.length },
        { id: 'trash' as Category, label: 'Tong Sampah', count: counts('trash') },
        { id: 'heritage' as Category, label: 'Ikon Sejarah', count: data.heritage_icons.length },
        { id: 'culinary' as Category, label: 'Kuliner & Oleh-Oleh', count: data.culinary_spots.length },
        { id: 'hotel' as Category, label: 'Hotel', count: data.hotels.length },
        { id: 'gate' as Category, label: 'Gerbang', count: counts('gate') },
      ];
    }

    return [
      { id: 'all' as Category, label: 'Semua Kota', count: ALL_MARKERS.length },
      { id: 'toilet' as Category, label: 'Toilet', count: counts('toilet') },
      { id: 'culinary' as Category, label: 'Kuliner & Oleh-Oleh', count: counts('culinary') },
      { id: 'hotel' as Category, label: 'Hotel', count: counts('hotel') },
      { id: 'heritage' as Category, label: 'Sejarah', count: counts('heritage') },
      { id: 'trash' as Category, label: 'Tong Sampah', count: counts('trash') },
      { id: 'gate' as Category, label: 'Gerbang', count: counts('gate') },
    ];
  }, [scope, scopedMarkers]);

  const switchToAlunAlun = useCallback(() => {
    setScope('alun-alun');
    setFilter('all');
    setShowOverlay(true);
    setSheet(null);
    setActiveGuideRouteId(null);
    mapRef.current?.flyTo(
      data.app_config.center_coords as [number, number],
      data.app_config.default_zoom,
      { duration: 0.9 },
    );
  }, []);

  const switchToCity = useCallback(() => {
    setScope('city');
    setFilter('all');
    setSheet(null);
    if (mapRef.current) {
      const bounds = L.latLngBounds(ALL_MARKERS.map((m) => m.coords));
      mapRef.current.flyToBounds(bounds.pad(0.12), { duration: 1.0, maxZoom: 16 });
    }
  }, []);

  const handleFilterChange = useCallback((nextFilter: Category) => {
    setFilter(nextFilter);
    if (!mapRef.current) return;

    if (nextFilter === 'culinary' || nextFilter === 'hotel' || nextFilter === 'heritage') {
      setScope('city');
      const pts = ALL_MARKERS.filter((m) => m.category === nextFilter).map((m) => m.coords);
      if (pts.length > 0) {
        mapRef.current.flyToBounds(L.latLngBounds(pts).pad(0.18), { duration: 0.9, maxZoom: 17 });
      }
    } else if (nextFilter === 'trash' || nextFilter === 'toilet' || nextFilter === 'gate') {
      mapRef.current.flyTo(data.app_config.center_coords as [number, number], 18, { duration: 0.8 });
    }
  }, []);

  const toggleGuideRoute = useCallback((routeId: string) => {
    setActiveGuideRouteId((prev) => {
      const next = prev === routeId ? null : routeId;
      const route = data.routes.find((r) => r.id === next);
      if (route && mapRef.current) {
        setScope('city');
        const bounds = L.latLngBounds(route.waypoints as [number, number][]);
        mapRef.current.flyToBounds(bounds.pad(0.25), { duration: 0.9, maxZoom: 18 });
      }
      return next;
    });
  }, []);

  const handleSelectSearchResult = useCallback((item: MarkerItem) => {
    setSearchQuery('');
    setScope(item.isInternal ? 'alun-alun' : 'city');
    setFilter('all');
    setSheet(item.sheet);
    mapRef.current?.flyTo(item.coords, item.isInternal ? 19 : 17, { duration: 0.9 });
  }, []);

  const toggleSheetAudio = useCallback(
    (id: string, script?: string) => {
      if (!script) return;
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        setSheetAudioNotice(
          'Suara otomatis tidak didukung di perangkat ini — silakan baca narasi sejarah di atas.',
        );
        return;
      }
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(script);
        u.lang = 'id-ID';
        u.rate = 0.95;
        u.onend = () => setSpeakingId(null);
        u.onerror = () => {
          setSpeakingId(null);
          setSheetAudioNotice(
            'Pemutaran suara terkendala di perangkat ini — silakan baca narasi sejarah di atas.',
          );
        };
        setSheetAudioNotice(null);
        setSpeakingId(id);
        window.speechSynthesis.speak(u);
      } catch {
        setSpeakingId(null);
        setSheetAudioNotice(
          'Pemutaran suara terkendala di perangkat ini — silakan baca narasi sejarah di atas.',
        );
      }
    },
    [speakingId],
  );

  const applyCenterBinFallback = useCallback(() => {
    setGpsLoading(false);
    const fallbackBin = data.trash_bins[0];
    const centerCoords = data.app_config.center_coords as [number, number];
    const to = fallbackBin.coords as [number, number];
    const dist = haversine(centerCoords[0], centerCoords[1], to[0], to[1]);
    setFilter('trash');
    setRouteLine([centerCoords, to]);
    setSheet({
      id: fallbackBin.id,
      name: fallbackBin.cluster_name,
      category: 'trash',
      categoryLabel: 'Tong Sampah Terdekat (Estimasi Pusat)',
      categoryColor: COLORS.trash,
      subLabel: fallbackBin.bin_type,
      detail: `${fallbackBin.landmark_hint} (GPS tidak aktif, menampilkan dari titik pusat Alun-Alun)`,
      distance: dist,
      coords: to,
    });
    mapRef.current?.flyTo(to, 18, { duration: 0.9 });
  }, []);

  const findNearestBin = useCallback(() => {
    setGpsLoading(true);
    if (!('geolocation' in navigator)) {
      applyCenterBinFallback();
      return;
    }

    let settled = false;
    const finishWithFallback = () => {
      if (settled) return;
      settled = true;
      applyCenterBinFallback();
    };

    const guardTimer = window.setTimeout(finishWithFallback, 3600);

    const runGeolocation = () => {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(guardTimer);
            const { latitude: lat, longitude: lng } = pos.coords;
            let best: (typeof data.trash_bins)[number] | null = null;
            let bestDist = Infinity;

            for (const bin of data.trash_bins) {
              const d = haversine(lat, lng, bin.coords[0], bin.coords[1]);
              if (d < bestDist) {
                bestDist = d;
                best = bin;
              }
            }

            if (best) {
              const from: [number, number] = [lat, lng];
              const to = best.coords as [number, number];
              setUserPos(from);
              setRouteLine([from, to]);
              setFilter('trash');
              setSheet({
                id: best.id,
                name: best.cluster_name,
                category: 'trash',
                categoryLabel: 'Tong Sampah Terdekat',
                categoryColor: COLORS.trash,
                subLabel: best.bin_type,
                detail: `${best.landmark_hint} (${formatDistance(bestDist)} dari posisimu)`,
                distance: bestDist,
                coords: to,
              });
              mapRef.current?.flyTo(to, 19, { duration: 0.9 });
            }

            setGpsLoading(false);
          },
          () => {
            window.clearTimeout(guardTimer);
            finishWithFallback();
          },
          { enableHighAccuracy: false, timeout: 3200, maximumAge: 60000 },
        );
      } catch {
        window.clearTimeout(guardTimer);
        finishWithFallback();
      }
    };

    if ('permissions' in navigator && typeof navigator.permissions?.query === 'function') {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'denied') {
            window.clearTimeout(guardTimer);
            finishWithFallback();
          } else {
            runGeolocation();
          }
        })
        .catch(() => {
          runGeolocation();
        });
    } else {
      runGeolocation();
    }
  }, [applyCenterBinFallback]);

  const dismissSheet = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setSheet(null);
    setRouteLine(null);
  }, []);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 pb-[56px] md:pb-0">
      {/* Mode Switcher: Denah Internal vs Peta Sekitar Kota */}
      <div className="bg-earth-900 text-white px-2.5 sm:px-4 py-2 flex items-center justify-between gap-2 relative z-10 shrink-0">
        <div className="flex bg-earth-800 p-0.5 rounded-xl flex-1 min-w-0">
          <button
            onClick={switchToAlunAlun}
            className={`flex-1 min-w-0 py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold truncate transition-all ${
              scope === 'alun-alun'
                ? 'bg-gold-500 text-earth-900 shadow-xs'
                : 'text-earth-200 hover:text-white'
            }`}
          >
            Denah Alun-Alun
          </button>
          <button
            onClick={switchToCity}
            className={`flex-1 min-w-0 py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold truncate transition-all ${
              scope === 'city'
                ? 'bg-gold-500 text-earth-900 shadow-xs'
                : 'text-earth-200 hover:text-white'
            }`}
          >
            <span className="sm:hidden">Peta Sekitar Kota</span>
            <span className="hidden sm:inline">Peta Sekitar (Kuliner & Hotel)</span>
          </button>
        </div>

        <button
          onClick={() => setShowOverlay((v) => !v)}
          className={`shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all active:scale-95 ${
            showOverlay
              ? 'bg-islam-700 border-islam-500 text-white'
              : 'bg-earth-800 border-earth-600 text-earth-300'
          }`}
        >
          {showOverlay ? 'Denah: ON' : 'Denah: OFF'}
        </button>
      </div>

      {/* Instant Search Bar, Category Filter Pills & Quick Route Toggles */}
      <div className="bg-white/95 backdrop-blur-sm relative z-20 border-b border-earth-200 px-3 sm:px-4 pt-2 pb-2 space-y-2 shrink-0">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari: Toilet, Stasiun, Bomero, Lonceng, Geco..."
            className="w-full min-w-0 bg-earth-50 border border-earth-200 rounded-xl pl-8 pr-8 py-2 text-xs sm:text-sm text-earth-900 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-islam-600 transition-shadow"
          />
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-earth-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-earth-200 text-earth-700 text-xs flex items-center justify-center"
              aria-label="Hapus pencarian"
            >
              ×
            </button>
          )}
        </div>

        {searchQuery.trim().length > 0 && searchResults.length === 0 && (
          <div className="absolute left-3 right-3 sm:left-4 sm:right-4 top-12 bg-white rounded-2xl shadow-xl border border-earth-200 px-3.5 py-3 flex items-center justify-between gap-2 z-30 animate-view-enter">
            <span className="text-xs text-earth-600 truncate">
              Tidak ditemukan lokasi untuk &ldquo;{searchQuery.trim()}&rdquo;
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-earth-100 hover:bg-earth-200 text-earth-800 text-[11px] font-semibold"
            >
              Reset
            </button>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="absolute left-3 right-3 sm:left-4 sm:right-4 top-12 bg-white rounded-2xl shadow-xl border border-earth-200 divide-y divide-earth-100 max-h-60 overflow-y-auto z-30 animate-view-enter">
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectSearchResult(item)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-earth-50 flex items-center justify-between gap-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-earth-900 truncate">
                    {item.sheet.name}
                  </div>
                  <div className="text-[11px] text-earth-500 truncate">
                    {item.sheet.categoryLabel}
                    {item.sheet.distance != null ? ` · ${formatDistance(item.sheet.distance)}` : ''}
                  </div>
                </div>
                <span
                  className="shrink-0 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full"
                  style={{ background: item.sheet.categoryColor }}
                >
                  Pilih
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar items-center">
          {filterPills.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`shrink-0 min-h-8 px-3 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                filter === f.id
                  ? 'bg-earth-800 text-white shadow-xs'
                  : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
          <span className="text-earth-300 text-xs px-0.5">|</span>
          <button
            onClick={() => toggleGuideRoute('RTE-STASIUN')}
            className={`shrink-0 min-h-8 px-3 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              activeGuideRouteId === 'RTE-STASIUN'
                ? 'bg-islam-600 text-white border-islam-600 shadow-xs'
                : 'bg-islam-50 text-islam-700 border-islam-200 hover:bg-islam-100'
            }`}
          >
            Rute Stasiun (485m)
          </button>
          <button
            onClick={() => toggleGuideRoute('RTE-BOMERO')}
            className={`shrink-0 min-h-8 px-3 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              activeGuideRouteId === 'RTE-BOMERO'
                ? 'bg-earth-800 text-white border-earth-800 shadow-xs'
                : 'bg-earth-100 text-earth-700 border-earth-200 hover:bg-earth-200'
            }`}
          >
            Rute Bomero (210m)
          </button>
        </div>
      </div>

      {/* Active Route Banner */}
      {activeGuideRoute && (
        <div className="bg-earth-900/95 text-white px-3.5 py-2 flex items-center justify-between gap-2 relative z-10 border-b border-earth-700 shrink-0">
          <div className="min-w-0">
            <div className="text-xs font-bold text-gold-400 truncate">
              {activeGuideRoute.title} ({activeGuideRoute.distance_m}m · {activeGuideRoute.duration_walk})
            </div>
            <div className="text-[11px] text-earth-200 truncate">{activeGuideRoute.subtitle}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('panduan')}
              className="px-2.5 py-1 rounded-lg bg-gold-500 text-earth-900 text-[11px] font-bold"
            >
              Detail Langkah
            </button>
            <button
              onClick={() => setActiveGuideRouteId(null)}
              className="w-6 h-6 rounded-full bg-earth-700 text-white text-xs flex items-center justify-center"
              aria-label="Tutup rute"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative isolate z-0 min-h-[280px]">
        <MapContainer
          center={center}
          zoom={data.app_config.default_zoom}
          minZoom={13}
          maxZoom={20}
          className="absolute inset-0 h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url={
              useFallbackTiles
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            maxNativeZoom={19}
            maxZoom={20}
            eventHandlers={{
              tileerror: () => {
                tileErrorCountRef.current += 1;
                if (tileErrorCountRef.current >= 3 && !useFallbackTiles) {
                  setUseFallbackTiles(true);
                  setShowOverlay(true);
                }
              },
            }}
          />

          {showOverlay && (
            <ImageOverlay
              url="/alun-alun-overlay.svg"
              bounds={OVERLAY_BOUNDS}
              opacity={0.93}
              zIndex={250}
            />
          )}

          <MapController mapRef={mapRef} />

          {visible.map((m) => {
            const isSelected = sheet?.id === m.id;
            return (
              <Marker
                key={m.id}
                position={m.coords}
                icon={isSelected ? activeIcons[m.category] : defaultIcons[m.category]}
                zIndexOffset={isSelected ? 500 : 0}
                eventHandlers={{
                  click: () => {
                    setSheet(m.sheet);
                    mapRef.current?.panTo(m.coords, { animate: true });
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                  <span className="text-xs font-semibold">{m.sheet.name}</span>
                </Tooltip>
              </Marker>
            );
          })}

          {userPos && (
            <Circle
              center={userPos}
              radius={12}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.7 }}
            />
          )}

          {routeLine && (
            <Polyline
              positions={routeLine}
              pathOptions={{ color: COLORS.trash, weight: 4, dashArray: '8 6' }}
            />
          )}

          {activeGuideRoute && (
            <Polyline
              positions={activeGuideRoute.waypoints as [number, number][]}
              pathOptions={{
                color: activeGuideRoute.color,
                weight: 5,
                dashArray: '10 6',
                opacity: 0.95,
              }}
            />
          )}
        </MapContainer>

        {/* Custom Zoom Controls */}
        <div className="absolute top-3 right-3 z-[800] flex flex-col gap-1.5">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-earth-900 font-bold text-lg shadow-md border border-earth-200 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Perbesar peta"
          >
            +
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-earth-900 font-bold text-lg shadow-md border border-earth-200 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Perkecil peta"
          >
            −
          </button>
        </div>

        {/* Compact Legend */}
        <div
          className={`absolute top-3 left-3 z-[800] bg-white/92 backdrop-blur-sm px-2.5 py-2 rounded-xl shadow-md border border-earth-200 text-[10px] sm:text-[11px] text-earth-800 space-y-1 transition-opacity ${
            sheet ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block shrink-0" style={{ background: COLORS.gate }} />
            <span>Gerbang (GB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block shrink-0" style={{ background: COLORS.toilet }} />
            <span>Toilet (WC)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block shrink-0" style={{ background: COLORS.heritage }} />
            <span>Sejarah (SJ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block shrink-0" style={{ background: COLORS.trash }} />
            <span>Tong Sampah (TS)</span>
          </div>
          {scope === 'city' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block shrink-0" style={{ background: COLORS.culinary }} />
                <span>Kuliner & Oleh2 (KL)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block shrink-0" style={{ background: COLORS.hotel }} />
                <span>Hotel (HT)</span>
              </div>
            </>
          )}
        </div>

        {/* Find Nearest Trash Bin CTA */}
        <button
          onClick={findNearestBin}
          disabled={gpsLoading}
          className={`absolute bottom-4 md:bottom-20 left-1/2 -translate-x-1/2 z-[800] bg-islam-700 hover:bg-islam-800 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs font-semibold shadow-lg border border-islam-500 active:scale-95 transition-all disabled:opacity-60 whitespace-nowrap max-w-[92vw] truncate ${
            sheet ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {gpsLoading ? 'Mencari Lokasi GPS...' : 'Cari Tong Sampah Terdekat'}
        </button>
      </div>

      {/* Detail Bottom Sheet (Mobile bottom sheet + Desktop floating card) */}
      <div
        className={`fixed bottom-[56px] inset-x-0 md:inset-x-auto md:right-6 md:bottom-24 md:w-[400px] z-30 bg-[#FFFDF9] rounded-t-2xl md:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.18)] md:shadow-2xl transition-all duration-300 ease-out border-t md:border border-gold-500/40 max-h-[58dvh] md:max-h-[72dvh] overflow-y-auto ${
          sheet
            ? 'translate-y-0 opacity-100'
            : 'translate-y-[120%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-10 h-1 bg-earth-300 rounded-full mx-auto mt-2.5 md:hidden" />
        <div className="p-4 pt-2.5 md:pt-4">
          {sheet?.photoUrl && (
            <div className="mb-3 rounded-xl overflow-hidden border border-gold-500/30 h-32 bg-earth-900">
              <img
                src={sheet.photoUrl}
                alt={sheet.name}
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackVisualUrl({
                    id: sheet.id,
                    title: sheet.name,
                    subtitle: sheet.categoryLabel,
                    category: sheet.category,
                  });
                }}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {sheetAudioNotice && (
            <div className="mb-2.5 bg-gold-300/20 border border-gold-500/35 text-earth-800 rounded-xl px-3 py-2 text-[11px] font-medium">
              {sheetAudioNotice}
            </div>
          )}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              {sheet && (
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span
                    className="inline-block text-[11px] font-semibold text-white px-2.5 py-0.5 rounded-full"
                    style={{ background: sheet.categoryColor }}
                  >
                    {sheet.categoryLabel}
                  </span>
                  {sheet.openStatus && (
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sheet.openStatus.isOpen
                          ? 'bg-islam-100 text-islam-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {sheet.openStatus.label}
                    </span>
                  )}
                </div>
              )}
              <h3 className="text-base font-bold text-earth-900 leading-snug break-words">
                {sheet?.name}
              </h3>
              {sheet?.subLabel && (
                <p className="text-xs text-earth-500 mt-0.5 break-words">{sheet.subLabel}</p>
              )}
            </div>
            <button
              onClick={dismissSheet}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-earth-100 hover:bg-earth-200 text-earth-600 active:scale-95 transition-all"
              aria-label="Tutup"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} fill="none">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {sheet?.distance != null && (
            <span className="inline-block mb-2 text-xs font-semibold text-islam-700 bg-islam-50 px-2.5 py-0.5 rounded-full">
              Jarak {formatDistance(sheet.distance)} dari Alun-Alun
            </span>
          )}

          <p className="text-xs sm:text-sm text-earth-700 leading-relaxed mb-3.5">{sheet?.detail}</p>

          {sheet?.audioScript && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              <button
                onClick={() => toggleSheetAudio(sheet.id, sheet.audioScript)}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  speakingId === sheet.id
                    ? 'bg-earth-800 text-white border-earth-800'
                    : 'bg-earth-100 text-earth-800 border-earth-200 hover:bg-earth-200'
                }`}
              >
                {speakingId === sheet.id ? 'Hentikan Audio Sejarah' : 'Dengarkan Audio Sejarah'}
              </button>
              {sheet.quizId && (
                <button
                  onClick={() => {
                    dismissSheet();
                    setActiveTab('misi');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-earth-900 text-xs font-bold active:scale-95 transition-all"
                >
                  Jawab Kuis (+XP)
                </button>
              )}
            </div>
          )}

          {sheet?.category === 'trash' && (
            <button
              onClick={() => {
                dismissSheet();
                setActiveTab('misi');
              }}
              className="w-full mb-2.5 py-2.5 px-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-earth-900 text-xs font-bold active:scale-95 transition-all"
            >
              Check-In Misi Ksatria K5 (+200 XP)
            </button>
          )}

          {sheet && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  mapRef.current?.flyTo(sheet.coords, 19, { duration: 0.8 });
                  setSheet(null);
                }}
                className="flex-1 min-w-[115px] py-2.5 px-3 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs font-semibold active:scale-95 transition-all"
              >
                Perbesar Titik
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${sheet.coords[0]},${sheet.coords[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[115px] py-2.5 px-3 rounded-xl bg-islam-600 hover:bg-islam-700 text-white text-xs font-semibold text-center flex items-center justify-center active:scale-95 transition-all"
              >
                Rute Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
