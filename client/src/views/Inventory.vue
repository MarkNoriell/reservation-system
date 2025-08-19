<template>
  <v-app>
    <v-main style="background-color: #feefea;">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Inventory Management</h1>

        <v-card class="rounded-lg" elevation="2">
            <v-card-title class="d-flex flex-wrap align-center pa-4">
                <span class="text-h6 font-weight-bold" style="color: var(--v-theme-text);">
                  {{ showArchived ? 'Archived Products' : 'Active Products' }}
                </span>
                <v-spacer></v-spacer>

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
                    :loading="loadingTable"
                    items-per-page="10"
                    class="elevation-0"
                    density="comfortable"
                >
           <template v-slot:item.product_image="{ item }">
  <v-avatar class="ma-2 rounded-lg clickable-image" @click="enlargeImage(`http://localhost:3000/image/${item.product_id}?v=${item.imageVersion}`)">
     
     <!-- --- THIS IS THE FIX --- -->
     <!-- Append the unique version as a query parameter `?v=` -->
     <!-- This makes the URL unique and forces the browser to re-download the image -->
     <v-img :src="`http://localhost:3000/image/${item.product_id}?v=${item.imageVersion}`" :alt="item.product_name" cover></v-img>

  </v-avatar>
</template>

                  <template v-slot:item.product_cost="{ item }">
                    <span>₱{{ item.product_cost.toFixed(2) }}</span>
                  </template>

                  <template v-slot:item.product_price="{ item }">
                    <span>₱{{ item.product_price.toFixed(2) }}</span>
                  </template>
                  
                   <template v-slot:item.product_colors="{ item }">
                    <div class="py-2">
                        <v-chip
                            v-for="color in item.product_colors"
                            :key="color"
                            size="small"
                            class="mr-1 mb-1"
                        >
                            {{ color }}
                        </v-chip>
                    </div>
                  </template>

                <template v-slot:item.actions="{ item }">
                  <!-- CORRECTED AND SIMPLIFIED LOGIC -->
                  <div v-if="!item.archived">
                    <v-icon class="me-2" @click="openEditDialog(item)" color="grey-darken-1">mdi-pencil</v-icon>
                    <v-icon @click="openConfirmArchiveDialog(item)" color="error">mdi-archive-arrow-down</v-icon>
                  </div>
                  <div v-else>
                    <v-btn small variant="outlined" color="success" @click="restoreProduct(item)">
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
                    <v-text-field 
                      v-model="editedItem.product_name" 
                      label="Product Name" 
                      variant="outlined"
                      :error-messages="formErrors.product_name"
                      style="margin-bottom:3%;"
                    ></v-text-field>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field 
                            v-model.number="editedItem.product_cost" 
                            label="Product Cost (₱)" 
                            type="number" 
                            variant="outlined" 
                            prefix="₱"
                            :error-messages="formErrors.product_cost"
                            style="margin-bottom:4%;"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field 
                            v-model.number="editedItem.product_price" 
                            label="Price (₱)" 
                            type="number" 
                            variant="outlined" 
                            prefix="₱"
                            :error-messages="formErrors.product_price"
                            style="margin-bottom:4%;"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-select v-model="editedItem.product_category" :items="categories" label="Category" variant="outlined"></v-select>
                        <v-file-input
                          label="Select Image"
                          accept="image/*"
                          variant="outlined"
                          dense
                          v-model="selectedFile"
                          @change="previewFile"
                          :show-size="1000"
                        ></v-file-input>
                       
                       <img 
                         v-if="imagePreviewUrl"
                         :src="imagePreviewUrl" 
                         alt="Product image preview" 
                         class="image-preview clickable-image" 
                         contain
                         @click="enlargeImage(imagePreviewUrl)"
                       />

                      <v-divider class="my-4"></v-divider>
                      
                      <h3 class="text-subtitle-1 font-weight-bold mb-2">Available Colors</h3>
                       <v-row align="center">
                          <v-col cols="12" sm="8">
                            <v-text-field v-model="newColor" label="Color Name (e.g., Red)" variant="outlined" density="compact" hide-details @keydown.enter.prevent="addColor"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="4">
                             <v-btn @click="addColor" color="primary" block>Add Color</v-btn>
                          </v-col>
                        </v-row>

                        <div class="mt-4">
                            <p v-if="!editedItem.product_colors || editedItem.product_colors.length === 0" class="text-caption text-medium-emphasis">No colors added yet.</p>
                            <v-chip
                                v-for="(color, index) in editedItem.product_colors"
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
                  <v-btn text @click="closeDialog" :disabled="loadingAction">Cancel</v-btn>
                  <v-btn color="primary" variant="flat" @click="saveProduct" :loading="loadingAction">Save Product</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>

      <!-- Archive Confirmation Dialog -->
      <v-dialog v-model="confirmArchiveDialog" max-width="500px">
        <v-card class="rounded-lg">
          <v-card-title class="text-h5">Confirm Archive</v-card-title>
          <v-card-text>Are you sure you want to archive the product "{{ itemToArchive.product_name }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeConfirmArchiveDialog">Cancel</v-btn>
            <v-btn color="error" variant="flat" @click="archiveProductConfirm">Archive</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Reusable Image Enlarge Dialog -->
      <v-dialog v-model="imageDialog" max-width="800px">
        <v-card class="rounded-lg">
          <v-card-text class="pa-2">
             <v-img :src="enlargedImageUrl" contain max-height="80vh"></v-img>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Snackbar for notifications -->
      <!-- Implement v-snackbar here using the snackbar state -->

    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:3000/api';

