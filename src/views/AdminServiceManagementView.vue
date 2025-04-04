<template>
  <div class="dashboard-layout">
    <!-- Side Menu -->
    <SideMenu />

    <!-- Main Content -->
    <div class="admin-service-management">
      <h1 class="title">Admin's Service Management</h1>

      <!-- Venue Dropdown -->
      <div class="form-group">
        <label for="venue">Venue:</label>
        <select id="venue" v-model="selectedVenue" @change="filterServices" required>
          <option :value="null">Select Venue</option>
          <option v-for="venue in venues" :key="venue.venue_id" :value="venue.venue_id">
            {{ venue.venue_name }}
          </option>
        </select>
      </div>

      <!-- Display all services -->
      <div v-if="filteredServices.length" class="services-list">
        <h2 class="subtitle">All Services</h2>
        <ul>
          <li v-for="service in filteredServices" :key="service.service_id" class="service-item">
            <span class="service-details">
              {{ service.service_name }} - {{ service.description }}
              <span v-if="getVenueName(service.venue_id)">
                (Venue: {{ getVenueName(service.venue_id) }})</span
              >
            </span>
            <div class="service-actions">
              <button class="btn btn-edit" @click="editService(service)">Edit</button>
              <button class="btn btn-delete" @click="deleteService(service.service_id)">
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="no-services">
        <p>No services available for the selected venue.</p>
      </div>

      <!-- Error message display -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Create or Edit service -->
      <div class="form-container">
        <h2 class="subtitle">{{ isEditing ? 'Edit Service' : 'Create New Service' }}</h2>
        <form @submit.prevent="isEditing ? updateService() : createService()" class="service-form">
          <div class="form-group">
            <label for="serviceName">Service Name:</label>
            <input id="serviceName" v-model="currentService.service_name" required />
          </div>
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" v-model="currentService.description"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-submit">
              {{ isEditing ? 'Update Service' : 'Create Service' }}
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
import SideMenu from '@/components/SideMenu.vue' // Adjust the path if necessary

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081'

//const BASE_URL = 'http://api-ip-address/services'

