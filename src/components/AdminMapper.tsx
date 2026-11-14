import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import data from '../data/cianjur-data.json';

const OVERLAY_BOUNDS: [[number, number], [number, number]] = [
  [-6.82235, 107.1387],
  [-6.81875, 107.1421],
];

const DRAFT_STORAGE_KEY = 'cianjur_admin_draft_bins';

const CLUSTER_OPTIONS = [
  'Klaster Gerbang Jalan Suroso',
  'Klaster Koridor Asmaul Husna (Utara & Selatan)',
  "Klaster Perimeter Rumput Sintetis & Kolam Al-Qur'an",
  'Klaster Tribun Koloseum & Menara Pandang',
  'Klaster Panggung Suling, Lumbung Padi & Taman Anak',
  'Klaster Perimeter Trotoar Jalan Siti Jenab',
];

const BIN_TYPES = ['ORGANIK_ANORGANIK', 'ORGANIK_ANORGANIK_B3', 'UMUM'] as const;

interface DraftBin {
  id: string;
  cluster_name: string;
  coords: [number, number];
  bin_type: string;
  landmark_hint: string;
}

type CategoryKey = 'gates' | 'heritage_icons' | 'culinary_spots' | 'hotels' | 'trash_bins';

const CATEGORIES: { key: CategoryKey; label: string; color: string }[] = [
  { key: 'gates', label: 'Gerbang', color: '#6366f1' },
  { key: 'heritage_icons', label: 'Cagar Budaya', color: '#f59e0b' },
  { key: 'culinary_spots', label: 'Kuliner', color: '#f97316' },
  { key: 'hotels', label: 'Hotel', color: '#a855f7' },
  { key: 'trash_bins', label: 'Tong Sampah', color: '#22c55e' },
];

function makeIcon(color: string, size = 16) {
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  });
}

const iconCache = new Map<string, L.DivIcon>();
function getIcon(color: string) {
  if (!iconCache.has(color)) iconCache.set(color, makeIcon(color));
  return iconCache.get(color)!;
}

function formatCoord(lat: number, lng: number) {
  return `[${lat.toFixed(6)}, ${lng.toFixed(6)}]`;
}

function itemName(item: Record<string, unknown>): string {
  return (item.name ?? item.cluster_name ?? item.id) as string;
}

function loadDraftBins(): DraftBin[] {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftBin[]) : [];
  } catch {
    return [];
  }
}

