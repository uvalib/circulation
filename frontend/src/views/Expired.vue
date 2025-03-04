<template>
   <div class="signedout">
      <h1>Session Expired</h1>
      <div class="message">
         <p>Your session has expired and you have been signed out.</p>
      </div>
      <div class="buttons"><Button @click="signinClick">Sign in with NetBadge</Button></div>
   </div>
</template>

<script setup>
function signinClick() {
   window.location.href = "/authenticate"
}
</script>

<style scoped lang="scss">
.signedout {
   padding: 0;
   min-height: 600px;
   .message {
      margin-top: 40px;
      font-size: 1.15em;
   }
   .buttons {
      margin-top: 35px;
      font-size: 1.25em;
   }
}
</style>
