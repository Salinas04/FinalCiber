<template>
  <div class="profile-container">
    <h2>Perfil</h2>
    <div class="profile-info" v-if="user">
      <p><strong>Correo Electrónico:</strong> {{ user.email }}</p>
      <p><strong>Rol:</strong> {{ user.role }}</p>
    </div>
    <el-button type="primary" @click="logout" class="logout-button">Cerrar Sesión</el-button>
  </div>
</template>

<script>
import axios from '../axiosConfig.js';

export default {
  data() {
    return {
      user: null
    };
  },
  created() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await axios.get('/auth/profile');
        this.user = response.data;
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  background: #1b1f24;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

h2 {
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 1rem;
}

.profile-info {
  background: #25292e;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin-bottom: 1.5rem;
}

.profile-info p {
  margin: 0.5rem 0;
  font-size: 1rem;
  color: #d0d0d0;
}

.logout-button {
  background: linear-gradient(135deg, #634141, #da5f5f);
  color: white;
  border: none;
  padding: 0.8rem 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.logout-button:hover {
  transform: scale(1.05);
}
</style>
