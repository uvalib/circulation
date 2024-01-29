import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Results from '../views/Results.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/results',
    name: 'Results',
    component: Results
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
