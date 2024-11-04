<template>
<!--  <el-table :data="packages">-->
<!--    <el-table-column prop="id" label="ID" width="50" />-->
<!--    <el-table-column prop="name" label="Nombre" />-->
<!--    <el-table-column prop="status" label="Estado" />-->
<!--  </el-table>-->
</template>

<script>
import { mapGetters } from 'vuex';
import packages from "@/views/Packages.vue";

export default {
  computed: {
    packages() {
      return packages
    },
    ...mapGetters(['getPackages'])
  },
  mounted() {
    this.$store.dispatch('fetchPackages');
  }
};
</script>
