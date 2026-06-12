# Coolify Deployment Guide

## 1. Database Setup (Coolify'de)

Coolify'de zaten PostgreSQL çalışıyor (port 5432). Yeni bir database oluştur:

```bash
# VPS'te root olarak:
docker exec -it coolify-db psql -U postgres

# psql içinde:
CREATE DATABASE ayak_tenisi;
\q
```

Veya Coolify'nin kendi veritabanı hizmetini kullanarak yeni bir PostgreSQL servisi ekleyebilirsin.

## 2. Environment Variables (Coolify Dashboard)

Coolify'de projeyi eklerken şu environment variable'ları tanımla:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:POSTGRES_SIFREN@host:5432/ayak_tenisi?schema=public` |
| `AUTH_SECRET` | `017739974d90bc04a6426724781fbd18e7bd2ca81d34fc74ade585bbaecf55f8` |
| `AUTH_URL` | `https://SENIN_DOMAININ` (Coolify'nin verdiği URL) |
| `NEXT_PUBLIC_APP_URL` | `https://SENIN_DOMAININ` |

> `POSTGRES_SIFREN` yerine gerçek PostgreSQL şifreni yaz.  
> `SENIN_DOMAININ` yerine Coolify'nin verdiği domaini yaz (örn: `ayak-tenisi.coolify.io`).

## 3. Deploy

1. Coolify Dashboard > New Project > Ayak Tenisi
2. Add Resource > Application
3. Git Repository: `https://github.com/anuale/ayak-tenisi.git`
4. Branch: `main`
5. Build Pack: `Dockerfile`
6. Port: `3000`
7. Environment variables'ları yukarıdaki gibi ekle
8. Deploy

## 4. Database Migration (İlk Deploy'dan Sonra)

Uygulama ayağa kalktıktan sonra migration'ı çalıştır:

```bash
# Coolify'de uygulamanın terminal'ine girip:
npx prisma migrate deploy
```

Veya eğer Coolify terminal erişimi vermiyorsa, VPS'ten:

```bash
docker exec -it COOLIFY_APP_CONTAINER_NAME npx prisma migrate deploy
```

## Not

- **Build süresi:** İlk build ~3-5 dakika sürebilir (npm install + next build)
- **Migration:** İlk deploy'dan sonra `npx prisma migrate deploy` çalıştırmayı unutma, yoksa uygulama veritabanı hatası verir
- **AUTH_SECRET:** Yukarıdaki değer önceden oluşturuldu. Değiştirmek istersen `openssl rand -hex 32` ile yenisini üretebilirsin
- **Port:** Uygulama internal olarak 3000 portunda çalışır, Coolify reverse proxy ile dışarı açar
