<template>
  <v-container class="settings-container">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- Header -->
        <div class="text-center mb-6">
          <v-icon size="64" color="primary" class="mb-2">mdi-cog</v-icon>
          <h1 class="text-h4 mb-2">Impostazioni</h1>
          <p class="text-medium-emphasis">Personalizza la tua esperienza con Seeking</p>
        </div>

        <!-- Settings Card -->
        <v-card class="pa-4">
          <v-card-title class="px-0">
            <v-icon class="mr-2">mdi-palette</v-icon>
            Aspetto
          </v-card-title>

          <!-- Theme Toggle -->
          <v-row class="mb-4">
            <v-col cols="12">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-subtitle-1">Tema scuro</div>
                  <div class="text-caption text-medium-emphasis">
                    Attiva la modalità scura per ridurre l'affaticamento degli occhi
                  </div>
                </div>
                <v-switch
                  v-model="settings.darkTheme"
                  color="primary"
                  hide-details
                  class="ml-auto"
                  @change="updateTheme"
                ></v-switch>
              </div>
            </v-col>
          </v-row>

          <!-- Font Size -->
          <v-row class="mb-4">
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Dimensione del testo</div>
              <v-slider
                v-model="settings.fontSize"
                :min="12"
                :max="20"
                :step="1"
                thumb-label="always"
                color="primary"
                @end="saveSettings"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-format-font-size-decrease</v-icon>
                </template>
                <template v-slot:append>
                  <v-icon>mdi-format-font-size-increase</v-icon>
                </template>
              </v-slider>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- AI Settings -->
          <v-card-title class="px-0">
            <v-icon class="mr-2">mdi-robot</v-icon>
            Impostazioni AI
          </v-card-title>

          <!-- Temperature Setting -->
          <v-row class="mb-4">
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Creatività delle risposte</div>
              <div class="text-caption text-medium-emphasis mb-3">
                Controlla quanto creative e variabili saranno le risposte dell'AI
              </div>
              <v-slider
                v-model="settings.temperature"
                :min="0"
                :max="1"
                :step="0.1"
                thumb-label="always"
                color="primary"
                @end="saveSettings"
              >
                <template v-slot:prepend>
                  <div class="text-caption">Preciso</div>
                </template>
                <template v-slot:append>
                  <div class="text-caption">Creativo</div>
                </template>
                <template v-slot:thumb-label="{ modelValue }">
                  {{ getTemperatureLabel(modelValue) }}
                </template>
              </v-slider>
              
              <!-- Temperature Description -->
              <v-alert
                :type="getTemperatureAlertType(settings.temperature)"
                variant="tonal"
                class="mt-3"
              >
                {{ getTemperatureDescription(settings.temperature) }}
              </v-alert>
            </v-col>
          </v-row>

          <!-- Max Tokens -->
          <v-row class="mb-4">
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Lunghezza massima risposte</div>
              <div class="text-caption text-medium-emphasis mb-3">
                Controlla quanto lunghe possono essere le risposte dell'AI
              </div>
              <v-slider
                v-model="settings.maxTokens"
                :min="100"
                :max="2000"
                :step="100"
                thumb-label="always"
                color="primary"
                @end="saveSettings"
              >
                <template v-slot:prepend>
                  <div class="text-caption">Breve</div>
                </template>
                <template v-slot:append>
                  <div class="text-caption">Lunga</div>
                </template>
              </v-slider>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <!-- User Info -->
          <v-card-title class="px-0">
            <v-icon class="mr-2">mdi-account</v-icon>
            Informazioni Utente
          </v-card-title>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="settings.username"
                label="Nome utente"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Save Button -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-btn
                color="primary"
                size="large"
                block
                @click="saveSettings"
                :loading="saving"
              >
                <v-icon class="mr-2">mdi-content-save</v-icon>
                Salva Impostazioni
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- Reset Button -->
        <div class="text-center mt-4">
          <v-btn
            color="error"
            variant="outlined"
            @click="resetSettings"
          >
            <v-icon class="mr-2">mdi-refresh</v-icon>
            Ripristina Impostazioni Predefinite
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { db } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  doc,
  serverTimestamp
} from 'firebase/firestore'