function MapEvents({
  onMove,
  onClick,
}: {
  onMove: (lat: number, lng: number) => void;
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    mousemove(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function AdminMapper() {
  const [visible, setVisible] = useState<Record<CategoryKey, boolean>>({
    gates: true,
    heritage_icons: true,
    culinary_spots: true,
    hotels: true,
    trash_bins: true,
  });
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const [clicked, setClicked] = useState<[number, number] | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selected, setSelected] = useState<{ category: string; item: Record<string, unknown> } | null>(null);
  const [copied, setCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const [clusterName, setClusterName] = useState(CLUSTER_OPTIONS[0]);
  const [binType, setBinType] = useState<string>(BIN_TYPES[0]);
  const [landmarkHint, setLandmarkHint] = useState('');
  const [draftBins, setDraftBins] = useState<DraftBin[]>(loadDraftBins);

  const copyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const jsonCopyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftBins));
  }, [draftBins]);

  const handleCopy = useCallback(() => {
    if (!clicked) return;
    navigator.clipboard.writeText(formatCoord(clicked[0], clicked[1])).then(() => {
      setCopied(true);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 1500);
    });
  }, [clicked]);

  const handleGetGps = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setClicked([pos.coords.latitude, pos.coords.longitude]);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleSaveDraft = useCallback(() => {
    const coords: [number, number] = clicked
      ? [Number(clicked[0].toFixed(6)), Number(clicked[1].toFixed(6))]
      : (data.app_config.center_coords as [number, number]);
    const nextIdx = data.trash_bins.length + draftBins.length + 1;
    const newBin: DraftBin = {
      id: `BIN-SURVEY-${String(nextIdx).padStart(2, '0')}`,
      cluster_name: clusterName,
      coords,
      bin_type: binType,
      landmark_hint: landmarkHint.trim() || `Titik survei lapangan ${clusterName}`,
    };
    setDraftBins((prev) => [...prev, newBin]);
    setLandmarkHint('');
  }, [clicked, clusterName, binType, landmarkHint, draftBins.length]);

  const handleCopyDraftJson = useCallback(() => {
    const payload = draftBins.length > 0 ? draftBins : data.trash_bins;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      setJsonCopied(true);
      clearTimeout(jsonCopyTimeout.current);
      jsonCopyTimeout.current = setTimeout(() => setJsonCopied(false), 1800);
    });
  }, [draftBins]);

  const { center_coords, default_zoom } = data.app_config;

  return (
    <div className="fixed inset-0 z-[9999] bg-earth-900">
      <MapContainer
        center={center_coords as [number, number]}
        zoom={default_zoom}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxNativeZoom={19}
          maxZoom={20}
        />
        <ImageOverlay
          url="/alun-alun-overlay.svg"
          bounds={OVERLAY_BOUNDS}
          opacity={0.85}
          zIndex={250}
        />
        <MapEvents
          onMove={(lat, lng) => setCursor([lat, lng])}
          onClick={(lat, lng) => {
            setClicked([lat, lng]);
            setGpsAccuracy(null);
          }}
        />
        {CATEGORIES.map(
          ({ key, color, label }) =>
            visible[key] &&
            (data[key] as Record<string, unknown>[]).map((item) => {
              const coords = item.coords as [number, number];
              return (
                <Marker
                  key={item.id as string}
                  position={coords}
                  icon={getIcon(color)}
                  eventHandlers={{
                    click: () => setSelected({ category: label, item }),
                  }}
                >
                  <Popup>
                    <strong>{itemName(item)}</strong>
                  </Popup>
                </Marker>
              );
            }),
        )}
        {draftBins.map((bin) => (
          <Marker
            key={bin.id}
            position={bin.coords}
            icon={getIcon('#10b981')}
            eventHandlers={{
              click: () =>
                setSelected({
                  category: 'Draft Survei',
                  item: bin as unknown as Record<string, unknown>,
                }),
            }}
          >
            <Popup>
              <strong>{bin.id} - {bin.cluster_name}</strong>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Koordinat & Survei Lapangan K5 - kanan atas */}
      <div className="fixed top-3 right-3 z-[10000] bg-earth-900/90 text-white p-3 rounded-lg text-xs backdrop-blur-sm w-72 space-y-2 border border-earth-700 max-h-[92dvh] overflow-y-auto">
        <div className="font-semibold text-gold-400">Survei & Kalibrasi Titik K5</div>
        <div className="font-mono space-y-1">
          <div className="text-earth-400">Kursor: {cursor ? formatCoord(cursor[0], cursor[1]) : '-'}</div>
          <div className={clicked ? 'text-gold-400' : 'text-earth-400'}>
            Titik Aktif: {clicked ? formatCoord(clicked[0], clicked[1]) : '-'}
          </div>
          {gpsAccuracy !== null && (
            <div className="text-islam-500">Akurasi GPS: ±{gpsAccuracy} m</div>
          )}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={handleGetGps}
            disabled={gpsLoading}
            className="flex-1 bg-islam-600 hover:bg-islam-700 text-white py-1.5 px-2 rounded transition-colors disabled:opacity-50"
          >
            {gpsLoading ? 'Mencari GPS...' : 'Ambil GPS'}
          </button>
          {clicked && (
            <button
              onClick={handleCopy}
              className="flex-1 bg-earth-700 hover:bg-earth-600 text-white py-1.5 px-2 rounded transition-colors"
            >
              {copied ? 'Tersalin!' : 'Salin [lat,lng]'}
            </button>
          )}
        </div>

        <hr className="border-earth-700" />

        <div className="space-y-1.5">
          <label className="block text-earth-300">Klaster Zona Alun-Alun</label>
          <select
            value={clusterName}
            onChange={(e) => setClusterName(e.target.value)}
            className="w-full bg-earth-800 border border-earth-700 rounded px-2 py-1.5 text-white"
          >
            {CLUSTER_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="block text-earth-300">Jenis Tong Sampah</label>
          <select
            value={binType}
            onChange={(e) => setBinType(e.target.value)}
            className="w-full bg-earth-800 border border-earth-700 rounded px-2 py-1.5 text-white"
          >
            {BIN_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="block text-earth-300">Patokan Lokasi (landmark_hint)</label>
          <input
            type="text"
            value={landmarkHint}
            onChange={(e) => setLandmarkHint(e.target.value)}
            placeholder="Contoh: Sebelah timur Menara Pandang..."
            className="w-full bg-earth-800 border border-earth-700 rounded px-2 py-1.5 text-white placeholder:text-earth-500"
          />

          <button
            onClick={handleSaveDraft}
            className="w-full bg-gold-500 hover:bg-gold-400 text-earth-900 font-semibold py-1.5 px-2 rounded transition-colors"
          >
            Simpan Titik ke Draft ({draftBins.length})
          </button>

          <div className="flex gap-1.5">
            <button
              onClick={handleCopyDraftJson}
              className="flex-1 bg-earth-700 hover:bg-earth-600 text-white py-1.5 px-2 rounded transition-colors"
            >
              {jsonCopied ? 'JSON Tersalin!' : 'Salin JSON'}
            </button>
            {draftBins.length > 0 && (
              <button
                onClick={() => setDraftBins([])}
                className="bg-red-800 hover:bg-red-700 text-white py-1.5 px-2 rounded transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layer toggles - kiri atas */}
      <div className="fixed top-3 left-3 z-[10000] bg-earth-900/85 text-white p-3 rounded-lg text-sm backdrop-blur-sm">
        <div className="text-earth-400 text-xs mb-2">Lapisan</div>
        {CATEGORIES.map(({ key, label, color }) => (
          <label key={key} className="flex items-center gap-2 py-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={visible[key]}
              onChange={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
              className="accent-current"
              style={{ accentColor: color }}
            />
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span>
              {label}{' '}
              <span className="text-earth-500">({(data[key] as unknown[]).length})</span>
            </span>
          </label>
        ))}
      </div>

      {/* Detail panel - kiri bawah */}
      {selected && (
        <div className="fixed bottom-3 left-3 z-[10000] bg-earth-900/90 text-white p-4 rounded-lg text-sm backdrop-blur-sm max-w-sm max-h-72 overflow-y-auto">
          <div className="flex justify-between items-start mb-2">
            <span className="text-earth-400 text-xs">{selected.category}</span>
            <button
              onClick={() => setSelected(null)}
              className="text-earth-500 hover:text-white text-xs ml-4"
            >
              Tutup
            </button>
          </div>
          <div className="font-semibold mb-2">{itemName(selected.item)}</div>
          <pre className="text-xs text-earth-300 whitespace-pre-wrap break-all">
            {JSON.stringify(selected.item, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
