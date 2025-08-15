<template>
    <div class="centerParent">
        <v-card class="loginCard">
            <div class="loginCardElements">
                <div class="logoCard">
                    <v-img width="150px" src="/images/Logo3.png"></v-img>
                </div>

                <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mb-4" style="width: 80%;">
                    {{ errorMessage }}
                </v-alert>

                <div style="width: 80%; display: flex; flex-direction: column; gap: 20px;">
                    <v-text-field 
                        v-model="loginCredentials.username" 
                        label="Username"
                        hide-details="auto"
                        prepend-inner-icon="mdi-account" 
                        variant="outlined"
                        @keyup.enter="handleLogin()"
                    />
                    <v-text-field 
                        v-model="loginCredentials.password" 
                        label="Password"
                        hide-details="auto"
                        prepend-inner-icon="mdi-lock" 
                        variant="outlined" 
                        type="password"
                        @keyup.enter="handleLogin()"
                    />
                </div>
                <div style="width: 80%;" class="d-flex flex-column ga-2">
                    <v-btn 
                        @click="handleLogin()" 
                        color="primary"
                        variant="flat"
                        block
                        :loading="isLoading"
                        :disabled="isLoading"
                    >
                        Login
                    </v-btn>
                    <!-- NEW: Register Text Button -->
                    <v-btn 
                        @click="openRegisterDialog"
                        variant="text" 
                        class="text-capitalize"
                    >
                        Don't have an account? Register
                    </v-btn>
                </div>
            </div>
        </v-card>
    </div>

    <!-- --- NEW: Register Dialog --- -->
    <v-dialog v-model="isRegisterDialogVisible" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title>
          <span class="text-h5 font-weight-bold">Create an Account</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="registerForm">
            <v-text-field
              v-model="registerDetails.customer_name"
              label="Full Name"
              variant="outlined"
              :rules="validation.required"
            ></v-text-field>
            
            <v-text-field
              v-model="registerDetails.username"
              label="Username"
              variant="outlined"
              :rules="validation.required"
            ></v-text-field>
            
            <v-text-field
              v-model="registerDetails.password"
              label="Password"
              type="password"
              variant="outlined"
              :rules="validation.required"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeRegisterDialog">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="handleRegister" :loading="isRegistering">Register</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for success message -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { persistStore } from '@/stores/persistStore';

const router = useRouter();
const usePersistStore = persistStore();
const API_BASE_URL = 'http://localhost:3000/api';

// --- LOGIN STATE ---
const loginCredentials = ref({ username: '', password: '' });
const isLoading = ref(false);
const errorMessage = ref('');

// --- REGISTER STATE (NEW) ---
const isRegisterDialogVisible = ref(false);
const isRegistering = ref(false);
const registerForm = ref(null);
const registerDetails = ref({
    customer_name: '',
    username: '',
    password: '',
    access_rights: 'User' // Default all new sign-ups to 'User'
});

// --- UI STATE (NEW) ---
const snackbar = ref({ show: false, text: '', color: 'success' });

// --- VALIDATION RULES (NEW) ---
const validation = {
    required: [v => !!v || 'This field is required.'],
};


// --- LOGIN LOGIC (with redirection) ---
const handleLogin = async () => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        const response = await axios.post(`${API_BASE_URL}/loginAccount`, loginCredentials.value);
        
        console.log("Login successful:", response.data.message);

        const user = response.data.user;
        usePersistStore.saveLoginCredentials(user);

        // --- ROLE-BASED REDIRECTION ---
        if (user.access_rights === 'Admin') {
            router.push("/dashboard");
        } else {
            router.push("/"); // Redirect regular users to the homepage
        }

    } catch (error) {
        if (error.response) {
            errorMessage.value = error.response.data.message;
        } else {
            errorMessage.value = "Cannot connect to the server.";
        }
        console.error("Login failed:", errorMessage.value);
    } finally {
        isLoading.value = false;
    }
};

// --- REGISTER LOGIC (NEW) ---
const openRegisterDialog = () => {
    isRegisterDialogVisible.value = true;
};

const closeRegisterDialog = () => {
    isRegisterDialogVisible.value = false;
    registerDetails.value = { customer_name: '', username: '', password: '', access_rights: 'User' };
    if (registerForm.value) registerForm.value.resetValidation();
};

const handleRegister = async () => {
    const { valid } = await registerForm.value.validate();
    if (!valid) return;

    isRegistering.value = true;
    try {
        // We use the existing 'add account' endpoint from the admin module
        await axios.post(`${API_BASE_URL}/accounts`, registerDetails.value);
        
        closeRegisterDialog();
        snackbar.value = { show: true, text: 'Registration successful! You can now log in.', color: 'success' };

    } catch (error) {
        if (error.response) {
            snackbar.value = { show: true, text: error.response.data.message, color: 'error' };
        } else {
            snackbar.value = { show: true, text: 'An error occurred during registration.', color: 'error' };
        }
    } finally {
        isRegistering.value = false;
    }
};
</script>