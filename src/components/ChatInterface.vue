<template>
  <v-container fluid class="chat-container pa-0">
    <!-- Messages Area -->
    <div class="messages-area" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <v-icon size="64" color="primary" class="mb-4">mdi-robot-outline</v-icon>
        <h2 class="text-h5 mb-2">Ciao {{ username }}!</h2>
        <p class="text-medium-emphasis">Come posso aiutarti oggi?</p>
      </div>

      <div v-else class="messages-list">
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @toggle-favorite="toggleFavorite"
          @copy-message="copyMessage"
        />
      </div>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="typing-indicator">
        <v-card class="ma-2 pa-3" variant="tonal">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-icon size="18">mdi-robot</v-icon>
            </v-avatar>
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <v-card class="message-input-card mx-4 mb-4" variant="outlined">
        <div class="message-input-container">
          <v-textarea
            v-model="newMessage"
            placeholder="Scrivi un messaggio..."
            variant="plain"
            rows="1"
            auto-grow
            max-rows="4"
            hide-details
            class="message-textarea"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="newMessage += '\n'"
            :disabled="isTyping"
          ></v-textarea>
          <v-btn
            icon
            color="primary"
            class="send-button"
            :disabled="!newMessage.trim() || isTyping"
            @click="sendMessage"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>
      </v-card>
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
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { db } from '@/firebase'
import { 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import axios from 'axios'
import MessageBubble from './MessageBubble.vue'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

export default {
  name: 'ChatInterface',
  components: {
    MessageBubble
  },
  props: {
    currentChatId: String
  },
  emits: ['chat-created'],
  setup(props, { emit }) {
    const messages = ref([])
    const newMessage = ref('')
    const isTyping = ref(false)
    const messagesContainer = ref(null)
    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const username = computed(() => {
      return localStorage.getItem('username') || 'Utente'
    })

    // Load messages for current chat
    const loadMessages = async (chatId) => {
      if (!chatId) {
        messages.value = []
        return
      }

      try {
        const q = query(
          collection(db, 'messages'),
          where('chatId', '==', chatId)
        )
        const querySnapshot = await getDocs(q)
        messages.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => {
          const ta = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
          const tb = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
          return ta - tb
        })
        
        await nextTick()
        scrollToBottom()
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    // Send message to AI
    const sendMessage = async () => {
      if (!newMessage.value.trim()) return

      const messageText = newMessage.value.trim()
      newMessage.value = ''

      let chatId = props.currentChatId

      // Create new chat if none exists
      if (!chatId) {
        try {
          const newChat = {
            title: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            userId: username.value
          }
          
          const docRef = await addDoc(collection(db, 'chats'), newChat)
          chatId = docRef.id
          emit('chat-created', chatId)
        } catch (error) {
          console.error('Error creating chat:', error)
          showSnackbar('Errore nella creazione della chat', 'error')
          return
        }
      }

      // Add user message
      const userMessage = {
        chatId: chatId,
        text: messageText,
        sender: 'user',
        timestamp: serverTimestamp(),
        isFavorite: false,
        userId: username.value
      }

      try {
        const userDoc = await addDoc(collection(db, 'messages'), userMessage)

        // Add to local messages immediately with real id
        messages.value.push({
          ...userMessage,
          id: userDoc.id,
          timestamp: new Date()
        })

        await nextTick()
        scrollToBottom()

        // Get AI response
        await getAIResponse(messageText, chatId)

        // Update chat info
        await updateDoc(doc(db, 'chats', chatId), {
          title: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
          updatedAt: serverTimestamp()
        })

      } catch (error) {
        console.error('Error sending message:', error)
        showSnackbar('Errore nell\'invio del messaggio', 'error')
      }
    }

    // Get response from DeepSeek API
    const getAIResponse = async (userMessage, chatId) => {
      isTyping.value = true

      if (!API_KEY) {
        console.error('DeepSeek API key is missing')
        messages.value.push({
          id: Date.now() + '_missing_key',
          chatId,
          text: 'Chiave API mancante. Configurala nel file .env per usare l\'assistente.',
          sender: 'ai',
          timestamp: new Date(),
          isFavorite: false
        })
        showSnackbar('Chiave API mancante', 'error')
        isTyping.value = false
        await nextTick()
        scrollToBottom()
        return
      }

      try {
        // Get user settings for temperature
        const settingsQuery = query(
          collection(db, 'settings'), 
          where('userId', '==', username.value)
        )
        const settingsSnapshot = await getDocs(settingsQuery)
        let temperature = 0.7 // default
        
        if (!settingsSnapshot.empty) {
          const userSettings = settingsSnapshot.docs[0].data()
          temperature = userSettings.temperature || 0.7
        }

        const response = await axios.post(`${BASE_URL}/v1/chat/completions`, {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: temperature,
          max_tokens: 1000
        }, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        const aiResponse = response.data.choices[0].message.content

        // Add AI message to database
        const aiMessage = {
          chatId: chatId,
          text: aiResponse,
          sender: 'ai',
          timestamp: serverTimestamp(),
          isFavorite: false,
          userId: username.value
        }

        const docRef = await addDoc(collection(db, 'messages'), aiMessage)
        
        // Add to local messages
        messages.value.push({
          ...aiMessage,
          id: docRef.id,
          timestamp: new Date()
        })

      } catch (error) {
        console.error('Error getting AI response:', error)

        messages.value.push({
          id: Date.now() + '_error',
          chatId,
          text:
            'Impossibile contattare il servizio AI. Verifica la connessione e la chiave API.',
          sender: 'ai',
          timestamp: new Date(),
          isFavorite: false
        })

        showSnackbar('Errore nella risposta AI', 'error')
      } finally {
        isTyping.value = false
        await nextTick()
        scrollToBottom()
      }
    }

    // Toggle message favorite status
    const toggleFavorite = async (messageId) => {
      try {
        const messageIndex = messages.value.findIndex(m => m.id === messageId)
        if (messageIndex !== -1) {
          const message = messages.value[messageIndex]
          const newFavoriteStatus = !message.isFavorite
          
          // Update in database
          await updateDoc(doc(db, 'messages', messageId), {
            isFavorite: newFavoriteStatus,
            userId: username.value
          })
          
          // Update local state
          messages.value[messageIndex].isFavorite = newFavoriteStatus
          
          showSnackbar(
            newFavoriteStatus ? 'Messaggio aggiunto ai preferiti' : 'Messaggio rimosso dai preferiti',
            'success'
          )
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
        showSnackbar('Errore nell\'aggiornamento dei preferiti', 'error')
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

    // Show snackbar notification
    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    // Scroll to bottom of messages
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    // Watch for chat changes
    watch(() => props.currentChatId, (newChatId) => {
      loadMessages(newChatId)
    }, { immediate: true })

    onMounted(() => {
      if (props.currentChatId) {
        loadMessages(props.currentChatId)
      }
    })

    return {
      messages,
      newMessage,
      isTyping,
      messagesContainer,
      snackbar,
      username,
      sendMessage,
      toggleFavorite,
      copyMessage
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 32px;
}

.messages-list {
  padding: 0 16px;
}

.input-area {
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.02);
}

.message-input-card {
  border-radius: 24px !important;
  max-width: 900px;
  margin-left: auto !important;
  margin-right: auto !important;
}

.message-input-container {
  display: flex;
  align-items: flex-end;
  padding: 8px 16px;
}

.message-textarea {
  flex: 1;
  padding-right: 8px;
}

.send-button {
  margin-bottom: 4px;
}

.typing-indicator {
  padding: 0 16px;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Scrollbar styling */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
  .chat-container {
    height: calc(100vh - 56px);
  }
  .message-input-card {
    margin-left: 8px !important;
    margin-right: 8px !important;
  }
}

@media (max-width: 960px) {
  .message-input-card {
    max-width: 95%;
  }
}

</style>

