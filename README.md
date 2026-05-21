# CrazyWolf: AI-Driven Cinematic Prompt Guide

Bu proje, Gemini, GPT ve Flow/Veo 3.1 gibi generatif araçlarla profesyonel sinematik film ve dizi fragmanları üretmek isteyen ekipler için pratik bir prompt kılavuzu sunar. Amacınız ister arkadaşlarınızla sahneler kurmak ister reklam filmi oluşturmak olsun, burada verilen adımlar ve şablonlar hızlıca işe koyulmanıza yardımcı olur.

## Genel Akış
1. **Varlıkları hazırlayın:**
   - Kullanmak istediğiniz 3 referans görseli (karakter veya mekan) yüksek çözünürlüklü olarak toplayın.
   - İsimler, karakter ilişkileri, ton (drama/aksiyon/komedi) ve hedef süre (örn. 45 saniye fragman) gibi temel bilgileri belirleyin.
2. **Senaryo ve prompt tasarımı:**
   - Aşağıdaki senaryo ve sahne prompt şablonlarını Gemini veya GPT'ye vererek metin çıktıları üretin.
   - Karakter görsellerini "image conditioning" olarak ekleyerek yüz tutarlılığını koruyun.
3. **Sahne/sahneler için kareler üretin:**
   - Promptları, referans görselleriyle birlikte Flow/Veo 3.1'e göndererek kareler veya kısa klipler üretin.
4. **Video düzenleme:**
   - Üretilen kareleri video editörüne aktarın, ses/müzik ekleyin ve final montajı yapın.

## Örnek Senaryo Promptu (Gemini/GPT)
Bu şablon tam senaryo, duygu tonu ve tempo için optimize edilmiştir. Köşeli parantezleri kendi bilgilerinizle değiştirin:

```
Profesyonel sinematik fragman yazarı gibi davran. Türkçe yaz. Şu bilgilerle 45 saniyelik fragman senaryosu oluştur:
- Ton: [dramatik/aksiyon/komedi]
- Ortam: [şehir gece yağmur/sahra çölü/deniz kenarı]
- Karakterler: [İsim1] ([kısa tanım]) ve [İsim2] ([kısa tanım])
- Temel çatışma: [ör: ihanetin intikamı, kayıp kardeşin aranması]
- Üç perde: giriş (5-10 sn), yükseliş (20-25 sn), doruk (10-15 sn)
- Ses: tempolu trailer müziği, kritik anda kısa sessizlik, son cümlede güçlü replik

Çıktı formatı:
1) 6-8 shotlık kronolojik liste: her shot için süre, ortam, aksiyon, duygu.
2) İmza replik: 1 cümle.
3) Ses/müzik notu: 2-3 cümle.
4) Renk ve ışık: LUT/renk önerisi ve ışık karakteri.
```

## Örnek Sahne Promptu (Flow/Veo 3.1)
Senaryodaki her shot için aşağıdaki promptu kullanın; 3 görseli "image input" olarak ekleyin:

```
Üç referans görseldeki yüzleri koru. Sinemaskop, sinematik kontrast. Shot: [örn. gece yağmurlu sokak, neon ışıkları].
Kamera: [örn. geniş açı, yavaş kaydırma, steadycam].
Aksiyon: [örn. iki karakter gergin bakışıyor, su birikintisine düşen silahın yakın planı].
Işık: [örn. mavi-neon rim light + turuncu fill].
Renk: [örn. teal-orange, hafif film grain].
Çerçeve: [örn. 2.39:1, 4K, 24fps], motion blur doğal.
```

### Yüz Tutarlılığı İpuçları
- Karakter görsellerini her shot'a ek olarak bağla; gerekirse "keep identity from image X" talimatını yaz.
- Sahne bazında kıyafet ve aksesuar notlarını prompta ekleyerek değişkenliği azalt.
- Farklı arka planlar için aynı ışık tarifini kullanmak tutarlılık sağlar.

### Ses ve Diyalog
- Metin tabanlı diyaloğu GPT'den isterken her repliğin hangi shot'a ait olduğunu belirtin.
- Son montajda ses tasarımını (fırtına, motor sesi, kalp atışı) shot listesine göre yerleştirin.

## Reklam veya Sosyal Video İçin Hızlı Şablon
```
Marka: [ürün/servis]
Mesaj: [tek cümle]
Hedef kitle: [18-25 oyun/teknoloji meraklısı]
Ton: [enerjik/minimalist/samimi]
Süre: 20 sn, 5 shot.
CTA: [hemen indir/şimdi dene]

Her shot için: ürün sahnesi + karakter etkileşimi + net logo. Işık: temiz, yüksek kontrast. Renk: marka renk paleti.
```

## Kontrol Listesi
- [ ] 3 referans görsel yüklendi mi?
- [ ] Senaryo promptu güncellendi mi (ton, ortam, çatışma)?
- [ ] Her shot için kamera ve ışık talimatı eklendi mi?
- [ ] Ses/müzik notu yazıldı mı?
- [ ] Flow/Veo 3.1 çıktılarını video editörüne aktardınız mı?

## Sorun Giderme
- **Karakter benzemiyor:** Görselleri daha yüksek çözünürlükle verin, "identity lock" veya "match facial structure" gibi açık komutlar ekleyin.
- **Işık dağılıyor:** Işık tarifi için 1-2 cümleyle sınırlı kalın ve her shot'ta aynı terimleri kullanın.
- **Aksiyon donuk:** Kameraya hareket (dolly in/out, pan, tilt) ve çevresel efekt (yağmur, sis, toz) ekleyin.
- **Renk uyuşmuyor:** Tek bir LUT veya renk paleti tanımlayın, "consistent grade" notu ekleyin.

