<template>
  <v-app>
    <v-main style="background-color: var(--v-theme-background);">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Reservations</h1>

        <v-row>
          <!-- Left Side: Display Items -->
          <v-col cols="12" md="7">
            <h2 class="text-h5 font-weight-medium mb-4" style="color: var(--v-theme-text);">Available Items</h2>
            <v-row>
              <v-col v-for="product in products" :key="product.id" cols="12" sm="6" lg="4">
                <v-card class="rounded-lg d-flex flex-column" elevation="1" height="100%">
                    <v-img
                      :src="product.imageUrl"
                      height="180px"
                      cover
                      class="align-end text-white"
                    >
                      <v-card-title class="text-subtitle-1 font-weight-bold" style="background-color: rgba(0,0,0,0.3);">{{ product.name }}</v-card-title>
                    </v-img>

                    <v-card-subtitle class="pt-3 font-weight-bold">
                      ₱{{ product.price.toFixed(2) }}
                    </v-card-subtitle>

                    <v-card-text>
                      <v-chip
                        size="small"
                        variant="tonal"
                        :color="product.status === 'In Stock' ? 'success' : 'info'"
                      >
                        {{ product.status }}
                      </v-chip>
                    </v-card-text>

                    <v-spacer></v-spacer>

                    <v-card-actions>
                      <v-btn
                        color="primary"
                        variant="flat"
                        block
                        @click="addToReservation(product)"
                        :disabled="isProductReserved(product.id)"
                      >
                        {{ isProductReserved(product.id) ? 'Reserved' : 'Reserve' }}
                      </v-btn>
                    </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Right Side: Reservation Form and Summary -->
          <v-col cols="12" md="5">
             <v-card class="rounded-lg" elevation="2">
                <v-card-title class="d-flex align-center">
                    <v-icon icon="mdi-cart-heart" class="mr-3" size="large" color="primary-darken-1"></v-icon>
                    <span class="font-weight-bold text-h6" style="color: var(--v-theme-text);">Your Reservation</span>
                </v-card-title>

                <v-divider></v-divider>

                <!-- Reserved Items List -->
                <v-list v-if="reservedItems.length > 0" lines="two" class="py-0">
                    <template v-for="(item, index) in reservedItems" :key="item.id">
                        <v-list-item>
                            <template v-slot:prepend>
                               <v-avatar rounded="0" class="mr-4">
                                  <v-img :src="item.imageUrl"></v-img>
                               </v-avatar>
                            </template>

                            <v-list-item-title class="font-weight-bold">{{ item.name }}</v-list-item-title>
                            <v-list-item-subtitle>₱{{ item.price.toFixed(2) }}</v-list-item-subtitle>
                            
                            <template v-slot:append>
                                <v-btn icon="mdi-close" variant="text" size="small" @click="removeFromReservation(item.id)"></v-btn>
                            </template>
                        </v-list-item>
                        <v-divider v-if="index < reservedItems.length - 1"></v-divider>
                    </template>
                </v-list>
                
                <v-card-text v-else class="text-center text-medium-emphasis">
                  Select an item to begin your reservation.
                </v-card-text>

                <!-- Total -->
                 <div v-if="reservedItems.length > 0">
                    <v-divider></v-divider>
                    <div class="d-flex justify-space-between align-center pa-4">
                        <span class="font-weight-bold text-subtitle-1">Total:</span>
                        <span class="text-h5 font-weight-bold" style="color: var(--v-theme-text);">₱{{ totalCost.toFixed(2) }}</span>
                    </div>
                    <v-divider></v-divider>
                 </div>
                
                <!-- Pickup Details Form -->
                <v-card-text>
                    <h3 class="text-subtitle-1 font-weight-bold mb-3" style="color: var(--v-theme-text);">Pick-up Details</h3>
                    <v-form v-model="isFormValid">
                        <v-text-field
                            v-model="customerDetails.name"
                            label="Full Name"
                            variant="outlined"
                            density="compact"
                            :rules="[rules.required]"
                        ></v-text-field>

                        <v-text-field
                            v-model="customerDetails.contact"
                            label="Contact Number"
                            variant="outlined"
                            density="compact"
                            :rules="[rules.required]"
                        ></v-text-field>

                        <v-menu
                          v-model="dateMenu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ props }">
                            <v-text-field
                              v-model="formattedPickupDate"
                              label="Pick-up Date"
                              prepend-inner-icon="mdi-calendar"
                              readonly
                              variant="outlined"
                              density="compact"
                              v-bind="props"
                              :rules="[rules.required]"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="customerDetails.pickupDate"
                            @update:modelValue="dateMenu = false"
                            color="primary"
                            :min="new Date().toISOString().substr(0, 10)"
                          ></v-date-picker>
                        </v-menu>
                    </v-form>
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-btn
                        @click="submitReservation"
                        :disabled="!isFormValid || reservedItems.length === 0"
                        color="primary"
                        size="large"
                        variant="flat"
                        block
                    >
                        Confirm Reservation
                    </v-btn>
                </v-card-actions>
             </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- MOCK DATA ---
const products = ref([
  { id: 1, name: 'Bear Keychain', price: 150.00, status: 'In Stock', imageUrl: '../../public/images/bear crochet.png' },
  { id: 2, name: 'Duck Plushie', price: 350.00, status: 'Made-to-Order', imageUrl: '../../public/images/duck.png' },
  { id: 3, name: 'Anime Character', price: 500.00, status: 'In Stock', imageUrl: '../../public/images/anime.jpeg' },
  { id: 4, name: 'Flower Coaster', price: 120.00, status: 'Made-to-Order', imageUrl: '../../public/images/flower.png' },
]);

// --- COMPOSITION API STATE ---
const reservedItems = ref([]);
const isFormValid = ref(false);
const dateMenu = ref(false);

const customerDetails = ref({
  name: '',
  contact: '',
  pickupDate: null,
});

const rules = {
  required: value => !!value || 'This field is required.',
};

// --- COMPUTED PROPERTIES ---
const totalCost = computed(() => {
  return reservedItems.value.reduce((total, item) => total + item.price, 0);
});

const formattedPickupDate = computed(() => {
  return customerDetails.value.pickupDate ? customerDetails.value.pickupDate.toLocaleDateString('en-US') : '';
});


// --- FUNCTIONS ---
const addToReservation = (product) => {
  if (!isProductReserved(product.id)) {
    reservedItems.value.push(product);
  }
};

const removeFromReservation = (productId) => {
  reservedItems.value = reservedItems.value.filter(item => item.id !== productId);
};

const isProductReserved = (productId) => {
  return reservedItems.value.some(item => item.id === productId);
};

const submitReservation = () => {
  if (isFormValid.value) {
    console.log('Reservation Submitted:', {
      customer: { ...customerDetails.value },
      items: reservedItems.value,
      total: totalCost.value,
    });
    alert('Reservation Confirmed!');
    // Here you would typically send data to a server
    // Reset state after submission
    reservedItems.value = [];
    customerDetails.value = { name: '', contact: '', pickupDate: null };
  }
};
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
}
</style>