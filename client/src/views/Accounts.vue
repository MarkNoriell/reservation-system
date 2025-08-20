<template>
  <v-app>
    <v-main style="background-color: #feefea;">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6">Accounts</h1>

        <v-card class="rounded-lg" elevation="2">
            <v-tabs v-model="tab" bg-color="transparent" color="primary">
              <v-tab value="active">Active Accounts</v-tab>
              <v-tab value="deactivated">Deactivated Accounts</v-tab>
            </v-tabs>

            <v-card-text>
              <v-window v-model="tab">
                <!-- Active Accounts Tab -->
                <v-window-item value="active">
                    <div class="d-flex justify-end mb-4">
                        <v-btn color="primary" @click="openAddUserDialog" prepend-icon="mdi-plus">
                            Add New User
                        </v-btn>
                    </div>
                    <v-data-table
                      :headers="accountHeaders"
                      :items="activeUsers"
                      items-per-page="5"
                    >
                      <template v-slot:item.access_rights="{ item }">
                        <v-chip :color="getRoleColor(item.access_rights)" size="small">{{ item.access_rights }}</v-chip>
                      </template>
                      <template v-slot:item.actions="{ item }">
                        <v-tooltip text="Edit User">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" class="me-2" @click="openEditUserDialog(item)">mdi-pencil</v-icon>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Deactivate User">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" @click="openConfirmDeactivateDialog(item)" color="error">mdi-account-off</v-icon>
                            </template>
                        </v-tooltip>
                      </template>
                    </v-data-table>
                </v-window-item>

                <!-- Deactivated Accounts Tab -->
                <v-window-item value="deactivated">
                    <v-data-table
                      :headers="accountHeaders"
                      :items="deactivatedUsers"
                      items-per-page="5"
                      no-data-text="No deactivated accounts found."
                    >
                      <template v-slot:item.access_rights="{ item }">
                        <v-chip :color="getRoleColor(item.access_rights)" size="small" variant="outlined">{{ item.access_rights }}</v-chip>
                      </template>
                       <template v-slot:item.actions="{ item }">
                         <v-tooltip text="Reactivate User">
                            <template v-slot:activator="{ props }">
                                <v-btn icon v-bind="props" variant="text" size="small" @click="openConfirmReactivateDialog(item)">
                                  <v-icon color="success">mdi-account-check</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                      </template>
                    </v-data-table>
                </v-window-item>
              </v-window>
            </v-card-text>
        </v-card>
      </v-container>
      
      <!-- Reactivate Confirmation Dialog -->
      <v-dialog v-model="confirmReactivateDialog" max-width="500px" persistent>
        <v-card class="rounded-lg">
          <v-card-title class="text-h5">Confirm Reactivation</v-card-title>
          <v-card-text>Are you sure you want to reactivate the user "{{ userToProcess.customer_name }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeConfirmReactivateDialog">Cancel</v-btn>
            <v-btn color="success" variant="flat" @click="reactivateUserConfirm">Reactivate</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

       <v-dialog v-model="confirmDeactivateDialog" max-width="500px" persistent>
        <v-card class="rounded-lg">
          <v-card-title class="text-h5">Confirm Deactivation</v-card-title>
          <v-card-text>Are you sure you want to deactivate the user "{{ userToProcess.customer_name }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeConfirmDeactivateDialog">Cancel</v-btn>
            <v-btn color="error" variant="flat" @click="deactivateUserConfirm">Deactivate</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Add/Edit User Dialog -->
      <v-dialog v-model="userDialog" max-width="600px" persistent>
        <v-card class="rounded-lg">
          <v-card-title><span class="text-h5">{{ userFormTitle }}</span></v-card-title>
          <v-card-text>
            <v-container>
              <v-text-field v-model="editedUser.customer_name" label="Full Name" variant="outlined"></v-text-field>
              <v-text-field v-model="editedUser.username" label="Username" variant="outlined" :disabled="isEditMode"></v-text-field>
              <!-- Show password field only when adding a new user -->
              <v-text-field v-if="!isEditMode" v-model="editedUser.password" label="Password" type="password" variant="outlined"></v-text-field>
              <v-select v-model="editedUser.access_rights" :items="['Admin', 'User']" label="Access Rights" variant="outlined"></v-select>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeUserDialog">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="saveUser">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// --- STATE ---
