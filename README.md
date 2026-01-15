# 🚗 Weather Road App - Kelio Sąlygų Stebėjimo Sistema

Pilna sistema kelio sąlygų stebėjimui ir dalijimusi - su mobilia programėle ir web svetaine.

## 📁 Projekto Struktūra

```
.
├── WeatherRoadApp/          # React Native mobili programėlė
│   ├── screens/             # Ekranai (Map, AddMarker)
│   ├── services/            # Oro prognozės API
│   ├── utils/               # Vietos nustatymas
│   ├── .env.example         # Aplinkos kintamųjų pavyzdys
│   └── README.md            # Mobilio app dokumentacija
│
└── website/                 # Web svetainė
    ├── index.html           # Pagrindinis puslapis
    ├── app.js               # JavaScript logika
    ├── config.example.js    # Konfigūracijos pavyzdys
    └── README.md            # Web dokumentacija
```

## ✨ Funkcionalumas

### 📱 Mobili Programėlė
- ✅ GPS lokacijos nustatymas
- ✅ Barometro naudojimas (slėgio matavimas)
- ✅ Oro prognozės gavimas (OpenWeather API)
- ✅ Kelio būklės žymų pridėjimas
- ✅ Laisvas tekstas papildomai informacijai
- ✅ Real-time žemėlapis su visomis žymomis

### 🌐 Web Svetainė
- ✅ Real-time žemėlapis (Leaflet)
- ✅ Visų žymų sąrašas
- ✅ Automatinis atnaujinimas
- ✅ Spalvoti markeriai pagal būklę
- ✅ Responsive dizainas

### 🔥 Backend (Firebase)
- ✅ Realtime Database (NoSQL)
- ✅ WebSocket komunikacija (real-time)
- ✅ Automatinė sincronizacija tarp mobilio ir web

## 🚀 Pradžia

### 1️⃣ Clone Repository

```bash
git clone https://github.com/JŪSŲ-USERNAME/JŪSŲ-REPO.git
cd JŪSŲ-REPO
```

### 2️⃣ Mobili Programėlė Setup

```bash
cd WeatherRoadApp

# Įdiekite priklausomybes
npm install --legacy-peer-deps

# Sukurkite .env failą
Copy-Item .env.example .env

# Redaguokite .env su savo API raktais
notepad .env

# Paleiskite
npx expo start
```

#### Reikalingi API raktai:

**OpenWeather API:**
1. Eikite į https://openweathermap.org/api
2. Prisiregistruokite ir gaukite nemokamą API raktą
3. Įrašykite į `OPENWEATHER_API_KEY`

**Firebase:**
1. Eikite į https://console.firebase.google.com/
2. Sukurkite naują projektą
3. Įjunkite **Realtime Database** (ne Firestore!)
4. Pasirinkite **europe-west1** regioną
5. Settings > General > Your apps > Web app
6. Nukopijuokite konfigūraciją į `.env`

#### Firebase Realtime Database Rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Pastaba:** Produkcijai naudokite saugesnes taisykles!

### 3️⃣ Web Svetainė Setup

```bash
cd ../website

# Sukurkite config.js failą
Copy-Item config.example.js config.js

# Redaguokite config.js su tais pačiais Firebase duomenimis
notepad config.js

# Paleiskite lokalų serverį
python -m http.server 8000
# Arba: npx http-server -p 8000

# Atidarykite naršyklėje: http://localhost:8000
```

## 📊 Reikalavimai (Užduočiai)

- ✅ **Mobilioji programėlė** - React Native (Expo)
- ✅ **Įrenginio jutiklis** - Barometras (atmosferos slėgis)
- ✅ **NoSQL duomenų bazė** - Firebase Realtime Database
- ✅ **Internetinė svetainė** - HTML/JavaScript
- ✅ **Bendravimas tarp sistemų** - Firebase WebSocket (real-time listeners)

## 🔐 Saugumas

### ⚠️ LABAI SVARBU!

**NIEKADA** nepridėkite šių failų į Git:
- `WeatherRoadApp/.env` - Turi API raktus
- `website/config.js` - Turi Firebase konfigūraciją

Šie failai jau yra `.gitignore` sąraše!

### Saugus Workflow:

1. Clone repo
2. Nukopijuokite `.example` failus
3. Užpildykite savo API raktais
4. Niekada necommit'inkite originalių config failų

## 🌍 Deployment

### Mobili programėlė:
```bash
cd WeatherRoadApp
eas build --platform android
# Arba
eas build --platform ios
```

### Web svetainė:

**Firebase Hosting:**
```bash
cd website
firebase init hosting
firebase deploy
```

**Netlify:**
Tiesiog nuvilkite `website/` katalogą į netlify.com

## 📸 Screenshots

(Pridėkite screenshots čia)

## 🛠️ Technologijos

- React Native (Expo SDK 54)
- Firebase Realtime Database
- OpenWeather API
- Leaflet (žemėlapis)
- Expo Location
- Expo Sensors (Barometer)

## 📝 Licencija

MIT

## 👤 Autorius

Jūsų vardas - [GitHub](https://github.com/JŪSŲ-USERNAME)

## 🤝 Contribution

Pull requests priimami! Didesnėms keitimams, pirmiausia atidarykite issue.

## 📞 Pagalba

Jei kyla problemų:
1. Patikrinkite ar `.env` failas egzistuoja ir užpildytas
2. Patikrinkite Firebase Realtime Database rules
3. Patikrinkite ar naudojate teisingą `databaseURL` (europe-west1)
4. Atidarykite issue su klaidos pranešimu