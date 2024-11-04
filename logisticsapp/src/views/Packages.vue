<template>
  <div class="package-form-container">
    <h2>Crear Paquete</h2>
    <el-form :model="packageData" @submit.prevent="createPackage" label-position="top" label-width="120px" class="package-form">
      <el-form-item label="Nombre">
        <el-input v-model="packageData.name" required></el-input>
      </el-form-item>
      <el-form-item label="Peso (kg)">
        <el-input v-model="packageData.weight" type="number" required></el-input>
      </el-form-item>
      <el-form-item label="Dirección de Origen">
        <el-select v-model="packageData.originAddress" placeholder="Seleccione dirección de origen" required>
          <el-option v-for="address in addresses" :key="address.id" :label="address.street" :value="address"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Dirección de Destino">
        <el-select v-model="packageData.destinationAddress" placeholder="Seleccione dirección de destino" required>
          <el-option v-for="address in addresses" :key="address.id" :label="address.street" :value="address"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Observaciones">
        <el-input v-model="packageData.observations"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="packageData.fragile">¿Es frágil?</el-checkbox>
      </el-form-item>
      <el-form-item v-if="isAdmin" label="Usuario">
        <el-select v-model="packageData.userId" placeholder="Seleccione usuario">
          <el-option v-for="user in clients" :key="user._id" :label="user.email" :value="user._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">Crear</el-button>
      </el-form-item>
    </el-form>

    <h2>Mis Paquetes</h2>
    <el-table :data="packages" style="width: 100%" class="package-table">
      <el-table-column prop="name" label="Nombre"></el-table-column>
      <el-table-column prop="status" label="Estado"></el-table-column>
      <el-table-column prop="weight" label="Peso (kg)"></el-table-column>
      <el-table-column prop="originAddress" label="Dirección de Origen"></el-table-column>
      <el-table-column prop="destinationAddress" label="Dirección de Destino"></el-table-column>
      <el-table-column prop="observations" label="Observaciones"></el-table-column>
      <el-table-column label="¿Es frágil?" :formatter="fragileFormatter"></el-table-column>
      <el-table-column label="Acciones">
        <template #default="scope">
          <el-button v-if="scope.row.status === 'pendiente'" type="danger" @click="deletePackage(scope.row._id)">Eliminar</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../axiosConfig.js';
import {ElMessage, ElMessageBox} from "element-plus";

const packageData = ref({
  name: '',
  status: 'pendiente',
  weight: 0,
  observations: '',
  fragile: false,
  originAddress: '',
  destinationAddress: ''
});

const packages = ref([]);
const addresses = ref([]);
const clients = ref([]);
const isAdmin = localStorage.getItem('role') === 'admin';

const fragileFormatter = (row) => (row.fragile ? 'Sí' : 'No');

const fetchAddresses = async () => {
  try {
    const response = await axios.get('address/getAddress');
    addresses.value = response.data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
  }
};

const fetchClients = async () => {
  try {
    const response = await axios.get('users/getUsers');
    clients.value = response.data.filter(user => user.role === 'client');
  } catch (error) {
    console.error('Error fetching clients:', error);
  }
};

const createPackage = async () => {
  try {
    const packagePayload = {
      ...packageData.value,
      status: 'pendiente',
      weight: `${packageData.value.weight}`
    };

    if (isAdmin) {
      packagePayload.clientId = packageData.value.userId; // Add clientId from selected user
    } else {
      packagePayload.clientId = localStorage.getItem('userId'); // Add clientId from logged-in user
    }

    const response = await axios.post('package/createPackage', packagePayload);
    packages.value.push(response.data);

    await fetchPackages()

  } catch (error) {
    console.error('Error creating package:', error);
  }
};

const fetchPackages = async () => {
  try {
    const params = isAdmin ? {} : { userId: localStorage.getItem('userId') };
    const response = await axios.get('package/getPackages', { params });
    packages.value = response.data.map(pkg => ({
      ...pkg,
      weight: `${pkg.weight} kg`,
      fragile: pkg.fragile ? 'Sí' : 'No',
      originAddress: pkg.originAddress.street || 'N/A',
      destinationAddress: pkg.destinationAddress.street || 'N/A'
    }));
  } catch (error) {
    console.error('Error fetching packages:', error);
  }
};

const deletePackage = async (packageId) => {
  try {
    await ElMessageBox.confirm(
        '¿Estás seguro de que quieres eliminar este paquete?',
        'Confirmar Eliminación',
        {
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          type: 'warning',
        }
    );
    await axios.delete(`package/deletePackage/${packageId}`);
    packages.value = packages.value.filter(pkg => pkg._id !== packageId);
    ElMessage.success('Paquete eliminado con éxito');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting package:', error);
      ElMessage.error('No se pudo eliminar el paquete');
    }
  }
};

onMounted(() => {
  fetchPackages();
  fetchAddresses();
  if (isAdmin) {
    fetchClients();
  }
});
</script>

<style scoped>
.package-form-container {
  padding: 2rem;
  background: #1b1f24;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
}

.package-form-container h2 {
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 1.5rem;
}

.package-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #25292e;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.package-form .el-form-item {
  margin-bottom: 1.2rem;
}

.package-form .el-form-item__label {
  color: #ffffff;
}

.package-form .el-input,
.package-form .el-select {
  background: #1e2329;
  border: none;
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.package-form .el-input input::placeholder {
  color: #a5a5a5;
}

.package-form .el-button {
  background: linear-gradient(135deg, #634141, #da5f5f);
  color: white;
  border-radius: 8px;
  border: none;
  padding: 0.8rem 1.2rem;
  transition: transform 0.2s ease;
}

.package-form .el-button:hover {
  transform: scale(1.05);
}

.package-table {
  margin-top: 2rem;
  background: #1b1f24;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.package-table .el-table__header-wrapper {
  background: #25292e;
  color: #b0b0b0;
  border-radius: 12px 12px 0 0;
}

.package-table .el-table__body-wrapper {
  background: #1b1f24;
  color: #e0e0e0;
}

.package-table .el-table__row {
  transition: background 0.3s;
}

.package-table .el-table__row:hover {
  background: #25292e;
}
</style>

