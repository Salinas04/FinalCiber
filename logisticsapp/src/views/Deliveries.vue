<template>
  <div class="deliveries-container">
    <div v-if="isAdmin">
      <h2 class="table-title">Asignación de Paquetes</h2>
      <el-table :data="acceptedPackages" class="custom-table" border>
        <el-table-column prop="name" label="Nombre del Paquete"></el-table-column>
        <el-table-column prop="status" label="Estado"></el-table-column>

        <!-- Selección de Conductor -->
        <el-table-column label="Seleccionar Conductor">
          <template #default="scope">
            <el-select
                v-model="scope.row.selectedDriver"
                placeholder="Seleccionar Conductor"
                @change="fetchTrucks(scope.row.selectedDriver)"
            >
              <el-option
                  v-for="driver in drivers"
                  :key="driver._id"
                  :label="driver.email"
                  :value="driver._id"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>

        <!-- Selección de Camión -->
        <el-table-column label="Seleccionar Camión">
          <template #default="scope">
            <el-select
                v-model="scope.row.selectedTruck"
                placeholder="Seleccionar Camión"
                :disabled="!scope.row.selectedDriver"
            >
              <el-option
                  v-for="truck in trucks"
                  :key="truck._id"
                  :label="`${truck.model} - ${truck.licensePlate}`"
                  :value="truck._id"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>

        <!-- Selección de Fechas -->
        <el-table-column label="Fecha de Salida">
          <template #default="scope">
            <el-date-picker
                v-model="scope.row.departureDate"
                type="date"
                placeholder="Seleccionar Fecha"
            ></el-date-picker>
          </template>
        </el-table-column>

        <el-table-column label="Fecha Estimada de Entrega">
          <template #default="scope">
            <el-date-picker
                v-model="scope.row.estimatedDeliveryDate"
                type="date"
                placeholder="Seleccionar Fecha"
            ></el-date-picker>
          </template>
        </el-table-column>

        <!-- Botón de Asignar -->
        <el-table-column>
          <template #default="scope">
            <el-button
                type="primary"
                @click="assignPackageToTruck(
                scope.row,
                scope.row.selectedDriver,
                scope.row.selectedTruck,
                scope.row.departureDate,
                scope.row.estimatedDeliveryDate
              )"
                class="assign-button"
            >Asignar</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Entregas Asignadas -->
    <h3 class="table-title">Entregas Asignadas</h3>
    <el-table :data="assignedDeliveries" class="custom-table" border row-key="packageId._id" :expand-row-keys="expandedRows">

      <el-table-column type="expand">
        <template #default="scope">
          <div class="expanded-content" @click="getClientInfo(scope.row.packageId.clientId)">
            <p><strong>Nombre del Paquete:</strong> {{ scope.row.packageId.name }}</p>
            <p><strong>Camión:</strong> {{ scope.row.truckId.model }} - {{ scope.row.truckId.licensePlate }}</p>
            <p><strong>Fecha de Salida:</strong> {{ formatDate(scope.row.departureDate) }}</p>
            <p><strong>Fecha Estimada de Entrega:</strong> {{ formatDate(scope.row.estimatedDeliveryDate) }}</p>
            <p><strong>Usuario Paquete:</strong> {{ clientInfoMap[scope.row.packageId.clientId]?.email || 'Cargando...' }}</p>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="packageId.name" label="Nombre del Paquete" class-name="custom-column"></el-table-column>
      <el-table-column prop="truckId.model" label="Camión" class-name="custom-column"></el-table-column>
      <el-table-column prop="departureDate" label="Fecha de Salida" class-name="custom-column" :formatter="(row) => formatDate(row.departureDate)"></el-table-column>
      <el-table-column prop="estimatedDeliveryDate" label="Fecha Estimada de Entrega" class-name="custom-column" :formatter="(row) => formatDate(row.estimatedDeliveryDate)"></el-table-column>
      <el-table-column prop="packageId.status" label="Estado" class-name="custom-column"></el-table-column>

      <el-table-column v-if="isAdmin">
        <template #default="scope">
          <el-button type="danger" @click="cancelAssignedDelivery(scope.row)" class="cancel-button">Cancelar</el-button>
        </template>
      </el-table-column>
      <el-table-column>
        <template #default="scope">
          <el-button type="success" @click="finalizeAssignedDelivery(scope.row)" class="finalize-button">Finalizar</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../axiosConfig.js';
import { ElMessageBox, ElMessage } from 'element-plus';
import { format } from 'date-fns';

const acceptedPackages = ref([]);
const trucks = ref([]);
const drivers = ref([]);
const assignedDeliveries = ref([]);
const expandedRows = ref([]);
const clientInfoMap = ref({});
const isAdmin = localStorage.getItem('role') === 'admin';

const fetchAcceptedPackages = async () => {
  try {
    trucks.value = [];
    const response = await axios.get('/package/getAcceptedPackages');
    acceptedPackages.value = response.data;
  } catch (error) {
    console.error('Error al obtener paquetes aceptados:', error);
  }
};

