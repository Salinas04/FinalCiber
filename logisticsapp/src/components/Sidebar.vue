<template>
  <el-aside class="sidebar">
    <header class="sidebar-header">
      <el-icon><User /></el-icon>
      <div class="user-actions">
        <el-button type="warning" round @click="viewProfile" class="action-button">Ver perfil</el-button>
        <el-button type="warning" round @click="logout" class="action-button">Cerrar sesión</el-button>
      </div>
    </header>
    <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        background-color="#1e2329"
        text-color="#b0b0b0"
        active-text-color="#ffd04b"
        router
    >
      <el-menu-item index="1" route="/">
        <el-icon><HomeFilled /></el-icon>
        <span slot="title">Panel de control</span>
      </el-menu-item>
      <el-menu-item v-if="isClient" index="2" route="/packages">
        <el-icon><Goods /></el-icon>
        <span slot="title">Crear paquete</span>
      </el-menu-item>
      <el-menu-item v-if="isDriver" index="3" route="/trucks">
        <el-icon><Van /></el-icon>
        <span slot="title">Registrar Camion</span>
      </el-menu-item>
      <el-menu-item v-if="isDriver" index="4" route="/deliveries">
        <el-icon><Van /></el-icon>
        <span slot="title">Entregas</span>
      </el-menu-item>
<!--      <el-menu-item index="5" route="/settings">-->
<!--        <el-icon><User /></el-icon>-->
<!--        <span slot="title">Ajustes</span>-->
<!--      </el-menu-item>-->
      <el-menu-item v-if="isClient" index="5" route="/addresses">
        <el-icon><User /></el-icon>
        <span slot="title">Direcciones</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
import { User, Goods, Van, HomeFilled } from '@element-plus/icons-vue';

export default {
  name: 'Sidebar',
  components: {
    User,
    Goods,
    Van,
    HomeFilled
  },
  data() {
    return {
      isClient: false,
      isDriver: false
    };
  },
  created() {
    const role = localStorage.getItem('role');
    if (role === 'client' || role === 'admin') {
      this.isClient = true;
    }
    if (role === 'driver' || role === 'admin') {
      this.isDriver = true;
    }
  },
  methods: {
    viewProfile() {
      this.$router.push('/profile');
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Sidebar Styles */
.sidebar {
  height: 100vh;
  background-color: #1e2329;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #31363f;
}

/* Header Styles */
.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #1e2329;
  border-bottom: 1px solid #31363f;
  color: #b0b0b0;
}

.sidebar-header .el-icon {
  font-size: 2rem;
  color: #ffd04b;
}

.user-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 1rem;
}

.action-button {
  color: #1e2329 !important;
  font-size: 0.9rem;
  margin-top: 4px;
}

/* Menu Styles */
.el-menu-vertical-demo {
  border-right: none;
  flex: 1;
  background-color: #1e2329;
}

.el-menu-vertical-demo .el-menu-item {
  padding-left: 24px !important;
  transition: background-color 0.3s ease;
}

.el-menu-vertical-demo .el-menu-item:hover {
  background-color: #343a40;
  color: #ffd04b;
}

/* Active and Hover States */
.el-menu-vertical-demo .el-menu-item.is-active {
  background-color: #3b4148;
}

.el-menu-vertical-demo .el-icon {
  color: #ffd04b;
}

.el-menu-item span {
  font-size: 1rem;
  font-weight: 500;
}

/* Transitions for Hover Effects */
.el-menu-item:hover .el-icon,
.el-menu-item.is-active .el-icon {
  transform: scale(1.1);
  transition: transform 0.3s ease, color 0.3s ease;
}
</style>

