# Quizvraag

Persoonlijke vragenbank voor pubquizzen: vragen toevoegen, bewerken, filteren op categorie en markeren als gebruikt. Achter een gedeeld wachtwoord.

Stack: Next.js (App Router) + Prisma + Neon (serverless Postgres) + Tailwind, gedeployed op Vercel — zelfde opzet als het ProfCoach-project.

## Lokaal draaien

1. **Database**: maak een gratis Neon Postgres-database aan op [neon.tech](https://neon.tech) (of via Vercel → Storage → Neon), en kopieer de connectiestring.
2. Vul `.env` in:
   ```
   DATABASE_URL="postgresql://...neon.tech/..."
   APP_PASSWORD="kies-hier-je-eigen-wachtwoord"
   AUTH_SECRET="<al ingevuld met een gegenereerde waarde>"
   ```
3. Schema naar de database pushen:
   ```
   npx prisma migrate dev --name init
   ```
4. Server starten:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) — je wordt naar `/login` gestuurd, log in met `APP_PASSWORD`.

## Deployen naar Vercel

1. Nieuwe GitHub-repo aanmaken en pushen.
2. In Vercel: **Add New → Project** → importeer de repo.
3. Environment variables instellen in Vercel (Settings → Environment Variables): `DATABASE_URL`, `APP_PASSWORD`, `AUTH_SECRET` (gebruik hiervoor een andere, eigen gegenereerde `AUTH_SECRET` dan lokaal).
4. Deploy.

## Datamodel

Eén `Question`-model (`prisma/schema.prisma`): `question`, `answer`, `category`, optioneel `notes`, en `used`/`usedAt` om bij te houden welke vragen al eens gebruikt zijn.
