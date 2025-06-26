<template>
  <div
    class="message-wrapper"
    :class="{ 'user-message': message.sender === 'user', 'ai-message': message.sender === 'ai' }"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <v-card
      class="message-card"
      :class="{
        'user-card': message.sender === 'user',
        'ai-card': message.sender === 'ai'
      }"
      variant="tonal"
    >
      <!-- AI Avatar -->
      <div v-if="message.sender === 'ai'" class="message-header">
        <v-avatar size="32" color="primary" class="mr-3">
          <v-icon size="18">mdi-robot</v-icon>
        </v-avatar>
        <span class="text-caption text-medium-emphasis">Seeking</span>
      </div>

      <!-- Message Content -->
      <div class="message-content">
        <div class="message-text" v-html="formatMessage(message.text)"></div>
        
        <!-- Timestamp -->
        <div class="message-timestamp">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>

      <!-- Action Buttons (shown on hover) -->
      <div
        v-show="showActions"
        class="message-actions"
        :class="{ 'user-actions': message.sender === 'user' }"
      >
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('toggle-favorite', message.id)"
          :color="message.isFavorite ? 'red' : 'grey'"
        >
          <v-icon size="18">
            {{ message.isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
          </v-icon>
        </v-btn>

        <v-btn
          icon
          size="small"
          variant="text"
          color="grey"
          @click="$emit('copy-message', message.text)"
        >
          <v-icon size="18">mdi-content-copy</v-icon>
        </v-btn>

        <v-btn
          icon
          size="small"
          variant="text"
          color="grey"
          disabled
        >
          <v-icon size="18">mdi-pencil</v-icon>
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'MessageBubble',
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  emits: ['toggle-favorite', 'copy-message'],
  setup() {
    const showActions = ref(false)

    const formatMessage = (text) => {
      // Convert line breaks to <br> tags
      return text.replace(/\n/g, '<br>')
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      
      let date
      if (timestamp.toDate) {
        date = timestamp.toDate()
      } else if (timestamp instanceof Date) {
        date = timestamp
      } else {
        date = new Date(timestamp)
      }
      
      return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      showActions,
      formatMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.message-wrapper {
  display: flex;
  margin-bottom: 16px;
  position: relative;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-card {
  max-width: 70%;
  position: relative;
  transition: all 0.2s ease;
}

.user-card {
  background-color: rgb(25, 118, 210) !important;
  color: white !important;
}

.ai-card {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

.message-header {
  display: flex;
  align-items: center;
  padding: 12px 16px 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.message-content {
  padding: 16px;
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
  margin-bottom: 8px;
}

.message-timestamp {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 8px;
}

.message-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.2s ease;
}

.user-actions {
  background: rgba(0, 0, 0, 0.1);
}

.user-actions .v-btn {
  color: rgba(255, 255, 255, 0.8) !important;
}

.user-actions .v-btn:hover {
  color: white !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .message-card {
    max-width: 85%;
  }
  
  .message-actions {
    position: static;
    margin-top: 8px;
    justify-content: center;
    background: transparent;
    box-shadow: none;
  }
}
</style>

