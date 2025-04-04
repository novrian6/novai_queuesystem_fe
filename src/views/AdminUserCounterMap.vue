<template>
  <div class="dashboard-layout">
    <!-- Side Menu -->
    <SideMenu />

    <!-- Main Content -->
    <div class="admin-user-counter-map">
      <h1 class="title">Admin's User-Counter Management</h1>

      <!-- Existing User-Counter Mappings -->
      <div v-if="userCounterMaps.length" class="mappings-list">
        <h2 class="subtitle">Existing User-Counter Mappings</h2>
        <table class="mappings-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Counter</th>
              <th>Assigned At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mapping in userCounterMaps" :key="mapping.user_counter_map_id">
              <td>{{ getUserName(mapping.user_id) }}</td>
              <td>{{ getCounterName(mapping.counter_id) }}</td>
              <td>{{ mapping.assigned_at }}</td>
              <td>
                <button class="btn btn-delete" @click="removeMapping(mapping.user_counter_map_id)">
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-mappings">
        <p>No user-counter mappings available.</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Assign User to Counter -->
      <div class="form-container">
        <h2 class="subtitle">Assign User to Counter</h2>
        <form @submit.prevent="assignUserToCounter" class="mapping-form">
          <div class="form-group">
            <label for="userId">User:</label>
            <select id="userId" v-model="newMapping.user_id" required>
              <option value="" disabled>Select a user</option>
              <option v-for="user in users" :key="user.user_id" :value="user.user_id">
                {{ user.username }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="venueId">Venue:</label>
            <select id="venueId" v-model="selectedVenue" @change="filterServices" required>
              <option value="" disabled>Select a venue</option>
              <option v-for="venue in venues" :key="venue.venue_id" :value="venue.venue_id">
                {{ venue.venue_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="serviceId">Service:</label>
            <select id="serviceId" v-model="selectedService" @change="filterCounters" required>
              <option value="" disabled>Select a service</option>
              <option
                v-for="service in filteredServices"
                :key="service.service_id"
                :value="service.service_id"
              >
                {{ service.service_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="counterId">Counter:</label>
            <select id="counterId" v-model="newMapping.counter_id" required>
              <option value="" disabled>Select a counter</option>
              <option
                v-for="counter in filteredCounters"
                :key="counter.counter_id"
                :value="counter.counter_id"
              >
                {{ counter.counter_name }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-submit">Assign</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SideMenu from '@/components/SideMenu.vue'

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081'

export default {
  name: 'AdminUserCounterMap',
  components: {
    SideMenu,
  },
  data() {
    return {
      userCounterMaps: [],
      users: [],
      venues: [],
      services: [],
      counters: [],
      filteredServices: [],
      filteredCounters: [],
      selectedVenue: null,
      selectedService: null,
      newMapping: {
        user_id: null,
        counter_id: null,
      },
      errorMessage: '',
    }
  },
  methods: {
    async fetchMappings() {
      try {
        const token = localStorage.getItem('token')
        console.log('Fetching mappings with token:', token)
        const response = await axios.get(`${BASE_URL}/user-counter-map/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('Mappings fetched:', response.data)
        this.userCounterMaps = response.data
      } catch (error) {
        console.error('Error fetching mappings:', error.response || error.message)
        this.errorMessage =
          'Error fetching mappings: ' + (error.response?.data?.message || error.message)
      }
    },
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.users = response.data
      } catch (error) {
        this.errorMessage =
          'Error fetching users: ' + (error.response?.data?.message || error.message)
      }
    },
    async fetchVenues() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/venues`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.venues = response.data
      } catch (error) {
        this.errorMessage =
          'Error fetching venues: ' + (error.response?.data?.message || error.message)
      }
    },
    async fetchCounters() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/counters/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.counters = response.data
      } catch (error) {
        this.errorMessage =
          'Error fetching counters: ' + (error.response?.data?.message || error.message)
      }
    },
    async filterServices() {
      try {
        if (!this.selectedVenue) {
          this.filteredServices = []
          this.selectedService = null
          return
        }
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/services/venue/${this.selectedVenue}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.filteredServices = response.data
        this.selectedService = null
        this.filteredCounters = []
      } catch (error) {
        this.errorMessage =
          'Error fetching services: ' + (error.response?.data?.message || error.message)
      }
    },
    filterCounters() {
      this.filteredCounters = this.counters.filter(
        (counter) => counter.service_id === this.selectedService,
      )
      this.newMapping.counter_id = null
    },
    async assignUserToCounter() {
      try {
        const token = localStorage.getItem('token')
        await axios.post(`${BASE_URL}/user-counter-map/`, this.newMapping, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.fetchMappings()
        this.newMapping.user_id = null
        this.newMapping.counter_id = null
        this.selectedVenue = null
        this.selectedService = null
        this.errorMessage = ''
      } catch (error) {
        this.errorMessage =
          'Error assigning user to counter: ' + (error.response?.data?.message || error.message)
      }
    },
    async removeMapping(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BASE_URL}/user-counter-map/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.fetchMappings()
        this.errorMessage = ''
      } catch (error) {
        this.errorMessage =
          'Error removing mapping: ' + (error.response?.data?.message || error.message)
      }
    },
    getUserName(userId) {
      const user = this.users.find((u) => u.user_id === userId)
      return user ? user.username : 'Unknown User'
    },
    getCounterName(counterId) {
      const counter = this.counters.find((c) => c.counter_id === counterId)
      return counter ? counter.counter_name : 'Unknown Counter'
    },
  },
  mounted() {
    this.fetchVenues()
    this.fetchCounters()
    this.fetchUsers()
    this.fetchMappings()
  },
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
}

.admin-user-counter-map {
  flex: 1;
  padding: 20px;
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

.mappings-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.mappings-table th,
.mappings-table td {
  border: 1px solid #cbd5e1;
  padding: 10px;
  text-align: left;
}

.mappings-table th {
  background-color: #f1f5f9;
  color: #1e293b;
}

.mappings-table tr:nth-child(even) {
  background-color: #f9fafb;
}

.mappings-table tr:hover {
  background-color: #e2e8f0;
}

.form-container {
  margin-top: 30px;
}

.mapping-form {
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

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

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

.btn-delete {
  background-color: #ef4444;
  color: #ffffff;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.no-mappings {
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
</style>
