# Configurazione del Progetto Seeking in VSCode

Questa guida ti aiuterà a configurare e avviare il progetto Seeking in Visual Studio Code.

## Prerequisiti

- [Node.js](https://nodejs.org/) (versione 16 o superiore)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

## Estensioni VSCode consigliate

Per una migliore esperienza di sviluppo, installa le seguenti estensioni in VSCode:

- Volar (Vue Language Features)
- ESLint
- Prettier - Code formatter
- Path Intellisense
- Auto Import
- Material Icon Theme

## Configurazione del progetto

1. Clona il repository o copia i file in una directory locale
2. Apri la cartella del progetto in VSCode
3. Apri un terminale in VSCode (Terminal > New Terminal)
4. Installa le dipendenze:

```bash
npm install
```

## Configurazione di Firebase

1. Verifica che il file `src/firebase.js` contenga le credenziali corrette per il tuo progetto Firebase
2. Se necessario, aggiorna le credenziali seguendo le istruzioni nella [guida Firebase](./guida_firebase.md)

## Test della connessione a Firebase

Per verificare che la connessione a Firebase funzioni correttamente:

1. Apri il file `test_firebase.js`
2. Segui le istruzioni nel file per testare la connessione
3. Puoi anche utilizzare il seguente snippet di codice nel componente `App.vue`:

```javascript
import { onMounted } from 'vue';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// All'interno della funzione setup()
onMounted(async () => {
  try {
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Test di connessione a Firebase',
      timestamp: new Date()
    });
    console.log('Documento scritto con ID:', docRef.id);
    alert('Connessione a Firebase riuscita! Documento creato con ID: ' + docRef.id);
  } catch (error) {
    console.error('Errore durante la scrittura su Firestore:', error);
    alert('Errore durante la connessione a Firebase: ' + error.message);
  }
});
```

## Avvio del progetto

### Metodo 1: Tramite terminale

1. Apri un terminale in VSCode
2. Esegui il comando:

```bash
npm run dev
```

3. Apri il browser all'indirizzo [http://localhost:5173](http://localhost:5173)

### Metodo 2: Tramite configurazione di lancio VSCode

1. Vai alla scheda "Run and Debug" in VSCode (o premi F5)
2. Seleziona "Dev Server + Chrome" dal menu a tendina
3. Clicca sul pulsante di avvio (o premi F5)

Questo avvierà automaticamente il server di sviluppo e aprirà Chrome con l'applicazione.

## Struttura del progetto

```
seeking-project/
├── public/              # File statici
├── src/                 # Codice sorgente
│   ├── components/      # Componenti Vue
│   ├── router/          # Configurazione del router
│   ├── App.vue          # Componente principale
│   ├── firebase.js      # Configurazione Firebase
│   └── main.js          # Punto di ingresso
├── .vscode/             # Configurazione VSCode
├── index.html           # HTML principale
├── package.json         # Dipendenze e script
└── vite.config.js       # Configurazione Vite
```

## Risoluzione dei problemi

### Errore "Module not found"

Se riscontri errori del tipo "Module not found", prova a:

1. Verificare che tutte le dipendenze siano installate:

```bash
npm install
```

2. Riavviare VSCode

### Errore di connessione a Firebase

Se riscontri errori di connessione a Firebase:

1. Verifica che le credenziali nel file `src/firebase.js` siano corrette
2. Controlla la console del browser per errori specifici
3. Segui le istruzioni nella [guida Firebase](./guida_firebase.md) per la risoluzione dei problemi

### Errore "Port already in use"

Se il server di sviluppo non si avvia a causa di un errore "Port already in use":

1. Termina eventuali processi che utilizzano la porta 5173:

```bash
# Su Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Su macOS/Linux
lsof -i :5173
kill -9 <PID>
```

2. Oppure modifica la porta nel file `vite.config.js`:

```javascript
export default defineConfig({
  // ...
  server: {
    port: 3000 // Cambia con una porta disponibile
  }
})
```

## Risorse utili

- [Documentazione Vue.js](https://vuejs.org/)
- [Documentazione Vuetify](https://vuetifyjs.com/)
- [Documentazione Firebase](https://firebase.google.com/docs)
- [Documentazione Vite](https://vitejs.dev/)

