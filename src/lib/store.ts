import { create } from 'zustand';
import { AppSettings, DEFAULT_SETTINGS, WeaponId, WEAPONS } from './constants';

// ===== APP-LEVEL STORE =====
// Screen routing + persistent settings + chosen class + GLB blob.

export type Screen = 'loading' | 'menu' | 'class' | 'settings' | 'viewer' | 'game' | 'gameover' | 'victory';

interface AppState {
  screen: Screen;
  setScreen: (s: Screen) => void;

  classId: string | null;
  setClass: (id: string) => void;

  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;

  glbUrl: string | null;
  setGlbUrl: (url: string | null) => void;

  // Last-run results (filled when game ends)
  lastResult: GameResult | null;
  setLastResult: (r: GameResult) => void;
}

export interface GameResult {
  win: boolean;
  reason: string;
  score: number;
  time: number;
  kills: number;
  wave: number;
  bestCombo: number;
}

const SETTINGS_KEY = 'gokboru_settings_v1';
function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return DEFAULT_SETTINGS; }
}
function saveSettings(s: AppSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

export const useApp = create<AppState>((set, get) => ({
  screen: 'loading',
  setScreen: (s) => set({ screen: s }),

  classId: null,
  setClass: (id) => set({ classId: id }),

  settings: loadSettings(),
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    saveSettings(next);
    set({ settings: next });
  },

  glbUrl: null,
  setGlbUrl: (url) => set({ glbUrl: url }),

  lastResult: null,
  setLastResult: (r) => set({ lastResult: r }),
}));

// ===== GAME STORE (per-run, HUD-facing) =====
// Mirror of in-game state that the HUD subscribes to.

interface GameUiState {
  hp: number;
  hpMax: number;
  energy: number;
  energyMax: number;
  tengri: number;
  tengriMax: number;
  score: number;
  time: number;       // seconds elapsed
  wave: number;
  enemiesAlive: number;
  combo: number;
  bestCombo: number;
  weapon: WeaponId;
  ammo: number;
  fps: number;
  paused: boolean;
  defenseHeld: boolean;
  // toasts (transient)
  toast: { id: number; text: string; kind: 'info' | 'good' | 'warn' } | null;
  damageFlash: number; // timestamp ms of last flash
  killfeed: { id: number; text: string }[];
  cooldowns: { attack: number; defense: number; special: number };

  setHp: (v: number, max?: number) => void;
  setEnergy: (v: number, max?: number) => void;
  setTengri: (v: number, max?: number) => void;
  setScore: (v: number) => void;
  setTime: (v: number) => void;
  setWave: (v: number) => void;
  setEnemiesAlive: (v: number) => void;
  setCombo: (v: number) => void;
  setBestCombo: (v: number) => void;
  setWeapon: (w: WeaponId, ammo?: number) => void;
  setAmmo: (n: number) => void;
  setFps: (v: number) => void;
  setPaused: (b: boolean) => void;
  setDefenseHeld: (b: boolean) => void;
  setCooldowns: (c: Partial<GameUiState['cooldowns']>) => void;
  showToast: (text: string, kind?: 'info' | 'good' | 'warn') => void;
  flashDamage: () => void;
  addKill: (text: string) => void;
  resetForRun: (hpMax: number, energyMax: number) => void;
}

let toastCounter = 0;
let killCounter = 0;

export const useGameUi = create<GameUiState>((set) => ({
  hp: 100, hpMax: 100,
  energy: 100, energyMax: 100,
  tengri: 100, tengriMax: 100,
  score: 0, time: 0, wave: 1, enemiesAlive: 0,
  combo: 0, bestCombo: 0,
  weapon: 'fist', ammo: Infinity,
  fps: 60, paused: false, defenseHeld: false,
  toast: null,
  damageFlash: 0,
  killfeed: [],
  cooldowns: { attack: 0, defense: 0, special: 0 },

  setHp: (v, max) => set((s) => ({ hp: Math.max(0, v), hpMax: max ?? s.hpMax })),
  setEnergy: (v, max) => set((s) => ({ energy: Math.max(0, v), energyMax: max ?? s.energyMax })),
  setTengri: (v, max) => set((s) => ({ tengri: Math.max(0, v), tengriMax: max ?? s.tengriMax })),
  setScore: (v) => set({ score: v }),
  setTime: (v) => set({ time: v }),
  setWave: (v) => set({ wave: v }),
  setEnemiesAlive: (v) => set({ enemiesAlive: v }),
  setCombo: (v) => set({ combo: v }),
  setBestCombo: (v) => set({ bestCombo: v }),
  setWeapon: (w, ammo) => set({ weapon: w, ammo: ammo ?? WEAPONS[w].ammo }),
  setAmmo: (n) => set({ ammo: n }),
  setFps: (v) => set({ fps: v }),
  setPaused: (b) => set({ paused: b }),
  setDefenseHeld: (b) => set({ defenseHeld: b }),
  setCooldowns: (c) => set((s) => ({ cooldowns: { ...s.cooldowns, ...c } })),
  showToast: (text, kind = 'info') => set({ toast: { id: ++toastCounter, text, kind } }),
  flashDamage: () => set({ damageFlash: performance.now() }),
  addKill: (text) => set((s) => {
    const next = [{ id: ++killCounter, text }, ...s.killfeed].slice(0, 4);
    return { killfeed: next };
  }),
  resetForRun: (hpMax, energyMax) => set({
    hp: hpMax, hpMax, energy: energyMax, energyMax, tengri: 100, tengriMax: 100,
    score: 0, time: 0, wave: 1, enemiesAlive: 0,
    combo: 0, bestCombo: 0, weapon: 'fist', ammo: Infinity,
    paused: false, defenseHeld: false, killfeed: [],
    cooldowns: { attack: 0, defense: 0, special: 0 },
  }),
}));

// ===== INPUT STORE (joystick + buttons -> game loop) =====
interface InputState {
  moveX: number;
  moveY: number;
  attackPressed: number;   // increment counter on press
  specialPressed: number;
  defenseDown: boolean;
  pausePressed: number;
  setMove: (x: number, y: number) => void;
  pressAttack: () => void;
  pressSpecial: () => void;
  setDefense: (b: boolean) => void;
  pressPause: () => void;
}

export const useInput = create<InputState>((set) => ({
  moveX: 0, moveY: 0,
  attackPressed: 0, specialPressed: 0, defenseDown: false, pausePressed: 0,
  setMove: (x, y) => set({ moveX: x, moveY: y }),
  pressAttack: () => set((s) => ({ attackPressed: s.attackPressed + 1 })),
  pressSpecial: () => set((s) => ({ specialPressed: s.specialPressed + 1 })),
  setDefense: (b) => set({ defenseDown: b }),
  pressPause: () => set((s) => ({ pausePressed: s.pausePressed + 1 })),
}));
