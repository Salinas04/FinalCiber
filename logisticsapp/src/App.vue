<template>
  <div class="common-layout">
    <el-container class="backColor">
      <el-aside v-if="showSidebar">
        <Sidebar />
      </el-aside>
      <el-main :class="{'content': showSidebar, 'auth-content': !showSidebar}">
        <RouterView />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
  },
  setup() {
    const route = useRoute();
    const showSidebar = computed(() => !['/login', '/register'].includes(route.path));
    return { showSidebar };
  },
};
</script>

<style>
.common-layout {
  display: flex;
  height: 100vh;
}

.content {
  padding: 20px !important;
  overflow-y: auto;
}

.el-main {
  --el-main-padding: 0 !important;
}

.auth-content {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #989898;
}

.backColor{
  width: 100%;
  height: 100%;
  --color: #E1E1E1;
  background-color: #F3F3F3;
  background-image: linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%,transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%,transparent),
  linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%,transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%,transparent);
  background-size: 55px 55px;
}
</style>

