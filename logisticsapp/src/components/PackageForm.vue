<template>
  <form @submit.prevent="submitForm">
    <el-input v-model="name" placeholder="Nombre del paquete" />
    <el-select v-model="status" placeholder="Seleccionar estado">
      <el-option label="Pendiente" value="pendiente"></el-option>
      <el-option label="En tránsito" value="en tránsito"></el-option>
    </el-select>
    <el-button type="primary" @click="submitForm">Crear Paquete</el-button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      status: 'pendiente'
    };
  },
  methods: {
    submitForm() {
      const newPackage = {
        id: Date.now(),
        name: this.name,
        status: this.status
      };
      this.$store.dispatch('createPackage', newPackage);
    }
  }
};
</script>
