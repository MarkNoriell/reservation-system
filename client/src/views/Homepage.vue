<template>
  <v-app style="background-color: #FFF8F5;">
    <v-main>
      <v-container class="py-12">
        <!-- --- HERO SECTION --- -->
        <v-row align="center" justify="center" class="bg-pink-lighten-5 rounded-xl pa-12">
          <v-col cols="12" md="4">
            <v-img src="/images/bear crochet.png" alt="Crochet Bear Keychain" contain height="250"></v-img>
          </v-col>
          <v-col cols="12" md="6">
            <h1 class="text-h4 text-md-h3 font-weight-bold mb-4" style="color: #5D4037; line-height: 1.4;">
              Handcrafted with Heart, Reserved for You.
            </h1>
            <p class="text-h6 font-weight-regular mb-8" style="color: #6D4C41;">
              Discover unique, handcrafted crochet creations from Iluvmica. Reserve your next favorite piece today.
            </p>
            <v-btn outlined large color="#D8A798" class="text-capitalize" style="border-width: 2px;" @click="redirectToShop()">
              Shop Now
            </v-btn>
          </v-col>
        </v-row>

        <!-- --- KEY CHANGE: Replaced v-carousel with v-slide-group --- -->
        <div class="mt-16">
          <h2 class="text-h4 font-weight-bold mb-8 text-center" style="color: #5D4037;">Featured Items</h2>
          <v-slide-group show-arrows>
            <!-- KEY CHANGE: Looping over 'featuredProducts' now -->
            <v-slide-group-item
              v-for="product in featuredProducts" 
              :key="product.product_id"
            >
              <!-- Added margin for spacing between items -->
              <v-card class="text-center mx-4" flat style="background-color: transparent;" width="250">
                <v-card class="d-inline-block pa-2" flat rounded="lg">
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
                  <v-btn outlined rounded color="#D8A798" class="mt-4 text-capitalize" style="border-width: 2px;" @click="openReservationDialog(product)">
                    Reserve
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>
        </div>
        
        <!-- --- CONTACT US SECTION --- -->
<div class="mt-16">
    <v-row justify="center">
        <v-col cols="12">
            <div class="bg-pink-lighten-5 rounded-xl pa-8 pa-md-12">
                <v-row align="center">
                    <!-- Left Column: Contact Info & Socials -->
                    <v-col cols="12" md="6">
                        <h2 class="text-h4 font-weight-bold mb-4" style="color: #5D4037;">Get in Touch</h2>
                        <p class="mb-8" style="color: #6D4C41;">
                            We'd love to hear from you! Whether you have a question about our products, a custom order request, or just want to say hello, feel free to reach out.
                        </p>

                        <v-list lines="two" bg-color="transparent" class="mb-6">
                            <!-- Call Us Item -->
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="#5D4037">mdi-phone</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-bold" style="color: #5D4037;">Call Us</v-list-item-title>
                                <v-list-item-subtitle>
                                    <a href="tel:+639123456789" class="contact-link">+639945748346</a>
                                </v-list-item-subtitle>
                            </v-list-item>

                            <!-- KEY CHANGE: Replaced Email item with Facebook item -->
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="#5D4037">mdi-facebook</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-bold" style="color: #5D4037;">Follow on Facebook</v-list-item-title>
                                <v-list-item-subtitle>
                                    <a href="https://www.facebook.com/your-page-url" target="_blank" class="contact-link">lluvmicacrochet</a>
                                </v-list-item-subtitle>
                            </v-list-item>

                            <!-- Our Location Item -->
                            <v-list-item>
                                <template v-slot:prepend>
                                    <v-icon color="#5D4037">mdi-map-marker</v-icon>
                                </template>
                                <v-list-item-title class="font-weight-bold" style="color: #5D4037;">Our Location</v-list-item-title>
                                <v-list-item-subtitle style="color: #6D4C41;">421 Garcia st. Cavite, City</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                        
                        <!-- KEY CHANGE: The standalone Facebook button has been removed -->

                    </v-col>

                    <!-- KEY CHANGE: Right Column now contains a placeholder for a logo instead of the map -->
                    <v-col cols="12" md="6" class="d-flex align-center justify-center mt-8 mt-md-0">
                        <!-- 
                            TODO: Replace the 'src' with the actual path to your logo.
                            The max-width is set to 300px, but you can adjust it as needed.
                        -->
                        <v-img
                            src="../../public/images/Logo2.png"
                            alt="Your Company Logo"
                            contain
                            style="max-width: 500px; width: 100%;"
                        ></v-img>
                    </v-col>
                </v-row>
            </div>
        </v-col>
    </v-row>
