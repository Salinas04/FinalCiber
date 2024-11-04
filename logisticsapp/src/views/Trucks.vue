<template>
  <div class="trucks-container">
    <h2>Registrar Camión</h2>
    <el-form :model="newTruck" label-width="120px" class="truck-form">
      <el-form-item label="Matricula">
        <el-input v-model="newTruck.licensePlate" placeholder="Introduce la Matricula"></el-input>
      </el-form-item>
      <el-form-item label="Modelo">
        <el-input v-model="newTruck.model" placeholder="Introduce Modelo"></el-input>
      </el-form-item>
      <el-form-item label="Capacidad">
        <el-input-number v-model="newTruck.capacity" :min="0" placeholder="Introduce la capacidad"></el-input-number>
      </el-form-item>
      <el-form-item label="Año">
        <el-input-number v-model="newTruck.year" :min="1900" :max="new Date().getFullYear()" placeholder="Introduce el año del camión"></el-input-number>
      </el-form-item>
      <el-form-item label="Estado">
        <el-select v-model="newTruck.status" placeholder="Select status">
          <el-option label="Activo" value="active"></el-option>
          <el-option label="Inactivo" value="inactive"></el-option>
          <el-option label="En mantenimiento" value="maintenance"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Asignar a Conductor" v-if="isAdmin">
        <el-select v-model="newTruck.driverId" placeholder="Selecciona un conductor">
          <el-option v-for="user in drivers" :key="user._id" :label="user.email" :value="user._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createTruck">Registrar camión</el-button>
      </el-form-item>
    </el-form>

    <h2>Mis Camiones</h2>
    <el-table :data="trucks" class="truck-table" border style="width: 100%">
      <el-table-column prop="licensePlate" label="Matricula"></el-table-column>
      <el-table-column prop="model" label="Modelo"></el-table-column>
      <el-table-column prop="capacity" label="Capacidad (tons)"></el-table-column>
      <el-table-column prop="year" label="Año"></el-table-column>
      <el-table-column prop="status" label="Estado"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../axiosConfig.js';
import { ElMessage } from 'element-plus';

const trucks = ref([]);
const drivers = ref([]);
const newTruck = ref({
  licensePlate: '',
  model: '',
  capacity: 0,
  year: new Date().getFullYear(),
  status: 'active',
  driverId: ''
});

const isAdmin = localStorage.getItem('role') === 'admin';

const fetchTrucks = async () => {
  try {
    const response = await axios.get('/trucks/getTruck');
    trucks.value = response.data;
  } catch (error) {
    console.error('Error fetching trucks:', error);
  }
};

const fetchDrivers = async () => {
  try {
    const response = await axios.get('/users/getUsers');
    drivers.value = response.data.filter(user => user.role === 'driver');
    console.log(drivers.value);
  } catch (error) {
    console.error('Error fetching drivers:', error);
  }
};

const createTruck = async () => {
  try {
    console.log('Creating truck:', newTruck.value);
    await axios.post('/trucks/postTruck', newTruck.value);
    ElMessage.success('Truck created successfully');
    await fetchTrucks();
    newTruck.value = {
      licensePlate: '',
      model: '',
      capacity: 0,
      year: new Date().getFullYear(),
      status: 'active',
      driverId: ''
    };
  } catch (error) {
    console.error('Error creating truck:', error);
    ElMessage.error('Failed to create truck');
  }
};

onMounted(() => {
  fetchTrucks();
  if (isAdmin) {
    fetchDrivers();
  }
});
</script>

<style scoped>
.trucks-container {
  padding: 2rem;
  background: #1b1f24;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
}

h2 {
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 1.5rem;
}

.truck-form {
  max-width: 600px;
  margin: 0 auto 2rem;
  padding: 1.5rem;
  background: #25292e;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.truck-form .el-form-item__label {
  color: #ffffff;
}

.truck-form .el-input,
.truck-form .el-input-number__inner,
.truck-form .el-select .el-input__inner {
  background: #1e2329;
  border: none;
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.truck-form .el-input input::placeholder,
.truck-form .el-input-number__inner::placeholder {
  color: #a5a5a5;
}

.truck-form .el-button {
  background: linear-gradient(135deg, #634141, #da5f5f);
  color: white;
  border-radius: 8px;
  border: none;
  padding: 0.8rem 1.2rem;
  transition: transform 0.2s ease;
}

.truck-form .el-button:hover {
  transform: scale(1.05);
}

.truck-table {
  background: #1b1f24;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.truck-table .el-table__header-wrapper {
  background: #25292e;
  color: #b0b0b0;
}

.truck-table .el-table__body-wrapper {
  background: #1b1f24;
  color: #e0e0e0;
}

.truck-table .el-table__row {
  transition: background 0.3s;
}

.truck-table .el-table__row:hover {
  background: #25292e;
}

.truck-table .el-table__cell {
  border-bottom: 1px solid #2d3135;
}

.truck-table .el-table__header {
  font-weight: bold;
  color: #b0b0b0;
}
</style>
