<template>
  <div class="visitor-ticket-view">
    <div class="ticket-card">
      <h1 class="title">Visitor Queuing</h1>
      <div v-if="ticket" class="ticket-details">
        <div class="ticket-row">
          <span class="label">Created Time:</span>
          <span class="value">{{ formattedCreatedTime }}</span>
        </div>
        <div class="ticket-row">
          <span class="label">Venue Name:</span>
          <span class="value">{{ venueName }}</span>
        </div>
        <div class="ticket-row">
          <span class="label">Service Name:</span>
          <span class="value">{{ serviceName }}</span>
        </div>
        <div class="ticket-row">
          <span class="label">Visitor Name:</span>
          <span class="value">{{ ticket.customer_name }}</span>
        </div>
        <div class="ticket-row">
          <span class="label">Ticket Status:</span>
          <span class="value">{{ ticket.status }}</span>
        </div>
        <div class="ticket-row ticket-number">
          <span class="label">Your Queue Number:</span>
          <span class="value">{{ ticket.queue_number }}</span>
        </div>
        <div class="ticket-row">
          <span class="label">Current Waiting Queue:</span>
          <span class="value">{{ currentWaitingQueue }}</span>
        </div>
        <div class="ticket-row">
          <span class="label">Currently Served Queue:</span>
          <span class="value">{{ currentlyServedQueue }}</span>
        </div>
        <div class="ticket-row">
          <span class="label">Average Queue Time:</span>
          <span class="value">{{ formattedAverageQueueTime }}</span>
        </div>
      </div>
      <div v-else class="loading">
        <p>Loading ticket details...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081'

export default {
  name: 'VisitorTicketView',
  setup() {
    const ticket = ref(null)
    const venueName = ref('')
    const serviceName = ref('')
    const averageQueueTime = ref(0)
    const currentWaitingQueue = ref('N/A')
    const currentlyServedQueue = ref('N/A')
    const route = useRoute()

    const formattedCreatedTime = computed(() => {
      if (ticket.value?.created_at) {
        const date = new Date(ticket.value.created_at)
        return date.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      }
      return ''
    })

    const formattedAverageQueueTime = computed(() => {
      const hours = Math.floor(averageQueueTime.value / 60)
      const minutes = averageQueueTime.value % 60
      return `${hours} hours and ${minutes} minutes`
    })

    onMounted(async () => {
      const token = route.params.token
      if (token) {
        try {
          const response = await axios.get(`${BASE_URL}/myticket/${token}`)
          ticket.value = response.data.ticket
          venueName.value = response.data.venue_name
          serviceName.value = response.data.service_name
          averageQueueTime.value = response.data.average_queue_time

          // Fetch current waiting queue and currently served queue
          const queueResponse = await axios.get(`${BASE_URL}/waiting-tickets`, {
            params: {
              service_id: ticket.value?.service_id,
              venue_id: ticket.value?.venue_id,
            },
          })

          currentWaitingQueue.value =
            queueResponse.data.tickets
              .filter((t) => t.status === 'waiting')
              .map((t) => t.queue_number)
              .join(', ') || 'N/A'

          currentlyServedQueue.value =
            queueResponse.data.tickets
              .filter((t) => t.status === 'called')
              .map((t) => t.queue_number)
              .join(', ') || 'N/A'
        } catch (error) {
          console.error('Failed to fetch ticket or queue details:', error)
        }
      }
    })

    return {
      ticket,
      venueName,
      serviceName,
      formattedCreatedTime,
      formattedAverageQueueTime,
      currentWaitingQueue,
      currentlyServedQueue,
      BASE_URL,
    }
  },
}
</script>

<style scoped>
.visitor-ticket-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.ticket-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.ticket-details {
  margin-top: 20px;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1rem;
  flex-wrap: wrap;
}

.label {
  font-weight: bold;
  color: #555;
  flex: 1 1 40%;
  text-align: left;
}

.value {
  color: #333;
  flex: 1 1 60%;
  text-align: right;
}

.ticket-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.ticket-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  margin-top: 10px;
}

.ticket-link:hover {
  text-decoration: underline;
}

.loading {
  font-size: 1rem;
  color: #888;
}

/* Responsive Design */
@media (max-width: 768px) {
  .ticket-card {
    padding: 20px;
  }

  .title {
    font-size: 1.5rem;
  }

  .ticket-row {
    font-size: 0.9rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .label,
  .value {
    flex: 1 1 100%;
    text-align: left;
    margin-bottom: 5px;
  }

  .ticket-number {
    font-size: 1.2rem;
  }
}
</style>
