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
          <template v-slot:append>
            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              @click.stop="promptDeleteChat(chat)"
            >
              <v-icon>mdi-delete-outline</v-icon>
            </v-btn>
          </template>
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

        <v-list-item @click="logout">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-list>
  </v-navigation-drawer>

  <v-dialog v-model="confirmDelete" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Elimina chat</v-card-title>
      <v-card-text>
        Vuoi davvero eliminare questa chat? Non sarà possibile recuperarla.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="confirmDelete = false">Annulla</v-btn>
        <v-btn text color="error" :loading="deletingChat" @click="deleteChat">
          Elimina
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { toDate, relativeDate } from '@/utils'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore'

export default {
  name: 'ChatDrawer',
  props: {
    modelValue: Boolean,
    currentChatId: String
  },
  emits: ['update:modelValue', 'new-chat', 'select-chat', 'logout'],
  setup(props, { emit }) {
    const chats = ref([])
    const loading = ref(false)
    const creatingChat = ref(false)
    const confirmDelete = ref(false)
    const chatToDelete = ref(null)
    const deletingChat = ref(false)
    const { smAndDown } = useDisplay()
    const router = useRouter()
    const drawerWidth = computed(() => (smAndDown.value ? 280 : 320))

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
          .sort((a, b) => toDate(b.updatedAt) - toDate(a.updatedAt))
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

    const promptDeleteChat = (chat) => {
      chatToDelete.value = chat
      confirmDelete.value = true
    }

    const deleteChat = async () => {
      if (!chatToDelete.value) return
      deletingChat.value = true
      try {
        await deleteDoc(doc(db, 'chats', chatToDelete.value.id))

        const q = query(
          collection(db, 'messages'),
          where('chatId', '==', chatToDelete.value.id)
        )
        const snap = await getDocs(q)
        const promises = snap.docs.map(d => deleteDoc(d.ref))
        await Promise.all(promises)

        if (props.currentChatId === chatToDelete.value.id) {
          emit('select-chat', null)
        }

        await loadChats()
        confirmDelete.value = false
      } catch (error) {
        console.error('Error deleting chat:', error)
      } finally {
        deletingChat.value = false
        chatToDelete.value = null
      }
    }

    // Select existing chat
    const selectChat = (chatId) => {
      emit('select-chat', chatId)
      emit('update:modelValue', false) // Close drawer
      router.push('/')
    }

    const logout = () => {
      localStorage.removeItem('username')
      chats.value = []
      emit('select-chat', null)
      emit('update:modelValue', false)
      emit('logout')
    }

    // Format date for display
    const formatDate = (ts) => relativeDate(ts)

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
      confirmDelete,
      deletingChat,
      promptDeleteChat,
      deleteChat,
      username,
      drawerWidth,
      createNewChat,
      selectChat,
      formatDate,
      logout
    }
  }
}
</script>

<style scoped>
.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.12) !important;
}
</style>

