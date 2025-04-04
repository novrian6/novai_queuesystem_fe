<template>
  <div>
    <button class="burger-menu" @click="toggleMenu">
      <span class="burger-icon"></span>
    </button>
    <div class="sidebar-overlay" v-if="isMenuVisible" @click="toggleMenu"></div>
    <aside :class="['sidebar', { active: isMenuVisible }]">
      <div class="sidebar-header">
        <h2 class="sidebar-title">
          <i class="fas fa-tasks"></i>
          Admin Dashboard
        </h2>
      </div>
      <ul class="menu">
        <li>
          <router-link to="/dashboard" class="menu-item">
            <i class="fas fa-home"></i>
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/operator" class="menu-item">
            <i class="fas fa-user-cog"></i>
            Operator
          </router-link>
        </li>
        <template v-if="!isOperatorRole">
          <li>
            <div class="menu-item" @click="toggleSubmenu('queueManagement')">
              <div class="menu-item-content">
                <i class="fas fa-stream"></i>
                Queue Management
              </div>
              <i
                :class="[
                  'fas',
                  'submenu-arrow',
                  activeSubmenu === 'queueManagement' ? 'fa-chevron-down' : 'fa-chevron-right',
                ]"
              ></i>
            </div>
            <transition name="slide-fade">
              <ul v-if="activeSubmenu === 'queueManagement'" class="submenu">
                <li><router-link to="">Live Queue Status</router-link></li>
                <li><router-link to="/queues/get-ticket">Get Ticket</router-link></li>
              </ul>
            </transition>
          </li>
          <li>
            <div class="menu-item" @click="toggleSubmenu('venuesServices')">
              <div class="menu-item-content">
                <i class="fas fa-building"></i>
                Venues & Services
              </div>
              <i
                :class="[
                  'fas',
                  'submenu-arrow',
                  activeSubmenu === 'venuesServices' ? 'fa-chevron-down' : 'fa-chevron-right',
                ]"
              ></i>
            </div>
            <transition name="slide-fade">
              <ul v-if="activeSubmenu === 'venuesServices'" class="submenu">
                <li><router-link to="/admin/venues">Manage Venues</router-link></li>
                <li><router-link to="/admin/services">Manage Services</router-link></li>
                <li><router-link to="/admin/counters">Manage Counters</router-link></li>
              </ul>
            </transition>
          </li>
          <li>
            <div class="menu-item" @click="toggleSubmenu('usersRoles')">
              <div class="menu-item-content">
                <i class="fas fa-users"></i>
                Users & Roles
              </div>
              <i
                :class="[
                  'fas',
                  'submenu-arrow',
                  activeSubmenu === 'usersRoles' ? 'fa-chevron-down' : 'fa-chevron-right',
                ]"
              ></i>
            </div>
            <transition name="slide-fade">
              <ul v-if="activeSubmenu === 'usersRoles'" class="submenu">
                <li><router-link to="/admin/users">Manage Users</router-link></li>
                <li>
                  <router-link to="/admin/user-counter-map">Manage Counter's operator</router-link>
                </li>
              </ul>
            </transition>
          </li>
          <li>
            <div class="menu-item" @click="toggleSubmenu('reportsAnalytics')">
              <div class="menu-item-content">
                <i class="fas fa-chart-line"></i>
                Reports & Analytics
              </div>
              <i
                :class="[
                  'fas',
                  'submenu-arrow',
                  activeSubmenu === 'reportsAnalytics' ? 'fa-chevron-down' : 'fa-chevron-right',
                ]"
              ></i>
            </div>
            <transition name="slide-fade">
              <ul v-if="activeSubmenu === 'reportsAnalytics'" class="submenu">
                <li>
                  <router-link to="">Queue Performance Reports</router-link>
                </li>
                <li><router-link to="">Peak Hour Analysis</router-link></li>
                <li><router-link to="">Average Wait Time Trends</router-link></li>
                <li>
                  <router-link to="">Service Performance Analytics</router-link>
                </li>
              </ul>
            </transition>
          </li>
          <li>
            <div class="menu-item" @click="toggleSubmenu('systemSettings')">
              <div class="menu-item-content">
                <i class="fas fa-cogs"></i>
                System Settings
              </div>
              <i
                :class="[
                  'fas',
                  'submenu-arrow',
                  activeSubmenu === 'systemSettings' ? 'fa-chevron-down' : 'fa-chevron-right',
                ]"
              ></i>
            </div>
            <transition name="slide-fade">
              <ul v-if="activeSubmenu === 'systemSettings'" class="submenu">
                <li>
                  <router-link to="">Subscription & Billing</router-link>
                </li>
                <li>
                  <router-link to="">Notification Settings</router-link>
                </li>
                <li><router-link to="">Audit Logs</router-link></li>
                <li><router-link to="">API & Integration</router-link></li>
              </ul>
            </transition>
          </li>
        </template>
        <li class="logout-item">
          <div class="menu-item" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </div>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script>
