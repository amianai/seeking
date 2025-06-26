// Questo file contiene codice di esempio per testare la connessione a Firebase
// Puoi copiare e incollare queste funzioni nel tuo componente Vue per testarle

import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './src/firebase';

// Test di scrittura su Firestore
export const testFirebaseWrite = async () => {
  try {
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Test di connessione a Firebase',
      timestamp: new Date()
    });
    console.log('Documento scritto con ID:', docRef.id);
    return {
      success: true,
      message: 'Connessione a Firebase riuscita! Documento creato con ID: ' + docRef.id
    };
  } catch (error) {
    console.error('Errore durante la scrittura su Firestore:', error);
    return {
      success: false,
      message: 'Errore durante la connessione a Firebase: ' + error.message
    };
  }
};

// Test di lettura da Firestore
export const testFirebaseRead = async () => {
  try {
    const q = query(
      collection(db, 'test'),
      orderBy('timestamp', 'desc'),
      where('message', '==', 'Test di connessione a Firebase')
    );
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Documenti letti:', documents);
    return {
      success: true,
      message: `Lettura da Firebase riuscita! Trovati ${documents.length} documenti.`,
      documents
    };
  } catch (error) {
    console.error('Errore durante la lettura da Firestore:', error);
    return {
      success: false,
      message: 'Errore durante la lettura da Firebase: ' + error.message
    };
  }
};

// Test completo di Firebase (scrittura e lettura)
export const testFirebase = async () => {
  // Test di scrittura
  const writeResult = await testFirebaseWrite();
  if (!writeResult.success) {
    return writeResult;
  }
  
  // Test di lettura
  const readResult = await testFirebaseRead();
  return readResult;
};

// Esempio di utilizzo in un componente Vue:
/*
import { onMounted } from 'vue';
import { testFirebase } from './test_firebase';

export default {
  setup() {
    onMounted(async () => {
      const result = await testFirebase();
      if (result.success) {
        alert(result.message);
      } else {
        alert('Errore: ' + result.message);
      }
    });
    
    return {};
  }
};
*/

