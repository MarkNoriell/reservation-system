<template>
  <v-app>
    <v-main style="background-color: var(--v-theme-background);">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Sales Report</h1>

        <!-- Top Row: Key Metrics -->
        <v-row>
          <!-- Total Profit Card -->
          <v-col cols="12" md="4">
            <v-card class="rounded-lg pa-2" elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-cash-multiple" class="mr-3" color="success" size="large"></v-icon>
                <span class="font-weight-bold text-subtitle-1" style="color: var(--v-theme-text);">Total Profit</span>
              </v-card-title>
              <v-card-text>
                <p class="text-h4 font-weight-bold" style="color: var(--v-theme-text);">
                  ₱{{ totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </p>
                <p class="text-caption text-medium-emphasis">Revenue minus Cost</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Total Revenue Card -->
          <v-col cols="12" md="4">
            <v-card class="rounded-lg pa-2" elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-currency-php" class="mr-3" color="primary" size="large"></v-icon>
                <span class="font-weight-bold text-subtitle-1" style="color: var(--v-theme-text);">Total Revenue</span>
              </v-card-title>
              <v-card-text>
                <p class="text-h4 font-weight-bold" style="color: var(--v-theme-text);">
                  ₱{{ totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </p>
                <p class="text-caption text-medium-emphasis">Gross sales income</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Items Sold Card -->
          <v-col cols="12" md="4">
            <v-card class="rounded-lg pa-2" elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-package-variant-closed" class="mr-3" color="secondary-darken-1" size="large"></v-icon>
                <span class="font-weight-bold text-subtitle-1" style="color: var(--v-theme-text);">Items Sold</span>
              </v-card-title>
              <v-card-text>
                <p class="text-h4 font-weight-bold" style="color: var(--v-theme-text);">
                  {{ totalItemsSold }}
                </p>
                <p class="text-caption text-medium-emphasis">Total units sold</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <v-row>
            <!-- Sales Chart -->
            <v-col cols="12" md="7">
                <v-card class="rounded-lg pa-4" elevation="2">
                    <v-card-title class="font-weight-bold text-h6" style="color: var(--v-theme-text);">
                        Monthly Sales Revenue
                    </v-card-title>
                    <v-card-text>
                        <Bar :data="chartData" :options="chartOptions" />
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Top Selling Items -->
            <v-col cols="12" md="5">
                <v-card class="rounded-lg" elevation="2">
                    <v-card-title class="d-flex align-center">
                        <v-icon icon="mdi-trophy-award" class="mr-3" size="large" color="warning"></v-icon>
                        <span class="font-weight-bold text-h6" style="color: var(--v-theme-text);">Top Selling Items</span>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-list lines="two">
                      <v-list-item v-for="(item, index) in topSellingItems" :key="item.product_id">
                          <template v-slot:prepend>
                              <span class="font-weight-bold text-h6 mr-4" :class="index < 3 ? 'text-primary-darken-1' : ''">
                                  {{ index + 1 }}
                              </span>
                              <v-avatar rounded="lg">
                                  <!-- Use the correct image URL structure -->
                                  <v-img :src="`http://localhost:3000/image/${item.product_id}`" :alt="item.product_name"></v-img>
                              </v-avatar>
                          </template>

                          <!-- FIX #1: Use `item.product_name` instead of `item.name` -->
                          <v-list-item-title class="font-weight-bold">{{ item.product_name }}</v-list-item-title>
                          
                          <!-- FIX #2: Use `item.totalSold` instead of `item.sold` -->
                          <v-list-item-subtitle>{{ item.totalSold }} units sold</v-list-item-subtitle>
                          
                          <template v-slot:append>
                              <span class="font-weight-medium text-success">
                                  <!-- FIX #3: Use `item.product_price` and `item.totalSold` for the calculation -->
                                  ₱{{ (item.product_price * item.totalSold).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                              </span>
                          </template>
                      </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const API_BASE_URL = 'http://localhost:3000/api';

// --- DYNAMIC DATA STATE ---
const totalProfit = ref(0);
const totalRevenue = ref(0);
const totalItemsSold = ref(0);
const topSellingItems = ref([]);
const monthlySalesData = ref({ labels: [], data: [] });

// --- API FUNCTIONS ---
const fetchSalesMetrics = async () => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/sales/metrics`);
        totalProfit.value = data.totalProfit;
        totalRevenue.value = data.totalRevenue;
        totalItemsSold.value = data.totalItemsSold;
    } catch (error) {
        console.error("Error fetching sales metrics:", error);
    }
};

const fetchMonthlyRevenue = async () => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/sales/monthly-revenue`);
        monthlySalesData.value = data;
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
    }
};

const fetchTopSellingItems = async () => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/sales/top-selling`);
        topSellingItems.value = data;
    } catch (error) {
        console.error("Error fetching top selling items:", error);
    }
};

// --- CHART CONFIGURATION ---
const chartData = computed(() => ({
  labels: monthlySalesData.value.labels,
  datasets: [
    {
      label: 'Monthly Revenue',
      backgroundColor: '#FADCD9',
      borderColor: '#F8C8C0',
      borderWidth: 2,
      borderRadius: 8,
      data: monthlySalesData.value.data,
    },
  ],
}));

// Your chartOptions ref remains the same, it's perfect.
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  // ... (keep all your existing chart options)
});

// --- LIFECYCLE HOOK ---
onMounted(() => {
    // Fetch all data when the component is loaded
    fetchSalesMetrics();
    fetchMonthlyRevenue();
    fetchTopSellingItems();
});
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-list-item-title {
  white-space: normal;
}
</style>