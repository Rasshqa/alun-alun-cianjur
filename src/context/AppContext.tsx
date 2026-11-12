import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

function loadQuest(): QuestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultQuest, ...JSON.parse(raw) } : { ...defaultQuest };
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
    setQuestState((prev) => {
      const next = { ...prev, ...partial, last_active_timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questState));
  }, [questState]);

  return (
    <AppContext value={{
      activeTab,
      setActiveTab,
      questState,
      updateQuest,
      mapFocus,
      setMapFocus,
      parkStatus: data.app_config,
    }}>
      {children}
    </AppContext>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
