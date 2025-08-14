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
                  <template v-slot:item.product_image="{ item }">
                    <v-avatar class="ma-2 rounded-lg clickable-image" @click="enlargeImage(`http://localhost:3000/image/${item.product_id}`)">
                       <v-img :src="`http://localhost:3000/image/${item.product_id}`" :alt="item.product_name" cover></v-img>
                    </v-avatar>
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
                    <div v-if="item.archived == 'false'">
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
                      <v-text-field v-model="editedItem.product_name" label="Product Name" variant="outlined"></v-text-field>
                      <v-row>
                          <v-col cols="12" sm="6">
                              <v-text-field v-model.number="editedItem.product_price" label="Price (₱)" type="number" variant="outlined"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-select v-model="editedItem.product_category" :items="categories" label="Category" variant="outlined"></v-select>
                          </v-col>
                      </v-row>
                        <v-file-input
                          label="Select Image"
                          accept="image/*"
                          outlined
                          dense
                          v-model="selectedFile"
                          :show-size="true"
                        ></v-file-input>
                       <br>
                       <img 
                        v-if="previewImageSrc && !editDialog"
                         :src="previewImageSrc" 
                         :alt="sampleFile.filename || 'Product image'" 
                         class="image-preview clickable-image" 
                         contain
                         @click="enlargeImage(previewImageSrc)"
                       />
                      <img
                        v-else-if="previewImageSrc && editDialog" 
                        :src="`http://localhost:3000/image/${editedItem.product_id}`"
                        :alt="editedItem.product_name || 'Product zxc'" 
                        class="image-preview clickable-image" 
                        contain
                        @click="enlargeImage(`http://localhost:3000/image/${editedItem.product_id}`)"
                      />

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
                  <v-btn text @click="closeDialog" color="grey-darken-1">Cancel</v-btn>
                  <v-btn color="primary" variant="flat" @click="save">Save Product</v-btn>
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
            <v-btn color="error" variant="flat" @click="archiveItemConfirm">Archive</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Reusable Image Enlarge Dialog -->
      <v-dialog v-model="imageDialog" max-width="800px">
        <v-card class="rounded-lg">
          <v-card-text class="pa-2">
             <v-img :src="enlargedImageUrl" contain max-height="80vh"></v-img>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="imageDialog = false" color="primary">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios'

// --- MOCK DATA & CONSTANTS ---
const categories = ['Keychain', 'Plushie', 'Coaster', 'Tote Bag', 'Character'];
const products = ref([]); // Start with an empty array, will be filled by fetchProducts

// --- STATE ---
const dialog = ref(false);
const confirmArchiveDialog = ref(false);
const imageDialog = ref(false);
const showArchived = ref(false);
const newColor = ref('');
const searchQuery = ref('');
const enlargedImageUrl = ref('');

