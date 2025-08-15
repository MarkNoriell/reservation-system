<template>
  <v-app>
    <v-main style="background-color: var(--v-theme-background);">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Reservations</h1>

        <v-card class="rounded-lg" elevation="2">
          <v-card-title class="d-flex flex-wrap align-center pa-4">
            <span class="font-weight-bold text-h6" style="color: var(--v-theme-text);">Manage Reservations</span>
            <v-spacer></v-spacer>
            <div style="width: 250px;" class="mr-4">
              <v-text-field
                v-model="searchQuery"
                label="Search Reservations..."
                density="compact"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                hide-details
                single-line
              ></v-text-field>
            </div>
            <v-btn color="primary" variant="flat" @click="openAddDialog" prepend-icon="mdi-plus">
              New Reservation
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="reservationHeaders"
              :items="reservations"
              :search="searchQuery"
              items-per-page="10"
            >
              <template v-slot:item.pickup_date="{ item }">
                <span :style="{ color: getDateColor(item.pickup_date), fontWeight: 'bold' }">
                  {{ formatDate(item.pickup_date) }}
                </span>
              </template>
              
              <template v-slot:item.product_color="{ item }">
                  <v-chip size="small">{{ item.product_color }}</v-chip>
              </template>

              <template v-slot:item.reservation_status="{ item }">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-chip
                      :color="getStatusColor(item.reservation_status)"
                      variant="elevated"
                      size="small"
                      v-bind="props"
                      class="font-weight-bold"
                      style="cursor: pointer;"
                    >
                      {{ item.reservation_status }}
                      <v-icon end icon="mdi-menu-down"></v-icon>
                    </v-chip>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="updateStatus(item, 'Pending')">
                      <v-list-item-title>Pending</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateStatus(item, 'Completed')">
                      <v-list-item-title>Completed</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateStatus(item, 'Cancelled')">
                      <v-list-item-title>Cancelled</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-tooltip text="Edit Pick-up Date">
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" variant="text" size="small" @click="openEditDialog(item)">
                      <v-icon color="black">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>

          <!-- Add Reservation Dialog -->
    <v-dialog v-model="isAddDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title><span class="font-weight-bold">New Reservation</span></v-card-title>
        <v-card-text>
          <v-form ref="addForm">
            <v-text-field
              v-model="newReservation.customer_name"
              label="Customer Name"
              variant="outlined"
              density="compact"
              :rules="validationRules.required"
            ></v-text-field>
            
            <v-select
              v-model="newReservation.product_id"
              :items="products"
              item-title="product_name"
              item-value="product_id"
              label="Product"
              variant="outlined"
              density="compact"
              :rules="validationRules.required"
            />

            <v-select
              v-model="newReservation.product_color"
              :items="availableColors"
              label="Color"
              variant="outlined"
              density="compact"
              :disabled="!newReservation.product_id"
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
            <v-btn text @click="closeAddDialog">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="saveNewReservation">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
      
      <!-- Add/Edit Dialogs (similar to before, with key changes) -->
<v-dialog v-model="isEditDialogVisible" max-width="400px" persistent>
  <v-card class="rounded-lg">
    <v-card-title>
      <span class="font-weight-bold">Edit Pick-up Date</span>
    </v-card-title>
    <v-card-text class="pb-0">
      <p class="mb-4">
        Editing reservation for <strong>{{ editingReservation?.customer_name }}</strong>.
      </p>
        <v-menu
          v-model="isDateMenuVisible"
          :close-on-content-click="false"
          location="center"
        >
          <template v-slot:activator="{ props }">
            <v-text-field
              :model-value="formattedEditDate"
              label="Pick-up Date"
              prepend-inner-icon="mdi-calendar"
              readonly
              v-bind="props"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="editableDate"
            :allowed-dates="isDateAllowedForEdit"
            @update:model-value="isDateMenuVisible = false"
          ></v-date-picker>
        </v-menu>
        <p class="text-caption text-medium-emphasis mt-n2 mb-2">
          Dates with {{ DAILY_RESERVATION_LIMIT }} or more reservations are disabled.
        </p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="closeEditDialog">Cancel</v-btn>
      <v-btn color="primary" variant="flat" @click="saveDateChanges">Save</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const DAILY_RESERVATION_LIMIT = 10;

const reservations = ref([]);
const products = ref([]);
const dateCounts = ref({}); // Will store { 'YYYY-MM-DD': count }

const isAddDialogVisible = ref(false);
const isEditDialogVisible = ref(false); // You can re-implement the edit dialog similarly
const isDateMenuVisible = ref(false);
const searchQuery = ref('');
const addForm = ref(null);
const newReservation = ref({});
const newDateObject = ref(null);
const editingReservation = ref(null);
const editableDate = ref(null); 

const availableColors = ref([]);

// --- WATCH for product selection to update colors ---
watch(() => newReservation.value.product_id, (newProductId) => {
    if (newProductId) {
        const selectedProduct = products.value.find(p => p.product_id === newProductId);
        availableColors.value = selectedProduct ? selectedProduct.product_colors : [];
        newReservation.value.product_color = null; // Reset color selection
    } else {
        availableColors.value = [];
    }
});

