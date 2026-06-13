# VPS Güvenlik Düzeltmeleri

Aşağıdakileri sırayla VPS'te root olarak çalıştır.

## 1. UFW Firewall — sadece gerekli portları aç

```bash
# Önce UFW'yi kur (yoksa)
apt-get update && apt-get install -y ufw

# Varsayılan politikalar
ufw default deny incoming
ufw default allow outgoing

# Web portları (açık olmalı)
ufw allow 80/tcp
ufw allow 443/tcp

# SSH — SADECE SENİN IP'NDEN (sabit IP'n varsa)
# ufw allow from <SENIN-IP> to any port 22 proto tcp
# Sabit IP'n yoksa:
ufw allow 22/tcp

# Firewall'u etkinleştir
ufw --force enable
ufw status numbered
```

Bu komut çalıştıktan sonra sadece 22, 80, 443 dışarıya açık olacak. 
8000 (Coolify), 5432 (PostgreSQL), 6001, 6002 otomatik kapanacak.

## 2. PostgreSQL — public port'u kapat

Coolify arayüzünde (artık sadece localhost'tan erişilecek!):

1. Coolify dashboard → ilgili PostgreSQL kaynağını bul
2. Ayarlar → "Public Port" / "Make publicly available" seçeneğini KAPAT
3. Kaydet

Bu, PostgreSQL'in sadece Docker iç ağından erişilmesini sağlar.
Uygulama ile DB aynı Docker ağında olduğu için uygulama çalışmaya devam eder.

## 3. SSH Sertleştirme

```bash
# ÖNCE SSH anahtarınla giriş yapabildiğinden emin ol!
# Anahtarın yoksa oluştur:
# ssh-keygen -t ed25519
# ssh-copy-id root@152.53.151.102

# Yedek al
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Parola girişini kapat, root parola girişini kapat
sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#PermitRootLogin prohibit-password/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config

# SSH'ı yeniden başlat
systemctl restart sshd

# fail2ban kur
apt-get install -y fail2ban
systemctl enable --now fail2ban
```

## 4. Doğrula

```bash
# Dışarıdan port kontrolü (başka bir makineden):
for p in 22 80 443 8000 5432 6001 6002; do
  timeout 3 bash -c "exec 3<>/dev/tcp/152.53.151.102/$p" 2>/dev/null \
    && echo "$p OPEN" || echo "$p closed"
done
```

Çıktı şöyle olmalı:
```
22 OPEN
80 OPEN
443 OPEN
8000 closed
5432 closed
6001 closed
6002 closed
```
