<template>
  <nav class="navbar">
    <div class="navbar-content">
      <div class="nav-left">
        <img src="/src/assets/logo.png" alt="Queue System Logo" class="nav-logo" />
        <h1>Queue System</h1>
        <div class="nav-menu" v-if="userId && (userRole === 4 || userRole === 1)">
          <router-link to="/dashboard" class="nav-item">Dashboard</router-link>
          <router-link v-if="userRole === 4" to="/operator" class="nav-item">Operator</router-link>
        </div>
      </div>
      <div class="nav-right">
        <div class="user-info" v-if="userId">
          <div class="user-badge">
            <span class="user-icon">👤</span>
            <div class="user-details">
              <span class="username">{{ username }}</span>
              <span class="user-id">ID: {{ userId }}</span>
              <span class="user-role">{{ getRoleName }}</span>
            </div>
          </div>
        </div>
        <button v-if="userId" @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userId = ref<string>('')
const username = ref<string>('')
const userRole = ref<number>(0)

const getRoleName = computed(() => {
  switch (userRole.value) {
    case 1:
      return 'Admin'
    case 4:
      return 'Operator'
    default:
      return 'User'
  }
})

const updateUserInfo = () => {
  const loggedInUser = localStorage.getItem('user')
  if (loggedInUser) {
    const user = JSON.parse(loggedInUser)
    userId.value = user.user_id || ''
    username.value = user.user_name || 'User'
    userRole.value = parseInt(user.role) || 0
  } else {
    userId.value = ''
    username.value = ''
    userRole.value = 0
  }
}

watchEffect(updateUserInfo)

const handleLogout = () => {
  // Clear all relevant localStorage items
  localStorage.clear() // Clear all localStorage items

  // Reset user info
  updateUserInfo()

  router.push('/login')
}

// Handle storage events from other tabs
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'user' || event.key === null) {
    updateUserInfo()
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
  updateUserInfo() // Initial update
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.navbar {
  background: linear-gradient(90deg, #2e7d32 0%, #388e3c 100%);
  color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  height: 40px;
  margin-right: 1rem;
}

h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 150px;
}

.user-badge:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.user-icon {
  font-size: 1.5rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.username {
  font-weight: 600;
  font-size: 1rem;
}

.user-id {
  font-size: 0.85rem;
  opacity: 0.9;
}

.user-role {
  font-size: 0.85rem;
  color: #e8f5e9;
  background: rgba(0, 0, 0, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 2px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* Increased gap for better spacing */
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
