<template>
  <div class="dashboard-layout">
    <SideMenu />
    <div class="admin-user-management">
      <h1 class="title">Admin's User Management</h1>

      <!-- Main Content -->
      <div class="admin-user-management">
        <h1 class="title">Admin's User Management</h1>

        <!-- Display all users -->
        <div v-if="users.length" class="users-list">
          <h2 class="subtitle">All Users</h2>
          <table class="users-table">
            <thead>
              <tr>
                <th>UserID</th>
                <th>Company Name</th>
                <th>Role</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.user_id">
                <td>{{ user.user_id }}</td>
                <td>{{ user.company_name }}</td>
                <td>{{ user.role_id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <button class="btn btn-edit" @click="openEditModal(user)">Edit</button>
                  <button class="btn btn-delete" @click="deleteUser(user.user_id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-users">
          <p>No users available.</p>
        </div>

        <!-- Success message display -->
        <div v-if="successMessage" class="success-message">
          <p>{{ successMessage }}</p>
        </div>

        <!-- Error message display -->
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Create or Edit user -->
        <div class="form-container">
          <h2 class="subtitle">{{ isEditing ? 'Edit User' : 'Create New User' }}</h2>
          <form @submit.prevent="isEditing ? updateUser() : createUser()" class="user-form">
            <div class="form-group">
              <label for="companyName">Company Name:</label>
              <input id="companyName" v-model="form.company_name" readonly />
            </div>
            <div class="form-group">
              <label for="role">Role:</label>
              <select id="role" v-model="form.role_id" required>
                <option v-for="role in roles" :key="role.role_id" :value="role.role_id">
                  {{ role.role_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="username">Username:</label>
              <input id="username" v-model="form.username" required />
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input id="email" v-model="form.email" type="email" required />
            </div>
            <div class="form-group" v-if="!isEditing">
              <label for="password">Password:</label>
              <input id="password" v-model="form.password" type="password" required />
            </div>
            <!-- Add these new form groups for editing password -->
            <div class="form-group" v-if="isEditing && showPasswordFields">
              <label for="newPassword">New Password:</label>
              <input id="newPassword" v-model="form.newPassword" type="password" />
            </div>
            <div class="form-group" v-if="isEditing && showPasswordFields">
              <label for="confirmPassword">Confirm Password:</label>
              <input id="confirmPassword" v-model="form.confirmPassword" type="password" />
            </div>
            <div class="form-group" v-if="isEditing">
              <button type="button" class="btn btn-secondary" @click="togglePasswordFields">
                {{ showPasswordFields ? 'Cancel Password Change' : 'Change Password' }}
              </button>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-submit">
                {{ isEditing ? 'Update User' : 'Create User' }}
              </button>
              <button type="button" v-if="isEditing" class="btn btn-cancel" @click="closeModal">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SideMenu from '@/components/SideMenu.vue' // Adjust the path if necessary

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081'

export default {
  data() {
    return {
      users: [],
      roles: [],
      form: {
        company_name: '',
        role_id: null,
        username: '',
        email: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
      },
      showModal: false,
      isEditing: false,
      editingUserId: null,
      errorMessage: '', // To store error messages
      successMessage: '', // To store success messages
      showPasswordFields: false,
    }
  },
  components: {
    SideMenu,
  },
  methods: {
    async fetchUsers() {
      try {
        const token = this.getToken()
        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.users = response.data
      } catch (error) {
        this.handleError(error)
      }
    },
    async fetchRoles() {
      try {
        const token = this.getToken()
        const response = await axios.get(`${API_BASE_URL}/roles/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.roles = response.data.filter((role) => role.role_id !== 0)
      } catch (error) {
        this.handleError(error)
      }
    },
    openCreateModal() {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))
      this.resetForm()
      this.form.company_name = loggedInUser?.company_name || '' // Populate company_name with logged-in user's company name
      this.isEditing = false
      this.showModal = true
    },
    openEditModal(user) {
      this.form = {
        ...user,
        password: '',
        newPassword: '',
        confirmPassword: '',
      }
      this.isEditing = true
      this.editingUserId = user.user_id
      this.showModal = true
      this.showPasswordFields = false
    },
    closeModal() {
      this.resetForm() // Reset the form fields
      this.isEditing = false // Switch back to the create form view
      this.showModal = false // Hide the modal
      this.errorMessage = '' // Clear any error messages
      this.successMessage = '' // Clear any success messages
    },
    resetForm() {
      this.form = {
        //company_name: '',
        role_id: null,
        username: '',
        email: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
      }
      this.showPasswordFields = false
    },
    async createUser() {
      try {
        const token = this.getToken()
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))

        const payload = {
          username: this.form.username,
          password: this.form.password, // Map password directly
          email: this.form.email,
          company_name: this.form.company_name,
          role_id: this.form.role_id,
          owner_id: loggedInUser?.owner_id || null, // Optional owner_id
        }

        await axios.post(`${API_BASE_URL}/users/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.fetchUsers()
        this.closeModal()
        this.errorMessage = '' // Clear any previous error messages
        this.successMessage = 'User created successfully!' // Display success message
      } catch (error) {
        this.successMessage = '' // Clear any previous success messages
        this.handleError(error)
      }
    },
    async updateUser() {
      if (this.showPasswordFields) {
        if (!this.form.newPassword || !this.form.confirmPassword) {
          this.errorMessage = 'Please fill in both password fields'
          return
        }
        if (this.form.newPassword !== this.form.confirmPassword) {
          this.errorMessage = 'Passwords do not match'
          return
        }
      }

      try {
        const token = this.getToken()
        const payload = {
          ...this.form,
          password: this.showPasswordFields ? this.form.newPassword : undefined,
        }

        // Remove extra fields before sending
        delete payload.newPassword
        delete payload.confirmPassword

        await axios.put(`${API_BASE_URL}/users/${this.editingUserId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.fetchUsers()
        this.closeModal()
        this.errorMessage = '' // Clear any previous error messages
        this.successMessage = 'User updated successfully!' // Display success message
      } catch (error) {
        this.successMessage = '' // Clear any previous success messages
        this.errorMessage = error.response?.data?.message || 'Failed to update user' // Display error message
      }
    },
    async deleteUser(userId) {
      try {
        const token = this.getToken()
        await axios.delete(`${API_BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.fetchUsers()
      } catch (error) {
        this.handleError(error)
      }
    },
    getToken() {
      return localStorage.getItem('token')
    },
    handleError(error) {
      this.errorMessage = error.response?.data?.message || 'An error occurred'
    },
    togglePasswordFields() {
      this.showPasswordFields = !this.showPasswordFields
      if (!this.showPasswordFields) {
        this.form.newPassword = ''
        this.form.confirmPassword = ''
      }
    },
  },
  mounted() {
    this.fetchUsers()
    this.fetchRoles()
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))
    this.form.company_name = loggedInUser?.company_name || '' // Populate company_name with logged-in user's company name
  },
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
}

.admin-user-management {
  flex: 1;
  padding: 20px;
}

.admin-user-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  text-align: center;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 15px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.users-table th,
.users-table td {
  border: 1px solid #cbd5e1;
  padding: 10px;
  text-align: left;
}

.users-table th {
  background-color: #f1f5f9;
  color: #1e293b;
}

.users-table tr:nth-child(even) {
  background-color: #f9fafb;
}

.users-table tr:hover {
  background-color: #e2e8f0;
}

.form-container {
  margin-top: 30px;
}

.user-form {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #475569;
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

input:focus,
select:focus {
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-submit {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-submit:hover {
  background-color: #2563eb;
}

.btn-cancel {
  background-color: #e5e7eb;
  color: #1e293b;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

.btn-edit {
  background-color: #facc15;
  color: #1e293b;
}

.btn-edit:hover {
  background-color: #eab308;
}

.btn-delete {
  background-color: #ef4444;
  color: #ffffff;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.btn-secondary {
  background-color: #64748b;
  color: #ffffff;
  margin-bottom: 10px;
}

.btn-secondary:hover {
  background-color: #475569;
}

.no-users {
  text-align: center;
  color: #64748b;
}

.error-message {
  margin: 10px 0;
  padding: 10px;
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  text-align: center;
}

.success-message {
  margin: 10px 0;
  padding: 10px;
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
  border-radius: 6px;
  text-align: center;
}
</style>
