<template>
  <v-app>
    <v-main style="background-color: var(--v-theme-background);">
      <v-container fluid>
        <h1 class="text-h4 font-weight-bold mb-6" style="color: var(--v-theme-text);">Accounts</h1>

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
                        <v-btn
                            color="primary"
                            variant="flat"
                            @click="openAddUserDialog"
                            prepend-icon="mdi-plus"
                        >
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
                        <v-tooltip text="Edit User">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" class="me-2" @click="openEditUserDialog(item)" color="grey-darken-1">mdi-pencil</v-icon>
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
                      class="elevation-0"
                      no-data-text="No deactivated accounts found."
                    >
                      <template v-slot:item.role="{ item }">
                        <v-chip :color="getRoleColor(item.role)" size="small" variant="outlined">{{ item.role }}</v-chip>
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
      <v-dialog v-model="confirmDeactivateDialog" max-width="500px" persistent>
        <v-card class="rounded-lg">
          <v-card-title class="text-h5">Confirm Deactivation</v-card-title>
          <v-card-text>Are you sure you want to deactivate the user "{{ userToProcess.name }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeConfirmDeactivateDialog">Cancel</v-btn>
            <v-btn color="error" variant="flat" @click="deactivateUserConfirm">Deactivate</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
       <!-- Reactivate Confirmation Dialog -->
      <v-dialog v-model="confirmReactivateDialog" max-width="500px" persistent>
        <v-card class="rounded-lg">
          <v-card-title class="text-h5">Confirm Reactivation</v-card-title>
          <v-card-text>Are you sure you want to reactivate the user "{{ userToProcess.name }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeConfirmReactivateDialog">Cancel</v-btn>
            <v-btn color="success" variant="flat" @click="reactivateUserConfirm">Reactivate</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- STATE ---
const tab = ref('active');
const users = ref([
  { id: 1, name: 'Admin User', email: 'admin@preserve.com', role: 'Admin' },
  { id: 2, name: 'Staff Member One', email: 'staff1@preserve.com', role: 'Staff' },
  { id: 3, name: 'Staff Member Two', email: 'staff2@preserve.com', role: 'Staff' },
]);
const deactivatedUsers = ref([]);
const userDialog = ref(false);
const confirmDeactivateDialog = ref(false);
const confirmReactivateDialog = ref(false);
const editedUserIndex = ref(-1);
const defaultUser = { id: -1, name: '', email: '', role: 'Staff' };
const editedUser = ref({ ...defaultUser });
const userToProcess = ref({}); // Used for both deactivation and reactivation

// --- HEADERS ---
const accountHeaders = [
  { title: 'Full Name', key: 'name' },
  { title: 'Email Address', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

// --- COMPUTED ---
const userFormTitle = computed(() => (editedUserIndex.value === -1 ? 'Add New User' : 'Edit User'));

// --- METHODS ---
const getRoleColor = (role) => (role === 'Admin' ? 'green' : 'blue');

// Add/Edit User Dialog
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

const closeUserDialog = () => (userDialog.value = false);

const saveUser = () => {
  if (editedUserIndex.value > -1) {
    Object.assign(users.value[editedUserIndex.value], editedUser.value);
  } else {
    users.value.push({ ...editedUser.value, id: Date.now() });
  }
  closeUserDialog();
};


// Deactivation Dialog
const openConfirmDeactivateDialog = (user) => {
  userToProcess.value = user;
  confirmDeactivateDialog.value = true;
};

const closeConfirmDeactivateDialog = () => {
    confirmDeactivateDialog.value = false;
    userToProcess.value = {};
};

const deactivateUserConfirm = () => {
  const index = users.value.findIndex(u => u.id === userToProcess.value.id);
  if (index > -1) {
    deactivatedUsers.value.push(users.value[index]);
    users.value.splice(index, 1);
  }
  closeConfirmDeactivateDialog();
};

// Reactivation Dialog
const openConfirmReactivateDialog = (user) => {
  userToProcess.value = user;
  confirmReactivateDialog.value = true;
};

const closeConfirmReactivateDialog = () => {
    confirmReactivateDialog.value = false;
    userToProcess.value = {};
};

const reactivateUserConfirm = () => {
  const index = deactivatedUsers.value.findIndex(u => u.id === userToProcess.value.id);
  if (index > -1) {
    users.value.push(deactivatedUsers.value[index]);
    deactivatedUsers.value.splice(index, 1);
  }
  closeConfirmReactivateDialog();
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