export default {
  name: 'AdminServiceManagementView',
  components: {
    SideMenu,
  },
  data() {
    return {
      services: [], // List of services
      currentService: {
        service_name: '',
        description: '',
      }, // Current service being created or edited
      isEditing: false, // Flag to check if editing
      errorMessage: '', // To store error messages
      venues: [], // List of venues
      selectedVenue: null, // Selected venue
      filteredServices: [], // List of services filtered by venue
    }
  },
  methods: {
    async fetchServices() {
      try {
        const token = localStorage.getItem('token')
        const params = this.selectedVenue ? { venue_id: this.selectedVenue } : {}
        const response = await axios.get(`${BASE_URL}/services`, {
          headers: { Authorization: `Bearer ${token}` },
          params, // Pass venue_id as a query parameter if selectedVenue is set
        })
        this.services = response.data
        this.filterServices() // Apply filtering after fetching services
      } catch (error) {
        console.error('Error details:', error) // Log detailed error
        this.errorMessage =
          'Error fetching services: ' + (error.response?.data?.message || error.message)
      }
    },
    async createService() {
      try {
        const token = localStorage.getItem('token')
        const serviceData = {
          service_name: this.currentService.service_name,
          description: this.currentService.description,
          venue_id: this.selectedVenue, // Include venue_id
        }
        await axios.post(`${BASE_URL}/services`, serviceData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        await this.fetchServices() // Refresh services after creation
        this.resetForm()
        this.errorMessage = '' // Clear error message on success
      } catch (error) {
        this.errorMessage =
          'Error creating service: ' + (error.response?.data?.message || error.message)
      }
    },
    async updateService() {
      try {
        const token = localStorage.getItem('token')
        const serviceData = {
          service_id: this.currentService.service_id, // Include service_id
          user_id: null, // Set user_id to null as per the struct
          venue_id: this.selectedVenue, // Include venue_id
          service_name: this.currentService.service_name, // Include service_name
          description: this.currentService.description, // Include description
        }
        await axios.put(`${BASE_URL}/services/${this.currentService.service_id}`, serviceData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        await this.fetchServices() // Refresh services after update
        this.resetForm()
        this.errorMessage = '' // Clear error message on success
      } catch (error) {
        this.errorMessage =
          'Error updating service: ' + (error.response?.data?.message || error.message)
      }
    },
    async deleteService(serviceId) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BASE_URL}/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        await this.fetchServices() // Refresh services after deletion
        this.errorMessage = '' // Clear error message on success
      } catch (error) {
        this.errorMessage =
          'Error deleting service: ' + (error.response?.data?.message || error.message)
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
    filterServices() {
      if (!this.selectedVenue) {
        this.filteredServices = [] // Clear services when no venue is selected
      } else {
        this.filteredServices = this.services.filter(
          (service) => service.venue_id === this.selectedVenue,
        )
      }
    },
    getVenueName(venueId) {
      const venue = this.venues.find((v) => v.venue_id === venueId)
      return venue ? venue.venue_name : null
    },
    editService(service) {
      this.currentService = { ...service }
      this.isEditing = true
    },
    cancelEdit() {
      this.resetForm()
    },
    resetForm() {
      this.currentService = {
        service_name: '',
        description: '',
      }
      this.isEditing = false
    },
  },
  watch: {
    selectedVenue() {
      this.filterServices() // Re-filter services when venue changes
    },
  },
  mounted() {
    this.fetchVenues()
    this.fetchServices()
  },
}
</script>

<style scoped>
/* Reuse styles from AdminVenueManagementView.vue */
.dashboard-layout {
  display: flex;
  background-color: #f3f4f6; /* Light background for better contrast */
  min-height: 100vh;
}

.admin-service-management {
  flex: 1;
  padding: 30px; /* Increased padding for better spacing */
  background-color: #ffffff; /* White background for content area */
  border-radius: 12px; /* Softer corners */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.title {
  font-size: 2.5rem; /* Larger title for emphasis */
  font-weight: 700;
  color: #1f2937; /* Darker color for better readability */
  margin-bottom: 25px;
  text-align: center;
}

.subtitle {
  font-size: 1.8rem; /* Slightly larger subtitle */
  font-weight: 600;
  color: #374151; /* Neutral color for subtitles */
  margin-bottom: 20px;
}

.services-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb; /* Light background for service items */
  padding: 15px 20px; /* Increased padding for better spacing */
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Subtle shadow for depth */
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.service-item:hover {
  transform: translateY(-2px); /* Slight lift on hover */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Enhanced shadow on hover */
}

.service-details {
  font-size: 1.1rem; /* Slightly larger text for readability */
  color: #111827; /* Darker color for better contrast */
}

.service-actions .btn {
  margin-left: 10px;
}

.form-container {
  margin-top: 40px; /* Increased spacing above the form */
}

.service-form {
  background-color: #ffffff;
  padding: 25px; /* Increased padding for better spacing */
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.form-group {
  margin-bottom: 20px; /* Increased spacing between form groups */
}

label {
  display: block;
  margin-bottom: 8px; /* Increased spacing below labels */
  font-size: 1rem;
  color: #4b5563; /* Neutral color for labels */
  font-weight: 500;
}

textarea,
input,
select {
  width: calc(100% - 40px);
  padding: 12px; /* Increased padding for better usability */
  border: 1px solid #d1d5db; /* Neutral border color */
  border-radius: 8px; /* Softer corners */
  outline: none;
  margin-left: 20px;
  margin-right: 20px;
  font-size: 1rem; /* Consistent font size */
  color: #374151; /* Neutral text color */
  background-color: #f9fafb; /* Light background for inputs */
}

textarea:focus,
input:focus,
select:focus {
  border-color: #2563eb; /* Blue border on focus */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2); /* Subtle focus ring */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px; /* Increased spacing between buttons */
}

.btn {
  padding: 12px 20px; /* Increased padding for better usability */
  border: none;
  border-radius: 8px; /* Softer corners */
  cursor: pointer;
  font-size: 1rem; /* Consistent font size */
  font-weight: 600; /* Bold text for buttons */
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.btn-submit {
  background-color: #2563eb; /* Blue background for primary action */
  color: #ffffff;
}

.btn-submit:hover {
  background-color: #1d4ed8; /* Darker blue on hover */
  transform: translateY(-2px); /* Slight lift on hover */
}

.btn-cancel {
  background-color: #e5e7eb; /* Neutral background for cancel button */
  color: #374151; /* Neutral text color */
}

.btn-cancel:hover {
  background-color: #d1d5db; /* Slightly darker on hover */
  transform: translateY(-2px); /* Slight lift on hover */
}

.btn-edit {
  background-color: #facc15; /* Yellow background for edit button */
  color: #1f2937; /* Dark text for contrast */
}

.btn-edit:hover {
  background-color: #eab308; /* Darker yellow on hover */
  transform: translateY(-2px); /* Slight lift on hover */
}

.btn-delete {
  background-color: #ef4444; /* Red background for delete button */
  color: #ffffff;
}

.btn-delete:hover {
  background-color: #dc2626; /* Darker red on hover */
  transform: translateY(-2px); /* Slight lift on hover */
}

.no-services {
  text-align: center;
  color: #6b7280; /* Neutral text color */
  font-size: 1.1rem; /* Slightly larger text for emphasis */
  margin-top: 20px; /* Spacing above the message */
}

.error-message {
  margin: 15px 0; /* Increased spacing around error messages */
  padding: 15px; /* Increased padding for better visibility */
  background-color: #fee2e2; /* Light red background for errors */
  color: #b91c1c; /* Dark red text for contrast */
  border: 1px solid #fca5a5; /* Red border for emphasis */
  border-radius: 8px; /* Softer corners */
  text-align: center;
  font-size: 1rem; /* Consistent font size */
}
</style>
