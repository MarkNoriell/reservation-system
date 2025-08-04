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
                        <v-list-item v-for="(item, index) in topSellingItems" :key="item.id">
                           <template v-slot:prepend>
                              <span class="font-weight-bold text-h6 mr-4" :class="index < 3 ? 'text-primary-darken-1' : ''">
                                {{ index + 1 }}
                              </span>
                               <v-avatar rounded="0">
                                  <v-img :src="item.imageUrl" :alt="item.name"></v-img>
                               </v-avatar>
                            </template>

                            <v-list-item-title class="font-weight-bold">{{ item.name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.sold }} units sold</v-list-item-subtitle>
                            
                            <template v-slot:append>
                                <span class="font-weight-medium text-success">
                                    ₱{{ (item.price * item.sold).toLocaleString() }}
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
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// IMPORTANT: Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// --- MOCK DATA ---
// Added 'cost' to calculate profit
const products = ref([
  { id: 1, name: 'Bear Keychain', price: 150.00, cost: 70, sold: 45, imageUrl: '../../public/images/bear crochet.png' },
  { id: 4, name: 'Flower Coaster', price: 120.00, cost: 50, sold: 38, imageUrl: '../../public/images/flower.png' },
  { id: 2, name: 'Duck Plushie', price: 350.00, cost: 180, sold: 25, imageUrl: '../../public/images/duck.png' },
  { id: 3, name: 'Anime Character', price: 500.00, cost: 250, sold: 18, imageUrl: '../../public/images/anime.jpeg' },
]);

const monthlySalesData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  revenue: [6500, 5900, 8000, 8100, 5600, 9500, 12000],
};


// --- COMPUTED PROPERTIES for Metrics ---
const totalRevenue = computed(() =>
  products.value.reduce((total, p) => total + (p.sold * p.price), 0)
);

const totalCost = computed(() =>
  products.value.reduce((total, p) => total + (p.sold * p.cost), 0)
);

const totalProfit = computed(() => totalRevenue.value - totalCost.value);

const totalItemsSold = computed(() =>
  products.value.reduce((total, p) => total + p.sold, 0)
);

const topSellingItems = computed(() =>
  [...products.value].sort((a, b) => b.sold - a.sold)
);


// --- CHART CONFIGURATION ---
const chartData = computed(() => ({
  labels: monthlySalesData.labels,
  datasets: [
    {
      label: 'Monthly Revenue',
      backgroundColor: '#FADCD9', // Theme's primary color
      borderColor: '#F8C8C0', // Darker shade for border
      borderWidth: 2,
      borderRadius: 8,
      data: monthlySalesData.revenue,
    },
  ],
}));

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Hide legend as title is clear
    },
    tooltip: {
      backgroundColor: '#5D4037', // Brownish tooltip
      titleFont: { size: 16 },
      bodyFont: { size: 14 },
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'PHP',
            }).format(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Hide vertical grid lines
      },
      ticks: {
        color: '#5D4037', // Text color for labels
      },
    },
    y: {
      grid: {
        color: '#F9E2D2', // Light secondary color for horizontal grid lines
      },
      ticks: {
        color: '#5D4037',
        callback: function(value) {
          return '₱' + (value / 1000) + 'k'; // Format ticks as thousands
        }
      },
    },
  },
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