<template>
  <v-app>
    <v-main style="background-color: var(--v-theme-background);">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Accounts</h1>

        <v-card class="rounded-lg" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex justify-end mb-4">
              <v-btn
                  color="primary"
                  variant="flat"
                  @click="openAddUserDialog"
                >
                <v-icon left>mdi-plus</v-icon>
                Add New User
              </v-btn>
            </div>
            <v-data-table
            :headers="accountHeaders"
            :items="users"
            items-per-page="5"
            class="elevation-0"
            >
            <template v-slot:item.role="{ item }">
            <v-chip :color="getRoleColor(item.role)" size="small">{{ item.role }}</v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
            <v-icon class="me-2" @click="openEditUserDialog(item)" color="grey-darken-1">mdi-pencil</v-icon>
            <v-icon @click="openConfirmDeactivateDialog(item)" color="error">mdi-account-off</v-icon>
            </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>

      <!-- Add/Edit User Dialog -->
      <v-dialog v-model="userDialog" max-width="600px" persistent>
        <v-card class="rounded-lg">
          <v-card-title class="pa-4"><span class="text-h5">{{ userFormTitle }}</span></v-card-title>
          <v-card-text>
            <v-container>
              <v-text-field v-model="editedUser.name" label="Full Name" variant="outlined"></v-text-field>
              <v-text-field v-model="editedUser.email" label="Email Address" variant="outlined"></v-text-field>
              <v-select v-model="editedUser.role" :items="['Admin', 'Staff']" label="Role" variant="outlined"></v-select>
            </v-container>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn text @click="closeUserDialog">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="saveUser">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

       <!-- Deactivate Confirmation Dialog -->
      <v-dialog v-model="confirmDeactivateDialog" max-width="500px">
        <v-card class="rounded-lg">
          <v-card-title class="text-h5">Confirm Deactivation</v-card-title>
          <v-card-text>Are you sure you want to deactivate the user "{{ userToDeactivate.name }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeConfirmDeactivateDialog">Cancel</v-btn>
            <v-btn color="error" variant="flat" @click="deactivateUserConfirm">Deactivate</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- MAIN STATE ---
const tab = ref('accounts');

// --- ACCOUNTS TAB STATE & LOGIC ---
const users = ref([
  { id: 1, name: 'Admin User', email: 'admin@preserve.com', role: 'Admin', lastLogin: '2025-08-04' },
  { id: 2, name: 'Staff Member One', email: 'staff1@preserve.com', role: 'Staff', lastLogin: '2025-08-03' },
  { id: 3, name: 'Staff Member Two', email: 'staff2@preserve.com', role: 'Staff', lastLogin: '2025-08-04' },
]);
const userDialog = ref(false);
const confirmDeactivateDialog = ref(false);
const editedUserIndex = ref(-1);
const defaultUser = { id: -1, name: '', email: '', role: 'Staff' };
const editedUser = ref({ ...defaultUser });
const userToDeactivate = ref({});

const accountHeaders = [
  { title: 'Full Name', key: 'name' },
  { title: 'Email Address', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Last Login', key: 'lastLogin' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const userFormTitle = computed(() => (editedUserIndex.value === -1 ? 'Add New User' : 'Edit User'));

const getRoleColor = (role) => (role === 'Admin' ? 'primary' : 'secondary-darken-1');

const openAddUserDialog = () => {
  editedUserIndex.value = -1;
  editedUser.value = { ...defaultUser };
  userDialog.value = true;
};

const openEditUserDialog = (user) => {
  editedUserIndex.value = users.value.findIndex(u => u.id === user.id);
  editedUser.value = { ...user };
  userDialog.value = true;
};

const openConfirmDeactivateDialog = (user) => {
  userToDeactivate.value = user;
  confirmDeactivateDialog.value = true;
};

const closeUserDialog = () => (userDialog.value = false);
const closeConfirmDeactivateDialog = () => (confirmDeactivateDialog.value = false);

const saveUser = () => {
  if (editedUserIndex.value > -1) {
    Object.assign(users.value[editedUserIndex.value], editedUser.value);
  } else {
    editedUser.value.id = Date.now();
    editedUser.value.lastLogin = 'Never';
    users.value.push({ ...editedUser.value });
  }
  closeUserDialog();
};

const deactivateUserConfirm = () => {
  const index = users.value.findIndex(u => u.id === userToDeactivate.value.id);
  users.value.splice(index, 1);
  closeConfirmDeactivateDialog();
};


// --- SYSTEM MAINTENANCE TAB STATE & LOGIC ---
const isClearingCache = ref(false);
const maintenanceSettings = ref({
  enabled: false,
  message: 'Our website is currently undergoing scheduled maintenance. We should be back shortly. Thank you for your patience.',
});

const clearCache = () => {
  isClearingCache.value = true;
  setTimeout(() => {
    isClearingCache.value = false;
    // Here you can show a success snackbar/toast
    alert('System cache has been cleared!');
  }, 1500);
};

const saveMaintenanceSettings = () => {
  // Logic to save settings to a backend or local storage
  console.log('Saving maintenance settings:', maintenanceSettings.value);
  alert('Maintenance settings saved!');
};
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