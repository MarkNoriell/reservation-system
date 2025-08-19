<template>
    <!-- Root container to center the login card on the page -->
    <div class="login-background">
        
        <!-- Login Card with two horizontal sections -->
        <v-card class="login-card" elevation="10">
            
            <!-- Left Section: Sign-In Form -->
            <div class="form-section">
                <h1 class="text-h4 font-weight-bold mb-8">Sign In</h1>
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Username Input -->
                    <label class="input-label">USERNAME</label>
                    <v-text-field 
                        v-model="loginCredentials.username" 
                        placeholder="Username"
                        density="compact"
                        variant="solo"
                        hide-details
                        rounded
                        @keyup.enter="handleLogin()"
                    />
    
                    <!-- Password Input -->
                    <label class="input-label">PASSWORD</label>
                    <v-text-field 
                        v-model="loginCredentials.password" 
                        placeholder="Password"
                        density="compact"
                        variant="solo" 
                        :type="isPasswordVisible ? 'text' : 'password'"
                        :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                        hide-details
                        rounded
                        @keyup.enter="handleLogin()"
                    />
    
                    <!-- Sign In Button -->
                    <v-btn 
                        @click="handleLogin()" 
                        color="#E97072"
                        class="sign-in-btn"
                        :loading="isLoading"
                        :disabled="isLoading"
                    >
                        Sign In
                    </v-btn>
                </div>
            </div>

            <!-- Right Section: Welcome & Sign Up -->
            <div class="welcome-section">
                <div class="welcome-content">
                    <!-- LOGO ADDED HERE -->
                    <v-img src="/images/Logo3.png" width="150" class="mb-6"></v-img>
                    
                    <!-- TEXT CHANGED HERE -->
                    <h2 class="text-h4 font-weight-bold mb-2">ILUVMICA CROCHET</h2>
                    <p class="mb-6">Don't have an account?</p>
                    <v-btn 
                        @click="openRegisterDialog"
                        variant="flat" 
                        color="#E97072"
                        class="sign-up-btn"
                        rounded
                    >
                        Sign Up
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

    <!-- Snackbar for success and error messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top end">
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
const isPasswordVisible = ref(false); // State for password visibility

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
        // --- THIS IS THE FIX ---
        // Show error toast on login failure
        if (error.response) {
            snackbar.value = { show: true, text: error.response.data.message, color: 'error' };
        } else {
            snackbar.value = { show: true, text: "Cannot connect to the server.", color: 'error' };
        }
        console.error("Login failed:", snackbar.value.text);
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

<style scoped>
/* Main container to center everything */
.login-background {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #feefea; /* CHANGED */
}

/* The main login card */
.login-card {
  display: flex;
  flex-direction: row;
  width: 900px; /* Adjust width as needed */
  height: 550px; /* Adjust height as needed */
  border-radius: 12px !important;
  overflow: hidden; /* Ensures child elements conform to the rounded corners */
}

/* Left side of the card with the form */
.form-section {
  flex: 1.2; /* Takes slightly more space than the welcome section */
  background-color: #FFFFFF;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Right side of the card with welcome message */
.welcome-section {
  flex: 1;
  background-color: #feefea; /* CHANGED */
  color: #5D4037; /* CHANGED to a dark text color for readability */
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Styling for input labels */
.input-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #616161;
  margin-bottom: 4px;
}

/* --- FIX FOR INPUT FIELD SIZE --- */
:deep(.v-text-field .v-field) {
  background-color: #F5F5F5 !important;
  box-shadow: none !important;
  height: 48px; /* Set a fixed smaller height */
}

/* Main "Sign In" button */
.sign-in-btn {
  height: 50px !important;
  color: white;
  font-weight: bold;
  text-transform: none;
  font-size: 1rem;
  border-radius: 25px !important;
}

/* "Sign Up" button on the right panel */
.sign-up-btn {
  height: 50px !important;
  width: 150px;
  color: white !important; /* Text color is white */
  font-weight: bold;
  text-transform: none;
  font-size: 1rem;
}
</style>