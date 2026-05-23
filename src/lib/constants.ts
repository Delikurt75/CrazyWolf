// ===== GAME CONSTANTS =====
// Tek bir merkez: oyun ayarları, sınıflar, silahlar, düşman tipleri.
// İleride online PvP eklenecekse buradaki tanımlar shared paket olarak ayrılabilir.

export type Quality = 'low' | 'medium' | 'high';

export interface AppSettings {
  quality: Quality;
  joystickSize: number;
  buttonSize: number;
  camDistance: number;
  sfx: boolean;
  music: boolean;
  autoPerf: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  quality: 'medium',
  joystickSize: 160,
  buttonSize: 100,
  camDistance: 11,
  sfx: true,
  music: true,
  autoPerf: true,
};

export const QUALITY_PRESETS = {
  low: { pixelRatio: 0.75, shadows: false, maxEnemies: 6, fog: 0.06 },
  medium: { pixelRatio: 1.0, shadows: true, maxEnemies: 10, fog: 0.05 },
  high: { pixelRatio: Math.min(window.devicePixelRatio, 2), shadows: true, maxEnemies: 16, fog: 0.04 },
} as const;

// ===== CLASSES =====
export interface PlayerClass {
  id: string;
  name: string;
  icon: string;
  color: string;
  hp: number;
  speed: number;
  energy: number;
  meleeMult: number;
  rangedMult: number;
  bonus: string;
  desc: string;
}

export const CLASSES: Record<string, PlayerClass> = {
  savasci: {
    id: 'savasci',
    name: 'SAVAŞÇI',
    icon: '⚔️',
    color: '#e53935',
    hp: 160,
    speed: 4.4,
    energy: 120,
    meleeMult: 1.4,
    rangedMult: 1.0,
    bonus: 'Yakın dövüş +40%, Can +60',
    desc: 'Ağır zırhlı kalın kollu Tengri savaşçısı.',
  },
  gecekurdu: {
    id: 'gecekurdu',
    name: 'GECE KURDU',
    icon: '🐺',
    color: '#7b1fa2',
    hp: 110,
    speed: 5.8,
    energy: 130,
    meleeMult: 1.55,
    rangedMult: 1.1,
    bonus: 'Hız +35%, Bıçak +55%',
    desc: 'Hızlı ve ölümcül kurt ruhu taşıyıcısı.',
  },
  tetikci: {
    id: 'tetikci',
    name: 'TETİKÇİ',
    icon: '🎯',
    color: '#1565c0',
    hp: 100,
    speed: 4.8,
    energy: 140,
    meleeMult: 0.85,
    rangedMult: 1.55,
    bonus: 'Tabanca +55%, Enerji +20',
    desc: 'Uzak mesafe uzmanı, hassas nişancı.',
  },
};

// ===== WEAPONS =====
export type WeaponType = 'melee' | 'ranged';
export type WeaponId = 'fist' | 'knife' | 'pistol' | 'sword';

export interface Weapon {
  id: WeaponId;
  name: string;
  icon: string;
  type: WeaponType;
  minDmg: number;
  maxDmg: number;
  range: number;
  cooldown: number; // seconds
  ammo: number;     // Infinity for melee
  maxAmmo: number;
  reloadTime: number;
}

export const WEAPONS: Record<WeaponId, Weapon> = {
  fist:   { id:'fist',   name:'Yumruk',  icon:'👊', type:'melee',  minDmg:14, maxDmg:22, range:2.0, cooldown:0.35, ammo:Infinity, maxAmmo:Infinity, reloadTime:0 },
  knife:  { id:'knife',  name:'Bıçak',   icon:'🔪', type:'melee',  minDmg:26, maxDmg:38, range:2.5, cooldown:0.28, ammo:Infinity, maxAmmo:Infinity, reloadTime:0 },
  pistol: { id:'pistol', name:'Tabanca', icon:'🔫', type:'ranged', minDmg:32, maxDmg:50, range:18,  cooldown:0.42, ammo:12, maxAmmo:12, reloadTime:1.3 },
  sword:  { id:'sword',  name:'Kılıç',   icon:'⚔️',  type:'melee',  minDmg:42, maxDmg:62, range:3.4, cooldown:0.55, ammo:Infinity, maxAmmo:Infinity, reloadTime:0 },
};

// ===== ENEMIES =====
export type EnemyType = 'guard' | 'heavy' | 'shaman' | 'boss';

export interface EnemyDef {
  type: EnemyType;
  hp: number;
  speed: number;
  attackRange: number;
  attackDmg: number;
  attackCd: number;
  score: number;
  scale: number;
  color: string;
  accent: string;
}

export const ENEMY_DEFS: Record<EnemyType, EnemyDef> = {
  guard:  { type:'guard',  hp:80,  speed:2.8, attackRange:1.8, attackDmg:8,  attackCd:1.2, score:100,  scale:1.0,  color:'#3d2814', accent:'#7a5436' },
  heavy:  { type:'heavy',  hp:170, speed:2.0, attackRange:2.2, attackDmg:15, attackCd:1.5, score:220,  scale:1.25, color:'#241a14', accent:'#8a6644' },
  shaman: { type:'shaman', hp:90,  speed:2.4, attackRange:9,   attackDmg:12, attackCd:1.6, score:180,  scale:1.05, color:'#3b1554', accent:'#a45fd1' },
  boss:   { type:'boss',   hp:650, speed:2.6, attackRange:2.8, attackDmg:24, attackCd:1.2, score:1500, scale:1.7,  color:'#1a0524', accent:'#d138ff' },
};

// ===== ARENA (single arena prototype) =====
// İleride çoklu odalara genişletilebilir. Şimdilik tek bozkır arenası.
export interface ArenaTheme {
  name: string;
  groundColor: number;
  fogColor: number;
  fogDensity: number;
  ambient: number;
  sunColor: number;
  sunIntensity: number;
}

export const ARENA: ArenaTheme = {
  name: 'Tengri Bozkırı',
  groundColor: 0x5a4628,
  fogColor: 0x1a2540,
  fogDensity: 0.022,
  ambient: 0x556688,
  sunColor: 0xffd9aa,
  sunIntensity: 1.05,
};

export const ARENA_RADIUS = 28;

// ===== WAVE SYSTEM =====
export interface WaveDef {
  count: number;
  types: EnemyType[];
  delay: number;
}

export function getWave(n: number): WaveDef {
  // Progressive: more enemies, harder mix
  if (n === 1) return { count: 3, types: ['guard'], delay: 1.5 };
  if (n === 2) return { count: 4, types: ['guard', 'guard', 'shaman'], delay: 1.4 };
  if (n === 3) return { count: 5, types: ['guard', 'heavy', 'shaman'], delay: 1.3 };
  if (n === 4) return { count: 6, types: ['guard', 'heavy', 'shaman', 'heavy'], delay: 1.2 };
  if (n === 5) return { count: 1, types: ['boss'], delay: 0.5 };
  // After boss: endless escalating
  const ramp = Math.min(2 + Math.floor((n - 5) * 1.5), 10);
  return { count: ramp, types: ['guard', 'heavy', 'shaman', 'heavy', 'guard'], delay: Math.max(0.7, 1.4 - (n - 5) * 0.1) };
}
