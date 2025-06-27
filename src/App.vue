<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      color="primary"
      prominent
      dark
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Seeking</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <ChatDrawer
      v-model="drawer"
      :current-chat-id="currentChatId"
      @new-chat="handleNewChat"
      @select-chat="handleSelectChat"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <v-main>
      <router-view 
        :current-chat-id="currentChatId"
        @chat-created="handleChatCreated"
      />
    </v-main>

    <!-- Login Modal -->
    <LoginModal 
      v-model="showLoginModal" 
      @login="handleLogin"
    />
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue'
import ChatDrawer from '@/components/ChatDrawer.vue'
import LoginModal from '@/components/LoginModal.vue'

export default {
  name: 'App',
  components: {
    ChatDrawer,
    LoginModal
  },
  setup() {
    const drawer = ref(false)
    const showLoginModal = ref(false)
    const currentChatId = ref(null)

    // Check if user is logged in on app start
    onMounted(() => {
      const username = localStorage.getItem('username')
      if (!username) {
        showLoginModal.value = true
      }
    })

    const handleLogin = (username) => {
      localStorage.setItem('username', username)
      showLoginModal.value = false
    }

    const handleNewChat = (chatId) => {
      currentChatId.value = chatId
    }

    const handleSelectChat = (chatId) => {
      currentChatId.value = chatId
    }

    const handleChatCreated = (chatId) => {
      currentChatId.value = chatId
    }

    const handleLogout = () => {
      localStorage.removeItem('username')
      currentChatId.value = null
      showLoginModal.value = true
      drawer.value = false
    }

    return {
      drawer,
      showLoginModal,
      currentChatId,
      handleLogin,
      handleNewChat,
      handleSelectChat,
      handleChatCreated,
      handleLogout
    }
  }
}
</script>

<style>
.v-application {
  font-family: 'Roboto', sans-serif !important;
}
</style>

