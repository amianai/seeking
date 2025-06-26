<template>
  <v-dialog 
    :model-value="modelValue" 
    max-width="400" 
    persistent
    no-click-animation
  >
    <v-card class="pa-4">
      <v-card-title class="text-center mb-4">
        <v-icon size="64" color="primary" class="mb-2">mdi-robot</v-icon>
        <div class="text-h4">Benvenuto in Seeking</div>
        <div class="text-subtitle-1 text-medium-emphasis">
          Il tuo assistente AI personale
        </div>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleSubmit" ref="form">
          <v-text-field
            v-model="username"
            label="Nome utente"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            :rules="usernameRules"
            class="mb-3"
            autofocus
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            type="password"
            :rules="passwordRules"
            class="mb-4"
          ></v-text-field>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="loading"
          >
            Accedi
          </v-btn>
        </v-form>
      </v-card-text>
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
    const loading = ref(false)
    const form = ref(null)

    const usernameRules = [
      v => !!v || 'Il nome utente è obbligatorio',
      v => v.length >= 3 || 'Il nome utente deve avere almeno 3 caratteri'
    ]

    const passwordRules = [
      v => !!v || 'La password è obbligatoria',
      v => v.length >= 4 || 'La password deve avere almeno 4 caratteri'
    ]

    const handleSubmit = async () => {
      const { valid } = await form.value.validate()
      
      if (valid) {
        loading.value = true
        
        // Simulate login delay
        setTimeout(() => {
          emit('login', username.value)
          loading.value = false
        }, 800)
      }
    }

    return {
      username,
      password,
      loading,
      form,
      usernameRules,
      passwordRules,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px !important;
}
</style>

