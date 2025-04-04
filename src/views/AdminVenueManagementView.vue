<template>
  <div class="dashboard-layout">
    <!-- Side Menu -->
    <SideMenu />

    <!-- Main Content -->
    <div class="admin-venue-management">
      <h1 class="title">Admin's Venue Management</h1>

      <!-- Display all venues -->
      <div v-if="venues.length" class="venues-list">
        <h2 class="subtitle">All Venues</h2>
        <ul>
          <li v-for="venue in venues" :key="venue.venue_id" class="venue-item">
            <span class="venue-details">
              {{ venue.venue_name }} - {{ venue.city }}, {{ venue.province }}
            </span>
            <div class="venue-actions">
              <button class="btn btn-edit" @click="editVenue(venue)">Edit</button>
              <button class="btn btn-delete" @click="deleteVenue(venue.venue_id)">Delete</button>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="no-venues">
        <p>No venues available.</p>
      </div>

      <!-- Error message display -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Create or Edit venue -->
      <div class="form-container">
        <h2 class="subtitle">{{ isEditing ? 'Edit Venue' : 'Create New Venue' }}</h2>
        <form @submit.prevent="isEditing ? updateVenue() : createVenue()" class="venue-form">
          <div class="form-group">
            <label for="venueName">Venue Name:</label>
            <input id="venueName" v-model="currentVenue.venue_name" required />
          </div>
          <div class="form-group">
            <label for="address">Address:</label>
            <input id="address" v-model="currentVenue.address" />
          </div>
          <div class="form-group">
            <label for="city">City:</label>
            <input id="city" v-model="currentVenue.city" />
          </div>
          <div class="form-group">
            <label for="province">Province:</label>
            <input id="province" v-model="currentVenue.province" />
          </div>
          <div class="form-group">
            <label for="postalCode">Postal Code:</label>
            <input id="postalCode" v-model="currentVenue.postal_code" />
          </div>
          <div class="form-group">
            <label for="phone">Phone:</label>
            <input id="phone" v-model="currentVenue.phone" />
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input id="email" v-model="currentVenue.email" />
          </div>
          <div class="form-group">
            <label for="openTime">Open Time:</label>
            <input id="openTime" v-model="currentVenue.open_time" type="time" />
          </div>
          <div class="form-group">
            <label for="closeTime">Close Time:</label>
            <input id="closeTime" v-model="currentVenue.close_time" type="time" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-submit">
              {{ isEditing ? 'Update Venue' : 'Create Venue' }}
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

export default {
  name: 'AdminVenueManagementView',
  components: {
    SideMenu,
  },
  data() {
    return {
      venues: [], // List of venues
      currentVenue: {
        venue_name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: '',
        open_time: '09:00',
        close_time: '17:00',
      },
      isEditing: false, // Flag to check if editing
      errorMessage: '', // To store error messages
    }
  },
  methods: {
    async fetchVenues() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/venues`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        this.venues = response.data
      } catch (error) {
        console.error('Error details:', error) // Log detailed error
        this.errorMessage =
          'Error fetching venues: ' + (error.response?.data?.message || error.message)
      }
    },
    async createVenue() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${BASE_URL}/venues`, this.currentVenue, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.venues.push(response.data)
        this.resetForm()
        this.errorMessage = '' // Clear error message on success
      } catch (error) {
        this.errorMessage =
          'Error creating venue: ' + error.response?.data?.message || error.message
      }
    },
    async updateVenue() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.put(
          `${BASE_URL}/venues/${this.currentVenue.venue_id}`,
          this.currentVenue,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        const index = this.venues.findIndex(
          (venue) => venue.venue_id === this.currentVenue.venue_id,
        )
        if (index !== -1) {
          this.venues.splice(index, 1, response.data)
        }
        this.resetForm()
        this.errorMessage = '' // Clear error message on success
      } catch (error) {
        this.errorMessage =
          'Error updating venue: ' + error.response?.data?.message || error.message
      }
    },
    async deleteVenue(venueId) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BASE_URL}/venues/${venueId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.venues = this.venues.filter((venue) => venue.venue_id !== venueId)
        this.errorMessage = '' // Clear error message on success
      } catch (error) {
        this.errorMessage =
          'Error deleting venue: ' + error.response?.data?.message || error.message
      }
    },
    editVenue(venue) {
      this.currentVenue = { ...venue }
      this.isEditing = true
    },
    cancelEdit() {
      this.resetForm()
    },
    resetForm() {
      this.currentVenue = {
        venue_name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: '',
        open_time: '09:00',
        close_time: '17:00',
      }
      this.isEditing = false
    },
  },
  mounted() {
    this.fetchVenues()
  },
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
}

.admin-venue-management {
  flex: 1;
  padding: 20px;
  /* Ensure it works well with the side menu */
}

.admin-venue-management {
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

.venues-list ul {
  list-style: none;
  padding: 0;
}

.venue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.venue-details {
  font-size: 1rem;
  color: #1e293b;
}

.venue-actions .btn {
  margin-left: 10px;
}

.form-container {
  margin-top: 30px;
}

.venue-form {
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

input {
  width: calc(100% - 40px); /* Adjust width to account for left and right margins */
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  margin-left: 20px; /* Updated margin-left */
  margin-right: 20px; /* Updated margin-right */
}

input:focus {
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

.no-venues {
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
