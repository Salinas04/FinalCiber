<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <el-input v-model="email" placeholder="Email" class="auth-input" />
        <el-input v-model="password" type="password" placeholder="Contraseña" class="auth-input" />
        <el-form-item label="Registrarse como:" label-position="top">
          <el-select v-model="role" placeholder="Selecciona un rol" class="auth-select">
            <el-option label="Cliente" value="client"></el-option>
            <el-option label="Transportista" value="driver"></el-option>
          </el-select>
        </el-form-item>

        <div class="terms-container">
          <el-checkbox v-model="acceptTerms" class="terms-checkbox">Acepta los terminos condiciones</el-checkbox>
        </div>

        <el-button type="primary" @click="register" class="auth-button" :disabled="!acceptTerms">Registrar</el-button>
      </form>

      <p class="auth-link">¿Tienes una cuenta registrada? <router-link to="/login">Login</router-link></p>
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
      password: '',
      role: 'client',
      acceptTerms: false
    };
  },
  methods: {
    validateEmail(email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    },
    validatePassword(password) {
      const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
      return passwordPattern.test(password);
    },
    async register() {
      if (!this.acceptTerms) {
        ElMessage({
          message: 'Porfavor acepta los terminos y condiciones.',
          type: 'warning',
        });
        return;
      }

      if (!this.validateEmail(this.email)) {
        ElMessage({
          message: 'Formato de email invalido.',
          type: 'warning',
        });
        return;
      }

      if (!this.validatePassword(this.password)) {
        ElMessage({
          message: 'Contraseña debe tener al menos 8 caracteres, una mayuscula y un caracter especial.',
          type: 'warning',
        });
        return;
      }

      try {
        await axios.post('/auth/register', {
          email: this.email,
          password: this.password,
          role: this.role
        });
        this.$router.push('/login');
        ElMessage({
          message: 'Registro completado con exito!',
          type: 'success',
        });
      } catch (error) {
        console.error('Error registering:', error);
        ElMessage({
          message: 'Error al registrar, intenta de nuevo.',
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
  justify-content: center;
  align-items: center;
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
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.auth-box h2 {
  color: #b0b0b0;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.auth-input,
.auth-select {
  background: #25292e;
  border: none;
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
}

.auth-input input::placeholder,
.auth-select .el-input__inner::placeholder {
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

.auth-button:disabled {
  background: #444;
}

.auth-button:hover:enabled {
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

.terms-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.terms-checkbox {
  color: #e0e0e0;
  margin-right: 0.5rem;
}

.info-icon {
  color: #12c2e9;
  cursor: pointer;
  font-size: 1.2rem;
}
</style>
