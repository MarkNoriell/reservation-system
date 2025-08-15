<template>
  <v-container fluid>
    <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Dashboard</h1>

    <!-- Main Stats Cards -->
    <v-row>
      <!-- Total Profit Card -->
      <v-col cols="12" md="6">
        <v-card class="rounded-lg pa-2 clickable-card" elevation="2" @click="goTo('/sales')">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-cash-multiple" class="mr-3" color="success" size="large"></v-icon>
            <span class="font-weight-bold text-subtitle-1">Total Profit</span>
          </v-card-title>
          <v-card-text>
            <p class="text-h4 font-weight-bold">
              ₱{{ totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </p>
            <p class="text-caption text-medium-emphasis">From completed reservations</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Top Selling Product Card -->
      <v-col cols="12" md="6">
        <v-card class="rounded-lg pa-2 clickable-card" elevation="2" @click="goTo('/sales')">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-trophy-award" class="mr-3" color="warning" size="large"></v-icon>
            <span class="font-weight-bold text-subtitle-1">Top Selling Product</span>
          </v-card-title>
          <v-card-text class="text-center">
              <v-avatar size="80" rounded="lg" class="mb-2">
                <v-img 
                  :src="`http://localhost:3000/image/${topSeller.product_id}`" 
                  :alt="topSeller.product_name"
                  v-if="topSeller.product_id"
                ></v-img>
                <v-icon v-else icon="mdi-package-variant" size="50"></v-icon>
              </v-avatar>
              <p class="text-h6 font-weight-bold mb-1">
                {{ topSeller.product_name }}
              </p>
              <v-chip color="primary" size="small">{{ topSeller.totalSold }} units sold</v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
        <!-- Pending Reservations -->
        <v-col cols="12" md="6">
            <v-card class="rounded-lg clickable-card" elevation="2" @click="goTo('/reservation')">
                <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-calendar-clock" class="mr-3" size="large" color="primary-darken-1"></v-icon>
                    <span class="font-weight-bold text-h6">Pending Reservations</span>
                </v-card-title>
                <v-card-text>
                    <v-data-table
                        :headers="reservationHeaders"
                        :items="pendingReservations"
                        items-per-page="5"
                        density="comfortable"
                    >
                        <template v-slot:item.reservation_status="{ item }">
                            <v-chip color="warning" variant="elevated" size="small">{{ item.reservation_status }}</v-chip>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- Active Products -->
        <v-col cols="12" md="6">
            <v-card class="rounded-lg clickable-card" elevation="2" @click="goTo('/inventory')">
                <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-package-variant-closed" class="mr-3" size="large" color="primary-darken-1"></v-icon>
                    <span class="font-weight-bold text-h6">Active Products</span>
                </v-card-title>
                <v-card-text>
                    <v-data-table
                        :headers="activeProductsHeader"
                        :items="activeProducts"
                        items-per-page="5"
                        density="comfortable"
                    >
                      <template v-slot:item.product_price="{ item }">
                          ₱{{ item.product_price.toFixed(2) }}
                      </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const router = useRouter();

// --- STATE ---
const totalProfit = ref(0);
const topSeller = ref({ product_name: 'N/A', totalSold: 0 });
const pendingReservations = ref([]);
const activeProducts = ref([]);

// --- DATA TABLE HEADERS ---
const reservationHeaders = [
  { title: 'Customer', key: 'customer_name', sortable: false },
  { title: 'Product', key: 'product_name', sortable: false },
  { title: 'Quantity', key: 'quantity', align: 'end' },
  { title: 'Status', key: 'reservation_status', align: 'center', sortable: false },
];

const activeProductsHeader = [
    { title: 'Product Name', key: 'product_name', sortable: true },
    { title: 'Price', key: 'product_price', align: 'end' },
];

// --- API FUNCTION ---
const fetchDashboardData = async () => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/dashboard`);
        totalProfit.value = data.totalProfit;
        topSeller.value = data.topSeller;
        pendingReservations.value = data.pendingReservations;
        activeProducts.value = data.activeProducts;
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
    }
};

// --- NAVIGATION ---
const goTo = (path) => {
    router.push(path);
};

// --- LIFECYCLE HOOK ---
onMounted(() => {
    fetchDashboardData();
});
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.clickable-card {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}
.v-data-table {
    background-color: transparent !important;
}
</style>