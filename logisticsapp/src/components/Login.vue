<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <el-input v-model="email" placeholder="Email" class="auth-input" />
        <el-input v-model="password" type="password" placeholder="Contraseña" class="auth-input" />
        <el-button type="primary" @click="login" class="auth-button">Login</el-button>
      </form>
      <p class="auth-link">¿No estas registrado? <router-link to="/register">Registrar</router-link></p>
    </div>
  </div>
</template>

<script>
import axios from '../axiosConfig.js';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('auth/login', {
          email: this.email,
          password: this.password
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', response.data.mail);
        localStorage.setItem('role', response.data.role);
        ElMessage({
          message: 'Login completado con éxito!',
          type: 'success',
        });
        this.$router.push('/');
      } catch (error) {
        console.error('Error logging in:', error);
        ElMessage({
          message: 'Credenciales incorrectas, prueba otra vez.',
          type: 'error',
        });
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  --color: #E1E1E1;
  background-color: #F3F3F3;
  background-image: linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%,transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%,transparent),
  linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%,transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%,transparent);
  background-size: 55px 55px;
}

.auth-box {
  background: #1b1f24;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
  max-width: 350px;
  width: 100%;
  text-align: center;
}

.auth-box h2 {
  color: #b0b0b0;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.auth-input {
  background: #25292e;
  border: none;
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
}

.auth-input input::placeholder {
  color: #a5a5a5;
}

.auth-button {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #634141, #da5f5f);
  color: white;
  border: none;
  transition: transform 0.2s ease;
}

.auth-button:hover {
  transform: scale(1.05);
}

.auth-link {
  margin-top: 1.5rem;
  color: #a0a0a0;
}

.auth-link a {
  color: #12c2e9;
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-link a:hover {
  color: #f64f59;
}
</style>
