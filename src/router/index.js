import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import GetTicketView from '../views/GetTicketView.vue' // Import the new view
import AdminVenueManagementView from '../views/AdminVenueManagementView.vue' // Import the new view
import AdminServiceManagementView from '@/views/AdminServiceManagementView.vue'
import AdminUserManagement from '@/views/AdminUserManagement.vue'
import AdminCounterManagementView from '@/views/AdminCounterManagementView.vue' // Import the new view
import AdminUserCounterMap from '@/views/AdminUserCounterMap.vue'
import VisitorTicketView from '@/views/VisitorTicketView.vue'
import OperatorView from '@/views/OperatorView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
  },
  { path: '/queues/get-ticket', component: GetTicketView }, // New route

  {
    path: '/visitor-ticket/:token',
    name: 'VisitorTicket',
    component: VisitorTicketView,
  },
  {
    path: '/admin/venues',
    name: 'AdminVenueManagement',
    component: AdminVenueManagementView,
  },
  {
    path: '/admin/services',
    name: 'AdminServiceManagement',
    component: AdminServiceManagementView,
  },
  {
    path: '/admin/users',
    name: 'AdminUserManagement',
    component: AdminUserManagement,
  },
  {
    path: '/admin/counters',
    name: 'AdminCounterManagement',
    component: AdminCounterManagementView,
  },
  {
    path: '/admin/user-counter-map',
    name: 'AdminUserCounterMap',
    component: AdminUserCounterMap,
  },
  {
    path: '/operator',
    name: 'Operator',
    component: OperatorView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
