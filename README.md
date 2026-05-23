# Benan Deniz: Gök Börü Savaşı

Mobil odaklı 3D aksiyon oyunu. Tengri / Şamanizm temalı bozkır arenasında dalga dalga gelen düşmanlara karşı savaş.

**Tech stack:** Vite + React + TypeScript + React Three Fiber + Three.js + PWA.

## Geliştirme

```bash
npm install
npm run dev      # localhost:5173
npm run build    # üretim derlemesi → dist/
npm run preview  # build edilmiş sürümü servis et
```

## Mobilde oynamak

1. `npm run build && npm run preview -- --host` ile yerel ağa aç.
2. Telefondan aynı Wi-Fi'da `http://<bilgisayar-ip>:4173` adresine git.
3. Sağ üstten "Ana Ekrana Ekle" → PWA olarak yüklenir, tam ekran açılır.
4. Yatay çevir, oyna.

## Karakter

`public/models/benan.glb` varsayılan karakter (smokinli, iri yapılı). Menüden veya karakter inceleme ekranından kendi GLB/GLTF dosyanızı yükleyebilirsin.

## Kontroller

- **Sol joystick:** Hareket
- **⚔️ SALDIR:** Yakın dövüş / silah ateşle
- **🛡️ SAVUN (basılı tut):** Hasarı %75 azalt, enerji harcar
- **🌀 TENGRİ:** Alan hasarı (35 Tengri enerjisi)
- **⏸ Duraklat**

## Sınıflar

| Sınıf | Bonus |
|-------|-------|
| ⚔️ SAVAŞÇI | Dövüş +40%, +60 Can |
| 🐺 GECE KURDU | Hız +35%, Bıçak +60% |
| 🎯 TETİKÇİ | Tabanca +55%, +20 Enerji |

## Yapı

```
src/
  App.tsx              # ekran yönlendirici
  main.tsx             # giriş noktası
  styles/global.css    # tüm UI stilleri
  lib/                 # constants, store (zustand), audio, fullscreen
  components/          # menü, HUD, joystick, butonlar, ayar, gameover
  game/                # 3D sahne: Game, Arena, PlayerModel, EnemyModel, Effects
public/
  models/benan.glb     # varsayılan karakter
  icons/               # PWA ikonları
```
