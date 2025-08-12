Of course! Adding a search bar is a great way to make the reservations list easier to navigate. I've integrated a search field into the component for you.

Key Changes:

Search Bar UI: A new v-text-field has been added to the card's title section. It's positioned between the title and the "New Reservation" button and includes a search icon for a clean look.

Search State: A ref named searchQuery has been created to store the user's search input.

v-data-table Integration: The v-data-table is now bound to the searchQuery via its built-in :search prop. This allows the table to automatically filter the data based on the user's input across all fields, including customer name, product, and status.

Here is the complete code with the added search functionality:

code
Vue
download
content_copy
expand_less

<template>
  <v-app>
    <v-main style="background-color: var(--v-theme-background);">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Reservations</h1>

        <v-row>
          <!-- Reservations Table -->
          <v-col cols="12">
            <v-card class="rounded-lg" elevation="2">
              <v-card-title class="d-flex flex-wrap align-center pa-4">
                <v-icon icon="mdi-calendar-clock" class="mr-3" size="large" color="primary-darken-1"></v-icon>
                <span class="font-weight-bold text-h6" style="color: var(--v-theme-text);">Manage Reservations</span>
                <v-spacer></v-spacer>
                 <!-- Search Bar -->
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
                  class="elevation-0"
                  density="comfortable"
                >
                  <!-- Custom slot for the pickup date color -->
                  <template v-slot:item.pickupDate="{ item }">
                    <span :style="{ color: getDateColor(item.pickupDate), fontWeight: 'bold' }">
                      {{ item.pickupDate }}
                    </span>
                  </template>
                  
                  <!-- Custom slot for the status chip menu -->
                  <template v-slot:item.status="{ item }">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-chip
                          :color="getStatusColor(item.status)"
                          variant="elevated"
                          size="small"
                          v-bind="props"
                          class="font-weight-bold"
                          style="cursor: pointer;"
                        >
                          {{ item.status }}
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

                  <!-- Custom slot for action buttons -->
                  <template v-slot:item.actions="{ item }">
                    <v-tooltip text="Edit Reservation">
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
          </v-col>
        </v-row>
      </v-container>
      
      <!-- Add Reservation Dialog -->
      <v-dialog v-model="isAddDialogVisible" max-width="500px" persistent>
        <v-card class="rounded-lg">
          <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-calendar-plus" class="mr-3"></v-icon>
              <span class="font-weight-bold">New Reservation</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="addForm">
              <v-text-field
                v-model="newReservation.customer"
                label="Customer Name"
                variant="outlined"
                density="compact"
                :rules="validationRules.required"
              ></v-text-field>
              <v-text-field
                v-model="newReservation.product"
                label="Product"
                variant="outlined"
                density="compact"
                :rules="validationRules.required"
              ></v-text-field>
              <v-text-field
                v-model.number="newReservation.quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                density="compact"
                :rules="validationRules.quantity"
              ></v-text-field>

              <v-menu v-model="isDateMenuVisible" :close-on-content-click="false" location="center">
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="newReservation.pickupDate"
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
                    hide-actions
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


      <!-- Edit Reservation Dialog -->
      <v-dialog v-model="isEditDialogVisible" max-width="400px" persistent>
        <v-card class="rounded-lg">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-calendar-edit" class="mr-3"></v-icon>
            <span class="font-weight-bold">Edit Pick-up Date</span>
          </v-card-title>
          <v-card-text class="pb-0">
            <p class="mb-4">
              Editing reservation for <strong>{{ editingReservation?.customer }}</strong>.
            </p>
              <v-menu
                v-model="isDateMenuVisible"
                :close-on-content-click="false"
                location="center"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    :model-value="formattedDate"
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
                  :allowed-dates="isDateAllowed"
                  hide-actions
                  title=""
                  @update:model-value="isDateMenuVisible = false"
                ></v-date-picker>
              </v-menu>
              <p class="text-caption text-medium-emphasis mt-n2 mb-2">
                Dates with {{ DAILY_RESERVATION_LIMIT }} reservations are disabled.
              </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeEditDialog">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="saveChanges">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- CONSTANTS & STATE ---
const DAILY_RESERVATION_LIMIT = 5;

// State for Dialogs
const isAddDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isDateMenuVisible = ref(false);

// State for Forms & Data
const searchQuery = ref('');
const addForm = ref(null);
const newReservation = ref({});
const newDateObject = ref(null);
const editingReservation = ref(null);
const editableDate = ref(null); 