export default {
  name: 'SettingsPage',
  setup() {
    const theme = useTheme()
    const saving = ref(false)
    const settingsId = ref(null)
    
    const settings = ref({
      darkTheme: false,
      fontSize: 16,
      temperature: 0.7,
      maxTokens: 1000,
      username: localStorage.getItem('username') || 'Utente'
    })

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    // Load settings from Firebase
    const loadSettings = async () => {
      try {
        const username = localStorage.getItem('username')
        const q = query(
          collection(db, 'settings'),
          where('userId', '==', username)
        )
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          settingsId.value = doc.id
          const data = doc.data()
          
          settings.value = {
            darkTheme: data.darkTheme ?? false,
            fontSize: data.fontSize ?? 16,
            temperature: data.temperature ?? 0.7,
            maxTokens: data.maxTokens ?? 1000,
            username: username
          }
          
          // Apply theme
          theme.global.name.value = settings.value.darkTheme ? 'dark' : 'light'
          document.documentElement.style.fontSize = `${settings.value.fontSize}px`
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        showSnackbar('Errore nel caricamento delle impostazioni', 'error')
      }
    }

    // Save settings to Firebase
    const saveSettings = async () => {
      if (saving.value) return
      
      saving.value = true
      try {
        const username = localStorage.getItem('username')
        const settingsData = {
          ...settings.value,
          userId: username,
          updatedAt: serverTimestamp()
        }

        if (settingsId.value) {
          // Update existing settings
          await updateDoc(doc(db, 'settings', settingsId.value), settingsData)
        } else {
          // Create new settings
          const docRef = await addDoc(collection(db, 'settings'), settingsData)
          settingsId.value = docRef.id
        }
showSnackbar('Impostazioni salvate con successo', 'success')
document.documentElement.style.fontSize = `${settings.value.fontSize}px`
await loadSettings()
} catch (error) {
  console.error('Error saving settings:', error)
  showSnackbar('Errore nel salvataggio delle impostazioni', 'error')
} finally {
  saving.value = false
}

    // Update theme
    const updateTheme = () => {
      theme.global.name.value = settings.value.darkTheme ? 'dark' : 'light'
      saveSettings()
    }

    // Reset settings to default
    const resetSettings = () => {
      settings.value = {
        darkTheme: false,
        fontSize: 16,
        temperature: 0.7,
        maxTokens: 1000,
        username: localStorage.getItem('username') || 'Utente'
      }
      theme.global.name.value = 'light'
      saveSettings()
      showSnackbar('Impostazioni ripristinate', 'info')
    }

    // Get temperature label
    const getTemperatureLabel = (value) => {
      if (value <= 0.3) return 'Preciso'
      if (value <= 0.7) return 'Bilanciato'
      return 'Creativo'
    }

    // Get temperature description
    const getTemperatureDescription = (value) => {
      if (value <= 0.3) {
        return 'Le risposte saranno più precise e coerenti, ideale per domande tecniche o informative.'
      }
      if (value <= 0.7) {
        return 'Un buon equilibrio tra precisione e creatività, adatto per la maggior parte delle conversazioni.'
      }
      return 'Le risposte saranno più creative e variabili, perfetto per brainstorming e contenuti creativi.'
    }

    // Get alert type for temperature
    const getTemperatureAlertType = (value) => {
      if (value <= 0.3) return 'info'
      if (value <= 0.7) return 'success'
      return 'warning'
    }

    // Show snackbar
    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      settings,
      saving,
      snackbar,
      saveSettings,
      updateTheme,
      resetSettings,
      getTemperatureLabel,
      getTemperatureDescription,
      getTemperatureAlertType
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding-top: 32px;
  padding-bottom: 32px;
}

@media (max-width: 600px) {
  .settings-container {
    padding-left: 16px;
    padding-right: 16px;
  }
}

.v-slider {
  margin-top: 8px;
}

.text-caption {
  font-size: 12px !important;
}
</style>

