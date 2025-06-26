# Guida all'integrazione di Firebase con il progetto Seeking

Questa guida ti aiuterà a configurare e verificare l'integrazione di Firebase con il tuo progetto Vue.js.

## 1. Verifica della configurazione Firebase

Per prima cosa, dobbiamo verificare che la configurazione Firebase nel tuo progetto sia corretta. Il file di configurazione si trova in `src/firebase.js`.

### Ottenere le credenziali Firebase

1. Vai alla [console Firebase](https://console.firebase.google.com/)
2. Seleziona il tuo progetto "progetto prog 2"
3. Clicca sull'icona ⚙️ (impostazioni) accanto a "Panoramica del progetto" nel menu a sinistra
4. Seleziona "Impostazioni del progetto"
5. Scorri verso il basso fino alla sezione "I tuoi app" e clicca sull'icona web (</>) se hai già registrato un'app web
6. Se non hai ancora registrato un'app web, clicca su "Aggiungi app" e seleziona l'icona web
7. Assegna un nickname all'app (es. "seeking-app")
8. Copia il blocco di codice `firebaseConfig` che contiene le tue credenziali

### Aggiornare il file di configurazione

Apri il file `src/firebase.js` nel tuo progetto e verifica che le credenziali corrispondano a quelle che hai copiato dalla console Firebase. Se necessario, aggiorna il file con le credenziali corrette.

```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'TUA_API_KEY',
  authDomain: 'TUO_AUTH_DOMAIN',
  projectId: 'TUO_PROJECT_ID',
  storageBucket: 'TUO_STORAGE_BUCKET',
  messagingSenderId: 'TUO_MESSAGING_SENDER_ID',
  appId: 'TUO_APP_ID'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 2. Creazione delle collezioni Firestore

Il progetto Seeking utilizza tre collezioni principali in Firestore:

1. `chats`: per memorizzare le conversazioni
2. `messages`: per memorizzare i messaggi delle conversazioni
3. `settings`: per memorizzare le impostazioni utente

Puoi creare queste collezioni manualmente o lasciare che vengano create automaticamente quando l'applicazione viene utilizzata per la prima volta.

### Creazione manuale delle collezioni (opzionale)

1. Vai alla [console Firebase](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Clicca su "Firestore Database" nel menu a sinistra
4. Clicca su "Crea raccolta" per ogni collezione che vuoi creare:
   - Nome: `chats`
   - Nome: `messages`
   - Nome: `settings`

## 3. Configurazione delle regole di sicurezza Firestore

Per garantire che i dati siano accessibili e modificabili solo dagli utenti autorizzati, è importante configurare le regole di sicurezza di Firestore.

1. Vai alla [console Firebase](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Clicca su "Firestore Database" nel menu a sinistra
4. Seleziona la scheda "Regole"
5. Modifica le regole come segue:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Consenti l'accesso a tutti gli utenti (per semplificare lo sviluppo)
    // In un ambiente di produzione, dovresti limitare l'accesso in base all'autenticazione
    match /{document=**} {
      allow read, write;
    }
  }
}
```

6. Clicca su "Pubblica"

**Nota**: Queste regole consentono l'accesso completo a tutti gli utenti. In un ambiente di produzione, dovresti limitare l'accesso in base all'autenticazione degli utenti.

## 4. Verifica della connessione a Firebase

Per verificare che la connessione a Firebase funzioni correttamente, possiamo eseguire un test semplice.

### Test di scrittura su Firestore

Aggiungi il seguente codice temporaneo al componente `App.vue` nella funzione `setup()` per testare la connessione a Firestore:

```javascript
import { collection, addDoc } from 'firebase/firestore'
import { db } from './firebase'

// All'interno della funzione setup()
const testFirebaseConnection = async () => {
  try {
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Test di connessione a Firebase',
      timestamp: new Date()
    })
    console.log('Documento scritto con ID:', docRef.id)
    alert('Connessione a Firebase riuscita! Documento creato con ID: ' + docRef.id)
  } catch (error) {
    console.error('Errore durante la scrittura su Firestore:', error)
    alert('Errore durante la connessione a Firebase: ' + error.message)
  }
}

// Esegui il test dopo un breve ritardo
setTimeout(testFirebaseConnection, 3000)
```

Dopo aver aggiunto questo codice, avvia l'applicazione e verifica che appaia un alert di conferma. Inoltre, controlla la console del browser per eventuali errori.

**Importante**: Rimuovi questo codice di test dopo aver verificato che la connessione funzioni correttamente.

## 5. Configurazione dell'autenticazione (opzionale)

Se desideri utilizzare l'autenticazione Firebase, puoi configurarla come segue:

1. Vai alla [console Firebase](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Clicca su "Authentication" nel menu a sinistra
4. Clicca su "Inizia"
5. Seleziona i provider di autenticazione che desideri utilizzare (es. Email/Password)
6. Abilita il provider e configura le opzioni necessarie
7. Clicca su "Salva"

## 6. Risoluzione dei problemi comuni

### Errore CORS

Se riscontri errori CORS durante le chiamate API, assicurati che il dominio della tua applicazione sia autorizzato nelle impostazioni di Firebase:

1. Vai alla [console Firebase](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Clicca sull'icona ⚙️ (impostazioni) accanto a "Panoramica del progetto"
4. Seleziona "Impostazioni del progetto"
5. Vai alla scheda "Domini autorizzati"
6. Aggiungi il dominio della tua applicazione (es. `localhost`)

### Errore di autenticazione

Se riscontri errori di autenticazione, verifica che le credenziali Firebase nel file `src/firebase.js` siano corrette e che l'API key non sia scaduta o disabilitata.

### Errore di connessione a Firestore

Se non riesci a connetterti a Firestore, verifica che:

1. Il servizio Firestore sia attivo nel tuo progetto Firebase
2. Le regole di sicurezza Firestore consentano l'accesso
3. La configurazione Firebase nel tuo progetto sia corretta

## 7. Risorse utili

- [Documentazione Firebase](https://firebase.google.com/docs)
- [Documentazione Firestore](https://firebase.google.com/docs/firestore)
- [Guida all'autenticazione Firebase](https://firebase.google.com/docs/auth)
- [Esempi di regole di sicurezza Firestore](https://firebase.google.com/docs/firestore/security/get-started)

