<template>

      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Dashboard</h1>

        <!-- Main Stats Cards -->
        <v-row>
          <!-- Sales Card -->
          <v-col cols="12" md="4">
            <v-card class="rounded-lg pa-2" elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-currency-php" class="mr-3" color="success" size="large"></v-icon>
                <span class="font-weight-bold text-subtitle-1" style="color: var(--v-theme-text);">Total Sales</span>
              </v-card-title>
              <v-card-text>
                <p class="text-h4 font-weight-bold" style="color: var(--v-theme-text);">
                  ₱{{ totalSales.toLocaleString() }}
                </p>
                <p class="text-caption text-medium-emphasis">Across all products</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Top Selling Product Card -->
          <v-col cols="12" md="4">
            <v-card class="rounded-lg pa-2" elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-trophy-award" class="mr-3" color="warning" size="large"></v-icon>
                <span class="font-weight-bold text-subtitle-1" style="color: var(--v-theme-text);">Top Selling Product</span>
              </v-card-title>
              <v-card-text class="text-center">
                  <v-avatar size="80" rounded="0" class="mb-2">
                    <!-- Placeholder for product image -->
                    <v-img :src="`/images/flower.png`" :alt="topSeller.name"></v-img>
                  </v-avatar>
                  <p class="text-h6 font-weight-bold mb-1" style="color: var(--v-theme-text);">
                    {{ topSeller.name }}
                  </p>
                  <v-chip color="primary" size="small">{{ topSeller.sold }} units sold</v-chip>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Low Stocks Card -->
          <v-col cols="12" md="4">
            <v-card class="rounded-lg pa-2" elevation="2">
                <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-alert-circle-outline" class="mr-3" color="error" size="large"></v-icon>
                    <span class="font-weight-bold text-subtitle-1" style="color: var(--v-theme-text);">Low Stocks</span>
                </v-card-title>
                <v-card-text>
                    <v-list v-if="lowStockItems.length > 0" density="compact" class="py-0">
                        <v-list-item v-for="item in lowStockItems" :key="item.id" class="px-0">
                            <v-list-item-title class="font-weight-medium">{{ item.name }}</v-list-item-title>
                            <template v-slot:append>
                                <v-chip size="small" variant="tonal" color="error">
                                    {{ item.stock }} left
                                </v-chip>
                            </template>
                        </v-list-item>
                    </v-list>
                    <p v-else class="text-medium-emphasis">No items with low stock.</p>
                </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <v-row>
            <!-- Pending Reservations -->
            <v-col cols="12" md="6">
                <v-card class="rounded-lg" elevation="2">
                    <v-card-title class="d-flex align-center">
                        <v-icon icon="mdi-calendar-clock" class="mr-3" size="large" color="primary-darken-1"></v-icon>
                        <span class="font-weight-bold text-h6" style="color: var(--v-theme-text);">Pending Reservations</span>
                    </v-card-title>
                    <v-card-text>
                        <v-data-table
                            :headers="reservationHeaders"
                            :items="reservations"
                            items-per-page="5"
                            class="elevation-0"
                            density="comfortable"
                        >
                            <template v-slot:item.status="{ item }">
                                <v-chip color="secondary-darken-1" variant="elevated" size="small">{{ item.status }}</v-chip>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Stock Report -->
            <v-col cols="12" md="6">
                <v-card class="rounded-lg" elevation="2">
                    <v-card-title class="d-flex align-center">
                        <v-icon icon="mdi-package-variant-closed" class="mr-3" size="large" color="primary-darken-1"></v-icon>
                        <span class="font-weight-bold text-h6" style="color: var(--v-theme-text);">Stock Report</span>
                    </v-card-title>
                    <v-card-text>
                        <v-data-table
                            :headers="stockHeaders"
                            :items="products"
                            items-per-page="5"
                            class="elevation-0"
                            density="comfortable"
                        >
                          <template v-slot:item.status="{ item }">
                              <v-chip :color="item.stock > 0 ? 'success' : 'info'" size="small" variant="tonal">
                                  {{ item.status }}
                              </v-chip>
                          </template>
                          <template v-slot:item.price="{ item }">
                              ₱{{ item.price.toFixed(2) }}
                          </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

      </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- MOCK DATA ---
// This data can be replaced with API calls in a real application.
const products = ref([
  { id: 1, name: 'Bear Keychain', price: 150.00, stock: 5, sold: 25, status: 'In Stock' },
  { id: 2, name: 'Duck Plushie', price: 350.00, stock: 0, sold: 18, status: 'Made-to-Order' },
  { id: 3, name: 'Anime Character', price: 500.00, stock: 3, sold: 12, status: 'In Stock' },
  { id: 4, name: 'Flower Coaster', price: 120.00, stock: 0, sold: 30, status: 'Made-to-Order' },
  { id: 5, name: 'Crochet Octopus', price: 250.00, stock: 8, sold: 15, status: 'In Stock' },
  { id: 6, name: 'Tote Bag', price: 800.00, stock: 2, sold: 9, status: 'In Stock' },
]);

const reservations = ref([
  { id: 101, customer: 'Juan Dela Cruz', product: 'Bear Keychain', quantity: 2, status: 'Pending' },
  { id: 102, customer: 'Maria Clara', product: 'Flower Coaster', quantity: 5, status: 'Pending' },
  { id: 103, customer: 'Jose Rizal', product: 'Tote Bag', quantity: 1, status: 'Pending' },
  { id: 104, customer: 'Gabriela Silang', product: 'Duck Plushie', quantity: 3, status: 'Pending' },
]);


// --- COMPUTED PROPERTIES ---

// Calculate total sales
const totalSales = computed(() => {
  return products.value.reduce((total, product) => total + (product.sold * product.price), 0);
});

// Find the top-selling product
const topSeller = computed(() => {
  return [...products.value].sort((a, b) => b.sold - a.sold)[0];
});

// Find items with low stock (e.g., stock < 5 and not made-to-order)
const lowStockItems = computed(() => {
  return products.value.filter(p => p.stock > 0 && p.stock < 5);
});


// --- DATA TABLE HEADERS ---

const reservationHeaders = [
  { title: 'Customer', key: 'customer', sortable: false },
  { title: 'Product', key: 'product', sortable: false },
  { title: 'Quantity', key: 'quantity', align: 'end' },
  { title: 'Status', key: 'status', align: 'center', sortable: false },
];

const stockHeaders = [
    { title: 'Product Name', key: 'name', sortable: true },
    { title: 'Price', key: 'price', align: 'end' },
    { title: 'Stock', key: 'stock', align: 'end' },
    { title: 'Status', key: 'status', align: 'center', sortable: false },
];

</script>

<style scoped>
/* Scoped styles for custom adjustments */
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Ensure data tables match the theme */
.v-data-table {
    background-color: transparent !important;
}
</style>