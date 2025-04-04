<template>
  <div class="dashboard-container">
    <SideMenu />
    <main class="content">
      <h1 class="title">Welcome to the Dashboard</h1>
      <p class="subtitle">Manage your queue system efficiently.</p>

      <section class="overview">
        <h2>Counter Level Statistics</h2>
        <div class="stats">
          <div class="stat-card">
            <h3>Active Queues</h3>
            <p v-if="loading.activeQueues">Loading...</p>
            <p v-else-if="error.activeQueues">Error loading data</p>
            <p v-else>{{ statistics.activeQueues }}</p>
          </div>
          <div class="stat-card">
            <h3>Average Wait Time</h3>
            <p v-if="loading.waitTime">Loading...</p>
            <p v-else-if="error.waitTime">Error loading data</p>
            <p v-else>{{ formatWaitTime(statistics.averageWaitTime) }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Served</h3>
            <p v-if="loading.totalServed">Loading...</p>
            <p v-else-if="error.totalServed">Error loading data</p>
            <p v-else>{{ statistics.totalServed }}</p>
          </div>
        </div>

        <h2 class="mt-6">Service Level Statistics</h2>
        <div class="stats">
          <div class="stat-card">
            <h3>Active Queues</h3>
            <p v-if="loading.serviceActiveQueues">Loading...</p>
            <p v-else-if="error.serviceActiveQueues">Error loading data</p>
            <p v-else>{{ serviceStatistics.activeQueues }}</p>
          </div>
          <div class="stat-card">
            <h3>Average Wait Time</h3>
            <p v-if="loading.serviceWaitTime">Loading...</p>
            <p v-else-if="error.serviceWaitTime">Error loading data</p>
            <p v-else>{{ formatWaitTime(serviceStatistics.averageWaitTime) }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Served</h3>
            <p v-if="loading.serviceTotalServed">Loading...</p>
            <p v-else-if="error.serviceTotalServed">Error loading data</p>
            <p v-else>{{ serviceStatistics.totalServed }}</p>
          </div>
        </div>

        <h2 class="mt-6">Venue Level Statistics</h2>
        <div class="stats">
          <div class="stat-card">
            <h3>Active Queues</h3>
            <p v-if="loading.venueActiveQueues">Loading...</p>
            <p v-else-if="error.venueActiveQueues">Error loading data</p>
            <p v-else>{{ venueStatistics.activeQueues }}</p>
          </div>
          <div class="stat-card">
            <h3>Average Wait Time</h3>
            <p v-if="loading.venueWaitTime">Loading...</p>
            <p v-else-if="error.venueWaitTime">Error loading data</p>
            <p v-else>{{ formatWaitTime(venueStatistics.averageWaitTime) }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Served</h3>
            <p v-if="loading.venueTotalServed">Loading...</p>
            <p v-else-if="error.venueTotalServed">Error loading data</p>
            <p v-else>{{ venueStatistics.totalServed }}</p>
          </div>
        </div>
      </section>

      <section class="services-overview mt-6">
        <h2>Services and Counters</h2>
        <div class="services-list">
          <div v-for="service in services" :key="service.service_id" class="service-card">
            <h3 class="service-name">{{ service.service_name }}</h3>
            <div class="counters-list">
              <div
                v-for="counter in service.counters"
                :key="counter.counter_id"
                class="counter-item"
              >
                <span class="counter-name">Counter {{ counter.counter_name }}</span>
                <div class="counter-stats">
                  <p><strong>Counter ID:</strong> {{ counter.counter_id }}</p>
                  <p><strong>Service ID:</strong> {{ counter.service_id }}</p>
                  <p><strong>Venue ID:</strong> {{ counter.venue_id }}</p>
                  <p>
                    <strong>Active Queues:</strong> {{ counter.statistics.activeQueues || 'N/A' }}
                  </p>
                  <p>
                    <strong>Average Wait Time:</strong>
                    {{ formatWaitTime(counter.statistics.averageWaitTime) || 'N/A' }}
                  </p>
                  <p>
                    <strong>Total Served:</strong> {{ counter.statistics.totalServed || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/config/api'
import SideMenu from '@/components/SideMenu.vue'

export default {
  name: 'DashboardView',
  components: {
    SideMenu,
  },
  setup() {
    const statistics = ref({
      activeQueues: 0,
      averageWaitTime: 0,
      totalServed: 0,
    })

    const serviceStatistics = ref({
      activeQueues: 0,
      averageWaitTime: 0,
      totalServed: 0,
    })

    const venueStatistics = ref({
      activeQueues: 0,
      averageWaitTime: 0,
      totalServed: 0,
    })

    const loading = ref({
      activeQueues: false,
      waitTime: false,
      totalServed: false,
      serviceActiveQueues: false,
      serviceWaitTime: false,
      serviceTotalServed: false,
      venueActiveQueues: false,
      venueWaitTime: false,
      venueTotalServed: false,
    })

    const error = ref({
      activeQueues: false,
      waitTime: false,
      totalServed: false,
      serviceActiveQueues: false,
      serviceWaitTime: false,
      serviceTotalServed: false,
      venueActiveQueues: false,
      venueWaitTime: false,
      venueTotalServed: false,
    })

    const filters = ref({
      counter_id: null,
      service_id: null,
      venue_id: null,
    })

    const services = ref([])
    const counters = ref([])

    const getUserRole = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.role || ''
    }

    const getUserData = () => {
      const operatorData = JSON.parse(localStorage.getItem('operatorData') || '{}')
      return operatorData
    }

    const getRequestFilters = () => {
      const role = getUserRole()
      const userData = getUserData()

      if (role === 'operator' && userData) {
        return {
          venue_id: userData.venue_id,
          service_id: userData.service_id,
          counter_id: userData.counter_id,
        }
      }

      return {
        venue_id: null,
        service_id: null,
        counter_id: null,
      }
    }

    const fetchActiveQueues = async () => {
      loading.value.activeQueues = true
      error.value.activeQueues = false
      try {
        const filters = getRequestFilters()
        const response = await api.post('/statistics/active-queues', filters)
        statistics.value.activeQueues = response.data[0]?.active_queues || 0
      } catch (err) {
        error.value.activeQueues = true
        console.error('Error fetching active queues:', err)
      } finally {
        loading.value.activeQueues = false
      }
    }

    const fetchAverageWaitTime = async () => {
      loading.value.waitTime = true

      error.value.waitTime = false
      try {
        const filters = getRequestFilters()
        const response = await api.post('/statistics/average-wait-time', filters)
        statistics.value.averageWaitTime = Math.round(response.data[0]?.wait_time || 0)
      } catch (err) {
        error.value.waitTime = true
        console.error('Error fetching wait time:', err)
      } finally {
        loading.value.waitTime = false
      }
    }

    const fetchTotalServed = async () => {
      loading.value.totalServed = true
      error.value.totalServed = false
      try {
        const filters = getRequestFilters()
        const response = await api.post('/statistics/total-served', filters)
        statistics.value.totalServed = response.data[0]?.total_served || 0
      } catch (err) {
        error.value.totalServed = true
        console.error('Error fetching total served:', err)
      } finally {
        loading.value.totalServed = false
      }
    }
    //Service level

    const fetchServiceLevelStats = async () => {
      const userData = getUserData()
      const serviceFilters = {
        venue_id: userData.venue_id,
        service_id: userData.service_id,
        counter_id: null,
      }

      loading.value.serviceActiveQueues = true
      loading.value.serviceWaitTime = true
      loading.value.serviceTotalServed = true

      try {
        const [activeQueues, waitTime, totalServed] = await Promise.all([
          api.post('/statistics/active-queues', serviceFilters),
          api.post('/statistics/average-wait-time', serviceFilters),
          api.post('/statistics/total-served', serviceFilters),
        ])

        serviceStatistics.value = {
          activeQueues: activeQueues.data.reduce((sum, item) => sum + (item.active_queues || 0), 0),
          averageWaitTime: Math.round(
            waitTime.data.reduce((sum, item) => sum + (item.wait_time || 0), 0) /
              waitTime.data.length || 0,
          ),
          totalServed: totalServed.data.reduce((sum, item) => sum + (item.total_served || 0), 0),
        }

        console.log('Service Level Total Served:', serviceStatistics.value.totalServed) // Debug log
      } catch (err) {
        error.value.serviceActiveQueues = true
        error.value.serviceWaitTime = true
        error.value.serviceTotalServed = true
        console.error('Error fetching service level stats:', err)
      } finally {
        loading.value.serviceActiveQueues = false
        loading.value.serviceWaitTime = false
        loading.value.serviceTotalServed = false
      }
    }

    // Venue level

    const fetchVenueLevelStats = async () => {
      const userData = getUserData()
      const venueFilters = {
        venue_id: userData.venue_id,
        service_id: null,
        counter_id: null,
      }

      loading.value.venueActiveQueues = true
      loading.value.venueWaitTime = true
      loading.value.venueTotalServed = true

      try {
        const [activeQueues, waitTime, totalServed] = await Promise.all([
          api.post('/statistics/active-queues', venueFilters),
          api.post('/statistics/average-wait-time', venueFilters),
          api.post('/statistics/total-served', venueFilters),
        ])

        venueStatistics.value = {
          activeQueues: activeQueues.data.reduce((sum, item) => sum + (item.active_queues || 0), 0),
          averageWaitTime: Math.round(
            waitTime.data.reduce((sum, item) => sum + (item.wait_time || 0), 0) /
              waitTime.data.length || 0,
          ),
          totalServed: totalServed.data.reduce((sum, item) => sum + (item.total_served || 0), 0),
        }
      } catch (err) {
        error.value.venueActiveQueues = true
        error.value.venueWaitTime = true
        error.value.venueTotalServed = true
        console.error('Error fetching venue level stats:', err)
      } finally {
        loading.value.venueActiveQueues = false
        loading.value.venueWaitTime = false
        loading.value.venueTotalServed = false
      }
    }

    const fetchCounterLevelStats = async () => {
      const userData = getUserData()
      const counterFilters = {
        venue_id: userData.venue_id,
        service_id: userData.service_id,
        counter_id: userData.counter_id,
      }

      loading.value.activeQueues = true
      loading.value.waitTime = true
      loading.value.totalServed = true

      try {
        const [activeQueues, waitTime, totalServed] = await Promise.all([
          api.post('/statistics/active-queues', counterFilters),
          api.post('/statistics/average-wait-time', counterFilters),
          api.post('/statistics/total-served', counterFilters),
        ])

        statistics.value = {
          activeQueues: activeQueues.data.reduce((sum, item) => sum + (item.active_queues || 0), 0),
          averageWaitTime: Math.round(
            waitTime.data.reduce((sum, item) => sum + (item.wait_time || 0), 0) /
              waitTime.data.length || 0,
          ),
          totalServed: totalServed.data.reduce((sum, item) => sum + (item.total_served || 0), 0),
        }
      } catch (err) {
        error.value.activeQueues = true
        error.value.waitTime = true
        error.value.totalServed = true
        console.error('Error fetching counter level stats:', err)
      } finally {
        loading.value.activeQueues = false
        loading.value.waitTime = false
        loading.value.totalServed = false
      }
    }

    const fetchCounterStatistics = async (counter) => {
      const counterFilters = {
        venue_id: counter.venue_id,
        service_id: counter.service_id,
        counter_id: counter.counter_id,
      }

      try {
        const [activeQueues, waitTime, totalServed] = await Promise.all([
          api.post('/statistics/active-queues', counterFilters),
          api.post('/statistics/average-wait-time', counterFilters),
          api.post('/statistics/total-served', counterFilters),
        ])

        return {
          activeQueues: activeQueues.data.reduce((sum, item) => sum + (item.active_queues || 0), 0),
          averageWaitTime: Math.round(
            waitTime.data.reduce((sum, item) => sum + (item.wait_time || 0), 0) /
              waitTime.data.length || 0,
          ),
          totalServed: totalServed.data.reduce((sum, item) => sum + (item.total_served || 0), 0),
        }
      } catch (err) {
        console.error(`Error fetching statistics for counter ${counter.counter_id}:`, err)
        return {
          activeQueues: 'N/A',
          averageWaitTime: 'N/A',
          totalServed: 'N/A',
        }
      }
    }

    const fetchServices = async () => {
      const userData = getUserData()
      try {
        const token = localStorage.getItem('token')
        const response = await api.get(`/services/venue/${userData.venue_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Fetch counters and their statistics for each service
        const servicesWithCounters = await Promise.all(
          response.data.map(async (service) => {
            const countersResponse = await api.get(`/counters/venue/${userData.venue_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            const countersWithStats = await Promise.all(
              countersResponse.data
                .filter((counter) => counter.service_id === service.service_id)
                .map(async (counter) => ({
                  ...counter,
                  statistics: await fetchCounterStatistics(counter),
                })),
            )

            console.log(`Counters for Service ${service.service_name}:`, countersWithStats) // Debug log

            return {
              ...service,
              counters: countersWithStats,
            }
          }),
        )

        services.value = servicesWithCounters

        // Calculate total served from all counters
        const totalServedFromCounters = services.value.reduce((serviceSum, service) => {
          return (
            serviceSum +
            service.counters.reduce((counterSum, counter) => {
              return counterSum + (counter.statistics.totalServed || 0)
            }, 0)
          )
        }, 0)

        console.log('Total Served from Counters:', totalServedFromCounters) // Debug log
      } catch (err) {
        console.error('Error fetching services:', err)
      }
    }

    const formatWaitTime = (minutes) => {
      if (minutes < 60) return `${minutes} mins`
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }

    onMounted(async () => {
      await Promise.all([
        fetchActiveQueues(),
        fetchAverageWaitTime(),
        fetchVenueLevelStats(),
        fetchTotalServed(),
        fetchServiceLevelStats(),
        fetchCounterLevelStats(), // Ensure this function is called
        fetchServices(), // Updated to include counter statistics
      ])
    })

    return {
      statistics,
      serviceStatistics,
      venueStatistics,
      loading,
      error,
      formatWaitTime,
      services,
    }
  },
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #f1f5f9;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 20px;
}

.overview {
  margin-bottom: 30px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1;
}

.stat-card h3 {
  font-size: 1rem;
  color: #475569;
  margin-bottom: 10px;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.services-overview {
  margin-top: 2rem;
}

.services-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.service-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

.counters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.counter-item {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  transition:
    background-color 0.2s,
    box-shadow 0.2s;
}

.counter-item:hover {
  background-color: #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.counter-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.counter-stats {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
}

.counter-stats p {
  margin: 0.2rem 0;
}

.counter-stats strong {
  color: #1e293b;
}

/* Responsive styles */
@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .content {
    margin-top: 50px;
  }

  .services-list {
    grid-template-columns: 1fr;
  }
}

.mt-6 {
  margin-top: 1.5rem;
}
</style>
