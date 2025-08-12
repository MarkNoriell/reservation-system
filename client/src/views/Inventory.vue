My apologies for the interruption. I have restored and completed the code for you.

Here is the complete and corrected component with the search bar functionality fully integrated.

code
Vue
download
content_copy
expand_less

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

                <!-- Search Bar -->
                 <div style="width: 250px;" class="mr-4">
                    <v-text-field
                      v-model="searchQuery"
                      label="Search Products..."
                      density="compact"
                      variant="outlined"
                      append-inner-icon="mdi-magnify"
                      hide-details
                      single-line
                    ></v-text-field>
                 </div>

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
                  prepend-icon="mdi-plus"
                >
                  Add New Product
                </v-btn>
            </v-card-title>
            
            <v-divider></v-divider>
            
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="filteredProducts"
                    :search="searchQuery"
                    items-per-page="10"
                    class="elevation-0"
                    density="comfortable"
                >
                  <!-- Custom Slots for better display -->
                  <template v-slot:item.imageUrl="{ item }">
                    <v-avatar class="ma-2" rounded="lg">
                       <v-img :src="item.imageUrl" :alt="item.name" cover></v-img>
                    </v-avatar>
                  </template>

                  <template v-slot:item.price="{ item }">
                    <span>₱{{ item.price.toFixed(2) }}</span>
                  </template>
                  
                   <template v-slot:item.colors="{ item }">
                    <div class="py-2">
                        <v-chip
                            v-for="color in item.colors"
                            :key="color"
                            size="small"
                            class="mr-1 mb-1"
                        >
                            {{ color }}
                        </v-chip>
                    </div>
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
                      <v-text-field v-model="editedItem.name" label="Product Name" variant="outlined"></v-text-field>
                      <v-row>
                          <v-col cols="12" sm="6">
                              <v-text-field v-model.number="editedItem.price" label="Price (₱)" type="number" variant="outlined"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-select v-model="editedItem.category" :items="categories" label="Category" variant="outlined"></v-select>
                          </v-col>
                      </v-row>
                      <v-text-field v-model="editedItem.imageUrl" label="Image URL" variant="outlined"></v-text-field>
                      
                      <v-divider class="my-4"></v-divider>
                      
                      <!-- Color Variations -->
                      <h3 class="text-subtitle-1 font-weight-bold mb-2">Available Colors</h3>
                       <v-row align="center">
                          <v-col cols="12" sm="8">
                            <v-text-field v-model="newColor" label="Color Name (e.g., Red)" variant="outlined" density="compact" hide-details @keydown.enter="addColor"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="4">
                             <v-btn @click="addColor" color="primary" block>Add Color</v-btn>
                          </v-col>
                        </v-row>

                        <div class="mt-4">
                            <p v-if="!editedItem.colors || editedItem.colors.length === 0" class="text-caption text-medium-emphasis">No colors added yet.</p>
                            <v-chip
                                v-for="(color, index) in editedItem.colors"
                                :key="index"
                                class="mr-2 mb-2"
                                closable
                                @click:close="removeColor(index)"
                            >
                                {{ color }}
                            </v-chip>
                        </div>
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

// --- MOCK DATA & CONSTANTS ---
const categories = ['Keychain', 'Plushie', 'Coaster', 'Tote Bag', 'Character'];
const products = ref([
  { id: 1, name: 'Bear Keychain', price: 150.00, category: 'Keychain', colors: ['Brown', 'White'], imageUrl: 'https://i.etsystatic.com/43491227/r/il/6bf599/5001438258/il_600x600.5001438258_t9g2.jpg', isActive: true },
  { id: 2, name: 'Duck Plushie', price: 350.00, category: 'Plushie', colors: ['Yellow'], imageUrl: 'https://i.etsystatic.com/23247021/r/il/43117b/4751435874/il_600x600.4751435874_k249.jpg', isActive: true },
  { id: 3, name: 'Gojo Satoru', price: 500.00, category: 'Character', colors: [], imageUrl: 'https://i.etsystatic.com/39563853/r/il/5070a8/4566367935/il_600x600.4566367935_pye7.jpg', isActive: true },
  { id: 4, name: 'Flower Coaster', price: 120.00, category: 'Coaster', colors: ['Pink', 'Blue', 'Green'], imageUrl: 'https://i.etsystatic.com/49257257/r/il/3a0333/5623072216/il_600x600.5623072216_hczf.jpg', isActive: true },
]);

// --- STATE ---
const dialog = ref(false);
const confirmArchiveDialog = ref(false);
const showArchived = ref(false);
const newColor = ref('');
const searchQuery = ref('');

const headers = [
  { title: 'Image', key: 'imageUrl', sortable: false },
  { title: 'Product Name', key: 'name' },
  { title: 'Category', key: 'category' },
  { title: 'Price', key: 'price' },
  { title: 'Available Colors', key: 'colors', sortable: false, width: '25%' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const defaultItem = {
  id: -1,
  name: '',
  price: 0,
  category: null,
  colors: [],
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
  editedItem.value = JSON.parse(JSON.stringify(defaultItem));
  dialog.value = true;
};

const openEditDialog = (item) => {
  editedIndex.value = products.value.findIndex(p => p.id === item.id);
  editedItem.value = JSON.parse(JSON.stringify(item));
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
};

// --- COLOR VARIATION FUNCTIONS ---
const addColor = () => {
    if (!newColor.value || !editedItem.value.colors) return;
    editedItem.value.colors.push(newColor.value);
    newColor.value = '';
};

const removeColor = (index) => {
    editedItem.value.colors.splice(index, 1);
};


// --- CRUD & ARCHIVE FUNCTIONS ---
const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(products.value[editedIndex.value], editedItem.value);
  } else {
    editedItem.value.id = Date.now();
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