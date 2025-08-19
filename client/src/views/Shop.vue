<template>
  <v-app style="background-color: #FFF8F5;">
    <v-main>
      <v-container class="py-12">
        <!-- --- PAGE HEADER --- -->
        <h1 class="text-h4 text-md-h3 font-weight-bold mb-2 text-center" style="color: #5D4037;">
          Our Handcrafted Collection
        </h1>
        <p class="text-body-1 text-md-h6 font-weight-regular mb-12 text-center" style="color: #6D4C41;">
          Browse all of our available crochet creations. Find a piece you love and reserve it today.
        </p>

        <!-- --- FILTERS: SEARCH BAR & CATEGORY SELECT --- -->
        <v-row justify="center" class="mb-10">
          <!-- Search Bar -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search for a product by name..."
              variant="solo"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              rounded
              bg-color="white"
            ></v-text-field>
          </v-col>
          <!-- Category Filter -->
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Filter by category..."
              variant="solo"
              clearable
              hide-details
              rounded
              bg-color="white"
            ></v-select>
          </v-col>
        </v-row>

        <!-- --- PRODUCT GRID --- -->
        <v-row v-if="filteredProducts.length > 0">
          <v-col
            v-for="product in filteredProducts"
            :key="product.product_id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <!-- Product Card -->
            <v-card class="text-center mx-auto" flat style="background-color: transparent;" max-width="280">
              <v-card class="d-inline-block pa-2" flat rounded="lg">
                  <v-img 
                    :src="`http://localhost:3000/image/${product.product_id}`" 
                    :alt="product.product_name" 
                    height="200" 
                    width="200"
                    cover
                    class="rounded"
                  ></v-img>
              </v-card>
              <v-card-text>
                <div class="text-h6 font-weight-medium" style="color: #5D4037;">{{ product.product_name }}</div>
                <div class="font-weight-regular my-1" style="color: #5D4037;">{{ product.product_category }}</div>
                <div class="font-weight-regular my-1" style="color: #5D4037;">₱ {{ product.product_price.toFixed(2) }}</div>
                <v-btn 
                  outlined 
                  rounded 
                  color="#D8A798" 
                  class="mt-4 text-capitalize" 
                  style="border-width: 2px;" 
                  @click="openReservationDialog(product)"
                >
                  Reserve
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- --- NO RESULTS MESSAGE --- -->
        <!-- Shows if filters result in an empty list, but only after products have loaded -->
        <v-row v-else-if="products.length > 0" justify="center">
          <v-col cols="12" class="text-center py-16">
            <v-icon size="64" color="grey">mdi-magnify-remove-outline</v-icon>
            <p class="text-h6 mt-4" style="color: #6D4C41;">No products found</p>
            <p class="text-body-1" style="color: #6D4C41;">Try adjusting your search or filter.</p>
          </v-col>
        </v-row>

      </v-container>
    </v-main>

    <!-- --- RESERVATION DIALOG (No changes here) --- -->
    <v-dialog v-model="isDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg" v-if="selectedProduct">
        <v-card-title>
          <span class="text-h5 font-weight-bold" style="color: #5D4037;">Reserve: {{ selectedProduct.product_name }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="reservationForm">
            <v-text-field
              v-model="newReservation.customer_name"
              label="Full Name"
              variant="outlined"
              :rules="validationRules.required"
              class="mb-2"
            ></v-text-field>
            
            <v-select
              v-model="newReservation.product_color"
              :items="selectedProduct.product_colors"
              label="Select a Color"
              variant="outlined"
              :rules="validationRules.required"
              class="mb-2"
            />

            <v-text-field
              v-model.number="newReservation.quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              :rules="validationRules.quantity"
              class="mb-2"
            />

            <v-menu v-model="isDateMenuVisible" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="newReservation.pickup_date"
                  label="Pick-up Date"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  variant="outlined"
                  :rules="validationRules.required"
                />
              </template>
              <v-date-picker
                  v-model="newDateObject"
                  :allowed-dates="isDateAllowed"
                  @update:model-value="selectDate"
                  color="primary"
              ></v-date-picker>
            </v-menu>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn text @click="closeReservationDialog">Cancel</v-btn>
            <v-btn color="#5D4037" variant="flat" @click="saveReservation" :loading="isSaving">Save Reservation</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- --- SNACKBAR NOTIFICATION --- -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:3000/api';
const DAILY_RESERVATION_LIMIT = 10;

// --- STATE MANAGEMENT ---
const products = ref([]);
const dateCounts = ref({});

// Filter State
const searchQuery = ref('');
const selectedCategory = ref(null); // State for the category filter

// Dialog & Form State
const isDialogVisible = ref(false);
const isDateMenuVisible = ref(false);
const isSaving = ref(false);
const reservationForm = ref(null);
const selectedProduct = ref(null);
const newReservation = ref({});
const newDateObject = ref(null);

// Snackbar Notification State
const snackbar = ref({ show: false, text: '', color: 'success' });

// --- COMPUTED PROPERTIES ---

// Dynamically creates a unique list of categories from the products
const categories = computed(() => {
  if (!products.value.length) return [];
  // Use a Set to get unique, non-empty category names
  const uniqueCategories = new Set(products.value.map(p => p.product_category).filter(Boolean));
  return ['All Categories', ...uniqueCategories];
});

// Filters products based on BOTH search query and selected category
const filteredProducts = computed(() => {
  let items = products.value;

  // 1. Filter by selected category first
  if (selectedCategory.value && selectedCategory.value !== 'All Categories') {
    items = items.filter(product => product.product_category === selectedCategory.value);
  }

  // 2. Then, filter the result by search query
  if (searchQuery.value) {
    items = items.filter(product =>
      product.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return items;
});


// --- FORM VALIDATION RULES ---
const validationRules = {
  required: [v => !!v || 'This field is required'],
  quantity: [
    v => !!v || 'This field is required',
    v => (v && v > 0) || 'Quantity must be greater than 0'
  ]
};

// --- API FUNCTIONS ---
const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fetchProducts`);
    products.value = response.data
      .filter(p => !p.archived || p.archived === 'false')
      .map(p => ({
        ...p,
        product_colors: JSON.parse(p.product_colors || '[]')
      }));
  } catch (error) {
    console.error("Error fetching products:", error);
    snackbar.value = { show: true, text: 'Could not load products.', color: 'error' };
  }
};

const fetchDateCounts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reservations/counts`);
        dateCounts.value = response.data;
    } catch (error) {
        console.error("Error fetching date counts:", error);
    }
}