Bu kılavuz, ekiplerin yüklenen görsellerle kısa sürede profesyonel fragman ve reklam tasarlamasını kolaylaştırır. İyi çekimler!

## YARA Analizi ve GPT ile Kural Oluşturma
Güvenlik odaklı projeler için kötü amaçlı yazılım tespiti yapmanız gerekiyorsa, GPT'yi YARA kuralı üretimi ve statik artefakt analizi için de kullanabilirsiniz. Aşağıdaki akış, herkesin uygulayabileceği pratik adımlar ve hazır prompt şablonları içerir.

### Hızlı Akış
1. **Örnekleri topla:** SHA256 hash, dosya adı, paket adı veya kısmi hex/strings parçalarını not alın.
2. **Artefaktları ayıkla:** `strings`, `objdump`, `exiftool` veya benzeri araçlarla temel metin/metadata çıkarın; GPT'ye özetletmek için temiz bir liste hazırlayın.
3. **GPT'ye özetlet:** Aşağıdaki "Artefakt Özeti" promptunu kullanarak davranış ve göstergeleri çıkartın.
4. **YARA kuralı oluştur:** "YARA Kural Taslağı" promptuyla kural gövdesini yazdırın; hedeflediğiniz platformu (PE, ELF, APK) belirtin.
5. **Test et:** `yarac` ile derle, `yara` ile temiz ve enfekte örneklerde çalıştır; yanlış pozitif/negatifleri not al.
6. **İyileştir:** Eşik değerleri, strings listesi ve koşulları GPT'ye geri vererek yeni sürüm isteyin.

### Artefakt Özeti (GPT Promptu)
```
Siber güvenlik analisti gibi davran. Aşağıdaki verilerden hangi göstergeler (API çağrıları, sabit URL/IP, RC4 key, mutex adı, paket adı, zip yorumları) dikkat çekiyor? Kısaca listele.

Dosya türü: [PE/ELF/APK/Office]
Hash: [SHA256]
Extracted strings (kırpılmış):
- ...
- ...
Metadata (varsa):
- İmza/sertifika: ...
- Section isimleri: ...
- İlginç karakteristik: ...
```

### YARA Kural Taslağı (GPT Promptu)
```
Deneyimli YARA kuralı yazarı gibi davran. Aşağıdaki göstergelere göre yüksek sinyalli, az yanlış-pozitif veren bir kural öner:
- Dosya türü: [PE/ELF/APK]
- Hedef aile/tema: [örn. info-stealer, clipper, bankacılık trojan]
- Ayırt edici strings: [liste]
- Entropi/sektion ipuçları: [.text/.rdata boyutları, overlay, UPX vb.]
- Davranış: [örn. clipboard hook, crypto address replace]

Kurallar:
1) Strings bölümüne anlamlı isimler ver (s1, s2 yerine api_http, wallet_regex).
2) Case sensitivity ve wide/ascii bayraklarını uygun kullan.
3) Condition kısmında dosya tipi kontrolü (pe, elf, apk), section boyutları veya imports kombinasyonu ekle.
4) Gerekiyorsa sabit byte imzası için hexa ekle.
5) Ekstra: false positive azaltmak için minimum eşleşme sayısı veya `pe.imports` kontrolleri ekle.

Çıktı formatı:
- Kısa açıklama (1-2 cümle)
- YARA kuralı (tam blok)
- Test notları: hangi göstergeler kritik, neyin esnetilebileceği.
```

### Örnek YARA Kuralı
```
rule Stealer_X_Telemetry_v1 {
    meta:
        description = "Clipboard stealer with hardcoded BTC regex and telemetry URL"
        author = "team"
        date = "2024-06-30"
        reference = "internal triage"

    strings:
        $wallet_regex = /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/ ascii
        $telemetry_url = "https://api.example-sync[.]com/v2/collect" ascii nocase
        $user_agent    = "curl/7." ascii
        $mutex         = "Global\\CLIP_MONITOR" ascii wide
        $hex_sig       = { 55 8B EC 83 EC 10 53 56 57 8B F1 8B 46 04 }

    condition:
        uint16(0) == 0x5A4D and // PE
        pe.imphash() != "" and
        2 of ($wallet_regex, $telemetry_url, $user_agent, $mutex) and
        $hex_sig and
        pe.number_of_sections >= 4 and
        filesize < 800KB
}
```

### Test ve İyileştirme İpuçları
- **Derleme:** `yarac rule.yar test.yarc` ile sentaks kontrolü yapın.
- **Örnek üzerinde deneme:** `yara -r rule.yar samples/` komutuyla hem temiz hem zararlı örneklerde tarama yapın.
- **Yanlış pozitif azaltma:** Çok genel string'leri ("HTTP/1.1", "Mozilla") kaldırın, daha spesifik regex veya hex imzalar ekleyin.
- **Performans:** Büyük dosyalarda yalnızca gerekli section'ları kontrol eden koşullar kullanın; yorum satırı ekleyerek sebebini belirtin.
- **Dokümantasyon:** Meta alanında versiyon, tarih ve referansları güncel tutun; takım içi paylaşımda değişiklikleri notlayın.

Bu bölüm, GPT ile YARA kuralı üretmek isteyen herkesin hızlıca analiz yapıp paylaşılabilir, bakım yapılabilir kurallar oluşturmasına yardımcı olur.
