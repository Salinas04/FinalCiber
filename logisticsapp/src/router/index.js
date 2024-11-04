import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Packages from '../views/Packages.vue';
import Deliveries from '../views/Deliveries.vue';
import Settings from '../views/Settings.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Profile from "../components/Profile.vue";
import AddressForm from "../components/AddressForm.vue";
import Trucks from "../views/Trucks.vue";

const routes = [
    { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/packages', name: 'Packages', component: Packages, meta: { requiresAuth: true, role: 'client' } },
    { path: '/trucks', name: 'Trucks', component: Trucks, meta: { requiresAuth: true, role: 'driver' } },
    { path: '/deliveries', name: 'Deliveries', component: Deliveries, meta: { requiresAuth: true, role: 'driver' } },
    { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/addresses', name: 'AddressForm', component: AddressForm, meta: { requiresAuth: true, role: 'client' } },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
    history: createWebHistory('/'),
    routes
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (requiresAuth && !token) {
        next('/login');
    } else if (role === 'admin') {
        next();
    } else if (to.meta.role && role !== to.meta.role) {
        next('/login');
    } else {
        next();
    }
});

export default router;
