# Taitaja 2025 - Kysymyspeli

Kysymyspelisovellus, joka on rakennettu Next.js:llä ja Supabasella Taitaja 2025 -semifinaaliin.

## 📋 Sisällysluettelo

- [Ominaisuudet](#ominaisuudet)
- [Teknologiat](#teknologiat)
- [Asennus](#asennus)
- [Käyttöönotto](#käyttöönotto)
- [Supabase-konfiguraatio](#supabase-konfiguraatio)
- [Käyttöohjeet](#käyttöohjeet)
- [Projektin rakenne](#projektin-rakenne)
- [API-dokumentaatio](#api-dokumentaatio)
- [Tietoturva](#tietoturva)
- [Lisenssi](#lisenssi)

## ✨ Ominaisuudet

### Pelitoiminnot
- **Interaktiivinen kysymyspeli** - Valitse opettaja, kategoria ja kysymysten määrä (5, 10 tai 15)
- **Reaaliaikainen pistelaskenta** - Näe edistymisesi pelaamisen aikana
- **Välitön palaute** - Saat välittömän palautteen jokaisesta vastauksesta
- **Tulosten tallennus** - Tallenna tuloksesi ja vertaa muihin pelaajiin
- **High Scores -lista** - Näe parhaat tulokset kategorioittain

### Hallintapaneeli opettajille
- **Turvallinen kirjautuminen** - Opettajien autentikointi
- **Kategorioiden hallinta** - Luo, muokkaa ja poista kategorioita
- **Kysymysten hallinta** - Luo, muokkaa ja poista kysymyksiä
- **CRUD-toiminnot** - Create, Read, Update, Delete -operaatiot
- **Tulosten tarkastelu** - Tarkastele opiskelijoiden pelituloksia

### Käyttöliittymä
- **Responsiivinen design** - Toimii kaikilla laitteilla
- **Intuitiivinen navigointi** - Helppokäyttöinen liittymä
- **Visuaalinen palaute** - Selkeät animaatiot ja korostukset
- **Esteettömyys** - Noudattaa web-esteettömyyden periaatteita

## 🛠 Teknologiat

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Custom CSS Modules
- **Backend**: Supabase (PostgreSQL)
- **Autentikointi**: Supabase Auth + custom session management
- **TypeScript**: Täysi tyyppiturvallisuus
- **Deployment**: Taitaja kilpailuympäristö

## 🚀 Asennus

### Vaatimukset
- Node.js 18+ 
- npm tai yarn
- Supabase-tili

### 1. Kloonaa repositorio
```bash
git clone https://git.taitaja.webkehitys.fi/[käyttäjänimi]/frontend.git
cd frontend
```

### 2. Asenna riippuvuudet
```bash
npm install
```

### 3. Luo ympäristömuuttujat
Luo `.env.local` tiedosto projektin juureen:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Käynnistä kehityspalvelin
```bash
npm run dev
```

Sovellus aukeaa osoitteeseen `http://localhost:3000`

## 🗄 Supabase-konfiguraatio

### 1. Luo uusi Supabase-projekti
1. Mene [Supabase Dashboard](https://supabase.com/dashboard)
2. Luo uusi projekti
3. Odota, että tietokanta on valmis

### 2. Suorita tietokantamigraatiot
1. Mene projektin SQL Editoriin
2. Kopioi ja suorita `quiz_app.sql` tiedoston sisältö
3. Suorita lisäksi `supabase-setup.sql` luodaksesi scores-taulun

### 3. Konfiguroi autentikointi (valinnainen)
Jos haluat käyttää Supabase Auth:ia:
1. Mene Authentication > Settings
2. Konfiguroi email providers
3. Päivitä login-komponentti käyttämään Supabase Auth:ia

### 4. Hae API-avaimet
1. Mene Project Settings > API
2. Kopioi Project URL ja anon public key
3. Lisää ne `.env.local` tiedostoon

## 📖 Käyttöohjeet

### Pelaajalle

1. **Aloita peli**
   - Siirry etusivulta "Pelaa nyt" -painikkeella pelinaloitussivulle
   - Valitse opettaja alasvetovalikosta
   - Valitse kategoria (näkyvät opettajan valinnan jälkeen)
   - Valitse kysymysten määrä (5, 10 tai 15)
   - Klikkaa "Aloita peli"

2. **Pelaa**
   - Lue kysymys huolellisesti
   - Valitse oikea vastausvaihtoehto klikkaamalla sitä
   - Klikkaa "Vastaa" vahvistaaksesi valintasi
   - Saat välittömän palautteen vastauksesta
   - Jatka seuraavaan kysymykseen

3. **Tulokset**
   - Pelin päätyttyä näet kokonaispistemääräsi
   - Anna nimesi tallentaaksesi tuloksen
   - Tarkastele High Scores -listaa
   - Pelaa uudestaan halutessasi

### Opettajalle

1. **Kirjautuminen**
   - Klikkaa "Kirjaudu sisään" -linkkiä
   - Syötä käyttäjätunnuksesi ja salasanasi
   - Testitunnukset: "Jyri Lindroos" / "password123"

2. **Kategorioiden hallinta**
   - Luo uusia kategorioita "Luo uusi kategoria" -painikkeella
   - Muokkaa olemassa olevia kategorioita "Muokkaa" -painikkeella
   - Poista kategorioita "Poista" -painikkeella (poistaa myös kaikki kysymykset)

3. **Kysymysten hallinta**
   - Klikkaa kategorian nimeä nähdäksesi sen kysymykset
   - Luo uusia kysymyksiä "Lisää uusi kysymys" -painikkeella
   - Täytä kaikki kentät: kysymys, neljä vaihtoehtoa ja oikea vastaus
   - Muokkaa tai poista olemassa olevia kysymyksiä

## 📁 Projektin rakenne

```
taitaja-quiz/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── admin/                    # Opettajien hallintapaneeli
│   │   │   ├── categories/[id]/      # Kysymysten hallinta
│   │   │   ├── layout.tsx           # Admin layout + auth protection
│   │   │   └── page.tsx             # Kategorioiden hallinta
│   │   ├── api/                     # API reitit
│   │   │   ├── categories/          # Kategorioiden API
│   │   │   ├── questions/           # Kysymysten API
│   │   │   └── scores/              # Tulosten API
│   │   ├── game/                    # Pelitoiminnot
│   │   │   ├── play/                # Pelinäkymä
│   │   │   ├── results/             # Tulosnäkymä
│   │   │   └── page.tsx             # Pelin aloitus
│   │   ├── login/                   # Kirjautumissivu
│   │   ├── globals.css              # Globaalit tyylit
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Etusivu
│   └── lib/
│       └── supabase.ts              # Supabase client & types
├── public/                          # Staattiset tiedostot
├── supabase-setup.sql              # Tietokanta setup
├── .env.local                      # Ympäristömuuttujat
├── package.json                    # Dependencies
└── README.md                       # Tämä tiedosto
```

## 🔌 API-dokumentaatio

### Scores API

#### GET /api/scores
Hae tuloksia.

**Query Parameters:**
- `category_id` (optional): Suodata kategorian mukaan
- `limit` (optional): Rajoita tulosten määrää (default: 50)

**Response:**
```json
{
  "scores": [
    {
      "id": 1,
      "player_name": "Mikael L.",
      "score": 8,
      "total_questions": 10,
      "category_id": 1,
      "created_at": "2025-01-15T10:30:00Z",
      "categories": {
        "name": "Historia"
      }
    }
  ]
}
```

#### POST /api/scores
Tallenna uusi tulos.

**Request Body:**
```json
{
  "player_name": "Anna K.",
  "score": 7,
  "total_questions": 10,
  "category_id": 2
}
```

### Categories API

#### GET /api/categories
Hae kategorioita.

**Query Parameters:**
- `teacher_id` (optional): Suodata opettajan mukaan

#### POST /api/categories
Luo uusi kategoria.

**Request Body:**
```json
{
  "name": "Matematiikka",
  "teacher_id": 1
}
```

### Questions API

#### GET /api/questions
Hae kysymyksiä.

**Query Parameters:**
- `category_id` (optional): Suodata kategorian mukaan
- `teacher_id` (optional): Suodata opettajan mukaan  
- `limit` (optional): Rajoita kysymysten määrää

#### POST /api/questions
Luo uusi kysymys.

**Request Body:**
```json
{
  "category_id": 1,
  "teacher_id": 1,
  "question": "Mikä on Suomen pääkaupunki?",
  "option_a": "Helsinki",
  "option_b": "Tampere", 
  "option_c": "Turku",
  "option_d": "Oulu",
  "correct_option": "A"
}
```

## 🔒 Tietoturva

### Autentikointi
- Session-pohjainen autentikointi opettajille
- Reittisuojaus admin-paneelissa
- Supabase Row Level Security (RLS) tuki

### Tietovalidointi
- Server-side validointi kaikissa API-reiteissä
- Client-side validointi käyttökokemuksen parantamiseksi
- SQL-injektiosuojaus Supabasen kautta

### Ympäristömuuttujat
- Salaiset avaimet .env.local tiedostossa
- Ei committata sensitiivisiä tietoja

## 🔧 Kehitys

### Uusien ominaisuuksien lisääminen

1. **Uusi sivu**: Luo uusi hakemisto `src/app/` alle
2. **API-reitti**: Luo `route.ts` tiedosto `src/app/api/` alle  
3. **Komponentti**: Luo `.tsx` ja `.module.css` tiedostot
4. **Tyypit**: Päivitä `src/lib/supabase.ts` tiedostoa

### Testaus
```bash
# Kehityspalvelin
npm run dev

# Tuotantobuuild
npm run build
npm start

# Linting
npm run lint
```

## 📝 Lisenssi

Tämä projekti on luotu Taitaja 2025 -kilpailua varten.

## 🤝 Tuki

Jos kohtaat ongelmia:
1. Tarkista `.env.local` muuttujat
2. Varmista Supabase-yhteys
3. Tarkista konsoliloki virheistä
4. Varmista että kaikki riippuvuudet on asennettu

---

**Taitaja2025 -semifinaali**  
*Jari Peltola | Salon seudun ammattiopisto*
