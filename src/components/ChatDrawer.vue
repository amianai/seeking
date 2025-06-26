<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    temporary
    :width="drawerWidth"
  >
    <v-list>
      <!-- User Info -->
      <v-list-item class="px-4 py-3">
        <template v-slot:prepend>
          <v-avatar color="primary">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="font-weight-medium">
          {{ username }}
        </v-list-item-title>
        <v-list-item-subtitle>Online</v-list-item-subtitle>
      </v-list-item>

      <v-divider></v-divider>

      <!-- New Chat Button -->
      <v-list-item 
        @click="createNewChat" 
        class="mt-2"
        :loading="creatingChat"
      >
        <template v-slot:prepend>
          <v-icon color="primary">mdi-plus</v-icon>
        </template>
        <v-list-item-title>Nuova Chat</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- Chat List -->
      <div class="px-3">
        <v-list-subheader>Conversazioni</v-list-subheader>
      </div>

      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="chats.length === 0" class="text-center pa-4 text-medium-emphasis">
        <v-icon size="48" class="mb-2">mdi-chat-outline</v-icon>
        <div>Nessuna conversazione</div>
        <div class="text-caption">Inizia una nuova chat!</div>
      </div>

      <v-list v-else density="compact">
        <v-list-item
          v-for="chat in chats"
          :key="chat.id"
          @click="selectChat(chat.id)"
          :active="chat.id === currentChatId"
          class="mb-1"
        >
          <template v-slot:prepend>
            <v-icon size="20">mdi-chat</v-icon>
          </template>
          <v-list-item-title class="text-truncate">
            {{ chat.title || 'Nuova Conversazione' }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ formatDate(chat.updatedAt) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider class="my-4"></v-divider>

      <!-- Navigation Menu -->
      <v-list density="compact">
        <v-list-item to="/settings">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Impostazioni</v-list-item-title>
        </v-list-item>

        <v-list-item to="/favorites">
          <template v-slot:prepend>
            <v-icon>mdi-heart</v-icon>
          </template>
          <v-list-item-title>Messaggi Preferiti</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/test-firebase">
          <template v-slot:prepend>
            <v-icon>mdi-firebase</v-icon>
          </template>
          <v-list-item-title>Test Firebase</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
<<<<<<< l6mxkl-codex/fix-chat-switching-and-favorites-issues
import { useRouter } from 'vue-router'
=======
>>>>>>> main
import { db } from '@/firebase'
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'

export default {
  name: 'ChatDrawer',
  props: {
    modelValue: Boolean,
    currentChatId: String
  },
  emits: ['update:modelValue', 'new-chat', 'select-chat'],
  setup(props, { emit }) {
    const chats = ref([])
    const loading = ref(false)
    const creatingChat = ref(false)
    const { smAndDown } = useDisplay()
<<<<<<< l6mxkl-codex/fix-chat-switching-and-favorites-issues
    const router = useRouter()
=======
>>>>>>> main
    const drawerWidth = computed(() => (smAndDown.value ? 260 : 300))

    const username = computed(() => {
      return localStorage.getItem('username') || 'Utente'
    })

    // Load chats from Firebase
    const loadChats = async () => {
      loading.value = true
      try {
        const q = query(
          collection(db, 'chats'),
          where('userId', '==', username.value)
        )
        const querySnapshot = await getDocs(q)
        chats.value = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const ta = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)
            const tb = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)
            return tb - ta
          })
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        loading.value = false
      }
    }

    // Create new chat
    const createNewChat = async () => {
      creatingChat.value = true
      try {
        const newChat = {
          title: null, // Will be set after first message
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: username.value
        }
        
        const docRef = await addDoc(collection(db, 'chats'), newChat)
        await loadChats() // Reload chats
        emit('new-chat', docRef.id)
        emit('update:modelValue', false) // Close drawer
        router.push('/')
      } catch (error) {
        console.error('Error creating chat:', error)
      } finally {
        creatingChat.value = false
      }
    }

    // Select existing chat
    const selectChat = (chatId) => {
      emit('select-chat', chatId)
      emit('update:modelValue', false) // Close drawer
      router.push('/')
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
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Oggi'
      if (diffDays === 1) return 'Ieri'
      if (diffDays < 7) return `${diffDays} giorni fa`
      
      return date.toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short' 
      })
    }

    onMounted(() => {
      loadChats()
    })

    watch(
      () => props.modelValue,
      (val) => {
        if (val) {
          loadChats()
        }
      }
    )

    return {
      chats,
      loading,
      creatingChat,
      username,
      drawerWidth,
      createNewChat,
      selectChat,
      formatDate
    }
  }
}
</script>

<style scoped>
.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.12) !important;
}
</style>

