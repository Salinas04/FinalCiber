<script setup>
import { ref, onMounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import axios from "../axiosConfig.js";
import { ElMessageBox, ElMessage } from 'element-plus';
import {format} from "date-fns";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, TitleComponent]);

const statuses = ref([
  { label: 'Pendiente', count: 0 },
  { label: 'Aceptado', count: 0 },
  { label: 'En tránsito', count: 0 },
  { label: 'Entregado', count: 0 }
]);

const chartOptions = ref({
  title: {
    text: 'Estado de los Pedidos'
  },
  tooltip: {},
  xAxis: {
    type: 'category',
    data: ['Pendiente', 'Aceptado', 'En tránsito', 'Entregado']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: [0, 0, 0, 0],
      itemStyle: {
        color: '#ffd04b'
      }
    }
  ]
});

const packages = ref([]);
const acceptedPackages = ref([]);
const assignedDeliveries = ref([]);
const deliveredPackages = ref([]);
const role = ref(localStorage.getItem('role'));

const fragileFormatter = (row) => (row.fragile ? 'Sí' : 'No');

const fetchPackageStatus = async () => {
  try {
    const endpoint = role.value === 'driver' || role.value === 'admin' ? 'package/getAllPackages' : 'package/getPackages';
    const response = await axios.get(endpoint);
    const packagesData = response.data;
    const statusCounts = { pendiente: 0, aceptado: 0, 'en tránsito': 0, entregado: 0 };

    packages.value = packagesData;

    packagesData.forEach(pkg => {
      statusCounts[pkg.status]++;
      if (pkg.status === 'aceptado') {
        acceptedPackages.value.push(pkg);
      } else if (pkg.status === 'entregado') {
        deliveredPackages.value.push(pkg);
      }
    });


    statuses.value = [
      { label: 'Pendiente', count: statusCounts.pendiente },
      { label: 'Aceptado', count: statusCounts.aceptado },
      { label: 'En tránsito', count: statusCounts['en tránsito'] },
      { label: 'Entregado', count: statusCounts.entregado }
    ];

    chartOptions.value.series[0].data = [
      statusCounts.pendiente,
      statusCounts.aceptado,
      statusCounts['en tránsito'],
      statusCounts.entregado
    ];

  } catch (error) {
    console.error('Error fetching package status:', error);
  }
};

const fetchAssignedDeliveries = async () => {
  try {
    const isAdmin = localStorage.getItem('role') === 'admin';
    const params = isAdmin ? {} : { driverId: localStorage.getItem('userId') };
    const response = await axios.get('/assignedDelivery/getAssignedDeliveries', { params });
    assignedDeliveries.value = response.data;
  } catch (error) {
    console.error('Error fetching assigned deliveries:', error);
  }
};

const acceptPackage = async (pkg) => {
  try {
    await ElMessageBox.confirm(
        `¿Estas seguro de que quieres aceptar el paquete "${pkg.name}"?`,
        'Confirm',
        {
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          type: 'warning',
        }
    );
    await axios.patch(`/package/acceptPackage/${pkg._id}`);
    ElMessage.success('Package accepted successfully');
    packages.value = [];
    acceptedPackages.value = []
     fetchPackageStatus();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error accepting package:', error);
      ElMessage.error('Failed to accept package');
    }
  }
};

const unacceptPackage = async (pkg) => {
  try {
    await ElMessageBox.confirm(
        `¿Estas seguro que quieres desaceptar este paquete "${pkg.name}"?`,
        'Confirm',
        {
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          type: 'warning',
        }
    );
    await axios.patch(`/package/unacceptPackage/${pkg._id}`);
    ElMessage.success('Package unaccepted successfully');
    packages.value = [];
    acceptedPackages.value = []
    fetchPackageStatus();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error unaccepting package:', error);
      ElMessage.error('Failed to unaccept package');
    }
  }
};

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy');
};

const generateInvoice = (packageData) => {
  const doc = new jsPDF();
  const pricePerKg = 15;
  const totalPrice = packageData.weight * pricePerKg;
  doc.text('Factura de Entrega', 30, 20);
  doc.autoTable({
    startY: 30,
    head: [['Información sobre la entrega', 'Adjuntos']],
    body: [
      ['Nombre', packageData.name],
      ['Estado', packageData.status.toUpperCase()],
      ['Peso', packageData.weight+'kg'],
      ['Dirección de Origen', packageData.originAddress.street],
      ['Dirección de Destino', packageData.destinationAddress.street],
      ['Frágil', packageData.fragile ? 'Sí' : 'No'],
      ['Total a Pagar', `$${totalPrice}`]
    ],
    headStyles: {
      fillColor: [223, 96, 96]
    }
  });
  doc.save(`Factura_${packageData.name}.pdf`);
};

onMounted(() => {
  fetchPackageStatus();
  if (role.value === 'driver' || role.value === 'admin') {
    fetchAssignedDeliveries();
  }
});
</script>