</div>

      </v-container>
    </v-main>

    <!-- --- RESERVATION DIALOG (No changes needed here) --- -->
    <v-dialog v-model="isDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg" v-if="selectedProduct">
        <v-card-title>
          <span class="text-h5 font-weight-bold">Reserve: {{ selectedProduct.product_name }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="reservationForm">
            <v-text-field
              disabled
              v-model="newReservation.customer_name"
              label="Username"
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { persistStore } from '@/stores/persistStore';
import axios from 'axios';

const router = useRouter()
const usePersistStore = persistStore()

const API_BASE_URL = 'http://localhost:3000/api';

// --- DEFINED CONSTANTS ---
// A date is considered "fully booked" and triggers a lockout period.
const DAILY_RESERVATION_LIMIT = 5;
// An order is considered "large" and requires a clear 4-day window.
const LARGE_ORDER_THRESHOLD = 1;

// --- STATE ---
const products = ref([]);
const dateCounts = ref({});

// Dialog State
const isDialogVisible = ref(false);
const isDateMenuVisible = ref(false);
const isSaving = ref(false);
const reservationForm = ref(null);

// Form State
const selectedProduct = ref(null);
const newReservation = ref({});
const newDateObject = ref(null);

// Snackbar State
const snackbar = ref({ show: false, text: '', color: 'success' });

// --- COMPUTED PROPERTY for the carousel ---
const featuredProducts = computed(() => {
  return products.value.slice(0, 4);
});

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

const redirectToShop = () => {
  router.push('/shop')
}

// --- DIALOG & FORM FUNCTIONS ---
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
  selectedProduct.value = null;
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

// --- DATE PICKER HELPERS (REFACTORED LOGIC) ---
const isDateAllowed = (date) => {
  const checkingDateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  // Universal Rule: Always disable past dates.
  if (checkingDateUTC < todayUTC) {
    return false;
  }

  // Determine if the user is currently trying to place a large or small order.
  const isPlacingLargeOrder = (newReservation.value.quantity || 0) > LARGE_ORDER_THRESHOLD;

  // Iterate through all the existing reservation data to find fully booked days and define their lockout periods.
  for (const dateString in dateCounts.value) {
    const count = dateCounts.value[dateString];

    // This checks if a day is "fully booked" and should start a lockout.
    if (count >= DAILY_RESERVATION_LIMIT) {
      // Condition 1: Define the 4-day "lockout period" (the booked day + 3 following days).
      const lockoutStartDateUTC = new Date(dateString);
      const lockoutEndDateUTC = new Date(lockoutStartDateUTC);
      lockoutEndDateUTC.setUTCDate(lockoutStartDateUTC.getUTCDate() + 3);

      if (isPlacingLargeOrder) {
        // Condition 2: Logic for LARGE orders (quantity > 2).
        // A large order also requires a 4-day window. We must check if this prospective window
        // overlaps AT ALL with the existing lockout period.
        const prospectiveStartDateUTC = checkingDateUTC;
        const prospectiveEndDateUTC = new Date(prospectiveStartDateUTC);
        prospectiveEndDateUTC.setUTCDate(prospectiveStartDateUTC.getUTCDate() + 3);

        // The date is DISALLOWED if the prospective window for the new large order
        // overlaps with an existing lockout period.
        if (prospectiveStartDateUTC <= lockoutEndDateUTC && prospectiveEndDateUTC >= lockoutStartDateUTC) {
          return false; // Conflict found. This disables dates before the lockout for large orders.
        }
      } else {
        // Condition 3: Logic for SMALL orders (quantity <= 2).
        // A small order is much simpler. It is only disallowed if the specific date
        // selected falls directly inside an existing lockout period.
        if (checkingDateUTC >= lockoutStartDateUTC && checkingDateUTC <= lockoutEndDateUTC) {
          return false; // This specific day is blocked.
        }
      }
    }
  }

  // If the date passes all checks for its order size, it is allowed.
  return true;
};


const selectDate = (date) => {
    newReservation.value.pickup_date = date.toLocaleDateString('en-CA');
    isDateMenuVisible.value = false;
};

// Watch for changes in quantity to reset the date and prevent bugs.
watch(() => newReservation.value.quantity, (newQuantity, oldQuantity) => {
  if (isDialogVisible.value && oldQuantity !== undefined) {
    newReservation.value.pickup_date = null;
    newDateObject.value = null;
  }
});

// Watch for dialog visibility to set the customer name.
watch(() => isDialogVisible.value,(dialogIsVisible) => {
  if(dialogIsVisible){
    newReservation.value.customer_name = usePersistStore.accountCredentials.username
  }
})

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
.contact-details span {
    font-size: 1rem;
}

/* ... keep your existing styles ... */
.bg-pink-lighten-5 {
  background-color: #FFF1EE !important;
}

/* --- STYLES FOR IMPROVED CONTACT SECTION --- */
.contact-link {
  color: #6D4C41;
  text-decoration: none;
  transition: color 0.3s ease;
}
.contact-link:hover {
  color: #5D4037;
  text-decoration: underline;
}

.map-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio (Square) */
  border-radius: 16px; 
}

.map-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
</style>