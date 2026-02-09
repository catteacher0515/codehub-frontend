import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/chat/assistant',
      name: 'assistant',
      component: () => import('../views/chat/AssistantView.vue')
    },
    {
      path: '/chat/agent',
      name: 'agent',
      component: () => import('../views/chat/AgentView.vue')
    }
  ]
})

export default router