// --- COMPUTED PROPERTIES ---
const formattedDate = computed(() => {
    if (!editableDate.value) return '';
    return editableDate.value.toLocaleDateString('en-CA');
});

// --- VALIDATION ---
const validationRules = {
  required: [v => !!v || 'This field is required'],
  quantity: [
    v => !!v || 'This field is required',
    v => (v && v > 0) || 'Quantity must be greater than 0'
  ]
};

// --- DATA TABLE HEADERS ---
const reservationHeaders = [
  { title: 'Customer', key: 'customer', sortable: true },
  { title: 'Product', key: 'product', sortable: false },
  { title: 'Quantity', key: 'quantity', align: 'end' },
  { title: 'Pick-up Date', key: 'pickupDate', align: 'center' },
  { title: 'Status', key: 'status', align: 'center', sortable: true },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
];

// --- DYNAMIC DATE HELPER ---
const getRelativeDate = (dayOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

// --- MOCK DATA ---
const reservations = ref([
  { id: 101, customer: 'Juan Dela Cruz', product: 'Bear Keychain', quantity: 2, pickupDate: getRelativeDate(0), status: 'Pending' },
  { id: 102, customer: 'Maria Clara', product: 'Flower Coaster', quantity: 5, pickupDate: getRelativeDate(1), status: 'Pending' },
  { id: 103, customer: 'Jose Rizal', product: 'Tote Bag', quantity: 1, pickupDate: getRelativeDate(2), status: 'Completed' },
  { id: 104, customer: 'Gabriela Silang', product: 'Duck Plushie', quantity: 3, pickupDate: getRelativeDate(7), status: 'Cancelled' },
  { id: 106, customer: 'Customer A', product: 'Product A', quantity: 1, pickupDate: '2025-08-28', status: 'Pending' },
  { id: 107, customer: 'Customer B', product: 'Product B', quantity: 1, pickupDate: '2025-08-28', status: 'Pending' },
  { id: 108, customer: 'Customer C', product: 'Product C', quantity: 1, pickupDate: '2025-08-28', status: 'Pending' },
  { id: 109, customer: 'Customer D', product: 'Product D', quantity: 1, pickupDate: '2025-08-28', status: 'Pending' },
  { id: 110, customer: 'Customer E', product: 'Product E', quantity: 1, pickupDate: '2025-08-28', status: 'Pending' },
]);

// --- FUNCTIONS ---

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pickupDate = new Date(dateString + 'T00:00:00');
  const diffTime = pickupDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 'red';
  return null;
};

const updateStatus = (item, newStatus) => {
  const reservation = reservations.value.find(r => r.id === item.id);
  if (reservation) reservation.status = newStatus;
};

const isDateAllowed = (date) => {
  const dateString = date.toLocaleDateString('en-CA');
  const reservationsOnDate = reservations.value.filter(r => r.pickupDate === dateString);
  if (editingReservation.value && editingReservation.value.pickupDate === dateString) {
    return true;
  }
  return reservationsOnDate.length < DAILY_RESERVATION_LIMIT;
};

// --- Add Dialog Functions ---
const openAddDialog = () => {
  newReservation.value = { customer: '', product: '', quantity: null, pickupDate: null };
  newDateObject.value = null;
  if(addForm.value) addForm.value.resetValidation();
  isAddDialogVisible.value = true;
};

const closeAddDialog = () => {
  isAddDialogVisible.value = false;
};

const selectDate = (date) => {
    newReservation.value.pickupDate = date.toLocaleDateString('en-CA');
    isDateMenuVisible.value = false;
};

const saveNewReservation = async () => {
  const { valid } = await addForm.value.validate();
  if (!valid) return;
  reservations.value.push({
    id: Date.now(),
    ...newReservation.value,
    status: 'Pending',
  });
  closeAddDialog();
};

// --- Edit Dialog Functions ---
const openEditDialog = (item) => {
  editingReservation.value = { ...item };
  editableDate.value = new Date(item.pickupDate + 'T00:00:00');
  isEditDialogVisible.value = true;
};

const closeEditDialog = () => {
  isEditDialogVisible.value = false;
  editingReservation.value = null;
  editableDate.value = null;
};

const saveChanges = () => {
  if (!editingReservation.value || !editableDate.value) return;
  const index = reservations.value.findIndex(r => r.id === editingReservation.value.id);
  if (index !== -1) {
    reservations.value[index].pickupDate = formattedDate.value;
  }
  closeEditDialog();
};
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