<template>
  <v-dialog 
    :model-value="modelValue" 
    max-width="400" 
    persistent
    no-click-animation
  >
    <v-card class="pa-4 login-card">
      <v-card-title class="text-center mb-4">
        <v-icon size="64" color="primary" class="mb-2">mdi-robot</v-icon>
        <div class="text-h5 mb-1">Benvenuto in Seeking</div>
        <div class="text-body-1 text-medium-emphasis">
          Chiedi ciò che vuoi ma prima autenticati.
        </div>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="username"
            label="Nome utente"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            color="primary"
            class="mb-3"
            autofocus
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            color="primary"
            type="password"
            class="mb-4"
          ></v-text-field>

          <v-btn
            type="submit"
            color="primary"
            block
          >
            Accedi
          </v-btn>
        </v-form>
      </v-card-text>
      <v-snackbar v-model="snackbar" color="error" timeout="3000">
        {{ snackbarMessage }}
      </v-snackbar>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'LoginModal',
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue', 'login'],
  setup(props, { emit }) {
    const username = ref('')
    const password = ref('')
    const snackbar = ref(false)
    const snackbarMessage = ref('')

    const handleSubmit = () => {
      if (username.value.trim().length < 3) {
        snackbarMessage.value = 'Il nome utente è troppo corto'
        snackbar.value = true
        return
      }
      if (password.value.trim().length < 8) {
        snackbarMessage.value = 'La password è troppo corta'
        snackbar.value = true
        return
      }

      emit('login', username.value.trim())
    }

    return {
      username,
      password,
      snackbar,
      snackbarMessage,
      handleSubmit
    }
  }
}
</script>

<style scoped>

.login-card {
  border-radius: 16px !important;
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}

@media (max-width: 600px) {
  .login-card {
    width: 90vw;
  }
}
</style>