const fetchClientInfo = async (clientId) => {
  try {
    const response = await axios.get(`/users/getUser/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la información del cliente:', error);
    return null;
  }
};

const getClientInfo = async (clientId) => {
  if (!clientInfoMap.value[clientId]) {
    const clientInfo = await fetchClientInfo(clientId);
    if (clientInfo) {
      clientInfoMap.value[clientId] = clientInfo;
    }
  }
  return clientInfoMap.value[clientId];
};

const fetchDrivers = async () => {
  try {
    const response = await axios.get('/users/getUsers');
    drivers.value = response.data.filter(user => user.role === 'driver');
  } catch (error) {
    console.error('Error fetching drivers:', error);
  }
};

const fetchTrucks = async (driverId) => {
  try {
    const driverResponse = await axios.get(`/users/getUser/${driverId}`);
    const driver = driverResponse.data;

    const params = driver.role === 'admin' ? {} : { driverId };
    console.log('Params:', params);

    // Fetch trucks based on params
    const response = await axios.get('/trucks/getTruck', { params });
    trucks.value = response.data;
  } catch (error) {
    console.error('Error al obtener camiones:', error);
  }
};

const fetchAssignedDeliveries = async () => {
  try {
    const params = isAdmin ? {} : { driverId: localStorage.getItem('userId') };
    const response = await axios.get('/assignedDelivery/getAssignedDeliveries', { params });
    assignedDeliveries.value = response.data;
  } catch (error) {
    console.error('Error al obtener entregas asignadas:', error);
  }
};

const assignPackageToTruck = async (pkg, selectedDriver, selectedTruck, departureDate, estimatedDeliveryDate) => {
  try {
    await ElMessageBox.confirm(
        `¿Estás seguro de que quieres asignar el paquete "${pkg.name}" al camión?`,
        'Confirmar Asignación',
        {
          confirmButtonText: 'Asignar',
          cancelButtonText: 'Cancelar',
          type: 'warning',
        }
    );
    await axios.patch(`/package/assignToTruck/${pkg._id}`, {
      driverId: selectedDriver,
      truckId: selectedTruck,
      departureDate: departureDate,
      estimatedDeliveryDate: estimatedDeliveryDate,
    });
    ElMessage.success('Paquete asignado con éxito');
    acceptedPackages.value = [];
    await fetchAcceptedPackages();
    await fetchAssignedDeliveries();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error al asignar paquete:', error);
      ElMessage.error('No se pudo asignar el paquete');
    }
  }
};

const cancelAssignedDelivery = async (assignedDelivery) => {
  try {
    await ElMessageBox.confirm(
        `¿Estás seguro de que quieres cancelar la entrega asignada del paquete "${assignedDelivery.packageId.name}"?`,
        'Confirmar Cancelación',
        {
          confirmButtonText: 'Cancelar',
          cancelButtonText: 'Volver',
          type: 'warning',
        }
    );
    await axios.patch(`/package/canceledPackage/${assignedDelivery.packageId._id}`);
    await axios.delete(`/assignedDelivery/${assignedDelivery._id}`);
    ElMessage.success('Entrega asignada cancelada con éxito');
    await fetchAssignedDeliveries();
    await fetchAcceptedPackages();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error al cancelar la entrega asignada:', error);
      ElMessage.error('No se pudo cancelar la entrega asignada');
    }
  }
};

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy');
};

const finalizeAssignedDelivery = async (assignedDelivery) => {
  try {
    await ElMessageBox.confirm(
        `¿Estás seguro de que quieres finalizar la entrega del paquete "${assignedDelivery.packageId.name}"?`,
        'Confirmar Finalización',
        {
          confirmButtonText: 'Finalizar',
          cancelButtonText: 'Cancelar',
          type: 'warning',
        }
    );
    await axios.patch(`/assignedDelivery/deliverPackage/${assignedDelivery._id}`);
    ElMessage.success('Entrega finalizada con éxito');
    await fetchAssignedDeliveries();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error al finalizar la entrega:', error);
      ElMessage.error('No se pudo finalizar la entrega');
    }
  }
};

onMounted(() => {
  fetchAcceptedPackages();
  fetchAssignedDeliveries();
  fetchDrivers();
});
</script>

<style scoped>
.deliveries-container {
  padding: 2rem;
  background-color: #25292e;
  border-radius: 12px;
}

.table-title {
  color: #e0e0e0;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.5rem 0;
  text-align: center;
}

.custom-table {
  margin-bottom: 2rem;
  background: #1b1f24;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.custom-table .el-table__header-wrapper {
  background: #25292e;
  color: #b0b0b0;
  font-weight: bold;
}

.custom-table .el-table__body-wrapper {
  background: #1b1f24;
  color: #e0e0e0;
}

.custom-table .el-table__row {
  transition: background 0.3s;
}

.custom-table .el-table__row:hover {
  background: #2d3135;
}

.custom-table .el-table__cell {
  border-bottom: 1px solid #2d3135;
}

.el-select,
.el-date-picker {
  background-color: #2d3135;
  color: #e0e0e0;
  border-radius: 8px;
}

.el-select .el-input__inner,
.el-date-picker .el-input__inner {
  color: #e0e0e0;
  border-color: #444;
}

.el-button.assign-button {
  background: linear-gradient(135deg, #4a8f4a, #76c76c);
  color: white;
  border: none;
  font-weight: bold;
  transition: transform 0.2s ease;
  border-radius: 8px;
}

.el-button.assign-button:hover {
  transform: scale(1.05);
}

.el-button.cancel-button {
  background: linear-gradient(135deg, #f56c6c, #f78989);
  color: white;
  border: none;
  font-weight: bold;
  transition: transform 0.2s ease;
  border-radius: 8px;
}

.el-button.cancel-button:hover {
  transform: scale(1.05);
}

.custom-column {
  background: #1b1f24;
  color: #e0e0e0;
  text-align: center;
}

.custom-column .el-table__header-cell {
  background-color: #25292e;
  color: #b0b0b0;
  font-weight: bold;
}

.custom-column .el-table__cell {
  border-bottom: 1px solid #2d3135;
}

.custom-table .el-table__row:hover {
  background: #2d3135;
}

.expanded-content {
  padding: 1rem;
  background-color: #2d3135;
  color: #e0e0e0;
  border-radius: 8px;
  line-height: 1.8;
  font-size: 0.9rem;
}

.expanded-content p {
  margin: 0.5rem 0;
}


</style>

