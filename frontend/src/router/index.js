import { createRouter, createWebHistory } from 'vue-router'
import { useCookies } from "vue3-cookies"
import { useSearchStore } from '@/stores/search'

const routes = [
   {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
   },
   {
      path: '/results',
      name: 'results',
      component: () => import('../views/Results.vue')
   },
   {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('../views/Forbidden.vue')
   },
   {
      path: '/expired',
      name: 'expired',
      component: () => import('../views/Expired.vue')
   },
]

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes
})

router.beforeEach((to, _from, next) => {
   const searchStore = useSearchStore()
   const { cookies } = useCookies()

   if (to.path === '/granted') {
      const jwtStr = cookies.get("cq_jwt")
      searchStore.setJWT(jwtStr)
      next("/")
   } else if (to.name !== 'forbidden' && to.name !== "expired") {
      let jwtStr = localStorage.getItem('cq_jwt')
      if (jwtStr) {
         searchStore.setJWT(jwtStr)
         next()
      } else {
         window.location.href = "/authenticate"
      }
   } else {
      next()
   }
})


export default router
