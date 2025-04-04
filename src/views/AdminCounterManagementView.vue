<template>
  <div class="dashboard-layout">
    <SideMenu />

    <div class="admin-counter-management">
      <h1 class="title">Admin's Counter Management</h1>

      <!-- Filters Section -->
      <div class="filters">
        <div class="filter-group">
          <label for="filterVenue">Filter by Venue:</label>
          <select id="filterVenue" v-model="selectedVenue" @change="applyFilters">
            <option value="">All Venues</option>
            <option v-for="venue in venues" :key="venue.venue_id" :value="venue.venue_id">
              {{ venue.venue_name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filterService">Filter by Service:</label>
          <select id="filterService" v-model="selectedService" @change="applyFilters">
            <option value="">All Services</option>
            <option
              v-for="service in filteredServices"
              :key="service.service_id"
              :value="service.service_id"
            >
              {{ service.service_name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="filteredCounters.length" class="counters-list">
        <h2 class="subtitle">All Counters</h2>
        <div class="counter-cards">
          <div v-for="counter in filteredCounters" :key="counter.counter_id" class="counter-card">
            <div class="card-header">
              <h3 class="counter-name">{{ counter.counter_name }}</h3>
              <span class="vip-badge" v-if="counter.is_vip">VIP</span>
            </div>
            <div class="card-body">
              <p><strong>Venue:</strong> {{ getVenueName(counter.venue_id) }}</p>
              <p><strong>Service:</strong> {{ getServiceName(counter.service_id) }}</p>
              <p>
                <strong>Operator:</strong> {{ counter.operator_name }} ({{ counter.operator_nik }})
              </p>
              <p>
                <strong>Open:</strong> {{ counter.open_time }} | <strong>Close:</strong>
                {{ counter.close_time }}
              </p>
            </div>
            <div class="card-actions">
              <button class="btn btn-edit" @click="editCounter(counter)">Edit</button>
              <button class="btn btn-delete" @click="deleteCounter(counter.counter_id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-counters">
        <p>No counters available.</p>
      </div>

      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>

      <div class="form-container">
        <h2 class="subtitle">{{ isEditing ? 'Edit Counter' : 'Create New Counter' }}</h2>
        <form @submit.prevent="isEditing ? updateCounter() : createCounter()" class="counter-form">
          <div class="form-group">
            <label for="counterName">Counter Name:</label>
            <input id="counterName" v-model="currentCounter.counter_name" required />
          </div>
          <div class="form-group">
            <label for="operatorName">Operator Name:</label>
            <input id="operatorName" v-model="currentCounter.operator_name" />
          </div>
          <div class="form-group">
            <label for="operatorNIK">Operator NIK:</label>
            <input id="operatorNIK" v-model="currentCounter.operator_nik" />
          </div>
          <div class="form-group">
            <label for="openTime">Open Time:</label>
            <input id="openTime" type="time" v-model="currentCounter.open_time" />
          </div>
          <div class="form-group">
            <label for="closeTime">Close Time:</label>
            <input id="closeTime" type="time" v-model="currentCounter.close_time" />
          </div>
          <div class="form-group">
            <label for="isVIP">VIP:</label>
            <input id="isVIP" type="checkbox" v-model="currentCounter.is_vip" />
          </div>
          <div class="form-group">
            <label for="venueId">Venue:</label>
            <select
              id="venueId"
              v-model="currentCounter.venue_id"
              @change="filterServices"
              required
            >
              <option value="" disabled>Select a venue</option>
              <option v-for="venue in venues" :key="venue.venue_id" :value="venue.venue_id">
                {{ venue.venue_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="serviceId">Service:</label>
            <select id="serviceId" v-model="currentCounter.service_id" required>
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
          <div class="form-actions">
            <button type="submit" class="btn btn-submit">
              {{ isEditing ? 'Update Counter' : 'Create Counter' }}
            </button>
            <button type="button" v-if="isEditing" class="btn btn-cancel" @click="cancelEdit">
              Cancel
            </button>
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
  name: 'AdminCounterManagementView',
  components: {
    SideMenu,
  },
  data() {
    return {
      counters: [],
      venues: [],
      services: [],
      filteredCounters: [],
      filteredServices: [],
      selectedVenue: '',
      selectedService: '',
      currentCounter: {
        counter_name: '',
        operator_name: '',
        operator_nik: '',
        open_time: '08:00:00',
        close_time: '17:00:00',
        is_vip: false,
        venue_id: '',
        service_id: '',
      },
      isEditing: false,
      errorMessage: '',
    }
  },
  methods: {
    async fetchCounters() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/counters/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.counters = response.data
        this.filteredCounters = this.counters // Initialize filtered counters
      } catch (error) {
        this.errorMessage =
          'Error fetching counters: ' + (error.response?.data?.message || error.message)
      }
    },
    async fetchVenuesAndServices() {
      try {
        const token = localStorage.getItem('token')
        const venuesResponse = await axios.get(`${BASE_URL}/venues`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.venues = venuesResponse.data

        const allServices = []
        for (const venue of this.venues) {
          const servicesResponse = await axios.get(`${BASE_URL}/services/venue/${venue.venue_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          allServices.push(...servicesResponse.data)
        }
        this.services = allServices
        this.filteredServices = this.services // Initialize filtered services
      } catch (error) {
        this.errorMessage =
          'Error fetching venues or services: ' + (error.response?.data?.message || error.message)
      }
    },
    applyFilters() {
      // Filter services based on selected venue
      this.filteredServices = this.selectedVenue
        ? this.services.filter((service) => service.venue_id === this.selectedVenue)
        : this.services

      // Filter counters based on selected venue and service
      this.filteredCounters = this.counters.filter((counter) => {
        const matchesVenue = this.selectedVenue ? counter.venue_id === this.selectedVenue : true
        const matchesService = this.selectedService
          ? counter.service_id === this.selectedService
          : true
        return matchesVenue && matchesService
      })
    },
    getVenueName(venueId) {
      const venue = this.venues.find((v) => v.venue_id === venueId)
      return venue ? venue.venue_name : 'Unknown Venue'
    },
    getServiceName(serviceId) {
      const service = this.services.find((s) => s.service_id === serviceId)
      return service ? service.service_name : 'Unknown Service'
    },

    async createCounter() {
      try {
        const token = localStorage.getItem('token')
        const payload = {
          ...this.currentCounter,
          open_time: this.formatTime(this.currentCounter.open_time),
          close_time: this.formatTime(this.currentCounter.close_time),
        }
        await axios.post(`${BASE_URL}/counters/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.resetForm()
        this.errorMessage = ''
        await this.fetchCounters() // Refresh counters
      } catch (error) {
        this.errorMessage =
          'Error creating counter: ' + (error.response?.data?.message || error.message)
      }
    },
    async updateCounter() {
      try {
        const token = localStorage.getItem('token')
        const payload = {
          ...this.currentCounter,
          open_time: this.formatTime(this.currentCounter.open_time),
          close_time: this.formatTime(this.currentCounter.close_time),
        }
        await axios.put(`${BASE_URL}/counters/${this.currentCounter.counter_id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.resetForm()
        this.errorMessage = ''
        await this.fetchCounters() // Refresh counters
      } catch (error) {
        this.errorMessage =
          'Error updating counter: ' + (error.response?.data?.message || error.message)
      }
    },
    async deleteCounter(counterId) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BASE_URL}/counters/${counterId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.errorMessage = ''
        await this.fetchCounters() // Refresh counters
      } catch (error) {
        this.errorMessage =
          'Error deleting counter: ' + (error.response?.data?.message || error.message)
      }
    },
    formatTime(time) {
      // Ensure time is in HH:mm:ss format
      return time.length === 5 ? `${time}:00` : time
    },
    editCounter(counter) {
      this.currentCounter = { ...counter }
      this.isEditing = true
    },
    cancelEdit() {
      this.resetForm()
    },
    resetForm() {
      this.currentCounter = {
        counter_name: '',
        operator_name: '',
        operator_nik: '',
        open_time: '08:00', // Default value
        close_time: '17:00', // Default value
        is_vip: false,
        venue_id: '',
        service_id: '',
      }
      this.isEditing = false
    },
    filterServices() {
      this.filteredServices = this.currentCounter.venue_id
        ? this.services.filter((service) => service.venue_id === this.currentCounter.venue_id)
        : []
      this.currentCounter.service_id = '' // Reset service selection
    },
  },
  mounted() {
    this.fetchCounters()
    this.fetchVenuesAndServices() // Fetch venues and services during initial load
  },
}
</script>

<style scoped>
/* Improved styles for better look and feel */
.dashboard-layout {
  display: flex;
  background-color: #f9f9f9;
  min-height: 100vh;
}

.admin-counter-management {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px;
}

.title {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f1f1f1;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.filter-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.3s;
}

.filter-group select:hover {
  border-color: #007bff;
}

.counters-list {
  margin-top: 20px;
}

.counter-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.counter-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.counter-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.counter-name {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}

.vip-badge {
  background: #ffd700;
  color: #fff;
  font-size: 0.8em;
  padding: 2px 8px;
  border-radius: 12px;
}

.card-body {
  margin-top: 10px;
  font-size: 0.9em;
  color: #555;
}

.card-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-edit {
  background: #007bff;
  color: #fff;
}

.btn-edit:hover {
  background: #0056b3;
}

.btn-delete {
  background: #dc3545;
  color: #fff;
}

.btn-delete:hover {
  background: #a71d2a;
}

.form-container {
  margin-top: 30px;
  padding: 20px;
  background-color: #f1f1f1;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.counter-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.3s;
}

.form-group input:hover,
.form-group select:hover {
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-submit {
  background: #28a745;
  color: #fff;
}

.btn-submit:hover {
  background: #218838;
}

.btn-cancel {
  background: #6c757d;
  color: #fff;
}

.btn-cancel:hover {
  background: #5a6268;
}

.error-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