const headers = [
  { title: 'Image', key: 'product_image', sortable: false },
  { title: 'Product Name', key: 'product_name' },
  { title: 'Category', key: 'product_category' },
  { title: 'Price', key: 'product_price' },
  { title: 'Available Colors', key: 'product_colors', sortable: false, width: '25%' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const defaultItem = {
  product_name: '',
  product_price: 0,
  product_category: null,
  product_colors: [],
  product_image: '',
  archived: false,
};

const editedIndex = ref(-1);
const editedItem = ref({ ...defaultItem });
const itemToArchive = ref({});

const sampleFile = ref({
  filename: '',
  imageData:''
})

let editDialog = ref(false)

const productImage = ref(null)

const selectedFile = ref(null);

// --- IMAGE HANDLING ---
const handleUpload = () => {
    const file = Array.isArray(selectedFile.value)
    ? selectedFile.value[0]
    : selectedFile.value;

  if (!file) {
    console.warn('No file selected');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  productImage.value = formData

  console.log('FormData:', [...formData.entries()]); // Debug output

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64String = reader.result;
    sampleFile.value.filename = file.name;
    sampleFile.value.imageData = base64String;
  }
  reader.readAsDataURL(file);
}

const enlargeImage = (imageUrl) => {
  if (!imageUrl) return;
  enlargedImageUrl.value = imageUrl;
  imageDialog.value = true;
};


// --- COMPUTED PROPERTIES ---
const formTitle = computed(() => (editedIndex.value === -1 ? 'Add New Product' : 'Edit Product'));
const filteredProducts = computed(() => products.value.filter(p => p.archived === showArchived.value.toString()));

const previewImageSrc = computed(() => {
  if (sampleFile.value.imageData) {
    return sampleFile.value.imageData;
  }
  if (editedItem.value.product_image) {
    return editedItem.value.product_image;
  }
  return null;
});


// --- DIALOG FUNCTIONS ---
const openAddDialog = () => {
  editedIndex.value = -1;
  editedItem.value = JSON.parse(JSON.stringify(defaultItem));
  sampleFile.value = { filename: '', imageData: '' };
  dialog.value = true;
};

const openEditDialog = (item) => {
  editedIndex.value = products.value.findIndex(p => p.product_id === item.product_id);
  editedItem.value = JSON.parse(JSON.stringify(item));
  sampleFile.value = { filename: '', imageData: '' };
  dialog.value = true;
  editDialog.value = true
};

const closeDialog = () => {
  dialog.value = false;
  sampleFile.value = { filename: '', imageData: '' };
  editDialog.value = false
  selectedFile.value = null
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
    if (!newColor.value || !editedItem.value.product_colors) return;
    editedItem.value.product_colors.push(newColor.value);
    newColor.value = '';
};

const removeColor = (index) => {
    editedItem.value.product_colors.splice(index, 1);
};

const handleSavingProduct = async (action,productPayload) => {
  if(action == 'Edit'){
    console.log("Edit");
  }
  else if(action == 'Add'){
    try {
      await axios.post("http://localhost:3000/api/addProduct", productPayload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
      });
    } catch (error) {
      console.error("Unable to add product", error);
      alert("Unable to add product!");
    }
  }
}

// --- CRUD & ARCHIVE FUNCTIONS ---
const save = async () => {
  let tmpEditedItem = { ...editedItem.value }

  if (editedIndex.value > -1) {
    Object.assign(products.value[editedIndex.value], tmpEditedItem);
  } else {
    tmpEditedItem.product_id = Date.now();
    products.value.push({ ...tmpEditedItem});
  }

  if(tmpEditedItem.product_colors){
    tmpEditedItem.product_colors = JSON.stringify(tmpEditedItem.product_colors)
  }

  if(productImage.value){
    for (const [key, value] of Object.entries(tmpEditedItem)) {
      productImage.value.append(key, value);
    }
  }

  let productPayload = null

  if(editDialog.value){
    productPayload = tmpEditedItem
    handleSavingProduct('Edit',productPayload)
  }else{
    productPayload =  productImage.value
    handleSavingProduct('Add',productPayload)
  }

  closeDialog();
};


const archiveItemConfirm = () => {
  const index = products.value.findIndex(p => p.product_id === itemToArchive.value.product_id);
  if (index > -1) {
    products.value[index].archived = true;
  }
  closeConfirmArchiveDialog();
};

const restoreItem = (item) => {
  const index = products.value.findIndex(p => p.product_id === item.product_id);
  if (index > -1) {
    products.value[index].archived = false;
  }
};

const fetchProducts = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/fetchProducts");
    
    const productsData = response.data.map(product => {
      return {
        ...product,
        product_colors: JSON.parse(product.product_colors)
      };
    });

    console.log(productsData,"productsData");
    
    products.value = productsData;

  } catch (error) {
    console.error("Unable to fetch products!", error);
    alert("Unable to fetch products!");
  }
};

watch(selectedFile, (newFile) => {
  handleUpload()
});

watch(()=> previewImageSrc.value, (newValue, oldValue) => {
  if(oldValue){
    editDialog.value = false
  }
})

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.v-data-table {
  background-color: transparent !important;
}
.v-icon:hover, .clickable-image:hover {
  cursor: pointer;
}
.v-icon:hover {
  color: var(--v-theme-primary) !important;
}

.image-preview {
  width: 300px;
  height: 200px;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 8px;
}
</style>