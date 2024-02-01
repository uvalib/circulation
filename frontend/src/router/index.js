import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Results from '@/views/Results.vue'
import Forbidden from '@/views/Forbidden.vue'
import Expired from '@/views/Expired.vue'
import VueCookies from 'vue-cookies'
import { useSearchStore } from '@/stores/search'

const routes = [
   {
      path: '/',
      name: 'home',
      component: Home
   },
   {
      path: '/results',
      name: 'results',
      component: Results
   },
   {
      path: '/forbidden',
      name: 'forbidden',
      component: Forbidden
   },
   {
      path: '/expired',
      name: 'expired',
      component: Expired
   },
]

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes
})

router.beforeEach((to, _from, next) => {
   const searchStore = useSearchStore()
   if (to.path === '/granted') {
      let jwtStr = VueCookies.get("cq_jwt")
      searchStore.setJWT(jwtStr)
      next("/")
   } else if (to.name !== 'forbidden' && to.name !== "expired") {
      let jwtStr = localStorage.getItem('cq_jwt')
      if (jwtStr) {
         searchStore.setJWT(jwtStr)
         next()
      } else {
         console.log("AUTH..")
         window.location.href = "/authenticate"
      }
   } else {
      next()
   }
})


export default router
