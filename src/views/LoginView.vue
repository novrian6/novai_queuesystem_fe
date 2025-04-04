<template>
  <div class="auth-container">
    <div class="auth-card">
      <img src="@/assets/logo.png" alt="NovAI QueueSystem Logo" class="logo" />
      <h1 class="title">Login to NovAI QueueSystem</h1>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button type="submit" class="btn-primary">Login</button>
      </form>

      <p class="footer-text">
        Don't have an account?
        <router-link to="/register">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '', // Added to store error messages
    }
  },
  methods: {
    async getCounterByUser(userId, token) {
      try {
        const response = await axios.get(`${BASE_URL}/user-counter-map/counter-by-user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      } catch (error) {
        console.error('Error fetching counter data:', error)
        throw error
      }
    },

    async getCounterDetails(counterId, token) {
      try {
        const response = await axios.get(`${BASE_URL}/counters/${counterId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      } catch (error) {
        console.error('Error fetching counter details:', error)
        throw error
      }
    },

    async handleLogin() {
      const loginEndpoint = `${BASE_URL}/auth/login`

      try {
        const response = await axios.post(loginEndpoint, {
          username: this.username,
          password: this.password,
        })
        const token = response.data.token
        const userData = {
          user_id: response.data.user_id,
          username: response.data.user_name,
          role: response.data.role,
        }

        // If user is an operator, fetch additional data
        if (response.data.role === 'operator') {
          try {
            const counterMapData = await this.getCounterByUser(response.data.user_id, token)
            if (counterMapData) {
              const counterDetails = await this.getCounterDetails(counterMapData.counter_id, token)

              // Store operator-specific data
              const operatorData = {
                operator_id: response.data.user_id,
                counter_id: counterMapData.counter_id,
                venue_id: counterDetails.venue_id,
                service_id: counterDetails.service_id,
              }
              localStorage.setItem('operatorData', JSON.stringify(operatorData))
            }
          } catch (error) {
            console.error('Error fetching operator data:', error)
          }
        }

        localStorage.setItem('token', token)
        localStorage.setItem('loggedInUser', JSON.stringify(userData))
        localStorage.setItem('user', JSON.stringify(response.data))
        this.$router.push('/dashboard')
      } catch (error) {
        console.error('Error during login:', error)
        this.errorMessage = 'Error:' + error.response.data.error // Handle unexpected errors
      }
    },
  },
}
</script>

<style scoped>
.auth-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  padding: 20px;
}

.auth-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo {
  width: 80px;
  height: auto;
  margin-bottom: 1.5rem;
}

.title {
  margin-bottom: 1.5rem;
  color: #1e293b;
  font-weight: 600;
  font-size: 1.5rem;
}

.form-group {
  text-align: left;
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-size: 0.875rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  width: 100%;
  background-color: #3b82f6;
  color: #ffffff;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.footer-text {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.footer-text a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  text-decoration: underline;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: left;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.25rem;
  }

  input {
    padding: 0.625rem;
  }
}
</style>
