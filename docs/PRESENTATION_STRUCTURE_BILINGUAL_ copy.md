# Oma Netz – Präsentations-Rede

---

**Ich möchte Ihnen kurz den Code des Projekts zeigen. Warum haben wir uns für Next.js entschieden?**

Erstens: **Full-stack in einem Framework** – UI, API-Routen und Server-Authorization alles an einem Ort.

Zweitens: **Production-ready Deployment** auf Vercel mit sehr guter Kompatibilität im Stack.

Drittens: **Strukturierte Architektur** – Integration mit Prisma, NextAuth, Middleware und Route Handlern. Besonders wichtig für ein Multi-Role-Produkt.

Mit Vanilla JS oder nur React SPA wäre es viel schwieriger, Auth und role-basiertes Routing sicher und elegant end-to-end zu implementieren.

---

## 2. Projektstruktur

**Wir haben eine typische Next.js-Struktur:**

- **`src/`** – hier ist der gesamte Code
- **`prisma/`** – Hier ist die Datenbank definiert:Tabellen, Änderungen, Beispiel-Daten
- **`public/`** – statische Assets wie Bilder

**Einfach gesagt:** Die ganze Business-Logik und Interfaces sind in `src` isoliert. Daten und Schema liegen in `prisma`.

**Die Analogie:**

- `app/` → Site-Map: welche Seiten und APIs existieren, Jede Ordner = eigene URL, File `page.tsx` in der Ordner = Seiteninhalt
- `components/` → LEGO-Baukasten: aus welchen Blöcken Seiten zusammengesetzt werden
- `lib/` → Werkzeuge: wie man sich mit DB verbindet, Benachrichtigungen sendet
- `types/` → Wörterbuch: welche Daten und in welchem Format erwartet werden

---

# Ich möchte Folgendes besonders betonen, Welche ungewöhnlichen Features wurden im Projekt verwendet.:

## 1. Pusher (Realtime-Updates Chat)

Pusher ist ein WebSocket-Dienst für **real-time-Kommunikation**

**Einfach gesagt:** Pusher ist wie ein Messenger zwischen Server und Browser. Sobald im Chat eine neue Nachricht kommt oder jemand sich bewirbt, bekommen alle sofort Bescheid – ohne neu laden zu müssen.

---

## 2. AI-Assistent

In unserem Projekt benutzen wir ein kostenloses KI-Assistenten-Modell von Groq. Kostenlos auf groq.com registrieren → API Key erstellen → in .env einfügen (Etwa 18.000 Tokens pro Tag, etwa 30 Requests pro Minute)

Der AI-Assistent hilft dem Senior, eine Anfrage zu erstellen.

```
/api/ai/chat/route.ts

SYSTEM_PROMPT – das ist die “Gebrauchsanweisung” für die KI.

Kurz gesagt: Das sind Regeln, die der AI sagen:

1. “Du bist ein freundlicher Assistent für OMA-NETZ Kassel.”
2. Du hilfst Nutzern, Anfragen zu erstellen
3. Die Suche läuft in 4 Schritten ab:
   Erst Kategorie, dann Beschreibung, dann Adresse, zum Schluss das Datum.
4. Sobald alle Infos vollständig sind, einfach CREATE_REQUEST … eingeben.

Ohne diesen Prompt würde die KI nicht wissen, was sie tun soll. Keine Infos zu Wetter oder Freizeit. Die KI folgt strikt ihrem Prompt.
```

## Zusammenfassung

Next.js bietet eine fertige Architektur für ein Multi-Role-Produkt mit minimalem Boilerplate. Alle Features sind modular aufgebaut, leicht zu warten und zu skalieren.

---

====================================================================

##### DEMO-DATEN ZUM KOPIEREN / ДЕМО-ДАННЫЕ ДЛЯ КОПИРОВАНИЯ

Helmut Weber (Senior):
uuu@uuu.de
Wilhelmshöher Allee 120
34119
Kassel
+49 561 77234

---

1. Guten Tag! Ich brauche Hilfe beim Einkaufen.
   Ich kann nicht gut zu Fuß gehen.
   Adresse ist - REWE am Wilhelmsplatz, Kassel
   nächsten Samstag

---

Anna Müller
ttt@ttt.de
Frankfurter Str 15
34122
Kassel
+49 561 66789
Studentin
Universität Kassel

3. (Anna) Hallo Herr Weber! Ich helfe Ihnen gerne beim Einkaufen.
   Was genau soll ich Ihnen mitbringen?

4. (Helmut) Ich schicke Ihnen eine Liste. Brot, Milch, Käse und
   meine Medikamente von der Apotheke neben dem REWE.

5. (Anna) Alles klar! Ich komme Samstagvormittag gegen 11 Uhr.
   Ist das in Ordnung?

6. (Helmut) Danke Anna, Sie sind sehr nett.