<template>
  <div class="dashboard-container">
    <div class="cards-container">
      <el-card class="status-card" v-for="status in statuses" :key="status.label">
        <div slot="header" class="card-header">
          <span>{{ status.label }}</span>
        </div>
        <div class="card-content">
          <span>{{ status.count }}</span>
        </div>
      </el-card>
    </div>
    <div class="charts-container">
      <v-chart :option="chartOptions" class="status-chart"></v-chart>
    </div>
    <div class="tables-row">
      <div v-if="role === 'client' || role === 'admin'" class="table-container">
        <div class="text-center">
          <el-text size="large" style="color: #b0b0b0;">Lista de Paquetes</el-text>
        </div>
        <el-table :data="packages" class="custom-table" border>
          <el-table-column prop="name" label="Nombre"></el-table-column>
          <el-table-column prop="status" label="Estado"></el-table-column>
          <el-table-column prop="weight" label="Peso"></el-table-column>
          <el-table-column prop="originAddress.street" label="Dirección de Origen"></el-table-column>
          <el-table-column prop="destinationAddress.street" label="Dirección de Destino"></el-table-column>
          <el-table-column prop="fragile" label="Frágil" :formatter="fragileFormatter"></el-table-column>
          <el-table-column label="Actions" v-if="role === 'admin'">
            <template #default="scope">
              <el-button
                  v-if="scope.row.status === 'pendiente'"
                  type="primary"
                  size="small"
                  @click="acceptPackage(scope.row)"
              >
                Aceptar
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="role === 'driver' || role === 'admin'" class="table-container">
        <div class="text-center">
          <el-text size="large" style="color: #b0b0b0;">Paquetes Aceptados</el-text>
        </div>
        <el-table :data="acceptedPackages" class="custom-table" border>
          <el-table-column prop="name" label="Nombre"></el-table-column>
          <el-table-column prop="status" label="Estado"></el-table-column>
          <el-table-column prop="weight" label="Peso"></el-table-column>
          <el-table-column prop="originAddress.street" label="Dirección de Origen"></el-table-column>
          <el-table-column prop="destinationAddress.street" label="Dirección de Destino"></el-table-column>
          <el-table-column prop="fragile" label="Frágil" :formatter="fragileFormatter"></el-table-column>
          <el-table-column label="Actions" v-if="role === 'admin'">
            <template #default="scope">
              <el-button
                  v-if="scope.row.status === 'aceptado'"
                  type="danger"
                  size="small"
                  @click="unacceptPackage(scope.row)"
              >
                Cancelar
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div v-if="role === 'driver' || role === 'admin'" class="table-container">
      <div class="text-center">
        <el-text size="large" style="color: #b0b0b0;">Paquetes Asignados/En tránsito</el-text>
      </div>
      <el-table :data="assignedDeliveries" class="custom-table" border>
        <el-table-column prop="packageId.name" label="Nombre del Paquete"></el-table-column>
        <el-table-column prop="truckId.model" label="Modelo del Camión"></el-table-column>
        <el-table-column
            prop="departureDate"
            label="Fecha de Salida"
            :formatter="(row) => formatDate(row.departureDate)"
        ></el-table-column>
        <el-table-column
            prop="estimatedDeliveryDate"
            label="Fecha Estimada de Entrega"
            :formatter="(row) => formatDate(row.estimatedDeliveryDate)"
        ></el-table-column>
        <el-table-column prop="packageId.status" label="Estado"></el-table-column>
      </el-table>
    </div>

    <div v-if="role === 'client' || role === 'admin'" class="table-container">
      <div class="text-center">
        <el-text size="large" style="color: #b0b0b0;">Paquetes Entregados</el-text>
      </div>
      <el-table :data="deliveredPackages" class="custom-table" border>
        <el-table-column prop="name" label="Nombre"></el-table-column>
        <el-table-column prop="status" label="Estado"></el-table-column>
        <el-table-column prop="weight" label="Peso"></el-table-column>
        <el-table-column prop="originAddress.street" label="Dirección de Origen"></el-table-column>
        <el-table-column prop="destinationAddress.street" label="Dirección de Destino"></el-table-column>
        <el-table-column prop="fragile" label="Frágil" :formatter="fragileFormatter"></el-table-column>
        <el-table-column v-if="role === 'client'">
          <template #default="scope">
            <el-button type="primary" @click="generateInvoice(scope.row)">Ver Factura</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  padding-bottom: 1rem;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}

.cards-container {
  display: flex;
  gap: 1rem;
}

.status-card {
  flex: 1;
  text-align: center;
  background: #1b1f24;
  color: #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-header {
  font-weight: 600;
  color: #b0b0b0;
}

.card-content {
  font-size: 2rem;
  font-weight: 700;
}

.charts-container {
  background: #1b1f24;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.status-chart {
  width: 100%;
  height: 400px;
}

.tables-row {
  display: flex;
  gap: 2rem;
}

/* Estilos de la tabla */
.table-container {
  flex: 1;
  background: #1b1f24;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.custom-table {
  border-radius: 12px;
  overflow: hidden;
}

.custom-table .el-table__header-wrapper {
  background-color: #25292e;
  color: #b0b0b0;
}

.custom-table .el-table__body-wrapper {
  background-color: #1b1f24;
  color: #e0e0e0;
}

.custom-table .el-table__row {
  transition: background 0.3s;
}

.custom-table .el-table__row:hover {
  background-color: #25292e;
}

.custom-table .el-table__cell {
  border-bottom: 1px solid #2d3135;
}

.custom-table .el-table__header {
  font-weight: bold;
  color: #b0b0b0;
}

.custom-table .el-table__cell--center {
  text-align: center;
}
</style>

