# OCR Mobile Application

OCR Mobile, mobil cihazın kamerasını kullanarak belgeleri tarayıp OCR teknolojisi ile metne dönüştüren, belgeleri yerel ve bulut depolama sistemlerinde saklayan, kullanıcılar arası paylaşım yapabilen ve bildirim gönderebilen kapsamlı bir mobil uygulamadır.

## Özellikler

### 1. Storage / Basic Data
- Taranan belgelerin yerel depolamada saklanması
- Dosya sistemi üzerinde uygulama özelinde depolama
- AsyncStorage ile kullanıcı tercihlerinin saklanması

### 2. Local Database (Room / CoreData / Document)
- SQLite veritabanı kullanımı
- Belge metadatalarının saklanması
- İlişkisel tablolar: Documents, Tags, Shares


### 5. Background Process / Task
- OCR işlemlerinin arka planda yürütülmesi
- İşlem süresi takibi
- Performans optimizasyonu

### 6. Broadcast Receiver / NSNotificationCenter
- Push notification altyapısı
- Belge değişiklik kontrolü
- Bluetooth bağlantı durumu bildirimleri

### 7. Sensor (Motion / Location / Environment)
- Kamera sensörü kullanımı
- Belge tarama optimizasyonu

### 8. Connectivity (Bluetooth)
- Bluetooth üzerinden belge paylaşımı
- Cihaz keşfi ve bağlantı yönetimi
- Güvenli veri transferi

### 9. Authorization (OAuth / OpenID / JWT)
- JWT tabanlı kimlik doğrulama
- Güvenli oturum yönetimi


## Kurulum

### Gereksinimler
- Node.js 14 veya üzeri
- React Native CLI
- Android Studio / Xcode
- JDK 11 veya üzeri

### Bağımlılıklar
```bash
npm install