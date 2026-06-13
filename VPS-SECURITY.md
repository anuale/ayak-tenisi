# VPS Güvenlik Düzeltmeleri — Adım Adım

Toplam süre: ~30 dakika

---

## NEREDE YAPACAĞIM?

İki yer var:

| Nerede | Ne için | Nasıl erişirim |
|--------|---------|----------------|
| **VPS SSH** (host) | Firewall, SSH ayarları | Terminal: `ssh root@152.53.151.102` |
| **Coolify paneli** (web) | PostgreSQL public port'u kapatma | Tarayıcıda Coolify adresin |

---

## ADIM 1: VPS'e SSH ile bağlan

Bilgisayarında terminal aç ve şunu yaz:

```bash
ssh root@152.53.151.102
```

Şifreni soracak, VPS root şifreni gir.

> **Not:** Coolify'nin web terminal'i host shell'i değil, container shell'idir. Firewall ayarları için gerçek SSH lazım.

---

## ADIM 2: UFW Firewall kur ve çalıştır

Bağlandıktan sonra sırayla şunları yaz:

```bash
# UFW'yi kur (zaten kurulu olabilir, hata vermez)
apt-get update && apt-get install -y ufw

# Varsayılan: gelen tüm trafiği engelle
ufw default deny incoming

# Web portlarını aç (bunlar kapalı olursa site çalışmaz!)
ufw allow 80/tcp
ufw allow 443/tcp

# SSH portunu aç (bunu kapatma yoksa bağlanamazsın!)
ufw allow 22/tcp

# Firewall'u aktifleştir
ufw --force enable

# Ne durumda kontrol et
ufw status numbered
```

Son komutun çıktısı şöyle olmalı:
```
[ 1] 80/tcp     ALLOW IN    Anywhere
[ 2] 443/tcp    ALLOW IN    Anywhere
[ 3] 22/tcp     ALLOW IN    Anywhere
```

Bu adım bittiğinde 8000 (Coolify panel), 5432 (PostgreSQL), 6001, 6002 portları otomatik olarak dışarıya KAPANIR.

---

## ADIM 3: SSH'ı güvenli hale getir (parola girişini kapat)

```bash
# ÖNCE: SSH anahtarınla giriş yapabildiğine emin ol!
# Anahtarın var mı kontrol et:
ls ~/.ssh/authorized_keys

# Eğer dosya boşsa veya yoksa, anahtar oluştur:
# (BUNU KENDİ BİLGİSAYARINDA yap, VPS'te değil!)
# ssh-keygen -t ed25519
# ssh-copy-id root@152.53.151.102

# Yedek al
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Parola girişini kapat
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# SSH servisini yeniden başlat
systemctl restart sshd

# fail2ban kur (brute-force koruması)
apt-get install -y fail2ban
systemctl enable --now fail2ban
```

> **UYARI:** Bu adımdan sonra parola ile SSH girişi çalışMAZ. Sadece SSH anahtarınla giriş yapabilirsin. Anahtarın yoksa bu adımı ATLA.

---

## ADIM 4: Coolify panelinde PostgreSQL portunu kapat

1. Tarayıcıda Coolify paneline git (artık dışarıdan erişemezsin, VPS SSH üzerinden `http://localhost:8000` ile veya Cloudflare Tunnel ile eriş)
2. Sol menüden **Resources** → PostgreSQL veritabanını bul
3. Veritabanı ayarlarına gir
4. **"Public Port"** veya **"Make publicly available"** seçeneğini **KAPAT**
5. Kaydet

> Not: Adım 2'de firewall ile zaten 5432 portu dışarıya kapatıldı. Bu adım ek güvenlik — Docker seviyesinde de portu kaldırır.

---

## ADIM 5: Doğrula (her şey çalışıyor mu?)

### 5a: Port kontrolü

**Kendi bilgisayarında** terminal aç ve şunu çalıştır:

```bash
for p in 22 80 443 8000 5432 6001 6002; do
  timeout 3 bash -c "exec 3<>/dev/tcp/152.53.151.102/$p" 2>/dev/null \
    && echo "$p AÇIK" || echo "$p KAPALI"
done
```

Beklenen çıktı:
```
22 AÇIK
80 AÇIK
443 AÇIK
8000 KAPALI
5432 KAPALI
6001 KAPALI
6002 KAPALI
```

### 5b: Site çalışıyor mu?

Tarayıcıda https://ayaktenisi.alnuai.com adresine git. Site açılıyorsa her şey yolunda.

---

## SORUN ÇIKARSA

- **Site çalışmıyorsa (80/443 kapandıysa):** `ufw allow 80/tcp && ufw allow 443/tcp`
- **SSH bağlanamıyorsan (22 kapandıysa):** Netcup panelinden VNC/console ile bağlanıp `ufw allow 22/tcp`
- **Her şeyi eski haline almak için:** `ufw disable`
