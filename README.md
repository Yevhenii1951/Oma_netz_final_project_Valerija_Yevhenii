<div align="center">
  <img src="public/oma_final_clean_300.png" alt="Oma-Netz Logo" width="120" />

  # Oma-Netz Kassel

  **Wir finden Hilfe für die, die es brauchen.**

  [![CI](https://github.com/Yevhenii1951/Oma_netz_final_project_Valerija_Yevhenii/actions/workflows/ci.yml/badge.svg)](https://github.com/Yevhenii1951/Oma_netz_final_project_Valerija_Yevhenii/actions/workflows/ci.yml)
  [![Live Demo](https://img.shields.io/badge/demo-oma--netz-8b5e3c?logo=vercel)](https://oma-netz-final-project-valerija-yev.vercel.app/landing)
  [![Presentation](https://img.shields.io/badge/presentation-oma--netz-8b5e3c?logo=slides)](https://oma-netz-presentation.onrender.com)
  [![GitHub](https://img.shields.io/badge/github-repo-181717?logo=github)](https://github.com/Yevhenii1951/Oma_netz_final_project_Valerija_Yevhenii)

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
  ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
  ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-v5-000000?logo=auth0)

</div>

---

<p align="center">
  <a href="#demo">Demo</a> •
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#api">API</a>
</p>

---

## 🎯 Überblick

**Oma-Netz** ist eine digitale Nachbarschaftshilfe-Plattform für Kassel. Sie verbindet Senioren mit ehrenamtlichen Helfern aus der Umgebung — unkompliziert, sicher und in Echtzeit.

**Das Problem:** Viele ältere Menschen in Kassel brauchen Hilfe bei alltäglichen Aufgaben (Einkauf, Arztbesuche, Technik, Haushalt), haben aber niemanden, der schnell einspringen kann.

**Unsere Lösung:** Eine Plattform mit vier Rollen (Senior, Helfer, Angehöriger, Admin), bei der Hilfeanfragen erstellt, per Karte oder Liste gefunden und mit einem Klick angenommen werden können — inklusive Echtzeit-Chat, Bewertungssystem und Belohnungsprogramm.

> **Live-Demo:** [oma-netz-final-project-valerija-yev.vercel.app](https://oma-netz-final-project-valerija-yev.vercel.app/landing)

---

## 🔄 Der Ablauf

```
1. Senior stellt eine Hilfeanfrage  →  2. Helfer findet sie auf der Karte/Liste
         ↓                                            ↓
3. Helfer bewirbt sich            →  4. Senior akzeptiert das Angebot
         ↓                                            ↓
5. Echtzeit-Chat für Absprachen   →  6. Hilfe wird geleistet
         ↓                                            ↓
7. Senior bewertet den Helfer     →  8. Helfer erhält 10 Punkte 🎉
```

---

## ✨ Features

| Bereich | Feature | Beschreibung |
|---------|---------|-------------|
| 🔐 | **4 Benutzerrollen** | Senior, Helfer, Angehöriger, Admin — jede Rolle hat eine maßgeschneiderte UI |
| 📋 | **Hilfeanfragen** | 7 Kategorien (Einkauf, Arzt, Spaziergang, Technik, Transport, Haushalt, Sonstiges) mit Beschreibung, Adresse und Wunschzeit |
| 🤝 | **Angebotssystem** | Helfer bewerben sich, Senioren akzeptieren oder lehnen ab — vollständiger Workflow |
| 💬 | **Echtzeit-Chat** | Pusher WebSocket — Nachrichten erscheinen sofort, keine Seitenaktualisierung nötig |
| 🤖 | **KI-Assistent** | Groq + Llama 3.3 70B hilft Senioren beim Formulieren von Hilfeanfragen |
| 🗺️ | **Interaktive Karte** | Leaflet/OpenStreetMap zeigt alle offenen Anfragen in Kassel |
| ⭐ | **Bewertungssystem** | 1–5 Sterne nach abgeschlossener Hilfe |
| 🎁 | **Punkte & Belohnungen** | Helfer sammeln 10 Punkte pro Hilfe und tauschen sie gegen Prämien ein (KVG-Fahrkarten, Kino-Tickets, Ehrungsurkunden, Baumpflanzungen) |
| 🛡️ | **Admin-Dashboard** | Statistiken, Helfer-Freigabe, Benutzerverwaltung, Einlösungen verwalten |
| 📱 | **Responsive Design** | Mobile Bottom Navigation, PWA-Manifest, voll responsive |
| 🔔 | **Benachrichtigungen** | Echtzeit-Push-Benachrichtigungen + persistente In-App-Historie |
| ⚖️ | **DSGVO-konform** | Impressum und Datenschutzerklärung auf Deutsch |

---

## 📸 Screenshots

### Landing Page

<table>
  <tr>
    <td><img src="public/for_Readme/compressed/landing_page1.jpg" alt="Landing Page Hero" width="400"/></td>
    <td><img src="public/for_Readme/compressed/landing_page2.jpg" alt="Landing Page Features" width="400"/></td>
  </tr>
  <tr>
    <td><img src="public/for_Readme/compressed/landing_page3.jpg" alt="Landing Page About" width="400"/></td>
    <td><img src="public/for_Readme/compressed/landing_page4.jpg" alt="Landing Page Footer" width="400"/></td>
  </tr>
</table>

### Registrierung

<img src="public/for_Readme/compressed/registration.jpg" alt="Registrierung" width="600"/>

### Senior-Ansicht

<table>
  <tr>
    <td><img src="public/for_Readme/compressed/1senior_page.jpg" alt="Senior Dashboard" width="400"/></td>
    <td><img src="public/for_Readme/compressed/2senior_page.jpg" alt="Neue Anfrage erstellen" width="400"/></td>
  </tr>
  <tr>
    <td><img src="public/for_Readme/compressed/3senior_page.jpg" alt="Anfragen-Übersicht" width="400"/></td>
    <td><img src="public/for_Readme/compressed/4senior_page.jpg" alt="Angebote prüfen" width="400"/></td>
  </tr>
</table>

### Helfer-Ansicht

<table>
  <tr>
    <td><img src="public/for_Readme/compressed/helper1.jpg" alt="Helfer Dashboard" width="400"/></td>
    <td><img src="public/for_Readme/compressed/helper2.jpg" alt="Offene Anfragen" width="400"/></td>
  </tr>
  <tr>
    <td><img src="public/for_Readme/compressed/helper3.jpg" alt="Chat mit Senior" width="400"/></td>
    <td><img src="public/for_Readme/compressed/helper4.jpg" alt="Belohnungen" width="400"/></td>
  </tr>
</table>

### Admin-Dashboard

<table>
  <tr>
    <td><img src="public/for_Readme/compressed/admin_dashboard.jpg" alt="Admin Dashboard" width="400"/></td>
    <td><img src="public/for_Readme/compressed/admin_senioren.jpg" alt="Admin Senioren" width="400"/></td>
  </tr>
  <tr>
    <td><img src="public/for_Readme/compressed/admin_helfer.jpg" alt="Admin Helfer" width="400"/></td>
    <td><img src="public/for_Readme/compressed/admin_anfragen.jpg" alt="Admin Anfragen" width="400"/></td>
  </tr>
  <tr>
    <td><img src="public/for_Readme/compressed/admin_einlosungen.jpg" alt="Admin Einlösungen" width="400"/></td>
    <td></td>
  </tr>
</table>

### Rechtliches

<table>
  <tr>
    <td><img src="public/for_Readme/compressed/impressum.jpg" alt="Impressum" width="400"/></td>
    <td><img src="public/for_Readme/compressed/dadtenschutz.jpg" alt="Datenschutzerklärung" width="400"/></td>
  </tr>
</table>

---

## 🛠️ Tech Stack

### Frontend

| Technologie | Einsatz |
|-------------|---------|
| **Next.js 16** (App Router) | Server Components, Server Actions, API Routes |
| **React 19** + **TypeScript 5** | Typsichere UI-Komponenten |
| **Tailwind CSS 4** | Utility-first Styling mit eigenem "Schokolade & Sahne"-Farbschema (`#8b5e3c` / `#f5ede0`) |
| **Framer Motion** | Animationen und Übergänge |
| **Leaflet** + **React-Leaflet** | Interaktive OpenStreetMap-Karte |
| **Lucide React** + **Iconify** | Icons |
| **Google Fonts** | Inter (Text) + Playfair Display (Überschriften) |

### Backend & Daten

| Technologie | Einsatz |
|-------------|---------|
| **Next.js API Routes** | REST-Endpoints + Server Actions |
| **Prisma 6** | ORM mit 12 Datenmodellen |
| **PostgreSQL** (Neon.tech, eu-central-1) | Relationale Datenbank |
| **NextAuth.js v5** | Authentifizierung mit Credentials-Provider + JWT |
| **bcryptjs** | Passwort-Hashing |
| **Zod** | Schema-Validierung (API + Formulare) |

### Echtzeit & KI

| Technologie | Einsatz |
|-------------|---------|
| **Pusher** (WebSocket) | Echtzeit-Chat + Benachrichtigungen |
| **Vercel AI SDK** + **Groq** (Llama 3.3 70B) | KI-Chat-Assistent für Senioren |

### DevOps & Tools

| Technologie | Einsatz |
|-------------|---------|
| **GitHub Actions** | CI-Pipeline (Lint + Build) |
| **ESLint 9** | Code-Qualitätssicherung |
| **Vercel** | Deployment & Hosting |

---

## 🚀 Getting Started

### Voraussetzungen

- Node.js 18+
- PostgreSQL (lokal oder [Neon.tech](https://neon.tech))
- [Pusher](https://pusher.com) Account (kostenloser Plan)
- [Groq](https://groq.com) API-Key (kostenlos)

### Installation

```bash
# Repository klonen
git clone https://github.com/Yevhenii1951/Oma_netz_final_project_Valerija_Yevhenii.git
cd Oma_netz_final_project_Valerija_Yevhenii

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# → .env ausfüllen (siehe Tabelle unten)

# Datenbank migrieren + Demo-Daten laden
npx prisma migrate deploy
npm run seed

# Entwicklungsserver starten
npm run dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000).

### Demo-Zugänge

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| 👑 Admin | `admin@oma-netz.de` | `123123nfnf` |
| 👴 Senior | `hildegard@example.com` | `123123nfnf` |
| 🦸 Helfer | `lena@example.com` | `123123nfnf` |

### Umgebungsvariablen

```env
# Datenbank
DATABASE_URL=postgresql://user:password@host:5432/oma-netz

# NextAuth
AUTH_SECRET=your-secret
AUTH_URL=http://localhost:3000

# Pusher (Echtzeit)
PUSHER_APP_ID=xxxx
PUSHER_SECRET=xxxx
NEXT_PUBLIC_PUSHER_KEY=xxxx
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# Groq (KI-Assistent)
GROQ_API_KEY=gsk_xxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Projektstruktur

```
├── prisma/
│   ├── schema.prisma          # Datenbankmodell (12 Modelle)
│   ├── migrations/            # SQL-Migrationen
│   └── seed.ts                # Demo-Daten
├── public/                    # Statische Assets
│   ├── for_Readme/            # Screenshots (für README)
│   ├── carussel/              # Karussell-Bilder
│   ├── oma_final_clean_300.png
│   └── manifest.json          # PWA-Manifest
├── src/
│   ├── app/
│   │   ├── api/               # REST-API-Endpoints
│   │   ├── admin/             # Admin-Dashboard
│   │   ├── landing/           # Marketing-Landingpage
│   │   ├── requests/          # Hilfeanfragen (CRUD)
│   │   ├── chat/              # Echtzeit-Chat
│   │   ├── map/               # Kartenansicht
│   │   ├── rewards/           # Belohnungen
│   │   ├── profile/           # Benutzerprofil
│   │   └── (auth)             # Anmeldung/Registrierung
│   ├── components/            # Wiederverwendbare UI
│   ├── lib/                   # Hilfsfunktionen (Prisma, Pusher, Utils)
│   ├── types/                 # TypeScript-Typdefinitionen
│   ├── auth.ts                # NextAuth-Konfiguration
│   └── middleware.ts          # Route-Schutz
├── docs/                      # Dokumentation
├── .github/workflows/         # CI/CD
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📊 Datenbankmodell

```
User ──┬── Request ──── Offer ──── Rating
       ├── Message (Chat)
       ├── Notification
       ├── Redemption ──── Reward
       └── Account / Session (NextAuth)
```

**12 Modelle:** `User`, `Account`, `Session`, `VerificationToken`, `Request`, `Offer`, `Chat`, `Message`, `Rating`, `Reward`, `Redemption`, `Notification`

---

## 🌐 API-Endpoints

| Endpunkt | Methoden | Beschreibung |
|----------|----------|-------------|
| `/api/auth/register` | POST | Benutzerregistrierung |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth-Authentifizierung |
| `/api/requests` | GET, POST | Hilfeanfragen (Liste / Erstellen) |
| `/api/requests/[id]` | GET, PATCH, DELETE | Einzelne Anfrage |
| `/api/offers` | POST | Angebot erstellen |
| `/api/offers/[id]/accept` | POST | Angebot annehmen |
| `/api/offers/[id]/reject` | POST | Angebot ablehnen |
| `/api/chat/[requestId]/messages` | GET, POST | Chat-Nachrichten |
| `/api/notifications` | GET, PATCH | Benachrichtigungen |
| `/api/ratings` | POST | Bewertung abgeben |
| `/api/rewards` | GET, POST | Belohnungen verwalten |
| `/api/profile` | GET, PATCH | Benutzerprofil |
| `/api/map` | GET | Karten-Daten |
| `/api/ai/chat` | POST | KI-Assistent |
| `/api/admin/*` | GET, PATCH | Admin-Funktionen |

---

## 👩‍💻 Autoren

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>Yevhenii Riabokon</strong><br />
        <a href="https://github.com/Yevhenii1951">@Yevhenii1951</a>
      </td>
      <td align="center">
        <strong>Valeriia Kovalenko</strong><br />
        <a href="https://github.com/Valerija2425">@Valerija2425</a>
      </td>
    </tr>
  </table>
  <br />
  <sub>DCI — Full-Stack Web Development Programm • 2025–2026</sub>
</div>

---

<div align="center">
  <a href="https://oma-netz-final-project-valerija-yev.vercel.app/landing">
    <img src="public/working.webp" alt="Live Demo" width="400" />
  </a>
  <br />
  <sub>Mit ❤️ entwickelt in Kassel</sub>
</div>

