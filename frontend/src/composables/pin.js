import { onMounted, ref, watch } from 'vue'
import { useWindowScroll, useElementBounding } from '@vueuse/core'

export function usePinnable( pinID, scrollID ) {
   const { y } = useWindowScroll()
   const scrollBody = ref()
   const toolbar = ref(null)
   const toolbarBounds = ref()
   const pinnedY = ref(-1)

   watch(y, (newY) => {
      if ( pinnedY.value < 0) {
         if ( toolbarBounds.value.top <= 0 ) {
            pinnedY.value = y.value+toolbarBounds.value.top
            toolbar.value.classList.add("sticky")
            toolbar.value.style.width = `${toolbarBounds.value.width}px`
            scrollBody.value.style.top = `${toolbarBounds.value.height}px`
         }
      } else {
         if ( newY <=  pinnedY.value) {
            pinnedY.value = -1
            toolbar.value.classList.remove("sticky")
            toolbar.value.style.width = `auto`
            scrollBody.value.style.top = `0px`
            scrollBody.value.style.top = `auto`
         }
      }
   })

   onMounted( () => {
      scrollBody.value = document.getElementById(scrollID)
      toolbar.value = document.getElementById(pinID)
      toolbarBounds.value = useElementBounding( toolbar )
   })

   return {}
}