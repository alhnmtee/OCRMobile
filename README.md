# OCR Mobile

OCR Mobile, belgeleri mobil cihaz kamerası ile tarayıp OCR teknolojisi ile metne dönüştüren, belgeleri yerel ve bulut depolama sistemlerinde saklayan, kullanıcılar arası paylaşım yapabilen ve bildirim gönderebilen kapsamlı bir mobil uygulamadır.

## 🚀 Proje Özellikleri

### Storage / Basic Data
Proje, app-specific ve shared kullanıma yönelik dosya sistemi uygulamaları içerir:
* StorageService ile dosya sistemi yönetimi
* AsyncStorage ile temel veri saklama
* Belge metadatalarının yerel depolanması
* Kullanıcı tercihlerinin yönetimi

### Local Database
Uygulama, birbiriyle ilişkili tablolar içeren bir veritabanı yapısı kullanır:
* Document: Belge bilgileri
* Tag: Belge etiketleri
* Share: Paylaşım kayıtları
* DocumentTag: Belge-etiket ilişkileri

### RESTful API
Kullanıcı yönetimi ve kimlik doğrulama için REST API entegrasyonu:
* JWT tabanlı kimlik doğrulama
* Kullanıcı kaydı ve girişi
* Belge paylaşım servisleri

### UI
Modern ve kullanıcı dostu arayüz:
* Belge tarama ekranı
* Belge listeleme ve yönetim ekranı
* OCR sonuç görüntüleme
* Paylaşım arayüzü

### Background Process
Arka plan işlemleri yönetimi:
* OCR işlemlerinin arka planda yürütülmesi
* Belge senkronizasyonu
* Bildirim yönetimi

### Broadcast Receiver
Sistem olaylarını ve uygulama bildirimlerini yönetme:
* Push notification altyapısı
* Belge değişiklik kontrolü
* Bağlantı durumu takibi

### Sensor
Cihaz sensörlerinin kullanımı:
* Kamera sensörü entegrasyonu
* Belge tarama optimizasyonu

### Connectivity
Çeşitli bağlantı yöntemleri:
* Bluetooth ile belge paylaşımı
* WiFi üzerinden senkronizasyon
* Cellular Network desteği

### Authorization
Güvenli kimlik doğrulama sistemi:
* JWT tabanlı yetkilendirme
* Kullanıcı oturum yönetimi
* Güvenli belge paylaşımı

### Cloud Service
Bulut tabanlı hizmetler:
* Hugging Face AI entegrasyonu
* OCR metin analizi
* Belge açıklamaları oluşturma

## 🛠️ Kurulum

### Gereksinimler
* Node.js (v14 veya üzeri)
* React Native CLI
* Android Studio (Android geliştirme için)
* Xcode (iOS geliştirme için)
* Firebase hesabı
* Hugging Face API anahtarı

### Geliştirme Ortamı Kurulumu

1. React Native ortamının kurulumu:
```bash
npm install -g react-native-cli
```

2. Projeyi klonlama:
```bash
git clone https://github.com/alhnmtee/OCRMobile
cd OCRMobile
```

3. Bağımlılıkların yüklenmesi:
```bash
npm install
```

4. iOS için pod kurulumu:
```bash
cd ios
pod install
cd ..
```

5. Ortam değişkenlerinin ayarlanması:
   * `.env` dosyası oluşturun
   * Gerekli API anahtarlarını ekleyin

### Android Kurulumu
1. Android Studio'yu açın
2. SDK Manager'dan gerekli SDK'ları yükleyin
3. Bir Android Emulator oluşturun
4. Projeyi çalıştırın:
```bash
npm run android
```

### iOS Kurulumu
1. Xcode'u açın
2. iOS Simulator'ü başlatın
3. Projeyi çalıştırın:
```bash
npm run ios
```