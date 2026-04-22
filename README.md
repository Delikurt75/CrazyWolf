# CrazyWolf — Filozof AI

ChatGPT Voice/Vision moduna benzer, **sesli + görüntülü** bir felsefi sohbet
uygulaması. Kameranı ve mikrofonunu kullanarak Sokrates, Platon, Kant,
Marcus Aurelius, Wittgenstein ve diğer 18 filozofun harmanlanmış bakış
açısıyla diyalog kurarsın.

Backend: **FastAPI (Python)** · AI: **Google Gemini 2.0 Flash (ücretsiz)** ·
Ses: tarayıcı **Web Speech API** · Vision: kullanıcının kamerası.

## Özellikler

- Mikrofonla konuşma → AI dinler → sesli cevap verir (tr-TR).
- Kameradan görüntü → AI ortamı/nesneleri felsefi bağlamda yorumlar.
- 18 filozofun persona'sı + "Farz Et → Sorgula → Derin Düşün → Karşı-Argüman
  → İyileştir" içsel düşünme protokolü.
- Feedback döngüsünü önleyen akıllı mikrofon yönetimi (AI konuşurken dinleme
  durur).
- Ücretsiz kota: Gemini free tier (dakikada 15 / günde 1500 istek).

## Kurulum

### 1. Depoyu klonla

```bash
git clone https://github.com/delikurt75/crazywolf.git
cd crazywolf
```

### 2. Python sanal ortam + bağımlılıklar

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Gemini API anahtarı al (ücretsiz)

1. <https://aistudio.google.com/apikey> adresine git (Google hesabıyla giriş).
2. "Create API key" → anahtarı kopyala.
3. `.env.example` dosyasını `.env` olarak kopyala ve anahtarı yapıştır:

```bash
cp .env.example .env
# .env içinde: GEMINI_API_KEY=AIza...
```

### 4. Sunucuyu çalıştır

```bash
uvicorn app.main:app --reload --port 8000
```

Tarayıcıda aç: <http://localhost:8000>

> **Önemli:** Chrome veya Edge kullanın. Firefox/Safari'de Web Speech API
> kısıtlıdır. HTTPS (veya localhost) zorunlu — kamera/mikrofon için.

## Kullanım

1. Sayfa açılınca **"Başla"** butonuna bas → kamera ve mikrofon izni ver.
2. Konuşmaya başla. 1.5 saniye sustuğunda cümlen AI'ya gönderilir.
3. AI cevabı hem ekranda yazılır hem sesli okunur.
4. Kameraya bir nesne tutarak "Bu ne ifade eder?" diye sorabilirsin.
5. Sesli mod kapalıyken **"Yazılı mesaj gönder"** butonuyla klavyeden yaz.
6. **"Durdur"** her şeyi kapatır; kamera ve mikrofon serbest bırakılır.

## Deploy (Render.com — ücretsiz)

1. GitHub'a push et.
2. <https://render.com> → "New Web Service" → bu repoyu bağla.
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment: `GEMINI_API_KEY=...`

Alternatif olarak Railway, Fly.io, Deta Space de ücretsiz katmanla kullanılabilir.

## Dizin Yapısı

```
CrazyWolf/
├── app/
│   ├── main.py              # FastAPI + /api/chat endpoint
│   ├── philosophers.py      # 18 filozof + sistem prompt
│   └── gemini_client.py     # Gemini API wrapper (vision + text)
├── static/
│   ├── index.html           # Tek sayfa UI
│   ├── style.css
│   └── app.js               # Kamera + mikrofon + TTS mantığı
├── requirements.txt
├── .env.example
└── README.md
```

## Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| "Kamera erişimi alınamadı" | Tarayıcı adres çubuğundaki kilit simgesine tıklayıp izin ver. |
| "GEMINI_API_KEY tanımlı değil" | `.env` dosyası doğru konumda mı? Anahtar doğru yapıştırıldı mı? |
| "Gemini ücretsiz kota doldu" | Dakikada 15 / günde 1500 limiti aştınız. Bekleyin. |
| AI sesi duyulmuyor | Sistem sesi açık mı? "Sesli mod" toggle'ı aktif mi? |
| Ses tanımıyor | Chrome/Edge kullanın. Firefox desteklemez. |
| AI kendi sesini dinliyor | Kulaklık kullanın — hoparlörden TTS mikrofonu tetikleyebilir. |

## Lisans

MIT — özgürce kullan, çatalla, geliştir.
