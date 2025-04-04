<template>
  <div class="auth-container">
    <div class="auth-card">
      <img src="@/assets/logo.png" alt="NovAI QueueSystem Logo" class="logo" />
      <h1 class="title">Register to NovAI QueueSystem</h1>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="name" placeholder="Enter your full name" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Create a password"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            required
          />
          <span class="error-text" v-if="passwordError">{{ passwordError }}</span>
        </div>

        <div class="form-group">
          <label for="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            v-model="companyName"
            placeholder="Enter your company name"
            required
          />
        </div>

        <button type="submit" class="btn-primary">Register</button>
      </form>

      <p class="footer-text">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      companyName: '',
      confirmPassword: '',
      passwordError: '',
      message: '',
      messageType: '',
    }
  },
  methods: {
    async handleRegister() {
      // Reset messages
      this.message = ''
      this.passwordError = ''

      // Validate passwords
      if (this.password !== this.confirmPassword) {
        this.passwordError = 'Passwords do not match'
        return
      }

      if (this.password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters long'
        return
      }

      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081'
      const requestBody = {
        username: this.name,
        password: this.password,
        email: this.email,
        company_name: this.companyName,
        role_id: 1,
      }

      try {
        const response = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Registration failed:', errorData)
          this.message = errorData.message || 'Registration failed'
          this.messageType = 'error'
          return
        }

        const responseData = await response.json()
        console.log('Registration successful:', responseData)
        this.message = 'Registration successful! Redirecting to login...'
        this.messageType = 'success'
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      } catch (error) {
        console.error('Error during registration:', error)
        this.message = 'An error occurred during registration. Please try again.'
        this.messageType = 'error'
      }
    },
  },
}
</script>

<style scoped>
/* Same styles as LoginView for consistency */
.auth-container {
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
}

.auth-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo {
  width: 100px;
  margin-bottom: 20px;
}

.title {
  margin-bottom: 20px;
  color: #1e293b;
  font-weight: 600;
}

.form-group {
  text-align: left;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #475569;
}

input {
  width: 100%;
  padding: 10px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

.btn-primary {
  width: 100%;
  background-color: #3b82f6;
  color: #ffffff;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.footer-text {
  margin-top: 15px;
  font-size: 14px;
  color: #64748b;
}

.footer-text a {
  color: #3b82f6;
  text-decoration: none;
}

.message {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #166534;
}

.error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
