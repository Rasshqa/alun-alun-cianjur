import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import data from '../data/cianjur-data.json';

export type TabId = 'peta' | 'sejarah' | 'kuliner' | 'hotel' | 'panduan' | 'misi';

export interface QuestState {
  visitor_nickname: string;
  entry_gate: string;
  total_xp: number;
  completed_missions: string[];
  trash_checkins_count: number;
  last_trash_bin_id: string;
  unlocked_badges: string[];
  certificate_claimed: boolean;
  last_active_timestamp: number;
}

export interface MapFocus {
  coords: [number, number];
  zoom: number;
  routeId?: string;
  layer?: 'all' | 'heritage' | 'trash' | 'toilet' | 'culinary' | 'hotel';
}

interface AppContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  questState: QuestState;
  updateQuest: (partial: Partial<QuestState>) => void;
  mapFocus: MapFocus | null;
  setMapFocus: (focus: MapFocus | null) => void;
  parkStatus: typeof data.app_config;
}

const STORAGE_KEY = 'cianjur_quest_v1';

const defaultQuest: QuestState = {
  visitor_nickname: '',
  entry_gate: '',
  total_xp: 0,
  completed_missions: [],
  trash_checkins_count: 0,
  last_trash_bin_id: '',
  unlocked_badges: [],
  certificate_claimed: false,
  last_active_timestamp: 0,
};

function sanitizeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return Array.from(
    new Set(val.filter((item): item is string => typeof item === 'string' && item.length <= 100)),
  );
}

function loadQuest(): QuestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultQuest };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...defaultQuest };
    }
    const rec = parsed as Record<string, unknown>;
    return {
      visitor_nickname:
        typeof rec.visitor_nickname === 'string' ? rec.visitor_nickname.slice(0, 50) : '',
      entry_gate: typeof rec.entry_gate === 'string' ? rec.entry_gate.slice(0, 60) : '',
      total_xp:
        typeof rec.total_xp === 'number' && Number.isFinite(rec.total_xp) && rec.total_xp >= 0
          ? Math.min(rec.total_xp, 5000)
          : 0,
      completed_missions: sanitizeStringArray(rec.completed_missions),
      trash_checkins_count:
        typeof rec.trash_checkins_count === 'number' &&
        Number.isFinite(rec.trash_checkins_count) &&
        rec.trash_checkins_count >= 0
          ? Math.floor(rec.trash_checkins_count)
          : 0,
      last_trash_bin_id:
        typeof rec.last_trash_bin_id === 'string' ? rec.last_trash_bin_id.slice(0, 30) : '',
      unlocked_badges: sanitizeStringArray(rec.unlocked_badges),
      certificate_claimed: Boolean(rec.certificate_claimed),
      last_active_timestamp:
        typeof rec.last_active_timestamp === 'number' && Number.isFinite(rec.last_active_timestamp)
          ? rec.last_active_timestamp
          : 0,
    };
  } catch {
    return { ...defaultQuest };
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>('peta');
  const [questState, setQuestState] = useState(loadQuest);
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);

  const updateQuest = useCallback((partial: Partial<QuestState>) => {
    setQuestState((prev) => ({
      ...prev,
      ...partial,
      visitor_nickname:
        typeof partial.visitor_nickname === 'string'
          ? partial.visitor_nickname.slice(0, 50)
          : prev.visitor_nickname,
      last_active_timestamp: Date.now(),
    }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questState));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [questState]);

  const contextValue = useMemo<AppContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      questState,
      updateQuest,
      mapFocus,
      setMapFocus,
      parkStatus: data.app_config,
    }),
    [activeTab, questState, updateQuest, mapFocus],
  );

  return <AppContext value={contextValue}>{children}</AppContext>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
