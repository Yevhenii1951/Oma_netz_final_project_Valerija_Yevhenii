<div align="center">

# Oma-Netz Kassel

**Wir finden Hilfe für die, die es brauchen.**

Eine Nachbarschaftshilfe-Plattform für Senioren in Kassel. Ehrenamtliche Helfer melden sich auf Anfragen, unterstützen bei Alltagsaufgaben und sammeln Belohnungen.

[![CI](https://github.com/Yevhenii1951/Oma_netz_final_project_Valerija_Yevhenii/actions/workflows/ci.yml/badge.svg)](https://github.com/Yevhenii1951/Oma_netz_final_project_Valerija_Yevhenii/actions/workflows/ci.yml)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)

</div>

---

## Was ist Oma-Netz?

Oma-Netz ist eine Plattform für ehrenamtliche Nachbarschaftshilfe in Kassel. Senioren stellen Hilfeanfragen (Einkäufen, Arztbesuche, Spaziergänge, Technik, Transport, Haushalt) und ehrenamtliche Helfer melden sich, um zu helfen.

**So funktioniert's:**

1. **Senior stellt Anfrage** — mit Kategorie, Beschreibung, Adresse und Wunschzeit
2. **Helfer bewirbt sich** — über den Marktplatz oder die Karte
3. **Senior akzeptiert Angebot** — und es entsteht ein Chat
4. **Hilfe wird geleistet** — mit Echtzeit-Chat während des Termins
5. **Bewertung & Punkte** — Helfer sammeln 10 Punkte pro Hilfe, die sie gegen echte Belohnungen eintauschen können

---

## Features

| | Feature | Beschreibung |
|---|---------|-------------|
| 🔐 | **Vier Rollen** | Senior, Helfer, Angehöriger, Admin — jede mit eigener UI |
| 📋 | **Hilfeanfragen** | 7 Kategorien mit Beschreibung, Adresse und Zeitwunsch |
| 🤝 | **Angebotsystem** | Helfer bewerben sich, Senioren akzeptieren/lehnen ab |
| 💬 | **Echtzeit-Chat** | Pusher WebSocket — Nachrichten erscheinen sofort |
| 🤖 | **KI-Assistent** | Groq + Llama 3.3 70B — hilft Senioren beim Erstellen von Anfragen |
| 🗺️ | **Interaktive Karte** | Leaflet/OpenStreetMap zeigt offene Anfragen in Kassel |
| ⭐ | **Bewertungssystem** | 1–5 Sterne nach geleisteter Hilfe |
| 🎁 | **Punkte & Belohnungen** | KVG-Fahrkarten, KinoTickets, Ehrungsurkunden, Baumpflanzungen |
| 🛡️ | **Admin-Dashboard** | Statistiken, Helfer-Freigabe, User-Management |
| 📱 | **Mobiloptimiert** | Bottom Navigation, Responsive Design, PWA-Manifest |
| 🔔 | **Benachrichtigungen** | Echtzeit-Push + persistente In-App-Benachrichtigungen |
| ⚖️ | **Impressum & Datenschutz** | DSGVO-konforme Seiten auf Deutsch |

---

## Tech Stack

### Frontend

- **Next.js 16** — App Router, Server Components, Server Actions
- **React 19** + **TypeScript 5**
- **Tailwind CSS 4** — custom "Schokolade & Sahne" Farbschema (`#8b5e3c` primär, `#f5ede0` Hintergrund)
- **Framer Motion** — Animationen
- **Leaflet / React-Leaflet** — Interaktive Karte
- **Lucide React** + **Iconify** — Icons
- **Google Fonts** — Inter (Text) + Playfair Display (Überschriften)

### Backend

- **Next.js API Routes** — REST-Endpoints
- **Prisma 6** ORM
- **PostgreSQL** (Neon.tech, eu-central-1)
- **NextAuth.js v5** — Credentials Provider + JWT
- **bcryptjs** — Passwort-Hashing
- **Zod** — API-Validierung

### Echtzeit & KI

- **Pusher** — WebSocket für Chat und Benachrichtigungen
- **Vercel AI SDK** + **Groq** (`Llama 3.3 70B`) — KI-Chat-Assistent

### DevOps

- **GitHub Actions** — CI (Lint + Build)
- **ESLint** — Code-Qualität

---

## Projektstruktur

```
├── prisma/                 # Datenbankschema (11 Modelle) + Migrationen + Seed
├── public/                 # Statische Assets (Bilder, Manifest)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # REST-API-Routen
│   │   ├── admin/          # Admin-Dashboard
│   │   ├── landing/        # Marketing-Landingpage
│   │   ├── requests/       # Hilfeanfragen (Liste, Detail, Neu)
│   │   ├── chat/           # Echtzeit-Chat
│   │   ├── map/            # Interaktive Karte
│   │   ├── rewards/        # Belohnungskatalog
│   │   ├── profile/        # Benutzerprofil
│   │   └── ...             # Weitere Seiten
│   ├── components/         # UI-Komponenten (Shell, AI-Chat, Footer, etc.)
│   ├── lib/                # Hilfsfunktionen (Prisma, Pusher, Utils)
│   ├── types/              # TypeScript-Interfaces
│   ├── auth.ts             # NextAuth-Konfiguration
│   └── proxy.ts            # Middleware / Route-Schutz
├── docs/                   # Dokumentation
└── .github/workflows/      # CI/CD
```

---

## Datenbankschema

```
User ──┬── Request ──── Offer ──── Rating
       ├── Message (Chat)
       ├── Notification
       ├── Redemption ──── Reward
       └── Account / Session (NextAuth)
```

11 Modelle: `User`, `Account`, `Session`, `VerificationToken`, `Request`, `Offer`, `Chat`, `Message`, `Rating`, `Reward`, `Redemption`, `Notification`

---

## Installation

### Voraussetzungen

- Node.js 18+
- PostgreSQL (lokal oder Neon.tech)
- Pusher-Account (kostenlos)
- Groq-API-Key (kostenlos)

### Setup

```bash
# 1. Repository klonen
git clone https://github.com/Yevhenii1951/Oma_netz_final_project_Valerija_Yevhenii.git
cd Oma_netz_final_project_Valerija_Yevhenii

# 2. Abhängigkeiten installieren
npm install

# 3. Umgebungsvariablen konfigurieren
cp .env.example .env
# → .env ausfüllen (Datenbank, Auth, Pusher, Groq, etc.)

# 4. Datenbank migrieren
npx prisma migrate deploy

# 5. Demo-Daten laden
npm run seed

# 6. Starten
npm run dev
```

App läuft auf `http://localhost:3000`

---

## Demo-Zugänge

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Admin | `admin@oma-netz.de` | `123123nfnf` |
| Senior | `hildegard@example.com` | `123123nfnf` |
| Helfer | `lena@example.com` | `123123nfnf` |

---

## Umgebungsvariablen

| Variable | Zweck |
|----------|-------|
| `DATABASE_URL` | PostgreSQL-Verbindungsstring |
| `AUTH_SECRET` | NextAuth JWT-Secret |
| `AUTH_URL` | Basis-URL der App |
| `PUSHER_APP_ID` / `PUSHER_SECRET` | Pusher-Credentials |
| `NEXT_PUBLIC_PUSHER_KEY` / `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher (Client) |
| `GROQ_API_KEY` | Groq AI API-Key |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | E-Mail-Versand |
| `TELEGRAM_BOT_TOKEN` | Telegram-Bot (zukünftig) |
| `NEXT_PUBLIC_APP_URL` | Öffentliche App-URL |

---

## API-Endpoints

| Endpoint | Methoden | Beschreibung |
|----------|----------|-------------|
| `/api/auth/register` | POST | Registrierung |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth-Handler |
| `/api/requests` | GET, POST | Hilfeanfragen |
| `/api/requests/[id]` | GET, PATCH, DELETE | Einzelne Anfrage |
| `/api/offers` | POST | Angebot erstellen |
| `/api/offers/[id]/accept` | POST | Angebot annehmen |
| `/api/chat/[requestId]/messages` | GET, POST | Chat-Nachrichten |
| `/api/notifications` | GET, PATCH | Benachrichtigungen |
| `/api/ratings` | POST | Bewertung abgeben |
| `/api/rewards` | GET, POST | Belohnungen |
| `/api/profile` | GET, PATCH | Profil |
| `/api/map` | GET | Karten-Daten |
| `/api/ai/chat` | POST | KI-Assistent |
| `/api/admin/*` | GET, PATCH | Admin-Funktionen |

---

## Autoren

**Yevhenii Riabokon** & **Valeriia Kovalenko**
DCI Full-Stack Development Programm

---

## Lizenz

Dieses Projekt wurde im Rahmen des DCI Full-Stack Entwicklungskurses erstellt.
