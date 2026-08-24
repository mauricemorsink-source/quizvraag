# Quizvraag

Persoonlijke vragenbank voor pubquizzen: vragen en losse kladjes bijhouden, filteren op categorie en markeren als gebruikt.

Stack: Next.js (App Router) + Prisma + Neon (serverless Postgres) + Tailwind, gedeployed op Vercel — zelfde opzet als het ProfCoach-project. Geen inlog nodig; dit is een persoonlijk hulpmiddel zonder gevoelige data.

## Lokaal draaien

1. **Database**: maak een gratis Neon Postgres-database aan op [neon.tech](https://neon.tech) (of via Vercel → Storage → Neon), en kopieer de connectiestring.
2. Vul `.env` in:
   ```
   DATABASE_URL="postgresql://...neon.tech/..."
   ```
3. Schema naar de database pushen:
   ```
   npx prisma migrate dev --name init
   ```
4. Server starten:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Deployen naar Vercel

1. Nieuwe GitHub-repo aanmaken en pushen.
2. In Vercel: **Add New → Project** → importeer de repo.
3. Environment variable instellen in Vercel (Settings → Environment Variables): `DATABASE_URL`.
4. Deploy.

## Datamodel

- `Question` (`prisma/schema.prisma`): `question`, `answer`, `category`, optioneel `notes`, en `used`/`usedAt` om bij te houden welke vragen al eens gebruikt zijn.
- `Draft`: losse notitie (`text` + `category`) vanuit het Kladblok-tabblad, om te zetten tot een volwaardige `Question`.