export default {
  name: 'SideMenu',
  data() {
    return {
      isMenuVisible: window.innerWidth > 768, // Default to visible on larger screens
      activeSubmenu: null,
    }
  },
  computed: {
    isOperatorRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.role === 'operator'
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuVisible = !this.isMenuVisible
    },
    toggleSubmenu(menu) {
      this.activeSubmenu = this.activeSubmenu === menu ? null : menu
    },
    handleResize() {
      this.isMenuVisible = window.innerWidth > 768 // Automatically hide on smaller screens
    },
    logout() {
      // Clear all relevant localStorage items
      localStorage.removeItem('token')
      localStorage.removeItem('loggedInUser')
      localStorage.removeItem('user')
      localStorage.removeItem('operator_id')
      localStorage.removeItem('counter_id')
      localStorage.removeItem('owner_id')
      localStorage.removeItem('operatorData')

      // Navigate to login
      this.$router.push('/login')
    },
    checkUserRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      this.isOperatorRole = user.role === 'operator'
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize) // Listen for window resize
    this.handleResize() // Initial check

    // Add storage event listener
    window.addEventListener('storage', this.checkUserRole)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize) // Clean up listener
    window.removeEventListener('storage', this.checkUserRole)
  },
}
</script>

<style scoped>
.burger-menu {
  display: none; /* Hidden by default */
  position: fixed;
  top: 15px;
  left: 15px;
  background-color: #43a047;
  color: #ffffff;
  border: none;
  padding: 8px;
  font-size: 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
  width: 40px; /* Explicitly set width */
  height: 40px; /* Explicitly set height */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.burger-icon {
  position: relative;
  width: 20px;
  height: 2px;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.burger-icon::before,
.burger-icon::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 2px;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.burger-icon::before {
  transform: translateY(-6px);
}

.burger-icon::after {
  transform: translateY(6px);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

.sidebar {
  width: 280px; /* Increased width for better spacing */
  background: linear-gradient(165deg, #388e3c 0%, #43a047 100%);
  color: #ffffff;
  padding: 0; /* Remove padding here */
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100%;
  z-index: 999;
  transform: translateX(-100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
}

.sidebar.active {
  transform: translateX(0); /* Visible when active */
}

@media (min-width: 769px) {
  .burger-menu {
    display: none; /* Hide burger menu on larger screens */
  }

  .sidebar {
    transform: translateX(0); /* Always visible on larger screens */
    position: static;
  }
}

.sidebar-header {
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  opacity: 0.95;
}

.menu {
  list-style: none;
  padding: 20px 16px;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.menu li {
  margin-bottom: 4px; /* Reduce space between items */
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Align arrow to the right */
  padding: 12px 16px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 12px;
  margin: 0;
  cursor: pointer;
  background: transparent;
  opacity: 0.85;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 16px; /* Consistent spacing between icon and text */
  font-weight: 500;
}

.menu-item i {
  width: 20px; /* Fixed width for icons */
  text-align: center;
  font-size: 1.1rem;
  opacity: 0.9;
}

.submenu-arrow {
  font-size: 0.75rem;
  margin-left: 8px;
  opacity: 0.8;
  transition: transform 0.2s ease;
}

.menu li > span {
  cursor: pointer;
  color: #ffffff;
  font-weight: bold;
}

.menu li a {
  color: #ffffff;
  text-decoration: none;
}

.menu li a:hover {
  text-decoration: underline;
}

.submenu {
  list-style: none;
  margin: 4px 0 8px 36px; /* Align with parent text */
  padding: 0 0 0 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
}

.submenu li {
  margin: 0; /* Remove margin */
}

.submenu a {
  display: block;
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  font-size: 0.95rem;
}

.submenu a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: translateX(4px);
  text-decoration: none; /* Remove underline on hover */
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-12px);
  opacity: 0;
}

.logout-item {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
}

.logout-item .menu-item {
  color: #ffcdd2;
  font-weight: 500;
}

.logout-item .menu-item:hover {
  background: rgba(244, 67, 54, 0.15);
}

.logout-link {
  color: #ef4444 !important;
  cursor: pointer;
  font-weight: bold;
}

.logout-link:hover {
  color: #dc2626 !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sidebar-overlay {
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

/* Active states */
.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .sidebar {
    width: 260px;
  }

  .burger-menu {
    background: rgba(67, 160, 71, 0.95);
    backdrop-filter: blur(10px);
  }
}
</style>
