<template>
  <v-container class="pa-4">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 mb-2">Messaggi Preferiti</h1>
      <p class="text-medium-emphasis">
        I tuoi messaggi salvati con il cuoricino
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-4 text-medium-emphasis">Caricamento...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="favoriteMessages.length === 0" class="text-center pa-8">
      <v-icon size="120" color="grey-lighten-2" class="mb-4">
        mdi-heart-outline
      </v-icon>
      <h2 class="text-h5 mb-2">Nessun messaggio preferito</h2>
      <p class="text-medium-emphasis mb-4">
        Usa il cuoricino per salvare i messaggi che ti piacciono di più
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        to="/"
      >
        <v-icon start>mdi-chat</v-icon>
        Inizia una chat
      </v-btn>
    </div>

    <!-- Favorites List -->
    <div v-else>
      <!-- Filter Chips -->
      <v-chip-group
        v-model="selectedFilter"
        class="mb-4"
        mandatory
      >
        <v-chip value="all">Tutti</v-chip>
        <v-chip value="ai">Solo AI</v-chip>
        <v-chip value="user">Solo Utente</v-chip>
      </v-chip-group>

      <!-- Messages Grid -->
      <v-row>
        <v-col
          v-for="message in filteredMessages"
          :key="message.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="favorite-card h-100"
            variant="outlined"
            hover
          >
            <v-card-text class="pb-2">
              <!-- Message Header -->
              <div class="d-flex align-center mb-3">
                <v-avatar
                  :color="message.sender === 'ai' ? 'primary' : 'secondary'"
                  size="32"
                  class="mr-3"
                >
                  <v-icon size="18">
                    {{ message.sender === 'ai' ? 'mdi-robot' : 'mdi-account' }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-2">
                    {{ message.sender === 'ai' ? 'AI Assistant' : username }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDate(message.timestamp) }}
                  </div>
                </div>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      size="small"
                      variant="text"
                      v-bind="props"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="copyMessage(message.text)">
                      <template v-slot:prepend>
                        <v-icon>mdi-content-copy</v-icon>
                      </template>
                      <v-list-item-title>Copia</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="removeFromFavorites(message.id)">
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-heart-remove</v-icon>
                      </template>
                      <v-list-item-title>Rimuovi dai preferiti</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <!-- Message Content -->
              <div class="message-content">
                <p class="text-body-1 mb-0">{{ message.text }}</p>
              </div>
            </v-card-text>

            <v-card-actions class="pt-0">
              <v-chip
                size="small"
                variant="tonal"
                :color="message.sender === 'ai' ? 'primary' : 'secondary'"
              >
                <v-icon start size="14">
                  {{ message.sender === 'ai' ? 'mdi-robot' : 'mdi-account' }}
                </v-icon>
                {{ message.sender === 'ai' ? 'AI' : 'Tu' }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn
                icon
                size="small"
                color="error"
                variant="text"
                @click="removeFromFavorites(message.id)"
              >
                <v-icon>mdi-heart</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Snackbar for notifications -->
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
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc 
} from 'firebase/firestore'

export default {
  name: 'FavoritesPage',
  setup() {
    const favoriteMessages = ref([])
    const loading = ref(false)
    const selectedFilter = ref('all')
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const username = computed(() => {
      return localStorage.getItem('username') || 'Utente'
    })

    // Filter messages based on selected filter
    const filteredMessages = computed(() => {
      if (selectedFilter.value === 'all') {
        return favoriteMessages.value
      }
      return favoriteMessages.value.filter(message => 
        message.sender === selectedFilter.value
      )
    })

    // Load favorite messages from Firebase
    const loadFavoriteMessages = async () => {
      loading.value = true
      try {
        const q = query(
          collection(db, 'messages'),
          where('isFavorite', '==', true),
          orderBy('timestamp', 'desc')
        )
        const querySnapshot = await getDocs(q)
        favoriteMessages.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error loading favorite messages:', error)
        showSnackbar('Errore nel caricamento dei messaggi preferiti', 'error')
      } finally {
        loading.value = false
      }
    }

    // Remove message from favorites
    const removeFromFavorites = async (messageId) => {
      try {
        await updateDoc(doc(db, 'messages', messageId), {
          isFavorite: false
        })
        
        // Remove from local array
        favoriteMessages.value = favoriteMessages.value.filter(
          message => message.id !== messageId
        )
        
        showSnackbar('Messaggio rimosso dai preferiti', 'success')
      } catch (error) {
        console.error('Error removing from favorites:', error)
        showSnackbar('Errore nella rimozione del messaggio', 'error')
      }
    }

    // Copy message to clipboard
    const copyMessage = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        showSnackbar('Messaggio copiato negli appunti', 'success')
      } catch (error) {
        console.error('Error copying message:', error)
        showSnackbar('Errore nella copia del messaggio', 'error')
      }
    }

    // Format date for display
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      let date
      if (timestamp.toDate) {
        date = timestamp.toDate()
      } else {
        date = new Date(timestamp)
      }
      
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffMinutes < 60) return `${diffMinutes} min fa`
      if (diffHours < 24) return `${diffHours} ore fa`
      if (diffDays === 1) return 'Ieri'
      if (diffDays < 7) return `${diffDays} giorni fa`
      
      return date.toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      })
    }

    // Show snackbar notification
    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    onMounted(() => {
      loadFavoriteMessages()
    })

    return {
      favoriteMessages,
      loading,
      selectedFilter,
      snackbar,
      username,
      filteredMessages,
      removeFromFavorites,
      copyMessage,
      formatDate
    }
  }
}
</script>

<style scoped>
.favorite-card {
  transition: transform 0.2s ease-in-out;
}

.favorite-card:hover {
  transform: translateY(-2px);
}

.message-content {
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.5;
}

.message-content::-webkit-scrollbar {
  width: 4px;
}

.message-content::-webkit-scrollbar-track {
  background: transparent;
}

.message-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.message-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>

