<template>
  <v-app>
    <v-main style="background-color: var(--v-theme-background);">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Inventory Management</h1>

        <v-card class="rounded-lg" elevation="2">
            <v-card-title class="d-flex flex-wrap align-center pa-4">
                <span class="text-h6 font-weight-bold" style="color: var(--v-theme-text);">
                  {{ showArchived ? 'Archived Products' : 'Active Products' }}
                </span>
                <v-spacer></v-spacer>
                <v-switch
                  v-model="showArchived"
                  label="Show Archived"
                  color="primary"
                  hide-details
                  class="mr-4"
                ></v-switch>
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="openAddDialog"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add New Product
                </v-btn>
            </v-card-title>
            
            <v-divider></v-divider>
            
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="filteredProducts"
                    items-per-page="10"
                    class="elevation-0"
                    density="comfortable"
                    :search="search"
                >
                  <!-- Custom Slots for better display -->
                  <template v-slot:item.imageUrl="{ item }">
                    <v-avatar class="ma-2" rounded="lg">
                       <v-img :src="item.imageUrl" :alt="item.name"></v-img>
                    </v-avatar>
                  </template>

                  <template v-slot:item.price="{ item }">
                    <span>₱{{ item.price.toFixed(2) }}</span>
                  </template>

                  <template v-slot:item.status="{ item }">
                    <v-chip
                      size="small"
                      :color="item.status === 'In Stock' ? 'success' : 'info'"
                      variant="tonal"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>

                  <template v-slot:item.actions="{ item }">
                    <div v-if="!showArchived">
                      <v-icon class="me-2" @click="openEditDialog(item)" color="grey-darken-1">mdi-pencil</v-icon>
                      <v-icon @click="openConfirmArchiveDialog(item)" color="error">mdi-archive-arrow-down</v-icon>
                    </div>
                    <div v-else>
                      <v-btn small variant="outlined" color="success" @click="restoreItem(item)">
                        Restore
                      </v-btn>
                    </div>
                  </template>
                </v-data-table>
            </v-card-text>
        </v-card>
      </v-container>

      <!-- Add/Edit Product Dialog -->
      <v-dialog v-model="dialog" max-width="600px" persistent>
          <v-card class="rounded-lg">
              <v-card-title class="pa-4">
                  <span class="text-h5 font-weight-bold" style="color: var(--v-theme-text);">{{ formTitle }}</span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                  <v-container>
                      <v-row>
                          <v-col cols="12">
                              <v-text-field v-model="editedItem.name" label="Product Name" variant="outlined"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field v-model.number="editedItem.price" label="Price (₱)" type="number" variant="outlined"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field v-model.number="editedItem.stock" label="Stock Quantity" type="number" variant="outlined"></v-text-field>
                          </v-col>
                          <v-col cols="12">
                              <v-select v-model="editedItem.status" :items="['In Stock', 'Made-to-Order']" label="Status" variant="outlined"></v-select>
                          </v-col>
                           <v-col cols="12">
                              <v-text-field v-model="editedItem.imageUrl" label="Image URL" variant="outlined"></v-text-field>
                          </v-col>
                      </v-row>
                  </v-container>
              </v-card-text>
              <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn text @click="closeDialog" color="grey-darken-1">Cancel</v-btn>
                  <v-btn color="primary" variant="flat" @click="save">Save Product</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>

      <!-- Archive Confirmation Dialog -->
      <v-dialog v-model="confirmArchiveDialog" max-width="500px">
        <v-card class="rounded-lg">
          <v-card-title class="text-h5">Confirm Archive</v-card-title>
          <v-card-text>Are you sure you want to archive the product "{{ itemToArchive.name }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeConfirmArchiveDialog">Cancel</v-btn>
            <v-btn color="error" variant="flat" @click="archiveItemConfirm">Archive</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- MOCK DATA ---
const products = ref([
  { id: 1, name: 'Bear Keychain', price: 150.00, stock: 5, status: 'In Stock', imageUrl: '../../public/images/bear crochet.png', isActive: true },
  { id: 2, name: 'Duck Plushie', price: 350.00, stock: 0, status: 'Made-to-Order', imageUrl: '../../public/images/duck.png', isActive: true },
  { id: 3, name: 'Anime Character', price: 500.00, stock: 3, status: 'In Stock', imageUrl: '../../public/images/anime.jpeg', isActive: true },
  { id: 4, name: 'Flower Coaster', price: 120.00, stock: 0, status: 'Made-to-Order', imageUrl: '../../public/images/flower.png', isActive: true },
]);

// --- COMPOSITION API STATE ---
const search = ref('');
const dialog = ref(false);
const confirmArchiveDialog = ref(false);
const showArchived = ref(false);

const headers = [
  { title: 'Image', key: 'imageUrl', sortable: false },
  { title: 'Product Name', key: 'name' },
  { title: 'Price', key: 'price' },
  { title: 'Stock', key: 'stock' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const defaultItem = {
  id: -1,
  name: '',
  price: 0,
  stock: 0,
  status: 'In Stock',
  imageUrl: 'https://via.placeholder.com/150/FADCD9/5D4037?text=New',
  isActive: true,
};

const editedIndex = ref(-1);
const editedItem = ref({ ...defaultItem });
const itemToArchive = ref({});


// --- COMPUTED PROPERTIES ---
const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Product' : 'Edit Product'));
const filteredProducts = computed(() => products.value.filter(p => p.isActive === !showArchived.value));


// --- DIALOG FUNCTIONS ---
const openAddDialog = () => {
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
  dialog.value = true;
};

const openEditDialog = (item) => {
  editedIndex.value = products.value.findIndex(p => p.id === item.id);
  editedItem.value = { ...item };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const openConfirmArchiveDialog = (item) => {
  itemToArchive.value = item;
  confirmArchiveDialog.value = true;
};

const closeConfirmArchiveDialog = () => {
  confirmArchiveDialog.value = false;
  setTimeout(() => { itemToArchive.value = {}; }, 300); // Clear after transition
};


// --- CRUD & ARCHIVE FUNCTIONS ---
const save = () => {
  if (editedIndex.value > -1) {
    // Edit existing
    Object.assign(products.value[editedIndex.value], editedItem.value);
  } else {
    // Add new
    editedItem.value.id = Date.now(); // Create a simple unique ID
    products.value.push({ ...editedItem.value });
  }
  closeDialog();
};

const archiveItemConfirm = () => {
  const index = products.value.findIndex(p => p.id === itemToArchive.value.id);
  if (index > -1) {
    products.value[index].isActive = false;
  }
  closeConfirmArchiveDialog();
};

const restoreItem = (item) => {
  const index = products.value.findIndex(p => p.id === item.id);
  if (index > -1) {
    products.value[index].isActive = true;
  }
};
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.v-data-table {
    background-color: transparent !important;
}

.v-icon:hover {
  color: var(--v-theme-primary) !important;
  cursor: pointer;
}
</style>