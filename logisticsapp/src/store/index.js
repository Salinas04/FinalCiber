// src/store/index.js
import { createStore } from 'vuex';

export default createStore({
    state: {
        packages: [],
        deliveries: []
    },
    mutations: {
        setPackages(state, packages) {
            state.packages = packages;
        },
        addPackage(state, packageItem) {
            state.packages.push(packageItem);
        },
        setDeliveries(state, deliveries) {
            state.deliveries = deliveries;
        }
    },
    actions: {
        fetchPackages({ commit }) {
            // Simulación de llamada a API
            const packages = [
                { id: 1, name: "Paquete 1", status: "pendiente" },
                { id: 2, name: "Paquete 2", status: "en tránsito" },
            ];
            commit('setPackages', packages);
        },
        createPackage({ commit }, packageItem) {
            // Aquí se haría la lógica para guardar en una API
            commit('addPackage', packageItem);
        },
    },
    getters: {
        getPackages: (state) => state.packages,
        getDeliveries: (state) => state.deliveries
    }
});
