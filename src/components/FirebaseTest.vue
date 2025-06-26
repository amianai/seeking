<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5 mb-4">
        Test di connessione a Firebase
      </v-card-title>
      
      <v-card-text>
        <p class="mb-4">
          Questo componente ti permette di testare la connessione a Firebase Firestore.
          Clicca sui pulsanti per eseguire i test di scrittura e lettura.
        </p>
        
        <v-alert
          v-if="result"
          :type="result.success ? 'success' : 'error'"
          class="mb-4"
        >
          {{ result.message }}
        </v-alert>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-btn
              color="primary"
              block
              :loading="loading"
              @click="testWrite"
            >
              Test di scrittura
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-btn
              color="secondary"
              block
              :loading="loading"
              @click="testRead"
            >
              Test di lettura
            </v-btn>
          </v-col>
        </v-row>
        
        <v-divider class="my-4"></v-divider>
        
        <div v-if="documents.length > 0">
          <h3 class="text-h6 mb-3">Documenti letti:</h3>
          
          <v-list>
            <v-list-item
              v-for="doc in documents"
              :key="doc.id"
            >
              <v-list-item-title>
                ID: {{ doc.id }}
              </v-list-item-title>
              
              <v-list-item-subtitle>
                Messaggio: {{ doc.message }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle>
                Timestamp: {{ formatDate(doc.timestamp) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="outlined"
          @click="clearTestData"
          :disabled="loading"
        >
          Cancella dati di test
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { db } from '@/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  doc
} from 'firebase/firestore'

export default {
  name: 'FirebaseTest',
  setup() {
    const loading = ref(false)
    const result = ref(null)
    const documents = ref([])
    
    // Test di scrittura su Firestore
    const testWrite = async () => {
      loading.value = true
      result.value = null
      
      try {
        const docRef = await addDoc(collection(db, 'test'), {
          message: 'Test di connessione a Firebase',
          timestamp: new Date()
        })
        
        console.log('Documento scritto con ID:', docRef.id)
        result.value = {
          success: true,
          message: 'Connessione a Firebase riuscita! Documento creato con ID: ' + docRef.id
        }
        
        // Aggiorna la lista dei documenti
        testRead()
      } catch (error) {
        console.error('Errore durante la scrittura su Firestore:', error)
        result.value = {
          success: false,
          message: 'Errore durante la connessione a Firebase: ' + error.message
        }
        loading.value = false
      }
    }
    
    // Test di lettura da Firestore
    const testRead = async () => {
      loading.value = true
      result.value = null
      
      try {
        const q = query(
          collection(db, 'test'),
          orderBy('timestamp', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        documents.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        console.log('Documenti letti:', documents.value)
        result.value = {
          success: true,
          message: `Lettura da Firebase riuscita! Trovati ${documents.value.length} documenti.`
        }
      } catch (error) {
        console.error('Errore durante la lettura da Firestore:', error)
        result.value = {
          success: false,
          message: 'Errore durante la lettura da Firebase: ' + error.message
        }
      } finally {
        loading.value = false
      }
    }
    
    // Cancella tutti i dati di test
    const clearTestData = async () => {
      loading.value = true
      result.value = null
      
      try {
        const q = query(collection(db, 'test'))
        const querySnapshot = await getDocs(q)
        
        const deletePromises = querySnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        )
        
        await Promise.all(deletePromises)
        
        documents.value = []
        result.value = {
          success: true,
          message: `Cancellazione riuscita! Eliminati ${querySnapshot.docs.length} documenti.`
        }
      } catch (error) {
        console.error('Errore durante la cancellazione:', error)
        result.value = {
          success: false,
          message: 'Errore durante la cancellazione: ' + error.message
        }
      } finally {
        loading.value = false
      }
    }
    
    // Formatta la data per la visualizzazione
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      
      let date
      if (timestamp.toDate) {
        date = timestamp.toDate()
      } else {
        date = new Date(timestamp)
      }
      
      return date.toLocaleString()
    }
    
    return {
      loading,
      result,
      documents,
      testWrite,
      testRead,
      clearTestData,
      formatDate
    }
  }
}
</script>