const tab = ref('active');
const allAccounts = ref([]); // Single source of truth for all users
const userDialog = ref(false);
const confirmDeactivateDialog = ref(false);
const confirmReactivateDialog = ref(false);

const defaultUser = { customer_name: '', username: '', password: '', access_rights: 'User' };
const editedUser = ref({ ...defaultUser });
const userToProcess = ref({});

// --- COMPUTED PROPERTIES ---
const isEditMode = computed(() => !!editedUser.value.originalUsername); // Check if we are editing
const userFormTitle = computed(() => (isEditMode.value ? 'Edit User' : 'Add New User'));

// Automatically filter the master list into two separate lists for the tabs
const activeUsers = computed(() => allAccounts.value.filter(u => !u.deleted_date));
const deactivatedUsers = computed(() => allAccounts.value.filter(u => u.deleted_date));

// --- DATA TABLE HEADERS (updated keys) ---
const accountHeaders = [
  { title: 'Full Name', key: 'customer_name' },
  { title: 'Username', key: 'username' },
  { title: 'Role', key: 'access_rights' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

// --- API METHODS ---
const fetchAllAccounts = async () => {
    try {
        const { data } = await axios.get(`${API_BASE_URL}/accounts`);
        allAccounts.value = data;
    } catch (error) {
        console.error("Error fetching accounts:", error);
    }
};

const saveUser = async () => {
    try {
        if (isEditMode.value) {
            // Update existing user
            await axios.put(`${API_BASE_URL}/accounts/${editedUser.value.originalUsername}`, editedUser.value);
        } else {
            // Add new user
            await axios.post(`${API_BASE_URL}/accounts`, editedUser.value);
        }
        await fetchAllAccounts(); // Refresh the list
        closeUserDialog();
    } catch (error) {
        console.error("Error saving user:", error);
        alert(error.response?.data?.message || "An error occurred.");
    }
};

const deactivateUserConfirm = async () => {
  try {
    await axios.put(`${API_BASE_URL}/accounts/${userToProcess.value.username}/deactivate`);
    await fetchAllAccounts(); // Refresh
    closeConfirmDeactivateDialog();
  } catch (error) {
    console.error("Error deactivating user:", error);
  }
};

const reactivateUserConfirm = async () => {
  try {
    await axios.put(`${API_BASE_URL}/accounts/${userToProcess.value.username}/reactivate`);
    await fetchAllAccounts(); // Refresh
    closeConfirmReactivateDialog();
  } catch (error) {
    console.error("Error reactivating user:", error);
  }
};

// --- DIALOG & UI METHODS ---
const getRoleColor = (role) => (role === 'Admin' ? 'green' : 'blue');

const openAddUserDialog = () => {
  editedUser.value = { ...defaultUser };
  userDialog.value = true;
};

const openEditUserDialog = (user) => {
  // Store original username in case it's part of the primary key
  editedUser.value = { ...user, originalUsername: user.username };
  userDialog.value = true;
};

const closeUserDialog = () => {
    userDialog.value = false;
    editedUser.value = { ...defaultUser };
};

const openConfirmDeactivateDialog = (user) => {
  userToProcess.value = user;
  confirmDeactivateDialog.value = true;
};

const closeConfirmDeactivateDialog = () => {
    confirmDeactivateDialog.value = false;
    userToProcess.value = {};
};

const openConfirmReactivateDialog = (user) => {
  userToProcess.value = user;
  confirmReactivateDialog.value = true;
};

const closeConfirmReactivateDialog = () => {
    confirmReactivateDialog.value = false;
    userToProcess.value = {};
};

// --- LIFECYCLE HOOK ---
onMounted(() => {
    fetchAllAccounts();
});
</script>

<style scoped>
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.v-data-table {
  background-color: transparent !important;
}
.v-tab--selected {
  color: var(--v-theme-text) !important;
}
</style>