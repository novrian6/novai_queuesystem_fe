<template>
  <div class="get-ticket">
    <h1>Get Ticket</h1>
    <p>Welcome to the Get Ticket page.</p>
    <div v-if="lastTicketNumber" class="last-ticket-display">
      <p>Last Ticket Number:</p>
      <p class="ticket-number-large">{{ lastTicketNumber }}</p>
    </div>
    <div v-if="!venueId || !serviceId" class="error-message">
      <p>
        Please set both <strong>venue_id</strong> and <strong>service_id</strong> in the URL
        parameters to proceed.
      </p>
    </div>
    <div v-else>
      <div v-if="venueName && serviceName" class="venue-service-info">
        <p><strong>Venue:</strong> {{ venueName }}</p>
        <p><strong>Service:</strong> {{ serviceName }}</p>
      </div>
      <form @submit.prevent="generateTicket" class="ticket-form">
        <div class="form-group">
          <label for="customerName">Customer Name:</label>
          <input type="text" id="customerName" v-model="customerName" required />
        </div>
        <div class="form-group">
          <label for="customerEmail">Customer Email:</label>
          <input type="email" id="customerEmail" v-model="customerEmail" required />
        </div>
        <div class="form-group">
          <label for="whatsappNumber">WhatsApp Number:</label>
          <input type="tel" id="whatsappNumber" v-model="whatsappNumber" required />
        </div>
        <button type="submit" class="submit-button">Generate Ticket</button>
      </form>
      <div v-if="ticketNumber !== null" class="ticket-display">
        <p>Your Ticket Number:</p>
        <p class="ticket-number-large">{{ ticketNumber }}</p>
        <p v-if="countdown > 0" class="countdown-timer">
          Moving to last ticket in {{ countdown }} seconds...
        </p>
        <div class="ticket-details">
          <h2>Ticket Details</h2>
          <p><strong>Venue:</strong> {{ venueName }}</p>
          <p><strong>Service:</strong> {{ serviceName }}</p>
          <p><strong>Date & Time:</strong> {{ currentDateTime }}</p>
          <p><strong>Customer Name:</strong> {{ customerName }}</p>
          <p><strong>Ticket Number:</strong> {{ ticketNumber }}</p>
        </div>
        <div class="ticket-link">
          <p>
            <strong>View Your Ticket:</strong>
            <a :href="`/visitor-ticket/${ticketToken}`" target="_blank"> Click here </a>
          </p>
        </div>
        <!-- QR Code Display -->
        <div v-if="qrCodeUrl" class="qr-code">
          <p><strong>Scan QR to View Ticket:</strong></p>
          <img :src="qrCodeUrl" alt="Ticket QR Code" />
        </div>
      </div>
      <div v-if="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
      </div>
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import QRCode from 'qrcode'

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081'

export default {
  name: 'GetTicketView',
  setup() {
    const route = useRoute()
    const venueId = route.query.venue_id
    const serviceId = route.query.service_id
    const venueName = ref('')
    const serviceName = ref('')
    const customerName = ref('')
    const customerEmail = ref('')
    const whatsappNumber = ref('')
    const ticketNumber = ref(null)
    const lastTicketNumber = ref(null)
    const successMessage = ref('')
    const errorMessage = ref('')
    const countdown = ref(0)
    const currentDateTime = ref(new Date().toLocaleString())
    const ticketToken = ref('')
    const qrCodeUrl = ref('')
    let countdownInterval = null

    onMounted(async () => {
      if (!venueId || !serviceId) return

      try {
        const token = localStorage.getItem('token')

        // Fetch venue details
        const venueResponse = await axios.get(`${BASE_URL}/venues/${venueId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        venueName.value = venueResponse.data.venue_name

        // Fetch service details
        const serviceResponse = await axios.get(`${BASE_URL}/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        serviceName.value = serviceResponse.data.service_name
      } catch (error) {
        console.error('Error fetching venue or service details:', error.response || error.message)
      }
    })

    const startCountdown = () => {
      countdown.value = 10
      countdownInterval = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--
        } else {
          clearInterval(countdownInterval)
          lastTicketNumber.value = ticketNumber.value
          ticketNumber.value = null // Reset ticket number after countdown
          clearForm() // Ensure the form is cleared after the countdown
        }
      }, 1000)
    }

    const clearForm = () => {
      // Reset all form fields to their initial state
      customerName.value = ''
      customerEmail.value = ''
      whatsappNumber.value = ''
    }

    const generateTicket = async () => {
      successMessage.value = ''
      errorMessage.value = ''
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(
          `${BASE_URL}/queue-tickets/`,
          {
            venue_id: parseInt(venueId), // Ensure venue_id is a number
            service_id: parseInt(serviceId), // Ensure service_id is a number
            customer_name: customerName.value,
            customer_email: customerEmail.value,
            customer_phone: whatsappNumber.value,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (response.data && response.data.queue_number) {
          lastTicketNumber.value = ticketNumber.value // Move current ticket to last ticket
          ticketNumber.value = response.data.queue_number // Assign the correct ticket number
          ticketToken.value = response.data.token // Set the ticket token
          currentDateTime.value = new Date().toLocaleString() // Update the current date and time
          successMessage.value = 'Ticket generated successfully!'

          // Generate QR Code for the ticket URL
          const ticketUrl = `${window.location.origin}/visitor-ticket/${ticketToken.value}`
          qrCodeUrl.value = await QRCode.toDataURL(ticketUrl)
          startCountdown()
        } else {
          throw new Error('Invalid response: ticket_number not found')
        }
      } catch (error) {
        console.error('Error generating ticket:', error.response || error.message)
        errorMessage.value = 'Failed to generate ticket. Please try again.'
      }
    }

    return {
      venueId,
      serviceId,
      venueName,
      serviceName,
      customerName,
      customerEmail,
      whatsappNumber,
      ticketNumber,
      lastTicketNumber,
      successMessage,
      errorMessage,
      countdown,
      currentDateTime,
      ticketToken,
      qrCodeUrl,
      generateTicket,
    }
  },
}
</script>

<style scoped>
.get-ticket {
  text-align: center;
  margin: 50px auto;
  max-width: 600px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #333;
}

p {
  font-size: 1rem;
  color: #555;
}

.venue-service-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #eef;
  border-radius: 5px;
  text-align: left;
}

.ticket-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: calc(100% - 20px); /* Add right margin */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  margin-right: 10px; /* Ensure enough spacing */
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #0056b3;
}

.ticket-display {
  margin-top: 20px;
  text-align: center;
}

.ticket-number-large {
  font-size: 3rem;
  font-weight: bold;
  color: #1d4ed8;
  margin-top: 10px;
}

.ticket-number {
  margin-top: 20px;
  font-size: 1.2rem;
  color: #28a745;
  font-weight: bold;
}

.error-message {
  margin: 20px auto;
  padding: 15px;
  background-color: #ffe4e6;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  text-align: center;
}

.success-message {
  margin: 20px auto;
  padding: 15px;
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
  border-radius: 8px;
  text-align: center;
}

.last-ticket-display {
  margin-top: 10px;
  text-align: center;
}

.countdown-timer {
  margin-top: 10px;
  font-size: 1rem;
  color: #f59e0b;
  font-weight: bold;
}

.ticket-details {
  margin-top: 20px;
  padding: 15px;
  background-color: #f1f5f9;
  border-radius: 8px;
  text-align: left;
  font-size: 1rem;
  color: #333;
}

.ticket-details h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #1d4ed8;
}
</style>