// --- STATE MANAGEMENT ---
const products = ref([]);
const categories = ['Keychain', 'Plushie', 'Coaster', 'Tote Bag', 'Character'];
const dialog = ref(false);
const confirmArchiveDialog = ref(false);
const imageDialog = ref(false);
const showArchived = ref(false); // This is a boolean
const loadingAction = ref(false);
const loadingTable = ref(false);
const searchQuery = ref('');
const newColor = ref('');
const enlargedImageUrl = ref('');
const imagePreviewUrl = ref(null);
const selectedFile = ref(null);
const editedIndex = ref(-1);
const editedItem = ref({});
const itemToArchive = ref({});
const formErrors = ref({});

const defaultItem = {
  product_name: '',
  product_cost: 0,
  product_price: 0,
  product_category: null,
  product_colors: [],
  archived: false,
};

const headers = [
  { title: 'Image', key: 'product_image', sortable: false },
  { title: 'Product Name', key: 'product_name' },
  { title: 'Category', key: 'product_category' },
  { title: 'Cost', key: 'product_cost' },
  { title: 'Price', key: 'product_price' },
  { title: 'Colors', key: 'product_colors', sortable: false, width: '25%' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

// --- COMPUTED PROPERTIES ---
const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Product' : 'Edit Product'));

// --- THIS IS THE DEFINITIVE FIX ---
// We are now comparing a boolean (p.archived) to a boolean (showArchived.value).
// This is the correct and only way to do it.
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    return p.archived === showArchived.value
  });
});


