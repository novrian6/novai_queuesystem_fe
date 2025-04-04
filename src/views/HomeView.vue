<template>
  <div class="home">
    <h1>Welcome to NovAI QueueSystem</h1>
    <p>Efficient Queue Management for Your Business.</p>
    <router-link to="/login" class="btn-primary">Get Started</router-link>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #3b82f6;
  margin-bottom: 10px;
}

p {
  color: #64748b;
  margin-bottom: 20px;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
