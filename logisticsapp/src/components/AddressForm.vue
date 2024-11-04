<template>
  <div class="address-form-container">
    <h2>Crear Dirección</h2>
    <el-form :model="address" @submit.prevent="createAddress" label-position="top" label-width="120px" class="address-form">
      <el-form-item v-if="isAdmin" label="Seleccionar Cliente">
        <el-select v-model="selectedClient" placeholder="Seleccionar Cliente">
          <el-option v-for="client in clients" :key="client._id" :label="client.email" :value="client._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Calle">
        <el-input v-model="address.street" required></el-input>
      </el-form-item>
      <el-form-item label="Ciudad">
        <el-input v-model="address.city" required></el-input>
      </el-form-item>
      <el-form-item label="Estado">
        <el-input v-model="address.state" required></el-input>
      </el-form-item>
      <el-form-item label="Codigo postal">
        <el-input v-model="address.zipCode" required></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">Crear</el-button>
      </el-form-item>
    </el-form>

    <h2>Mis direcciones</h2>
    <el-table :data="addresses" style="width: 100%" class="address-table">
      <el-table-column prop="street" label="Calle"></el-table-column>
      <el-table-column prop="city" label="Ciudad"></el-table-column>
      <el-table-column prop="state" label="Estado"></el-table-column>
      <el-table-column prop="zipCode" label="Codigo postal"></el-table-column>
      <el-table-column label="Acciones">
        <template #default="scope">
          <el-button type="danger" @click="deleteAddress(scope.row._id)">Eliminar</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from '../axiosConfig.js';
import {ElMessage, ElMessageBox} from "element-plus";

export default {
  data() {
    return {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      addresses: [],
      clients: [],
      selectedClient: null,
      isAdmin: localStorage.getItem('role') === 'admin'
    };
  },
  created() {
    this.fetchAddresses();
    if (this.isAdmin) {
      this.fetchClients();
    }
  },
  methods: {
    async createAddress() {
      try {
        const payload = { ...this.address };
        if (this.isAdmin && this.selectedClient) {
          payload.userId = this.selectedClient;
        }
        const response = await axios.post('address/createAddress', payload);
        this.addresses.push(response.data);
        this.address = { street: '', city: '', state: '', zipCode: '' };
      } catch (error) {
        console.error('Error creating address:', error);
      }
    },
    async fetchAddresses() {
      try {
        const userId = this.isAdmin ? '' : localStorage.getItem('userId');
        const response = await axios.get('address/getAddress', {
          params: { userId }
        });
        this.addresses = response.data;
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    },
    async fetchClients() {
      try {
        const response = await axios.get('users/getUsers');
        this.clients = response.data.filter(user => user.role === 'client');
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    },
    async deleteAddress(addressId) {
      try {
        await ElMessageBox.confirm(
            '¿Estás seguro de que quieres eliminar esta dirección?',
            'Confirmar Eliminación',
            {
              confirmButtonText: 'Eliminar',
              cancelButtonText: 'Cancelar',
              type: 'warning',
            }
        );
        await axios.delete(`address/deleteAddress/${addressId}`);
        this.addresses = this.addresses.filter(address => address._id !== addressId);
        ElMessage.success('Dirección eliminada con éxito');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error deleting address:', error);
          ElMessage.error('No se pudo eliminar la dirección');
        }
      }
    }
  }
};
</script>

<style scoped>
.address-form-container {
  padding: 2rem;
  background: #1b1f24;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
}

.address-form-container h2 {
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 1.5rem;
}

.address-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #25292e;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.address-form .el-form-item {
  margin-bottom: 1.2rem;
}

.address-form .el-form-item__label {
  color: #ffffff; /* Cambiar el color de los labels a blanco */
}

.address-form .el-input {
  background: #1e2329;
  border: none;
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.address-form .el-input input::placeholder {
  color: #a5a5a5;
}

.address-form .el-button {
  background: linear-gradient(135deg, #634141, #da5f5f);
  color: white;
  border-radius: 8px;
  border: none;
  padding: 0.8rem 1.2rem;
  transition: transform 0.2s ease;
}

.address-form .el-button:hover {
  transform: scale(1.05);
}

.address-table {
  margin-top: 2rem;
  background: #1b1f24;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.address-table .el-table__header-wrapper {
  background: #25292e;
  color: #b0b0b0;
  border-radius: 12px 12px 0 0;
}

.address-table .el-table__body-wrapper {
  background: #1b1f24;
  color: #e0e0e0;
}

.address-table .el-table__row {
  transition: background 0.3s;
}

.address-table .el-table__row:hover {
  background: #25292e;
}
</style>
