<template>
  <div class="operator-view">
    <div class="container">
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div class="section selectors">
        <div class="selector-grid">
          <div class="selector-item">
            <label>Venue</label>
            <select v-model="selectedVenue" class="dropdown" :disabled="isOperator" @change="filterServices">
              <option :value="null">Select Venue</option>
              <option v-for="venue in venues" :key="venue.venue_id" :value="venue.venue_id">
                {{ venue.venue_name }}
              </option>
            </select>
          </div>

          <div class="selector-item">
            <label>Service</label>
            <select
              v-model="selectedService"
              class="dropdown"
              :disabled="isOperator || !selectedVenue"
            >
              <option :value="null">Select Service</option>
              <option
                v-for="service in filteredServices"
                :key="service.service_id"
                :value="service.service_id"
              >
                {{ service.service_name }}
              </option>
            </select>
          </div>

          <div class="selector-item">
            <label>Counter</label>
            <select
              v-model="selectedCounter"
              class="dropdown"
              :disabled="isOperator || !selectedService"
            >
              <option :value="null">Select Counter</option>
              <option
                v-for="counter in filteredCounters"
                :key="counter.counter_id"
                :value="counter.counter_id"
              >
                {{ counter.counter_name }}
              </option>
            </select>
            <div v-if="selectedOperatorInfo" class="operator-info">
              <span class="operator-label">Operator:</span>
              <span class="operator-value"
                >{{ selectedOperatorInfo.name }} (ID: {{ selectedOperatorInfo.id }})</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="section queue-stats" v-if="selectedService">
        <h2 class="section-title">Queue Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card waiting">
            <span class="stat-label">Waiting</span>
            <span class="stat-value">{{ queueStats.waiting }}</span>
          </div>
          <div class="stat-card called">
            <span class="stat-label">Called</span>
            <span class="stat-value">{{ queueStats.called }}</span>
          </div>
          <div class="stat-card completed">
            <span class="stat-label">Completed</span>
            <span class="stat-value">{{ queueStats.completed }}</span>
          </div>
          <div class="stat-card skipped">
            <span class="stat-label">Skipped</span>
            <span class="stat-value">{{ queueStats.skipped }}</span>
          </div>
        </div>
      </div>

      <div class="section next-queues">
        <h2 class="section-title">Next in Queue</h2>
        <div class="queue-list">
          <div v-for="queue in nextQueues" :key="queue.queue_number" class="queue-item">
            <div class="queue-card">
              <span class="label">Queue</span>
              <span class="queue-number">{{ queue.queue_number }}</span>
              <span class="customer-name">{{ queue.customer_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentQueue" class="section current-queue">
        <h3 class="section-title">Current Service</h3>
        <div class="queue-card active">
          <div class="service-info">
            <div class="info-row">
              <span class="info-label">Ticket Number:</span>
              <span class="info-value number">{{ currentQueue.queue_number }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value status">{{ currentQueue.status }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Customer Name:</span>
              <span class="info-value">{{ currentQueue.customer_name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Called At:</span>
              <span class="info-value">{{ formattedCalledTime }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Elapsed Time:</span>
              <span class="info-value elapsed-time">{{ elapsedTime }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Counter:</span>
              <span class="info-value counter">{{ currentCounterName }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section actions">
        <button @click="callNextQueue" class="btn primary" :disabled="isCallNextDisabled">
          <i class="fas fa-play"></i>
          <span>Call Next</span>
        </button>
        <button @click="skipCurrentQueue" class="btn warning" :disabled="isSkipDisabled">
          <i class="fas fa-forward"></i>
          <span>Skip</span>
        </button>
        <button @click="completeCurrentQueue" class="btn success" :disabled="isCompleteDisabled">
          <i class="fas fa-check"></i>
          <span>Complete</span>
        </button>
        <button @click="closeCounter" class="btn danger">
          <i class="fas fa-times"></i>
          <span>Close</span>
        </button>
      </div>

      <div v-if="isEditingPassword" class="password-section">
        <div class="password-fields">
          <div class="field">
            <label>New Password</label>
            <input
              type="password"
              v-model="newPassword"
              class="password-input"
              placeholder="Enter new password"
            />
          </div>
          <div class="field">
            <label>Confirm Password</label>
            <input
              type="password"
              v-model="confirmPassword"
              class="password-input"
              placeholder="Confirm new password"
            />
          </div>
          <div class="password-actions">
            <button @click="updatePassword" class="btn primary" :disabled="!canUpdatePassword">
              Update Password
            </button>
            <button @click="cancelPasswordEdit" class="btn warning">Cancel</button>
          </div>
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </div>
      </div>
      <button v-else @click="startPasswordEdit" class="btn secondary change-password-btn">
        Change Password
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081'

interface QueueTicket {
  ticket_id: number
  user_id: number
  service_id: number | null
  counter_id: number | null
  venue_id: number | null
  customer_name: string
  customer_email: string
  customer_phone: string
  photo_url: string
  queue_number: string
  token: string
  status: 'waiting' | 'called' | 'skipped' | 'completed'
  created_at: string
  called_at: string | null
  completed_at: string | null
  skipped_at: string | null
  operator_id: number | null
}

interface QueueResponse {
  tickets: QueueTicket[]
}

interface Venue {
  venue_id: number
  venue_name: string
}

interface Service {
  service_id: number
  service_name: string
  venue_id: number
}

interface Counter {
  counter_id: number
  counter_name: string
  service_id: number
}

interface OperatorInfo {
  id: number
  name: string
}

export default defineComponent({
  name: 'OperatorView',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      nextQueues: [] as QueueTicket[],
      currentQueue: null as QueueTicket | null,
      venues: [] as Venue[],
      services: [] as Service[],
      counters: [] as Counter[],
      filteredServices: [] as Service[],
      filteredCounters: [] as Counter[],
      selectedVenue: null as number | null,
      selectedService: null as number | null,
      selectedCounter: null as number | null,
      errorMessage: '',
      elapsedTimeInterval: null as number | null,
      elapsedSeconds: 0,
      selectedOperatorInfo: null as OperatorInfo | null,
      isEditingPassword: false,
      newPassword: '',
      confirmPassword: '',
      passwordError: '',
      isOperator: false,
      queueStats: {
        waiting: 0,
        called: 0,
        completed: 0,
        skipped: 0,
      },
    }
  },
  computed: {
    formattedCalledTime() {
      if (!this.currentQueue) return ''
      return new Date(this.currentQueue.called_at).toLocaleTimeString()
    },
    elapsedTime() {
      const minutes = Math.floor(this.elapsedSeconds / 60)
      const seconds = this.elapsedSeconds % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    canUpdatePassword() {
      return this.newPassword.length >= 6 && this.newPassword === this.confirmPassword
    },
    currentCounterName(): string {
      if (!this.currentQueue?.counter_id) return 'Not assigned'
      const counter = this.counters.find((c) => c.counter_id === this.currentQueue?.counter_id)
      return counter ? counter.counter_name : 'Unknown'
    },
    isCallNextDisabled(): boolean {
      return this.currentQueue?.status === 'called'
    },
    isCompleteDisabled(): boolean {
      return !this.currentQueue || this.currentQueue.status !== 'called'
    },
    isSkipDisabled(): boolean {
      return !this.currentQueue || this.currentQueue.status !== 'called'
    },
  },
  methods: {
    async fetchQueueStatus() {
      if (!this.selectedService || !this.selectedVenue) return

      try {
        const token = localStorage.getItem('token')
        const params: any = {
          service_id: this.selectedService,
          venue_id: this.selectedVenue,
        }

        // Add counter_id to params if counter is selected
        if (this.selectedCounter) {
          params.counter_id = this.selectedCounter
        }

        const response = await axios.get<QueueResponse>(`${BASE_URL}/waiting-tickets`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        })

        // Get next 3 waiting tickets
        this.nextQueues = response.data.tickets
          .filter((ticket) => ticket.status === 'waiting')
          .slice(0, 3)

        // Get current called ticket for the selected counter
        const currentTicket = response.data.tickets.find(
          (ticket) =>
            ticket.status === 'called' /*|| ticket.status === 'skipped'*/ &&
            (!this.selectedCounter ||
              ticket.counter_id === this.selectedCounter ||
              ticket.counter_id === null),
        )

        this.currentQueue = currentTicket || null

        // Start or stop timer based on current queue
        if (this.currentQueue) {
          this.startElapsedTimer()
        } else {
          this.stopElapsedTimer()
        }

        // Calculate queue statistics
        this.queueStats = {
          waiting: response.data.tickets.filter((ticket) => ticket.status === 'waiting').length,
          called: response.data.tickets.filter((ticket) => ticket.status === 'called').length,
          completed: response.data.tickets.filter((ticket) => ticket.status === 'completed').length,
          skipped: response.data.tickets.filter((ticket) => ticket.status === 'skipped').length,
        }
      } catch (error: any) {
        this.errorMessage =
          'Error fetching queue status: ' + (error.response?.data?.message || error.message)
      }
    },

    async refreshCurrentTicketStatus() {
      if (!this.currentQueue) return

      try {
        const token = localStorage.getItem('token')
        const params: any = {
          service_id: this.selectedService,
          venue_id: this.selectedVenue,
        }

        if (this.selectedCounter) {
          params.counter_id = this.selectedCounter
        }

        const response = await axios.get<QueueResponse>(`${BASE_URL}/waiting-tickets`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        })

        const updatedTicket = response.data.tickets.find(
          (ticket) => ticket.ticket_id === this.currentQueue.ticket_id,
        )

        if (updatedTicket) {
          this.currentQueue = updatedTicket
        } else {
          // If ticket is not found, clear current queue
          this.currentQueue = null
          this.stopElapsedTimer()
        }
      } catch (error: any) {
        this.errorMessage =
          'Error refreshing ticket status: ' + (error.response?.data?.message || error.message)
      }
    },

    async callNextQueue() {
      if (!this.selectedCounter || !this.nextQueues.length) return

      try {
        const token = localStorage.getItem('token')
        const nextTicket = this.nextQueues[0]
        const operatorId = localStorage.getItem('operator_id')

        await axios.put(
          `${BASE_URL}/queue-tickets/${nextTicket.ticket_id}/status`,
          {
            status: 'called',
            operator_id: Number(operatorId),
            counter_id: this.selectedCounter,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        await this.fetchQueueStatus()
        this.startElapsedTimer()
      } catch (error: any) {
        this.errorMessage =
          'Error calling next queue: ' + (error.response?.data?.message || error.message)
      }
    },

    // Modify complete method
    async completeCurrentQueue() {
      if (!this.currentQueue) return

      try {
        const token = localStorage.getItem('token')
        const operatorId = localStorage.getItem('operator_id')
        const counterId = localStorage.getItem('counter_id')

        await axios.put(
          `${BASE_URL}/queue-tickets/${this.currentQueue.ticket_id}/status`,
          {
            status: 'completed',
            operator_id: Number(operatorId),
            counter_id: Number(counterId), // Add counter_id to the payload),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        await this.refreshCurrentTicketStatus() // Replace fetchQueueStatus with refreshCurrentTicketStatus
        this.stopElapsedTimer()
      } catch (error: any) {
        this.errorMessage =
          'Error completing queue: ' + (error.response?.data?.message || error.message)
      }
    },

    async skipCurrentQueue() {
      if (!this.currentQueue) return

      try {
        const token = localStorage.getItem('token')
        const operatorId = localStorage.getItem('operator_id')
        const counterId = localStorage.getItem('counter_id')

        await axios.put(
          `${BASE_URL}/queue-tickets/${this.currentQueue.ticket_id}/status`,
          {
            status: 'skipped',
            operator_id: Number(operatorId),
            counter_id: Number(counterId), // Add counter_id to the payload),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        // await this.fetchQueueStatus()
        await this.refreshCurrentTicketStatus() // Replace fetchQueueStatus with refreshCurrentTicketStatus

        this.stopElapsedTimer()
      } catch (error: any) {
        this.errorMessage =
          'Error skipping queue: ' + (error.response?.data?.message || error.message)
      }
    },

    async closeCounter() {
      try {
        // Clear any stored counter or operator info
        localStorage.removeItem('counter_id')
        localStorage.removeItem('operator_id')

        // Navigate to dashboard
        await this.router.push('/dashboard')
      } catch (error: any) {
        this.errorMessage = 'Error closing counter: ' + error.message
      }
    },
    async fetchVenues() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/venues`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.venues = response.data
      } catch (error: any) {
        this.errorMessage =
          'Error fetching venues: ' + (error.response?.data?.message || error.message)
      }
    },
    async filterServices() {
      try {
        if (!this.selectedVenue) {
          this.filteredServices = []
          this.selectedService = null
          this.filteredCounters = [] // Reset counters when venue changes
          return
        }
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/services/venue/${this.selectedVenue}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.filteredServices = response.data
        // Don't reset selectedService here if we're initializing from operatorData
        if (!this.selectedService) {
          this.selectedService = null
        }
        await this.fetchCounters() // Fetch counters after getting services
      } catch (error: any) {
        this.errorMessage =
          'Error fetching services: ' + (error.response?.data?.message || error.message)
      }
    },
    async fetchCounters() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/counters/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.counters = response.data
        this.filterCounters() // Filter counters after fetching
      } catch (error: any) {
        this.errorMessage =
          'Error fetching counters: ' + (error.response?.data?.message || error.message)
      }
    },
    async fetchOperatorByCounter(counterId: number) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `${BASE_URL}/user-counter-map/user-by-counter/${counterId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        console.log('Operator response:', response.data) // Debug log

        // Adjust based on your API response structure
        this.selectedOperatorInfo = {
          id: response.data.user_id || response.data.id,
          name: response.data.user_name || response.data.name,
        }

        if (this.selectedOperatorInfo.id) {
          localStorage.setItem('operator_id', this.selectedOperatorInfo.id.toString())
          localStorage.setItem('counter_id', counterId.toString())
        }
      } catch (error: any) {
        console.error('Error fetching operator:', error) // Debug log
        this.errorMessage =
          'Error fetching operator: ' + (error.response?.data?.message || error.message)
      }
    },
    /**
     * Filters the list of counters based on the selected service. If no service is
     * selected, it resets the list of filtered counters and the selected counter.
     */
    filterCounters() {
      if (!this.selectedService) {
        this.filteredCounters = []
        if (!this.selectedCounter) {
          // Only reset if not initializing
          this.selectedCounter = null
        }
        return
      }
      this.filteredCounters = this.counters.filter(
        (counter) => counter.service_id === this.selectedService,
      )
      if (this.filteredCounters.length === 0) {
        this.selectedCounter = null
      }
    },
    startElapsedTimer() {
      if (this.elapsedTimeInterval) {
        clearInterval(this.elapsedTimeInterval)
      }
      this.elapsedSeconds = 0
      this.elapsedTimeInterval = setInterval(() => {
        this.elapsedSeconds++
      }, 1000)
    },

    stopElapsedTimer() {
      if (this.elapsedTimeInterval) {
        clearInterval(this.elapsedTimeInterval)
        this.elapsedTimeInterval = null
      }
    },

    startPasswordEdit() {
      this.isEditingPassword = true
      this.newPassword = ''
      this.confirmPassword = ''
      this.passwordError = ''
    },

    cancelPasswordEdit() {
      this.isEditingPassword = false
      this.newPassword = ''
      this.confirmPassword = ''
      this.passwordError = ''
    },

    async updatePassword() {
      if (!this.canUpdatePassword) return

      try {
        const token = localStorage.getItem('token')
        const operatorId = localStorage.getItem('operator_id')

        await axios.put(
          `${BASE_URL}/users/${operatorId}/password`,
          {
            password: this.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        this.cancelPasswordEdit()
        this.errorMessage = ''
      } catch (error: any) {
        this.passwordError =
          'Error updating password: ' + (error.response?.data?.message || error.message)
      }
    },

    // Add this new method for fetching current service info
    async fetchCurrentServiceInfo() {
      if (!this.selectedCounter || !this.selectedVenue || !this.selectedService) return

      try {
        const token = localStorage.getItem('token')
        const response = await axios.get<QueueResponse>(`${BASE_URL}/waiting-tickets`, {
          params: {
            service_id: this.selectedService,
            venue_id: this.selectedVenue,
            counter_id: this.selectedCounter,
            status: 'called',
          },
          headers: { Authorization: `Bearer ${token}` },
        })

        // Update current queue if there's an active service
        if (response.data.tickets && response.data.tickets.length > 0) {
          const currentTicket = response.data.tickets[0]
          this.currentQueue = {
            ...currentTicket,
            counter_id: this.selectedCounter, // Ensure counter_id is set
          }
          this.startElapsedTimer()
        } else {
          this.currentQueue = null
          this.stopElapsedTimer()
        }
      } catch (error: any) {
        this.errorMessage =
          'Error fetching current service: ' + (error.response?.data?.message || error.message)
      }
    },
  },
  watch: {
    selectedVenue() {
      this.filterServices()
      this.fetchQueueStatus()
    },
    selectedService() {
      this.filterCounters()
      this.fetchQueueStatus()
    },
    currentQueue(newQueue, oldQueue) {
      if (newQueue?.queue_number !== oldQueue?.queue_number) {
        this.startElapsedTimer()
      }
    },
    // Modify selectedCounter watch
    async selectedCounter(newValue) {
      if (newValue) {
        await this.fetchOperatorByCounter(newValue)
        await this.fetchCurrentServiceInfo() // Add this line
        await this.fetchQueueStatus()
      }
    },
  },
  async created() {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}')
    const operatorData = JSON.parse(localStorage.getItem('operatorData') || '{}')

    // Set isOperator based on user role
    this.isOperator = loggedInUser.role === 'operator'

    // Only proceed with auto-selection if user is operator and has operatorData
    if (this.isOperator && operatorData) {
      try {
        // Set local storage values
        localStorage.setItem('operator_id', operatorData.operator_id)
        localStorage.setItem('counter_id', operatorData.counter_id)
        localStorage.setItem('owner_id', loggedInUser.owner_id)

        // Step 1: First fetch all venues and wait for completion
        await this.fetchVenues()

        // Step 2: Set venue and wait for services to load
        this.selectedVenue = operatorData.venue_id
        await this.filterServices()

        // Step 3: Set service and wait for counters to load
        this.selectedService = operatorData.service_id
        await this.fetchCounters()
        await this.filterCounters()

        // Step 4: Finally set the counter
        this.selectedCounter = operatorData.counter_id

        // Fetch initial queue status
        await this.fetchQueueStatus()
      } catch (error) {
        console.error('Error setting up operator view:', error)
        this.errorMessage = 'Error initializing operator view'
      }
    } else {
      // If not an operator, just load venues and counters
      await Promise.all([this.fetchVenues(), this.fetchCounters()])
    }
  },
  /**
   * Stops the elapsed timer when the component is about to be unmounted.
   * This is necessary to prevent memory leaks, as the timer will continue to run
   * indefinitely if it is not stopped.
   */
  beforeUnmount() {
    this.stopElapsedTimer()
  },
})
</script>

<style scoped>
.operator-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.queue-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.queue-card {
  background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease;
}

.queue-card:hover {
  transform: translateY(-2px);
}

.queue-card.active {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.queue-number,
.number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a73e8;
}

.customer-name {
  display: block;
  font-size: 1rem;
  color: #666;
  margin-top: 8px;
  font-weight: 500;
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn i {
  margin-right: 8px;
}

.primary {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.warning {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.success {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.danger {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .operator-view {
    padding: 12px;
  }

  .section {
    padding: 16px;
  }

  .queue-number,
  .number {
    font-size: 2rem;
  }

  .actions {
    grid-template-columns: 1fr;
  }

  .btn {
    padding: 16px;
  }

  .customer-name {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.25rem;
  }

  .queue-list {
    grid-template-columns: 1fr;
  }
}

.selectors {
  margin-bottom: 24px;
}

.selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.selector-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-item label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.dropdown {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown:hover {
  border-color: #2196f3;
}

.dropdown:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

@media (max-width: 768px) {
  .selector-grid {
    grid-template-columns: 1fr;
  }

  .dropdown {
    padding: 12px;
  }
}

.service-info {
  padding: 20px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.info-value.number {
  font-size: 2rem;
  color: #1a73e8;
}

.info-value.status {
  text-transform: uppercase;
  font-weight: 600;
  color: #4caf50;
  background: #e8f5e9;
  padding: 4px 8px;
  border-radius: 4px;
}

.elapsed-time {
  font-family: monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  color: #dc2626;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-value {
    font-size: 1rem;
  }

  .info-value.number {
    font-size: 1.5rem;
  }
}

.operator-info {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #666;
}
.operator-label {
  font-weight: 500;
  margin-right: 4px;
}
.operator-value {
  color: #1a73e8;
}

.password-section {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.password-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.password-input {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.password-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.change-password-btn {
  margin-top: 8px;
  background: linear-gradient(135deg, #64b5f6, #2196f3);
}

.error-message {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 4px;
}

.info-value.counter {
  color: #1976d2;
  font-weight: 600;
  background: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-card.waiting {
  background: linear-gradient(135deg, #fff9c4, #fff59d);
  .stat-value {
    color: #f57f17;
  }
}

.stat-card.called {
  background: linear-gradient(135deg, #bbdefb, #90caf9);
  .stat-value {
    color: #1565c0;
  }
}

.stat-card.completed {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  .stat-value {
    color: #2e7d32;
  }
}

.stat-card.skipped {
  background: linear-gradient(135deg, #ffcdd2, #ef9a9a);
  .stat-value {
    color: #c62828;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
