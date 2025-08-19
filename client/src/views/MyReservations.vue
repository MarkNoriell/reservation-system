<template>
  <v-app style="background-color: #feefea;">
    <v-main>
      <v-container class="py-12">
        <!-- --- PAGE HEADER --- -->
        <h1 class="text-h4 font-weight-bold mb-6" style="color: #5D4037;">
          My Reservations
        </h1>

        <!-- --- RESERVATIONS CARD --- -->
        <v-card class="rounded-lg" elevation="2">
          <v-card-title class="d-flex flex-wrap align-center pa-4">
            <span class="font-weight-bold text-h6" style="color: #5D4037;">Your Reservation History</span>
            <v-spacer></v-spacer>
            <div style="width: 300px;">
              <v-text-field
                v-model="searchQuery"
                label="Search by product name..."
                density="compact"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                hide-details
                single-line
              ></v-text-field>
            </div>
          </v-card-title>
          
          <!-- --- DATA TABLE --- -->
          <v-card-text>
            <v-data-table
              :headers="reservationHeaders"
              :items="userReservations"
              :search="searchQuery"
              items-per-page="10"
              :loading="isLoading"
              loading-text="Loading your reservations..."
            >
              <!-- Custom slot for Pick-up Date styling -->
              <template v-slot:item.pickup_date="{ item }">
                <span :style="{ color: getDateColor(item.pickup_date), fontWeight: 'bold' }">
                  {{ formatDate(item.pickup_date) }}
                </span>
              </template>
              
              <!-- Custom slot for Product Color chip -->
              <template v-slot:item.product_color="{ item }">
                  <v-chip size="small">{{ item.product_color }}</v-chip>
              </template>

              <!-- Custom slot for Status chip -->
              <template v-slot:item.reservation_status="{ item }">
                <v-chip
                  :color="getStatusColor(item.reservation_status)"
                  variant="elevated"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.reservation_status }}
                </v-chip>
              </template>

              <!-- Message to show when no data is available -->
              <template v-slot:no-data>
                <div class="text-center pa-8">
                  <p class="text-h6 mb-2">You have no reservations yet.</p>
                  <p class="text-medium-emphasis">Once you reserve an item, it will appear here.</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
// Import your Pinia store
import { persistStore } from '../stores/persistStore';

// --- CONFIGURATION & STORE INSTANTIATION ---
const API_BASE_URL = 'http://localhost:3000/api';
const usePersistStore = persistStore();

// --- STATE MANAGEMENT ---
const allReservations = ref([]);
const searchQuery = ref('');
const isLoading = ref(true);

// Define the headers for the data table. Note: 'Customer' and 'Actions' are removed.
const reservationHeaders = [
  { title: 'Product', key: 'product_name', sortable: true },
  { title: 'Color', key: 'product_color', sortable: false },
  { title: 'Quantity', key: 'quantity', align: 'end' },
  { title: 'Pick-up Date', key: 'pickup_date', align: 'center' },
  { title: 'Status', key: 'reservation_status', align: 'center' },
];

// --- COMPUTED PROPERTY TO FILTER RESERVATIONS ---
// This is the core logic: it filters the master list of reservations
// to only include ones matching the logged-in user's name.
const userReservations = computed(() => {
  const username = usePersistStore.accountCredentials.username;
  if (!username || !allReservations.value.length) {
    return [];
  }
  return allReservations.value.filter(res => res.customer_name === username);
});

// --- API FUNCTIONS ---
const fetchReservations = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/reservations`);
    allReservations.value = response.data;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    // You could add a snackbar here for user feedback
  } finally {
    isLoading.value = false;
  }
};

// --- HELPER FUNCTIONS (for display formatting) ---
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Cancelled': return 'error';
    default: return 'grey';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getDateColor = (dateString) => {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pickupDate = new Date(dateString);
  pickupDate.setHours(0, 0, 0, 0);
  
  if (isNaN(pickupDate.getTime())) return null; 

  const diffTime = pickupDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Highlight dates that are today or tomorrow in red
  if (diffDays <= 1) {
    return 'red';
  }
  return null; // Default color
};


// --- LIFECYCLE HOOK ---
// When the component is mounted, fetch the reservation data.
onMounted(() => {
  fetchReservations();
});
</script>

<style scoped>
/* Optional: Add some custom styles for better presentation */
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.v-data-table {
    background-color: transparent !important;
}
</style>