// --- API FUNCTIONS ---
const fetchProducts = async () => {
  loadingTable.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/fetchProducts`);
    products.value = response.data.map(product => {
      // This normalization is ESSENTIAL and CORRECT.
      const isArchived = product.archived === 'true' || product.archived === 1 || product.archived === true;
      return {
        ...product,
        product_colors: typeof product.product_colors === 'string' ? JSON.parse(product.product_colors || '[]') : [],
        archived: isArchived, // Guarantees p.archived is a boolean
        imageVersion: Date.now()
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loadingTable.value = false;
  }
};

const validateForm = () => {
  formErrors.value = {};
  const { product_name, product_cost, product_price, product_category, product_id } = editedItem.value;

  // --- DUPLICATE PRODUCT CHECK ---
  const isDuplicate = products.value.some(
    (product) =>
      product.product_name.toLowerCase() === product_name.toLowerCase() &&
      product.product_category.toLowerCase() === product_category.toLowerCase() &&
      product.product_id !== product_id // Ensure we're not comparing the item to itself when editing
  );

  if (isDuplicate) {
    formErrors.value.product_name = 'This product already exists in the selected category.';
  }
  // --- END DUPLICATE CHECK ---

  if (!product_name) formErrors.value.product_name = 'Product name is required.';
  if (!product_cost || product_cost <= 0) formErrors.value.product_cost = 'Product cost must be greater than zero.';
  if (!product_price || product_price <= 0) formErrors.value.product_price = 'Product price must be greater than zero.';
  if (product_price < product_cost) formErrors.value.product_price = 'Price cannot be lower than the cost.';

  return Object.keys(formErrors.value).length === 0;
};

const saveProduct = async () => {
  if (!validateForm()) return;

  loadingAction.value = true;
  const formData = new FormData();

  // --- THIS IS THE FIX ---
  // Create a clean payload object by destructuring `editedItem`.
  // This explicitly removes the old image data and the client-side imageVersion
  // before we prepare the data to be sent.
  if(editedItem.value.product_colors.length <= 0 ){
    editedItem.value.product_colors.push('Standard Color')
  }
  const {
    product_image,
    img_mime,
    imageVersion,
    ...detailsToSubmit
  } = editedItem.value;

  // Now, loop over the CLEAN `detailsToSubmit` object.
  Object.keys(detailsToSubmit).forEach(key => {
    const value = detailsToSubmit[key];
    if (key === 'product_colors') {
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  // This part remains the same: ONLY append a new image if the user selected one.
  if (selectedFile.value) {
    formData.append('image', selectedFile.value);
  }

  try {
    if (editedIndex.value > -1) {
      await axios.post(`${API_BASE_URL}/updateProduct`, formData);
    } else {
      await axios.post(`${API_BASE_URL}/addProduct`, formData);
    }
    await fetchProducts();
    closeDialog();
  } catch (error) {
    console.error("Error saving product:", error);
  } finally {
    loadingAction.value = false;
  }
};

const archiveProductConfirm = async () => {
    try {
        await axios.put(`${API_BASE_URL}/archiveProduct/${itemToArchive.value.product_id}`);
        await fetchProducts();
    } catch (error) {
        console.error("Error archiving product:", error);
    } finally {
        closeConfirmArchiveDialog();
    }
};

const restoreProduct = async (item) => {
    try {
        await axios.put(`${API_BASE_URL}/restoreProduct/${item.product_id}`);
        await fetchProducts();
    } catch (error) {
        console.error("Error restoring product:", error);
    }
};

// --- DIALOG & UI FUNCTIONS ---
const openAddDialog = () => {
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
  formErrors.value = {}; // Clear errors
  dialog.value = true;
};

const openEditDialog = (item) => {
  editedIndex.value = products.value.findIndex(p => p.product_id === item.product_id);
  editedItem.value = JSON.parse(JSON.stringify(item));
  imagePreviewUrl.value = `http://localhost:3000/image/${item.product_id}?v=${item.imageVersion}`;
  formErrors.value = {}; // Clear errors
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  imagePreviewUrl.value = null;
  selectedFile.value = null;
};

const openConfirmArchiveDialog = (item) => {
  itemToArchive.value = item;
  confirmArchiveDialog.value = true;
};

const closeConfirmArchiveDialog = () => {
  confirmArchiveDialog.value = false;
  itemToArchive.value = {};
};

const previewFile = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
    imagePreviewUrl.value = null;
  }
};

const enlargeImage = (imageUrl) => {
  if (!imageUrl) return;
  enlargedImageUrl.value = imageUrl;
  imageDialog.value = true;
};

const addColor = () => {
    if (!newColor.value.trim() || !editedItem.value.product_colors) return;
    editedItem.value.product_colors.push(newColor.value.trim());
    newColor.value = '';
};

const removeColor = (index) => {
    editedItem.value.product_colors.splice(index, 1);
};

onMounted(() => {
  fetchProducts();
});
</script>
<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.clickable-image:hover {
  cursor: pointer;
  filter: brightness(0.9);
}
.image-preview {
  width: 100%;
  max-width: 300px;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 12px;
}
</style>