// --- DIALOG & RESERVATION LOGIC (No changes here) ---
const openReservationDialog = (product) => {
  selectedProduct.value = product;
  newReservation.value = {
    customer_name: '',
    product_id: product.product_id,
    product_color: null,
    quantity: 1,
    pickup_date: null
  };
  newDateObject.value = null;
  if (reservationForm.value) reservationForm.value.resetValidation();
  isDialogVisible.value = true;
};

const closeReservationDialog = () => {
  isDialogVisible.value = false;
  setTimeout(() => {
    selectedProduct.value = null;
  }, 300);
};

const saveReservation = async () => {
  const { valid } = await reservationForm.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
      await axios.post(`${API_BASE_URL}/reservations`, newReservation.value);
      closeReservationDialog();
      await fetchDateCounts();
      snackbar.value = { show: true, text: 'Reservation placed successfully!', color: 'success' };
  } catch (error) {
      console.error("Error saving reservation:", error);
      snackbar.value = { show: true, text: 'Failed to place reservation.', color: 'error' };
  } finally {
      isSaving.value = false;
  }
};

// --- DATE PICKER HELPER FUNCTIONS (No changes here) ---
const isDateAllowed = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;

  const dateString = date.toLocaleDateString('en-CA');
  const count = dateCounts.value[dateString] || 0;
  return count < DAILY_RESERVATION_LIMIT;
};

const selectDate = (date) => {
    newReservation.value.pickup_date = date.toLocaleDateString('en-CA');
    isDateMenuVisible.value = false;
};

// --- LIFECYCLE HOOK ---
onMounted(() => {
  fetchProducts();
  fetchDateCounts();
});
</script>

<style scoped>
/* Optional: Add a subtle transition to the product cards for a nicer hover effect */
.v-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
</style>