# Seeking - AI Chat Assistant

Progetto per l'esame di Informatica II (Prof. Alessio Palmero Aprosio)

## Descrizione

Seeking è una Single-Page Application (SPA) che funge da interfaccia utente per un modello di Intelligenza Artificiale (DeepSeek API). L'applicazione permette di chattare con un assistente AI, salvare i messaggi preferiti e personalizzare le impostazioni dell'interfaccia e del modello AI.

## Requisiti del Corso Soddisfatti

1. **Single-Page Application (SPA)**: Implementata con Vue.js 3 e Vue Router.
2. **Cinque meccaniche/pagine differenti**:
   - **Meccanica 1**: Login semplificato (pseudonimo)
   - **Meccanica 2**: Interfaccia chat principale
   - **Meccanica 3**: Drawer di navigazione chat (storico conversazioni)
   - **Meccanica 4**: Pagina impostazioni
   - **Meccanica 5**: Pagina messaggi preferiti
3. **Interazione con Database**: Firebase Cloud Firestore per salvare chat, messaggi, preferiti e impostazioni.
4. **Uso di API**: DeepSeek API per le risposte dell'assistente AI.
5. **Responsive Design**: Implementato con Vuetify 3 per adattarsi a smartphone, tablet e PC desktop.
   Le ultime versioni utilizzano breakpoint CSS per migliorare la disposizione dei componenti su schermi piccoli.

## Stack Tecnologico

- **Frontend Framework**: Vue.js 3 (Composition API)
- **UI/UX Framework**: Vuetify 3 (Material Design)
- **Database**: Google Firebase Cloud Firestore
- **API Esterna**: DeepSeek API
- **Routing**: Vue Router
- **HTTP Client**: Axios

## Configurazione del Progetto

### Prerequisiti

- Node.js (versione 16 o superiore)
- npm o yarn
- Un account Firebase con un progetto configurato
- Una chiave API DeepSeek

### Installazione

1. Clona il repository o copia i file in una directory locale:

```bash
git clone <repository-url> seeking-project
cd seeking-project
```

2. Installa le dipendenze:

```bash
npm install
```

3. Configura Firebase:
   - Assicurati che il file `src/firebase.js` contenga le tue credenziali Firebase.
   - Se necessario, modifica il file con le tue credenziali:

```javascript
const firebaseConfig = {
  apiKey: 'TUA_FIREBASE_API_KEY',
  authDomain: 'TUO_AUTH_DOMAIN',
  projectId: 'TUO_PROJECT_ID',
  storageBucket: 'TUO_STORAGE_BUCKET',
  messagingSenderId: 'TUO_MESSAGING_SENDER_ID',
  appId: 'TUO_APP_ID'
};
```

4. Configura l'API DeepSeek creando un file `.env` (puoi copiare `.env.example`):

```bash
cp .env.example .env
```

Apri quindi `.env` e sostituisci `your_deepseek_api_key_here` con la tua chiave personale.
Se necessario, puoi cambiare anche `VITE_DEEPSEEK_BASE_URL`.

### Avvio dell'Applicazione in Locale

```bash
npm run dev
```

L'applicazione sarà disponibile all'indirizzo `http://localhost:5173/`.

### Build per la Produzione

```bash
npm run build
```

I file compilati saranno disponibili nella directory `dist/`.

## Struttura del Database Firebase

Il database Firestore è strutturato con le seguenti collezioni:

1. **chats**: Contiene i documenti delle conversazioni
   - `id`: Identificativo unico
   - `title`: Titolo della chat (primo messaggio troncato)
   - `createdAt`: Data di creazione
   - `updatedAt`: Data di ultimo aggiornamento
   - `userId`: Nome utente

2. **messages**: Contiene i messaggi delle conversazioni
   - `id`: Identificativo unico
   - `chatId`: ID della chat di appartenenza
   - `text`: Testo del messaggio
   - `sender`: Mittente ('user' o 'ai')
   - `timestamp`: Data e ora del messaggio
   - `isFavorite`: Flag per i messaggi preferiti

3. **settings**: Contiene le impostazioni utente
   - `id`: Identificativo unico
   - `userId`: Nome utente
   - `darkTheme`: Tema scuro attivo (boolean)
   - `fontSize`: Dimensione del testo
   - `temperature`: Temperatura del modello AI
   - `maxTokens`: Lunghezza massima delle risposte
   - `updatedAt`: Data di ultimo aggiornamento

## Funzionalità Principali

1. **Login Semplificato**: Inserimento di nome utente e password (fittizia) per accedere all'applicazione.
2. **Chat con AI**: Interfaccia per chattare con l'assistente AI utilizzando l'API DeepSeek.
3. **Gestione Conversazioni**: Creazione e selezione di conversazioni salvate automaticamente su Firebase.
4. **Messaggi Preferiti**: Possibilità di salvare e visualizzare i messaggi preferiti.
5. **Impostazioni Personalizzabili**: Configurazione del tema, dimensione del testo e parametri del modello AI.

## Autore

Studente del corso di Informatica II - Prof. Alessio Palmero Aprosio

