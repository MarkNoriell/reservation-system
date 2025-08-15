<template>
  <v-app style="background-color: #FFF8F5;">
    <v-main>
      <v-container class="py-12">
        <v-row align="center" justify="center" class="bg-pink-lighten-5 rounded-xl pa-12">
          <v-col cols="12" md="4">
            <v-img src="../../public/images/bear crochet.png" alt="Crochet Bear Keychain" contain height="250"></v-img>
          </v-col>
          <v-col cols="12" md="6">
          <!-- THIS IS THE NEW HEADLINE -->
          <h1 class="text-h4 text-md-h3 font-weight-bold mb-4" style="color: #5D4037; line-height: 1.4;">
          Handcrafted with Heart, Reserved for You.
          </h1>

          <!-- THIS IS THE NEW SUB-HEADLINE -->
          <p class="text-h6 font-weight-regular mb-8" style="color: #6D4C41;">
          Discover unique, handcrafted crochet creations from Iluvmica. Reserve your next favorite piece today.
          </p>

          <v-btn outlined large color="#D8A798" class="text-capitalize" style="border-width: 2px;">
          Shop Now
          </v-btn>
          </v-col>
        </v-row>

         <div class="mt-16">
          <h2 class="text-h4 font-weight-bold mb-8" style="color: #5D4037;">Shop</h2>
          <v-row>
            <v-col
              v-for="product in products"
              :key="product.product_id"
              cols="12" sm="6" md="3"
            >
              <v-card class="text-center" flat style="background-color: transparent;">
                <v-card class="d-inline-block pa-2" flat rounded="lg">
                    <!-- Use dynamic image URL -->
                    <v-img 
                      :src="`http://localhost:3000/image/${product.product_id}`" 
                      :alt="product.product_name" 
                      height="180" 
                      width="180"
                      cover
                    ></v-img>
                </v-card>
                <v-card-text>
                  <div class="text-h6 font-weight-medium" style="color: #5D4037;">{{ product.product_name }}</div>
                  <div class="font-weight-regular my-1" style="color: #5D4037;">₱ {{ product.product_price.toFixed(2) }}</div>
                  <!-- Bind the click event to the Reserve button -->
                  <v-btn outlined rounded color="#D8A798" class="mt-4 text-capitalize" style="border-width: 2px;" @click="openReservationDialog(product)">
                    Reserve
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>

    <!-- --- NEW: Reservation Dialog --- -->
    <v-dialog v-model="isDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg" v-if="selectedProduct">
        <v-card-title>
          <span class="text-h5 font-weight-bold">Reserve: {{ selectedProduct.product_name }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="reservationForm">
            <v-text-field
              v-model="newReservation.customer_name"
              label="Full Name"
              variant="outlined"
              density="compact"
              :rules="validationRules.required"
            ></v-text-field>
            
            <v-select
              v-model="newReservation.product_color"
              :items="selectedProduct.product_colors"
              label="Select a Color"
              variant="outlined"
              density="compact"
              :rules="validationRules.required"
            />

            <v-text-field
              v-model.number="newReservation.quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              density="compact"
              :rules="validationRules.quantity"
            ></v-text-field>

            <v-menu v-model="isDateMenuVisible" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="newReservation.pickup_date"
                  label="Pick-up Date"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  variant="outlined"
                  density="compact"
                  :rules="validationRules.required"
                ></v-text-field>
              </template>
              <v-date-picker
                  v-model="newDateObject"
                  :allowed-dates="isDateAllowed"
                  @update:model-value="selectDate"
              ></v-date-picker>
            </v-menu>
          </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeReservationDialog">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="saveReservation" :loading="isSaving">Save Reservation</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for success message -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
// You might need to import your Pinia store if the user's name is stored there
// import { persistStore } from '@/stores/persistStore';

const API_BASE_URL = 'http://localhost:3000/api';
const DAILY_RESERVATION_LIMIT = 10;

// --- STATE ---
const products = ref([]);
const dateCounts = ref({});

// Dialog State
const isDialogVisible = ref(false);
const isDateMenuVisible = ref(false);
const isSaving = ref(false);
const reservationForm = ref(null);

// Form State
const selectedProduct = ref(null); // Holds the product being reserved
const newReservation = ref({});
const newDateObject = ref(null);

// Snackbar State
const snackbar = ref({ show: false, text: '', color: 'success' });

// --- VALIDATION ---
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
    // We only fetch non-archived products for the shop
    const response = await axios.get(`${API_BASE_URL}/fetchProducts`);
    products.value = response.data
      .filter(p => !p.archived || p.archived === 'false')
      .map(p => ({
        ...p,
        product_colors: JSON.parse(p.product_colors || '[]')
      }));
  } catch (error) {
    console.error("Error fetching products:", error);
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

// --- DIALOG & FORM FUNCTIONS ---
const openReservationDialog = (product) => {
  selectedProduct.value = product;
  newReservation.value = {
    customer_name: '', // Or pre-fill from Pinia store: usePersistStore().user.customer_name
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
  selectedProduct.value = null;
};

const saveReservation = async () => {
  const { valid } = await reservationForm.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
      await axios.post(`${API_BASE_URL}/reservations`, newReservation.value);
      closeReservationDialog();
      // Refresh date counts for the next reservation
      await fetchDateCounts();
      // Show success message
      snackbar.value = { show: true, text: 'Reservation placed successfully!', color: 'success' };
  } catch (error) {
      console.error("Error saving reservation:", error);
      snackbar.value = { show: true, text: 'Failed to place reservation.', color: 'error' };
  } finally {
      isSaving.value = false;
  }
};

// --- DATE PICKER HELPERS ---
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
.bg-pink-lighten-5 {
  background-color: #FFF1EE !important;
}
</style>