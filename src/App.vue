<template>
  <div id="app">
    <NavBar />
    <router-view />
    <FooterBar />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'

export default {
  name: 'App',
  components: { NavBar, FooterBar },
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f1f5f9;
  color: #1e293b;
}
</style>