const validationRules = {
  required: [v => !!v || 'This field is required'],
  quantity: [
    v => !!v || 'This field is required',
    v => (v && v > 0) || 'Quantity must be greater than 0'
  ]
};

const reservationHeaders = [
  { title: 'Customer', key: 'customer_name' },
  { title: 'Product', key: 'product_name' },
  { title: 'Color', key: 'product_color', sortable: false },
  { title: 'Quantity', key: 'quantity', align: 'end' },
  { title: 'Pick-up Date', key: 'pickup_date', align: 'center' },
  { title: 'Status', key: 'reservation_status', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

// --- API FUNCTIONS ---
const fetchReservations = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reservations`);
        reservations.value = response.data;
    } catch (error) {
        console.error("Error fetching reservations:", error);
    }
};

const fetchProducts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fetchProducts`);
        products.value = response.data.map(p => ({
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

const updateStatus = async (item, newStatus) => {
    try {
        await axios.put(`${API_BASE_URL}/reservations/${item.reservation_id}/status`, { status: newStatus });
        const reservation = reservations.value.find(r => r.reservation_id === item.reservation_id);
        if (reservation) reservation.reservation_status = newStatus;
    } catch (error) {
        console.error("Error updating status:", error);
    }
};

const saveDateChanges = async () => {
  if (!editingReservation.value || !editableDate.value) return;
  try {
    const newDate = formattedEditDate.value; // YYYY-MM-DD
    await axios.put(`${API_BASE_URL}/reservations/${editingReservation.value.reservation_id}/date`, { pickupDate: newDate });
    
    // Refresh all data to ensure consistency
    await fetchReservations();
    await fetchDateCounts();

    closeEditDialog();
  } catch (error) {
    console.error("Error updating reservation date:", error);
  }
};

const saveNewReservation = async () => {
  const { valid } = await addForm.value.validate();
  if (!valid) return;
  try {
      await axios.post(`${API_BASE_URL}/reservations`, newReservation.value);
      closeAddDialog();
      // Refresh data
      await fetchReservations();
      await fetchDateCounts();
  } catch (error) {
      console.error("Error saving reservation:", error);
  }
};

// --- HELPER FUNCTIONS ---
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Cancelled': return 'error';
    default: return 'grey';
  }
};

const getDateColor = (dateString) => {
  if (!dateString) return null;

  // Get today's date and reset the time to the beginning of the day.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- THIS IS THE FIX ---
  // Create the pickupDate object directly from the original string from the database.
  const pickupDate = new Date(dateString);
  // Also reset its time to the beginning of its day for a perfect comparison.
  pickupDate.setHours(0, 0, 0, 0);
  
  // Check if the date is valid. If not, don't color it.
  if (isNaN(pickupDate.getTime())) {
    return null; 
  }

  // The rest of the logic is now guaranteed to work because pickupDate is valid.
  const diffTime = pickupDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    return 'red';
  }

  return null;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const isDateAllowed = (date) => {
  const dateString = date.toLocaleDateString('en-CA');
  const count = dateCounts.value[dateString] || 0;
  return count < DAILY_RESERVATION_LIMIT;
};

const openAddDialog = () => {
  newReservation.value = { customer_name: '', product_id: null, product_color: null, quantity: 1, pickup_date: null };
  newDateObject.value = null;
  if(addForm.value) addForm.value.resetValidation();
  isAddDialogVisible.value = true;
};

const closeAddDialog = () => {
  isAddDialogVisible.value = false;
};

const selectDate = (date) => {
    newReservation.value.pickup_date = date.toLocaleDateString('en-CA');
    isDateMenuVisible.value = false;
};

const formattedEditDate = computed(() => {
    if (!editableDate.value) return '';
    // Use toLocaleDateString('en-CA') to get the YYYY-MM-DD format
    return new Date(editableDate.value).toLocaleDateString('en-CA');
});

const isDateAllowedForEdit = (date) => {
  const dateString = date.toLocaleDateString('en-CA');

  // Allow the reservation's ORIGINAL date, regardless of the limit
  if (editingReservation.value && formatDate(editingReservation.value.pickup_date) === formatDate(dateString)) {
      return true;
  }

  // Otherwise, check the limit
  const count = dateCounts.value[dateString] || 0;
  return count < DAILY_RESERVATION_LIMIT;
};

const openEditDialog = (item) => {
  // Deep copy the item to avoid mutating the original data directly
  editingReservation.value = JSON.parse(JSON.stringify(item));
  // The Date constructor needs a properly formatted string to avoid timezone issues
  editableDate.value = new Date(item.pickup_date); 
  isEditDialogVisible.value = true;
};

const closeEditDialog = () => {
  isEditDialogVisible.value = false;
  editingReservation.value = null;
  editableDate.value = null;
};

// --- LIFECYCLE HOOK ---
onMounted(async () => {
  await fetchProducts();
  await fetchReservations();
  await fetchDateCounts();
});
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}
.v-data-table {
    background-color: transparent !important;
}
</style>