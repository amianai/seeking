import { createRouter, createWebHistory } from 'vue-router'
import ChatInterface from '@/components/ChatInterface.vue'
import SettingsPage from '@/components/SettingsPage.vue'
import FavoritesPage from '@/components/FavoritesPage.vue'

const routes = [
  {
    path: '/',
    name: 'Chat',
    component: ChatInterface
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: FavoritesPage
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

