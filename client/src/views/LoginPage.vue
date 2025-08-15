<template>
    <div class="centerParent">
        <v-card class="loginCard">
            <div class="loginCardElements">
                <div class="logoCard">
                    <v-img width="150px" src="/images/Logo3.png"></v-img> <!-- Corrected path for Vite -->
                </div>

                <!-- Alert for showing login errors -->
                <v-alert
                    v-if="errorMessage"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-4"
                    style="width: 80%;"
                >
                    {{ errorMessage }}
                </v-alert>

                <div style="width: 80%; display: flex; flex-direction: column; gap: 20px;">
                    <v-text-field 
                        v-model="loginCredentials.username" 
                        style="background-color: #ffe4e1;" 
                        hide-details="auto"
                        prepend-inner-icon="mdi-account" 
                        variant="outlined" 
                        placeholder="Username"
                        @keyup.enter="handleLogin()"
                    />
                    <v-text-field 
                        @keyup.enter="handleLogin()" 
                        v-model="loginCredentials.password" 
                        style="background-color: #ffe4e1;" 
                        hide-details="auto"
                        prepend-inner-icon="mdi-lock" 
                        variant="outlined" 
                        placeholder="Password"
                        type="password"
                    />
                </div>
                <div style="width: 80%;">
                    <v-btn 
                        @click="handleLogin()" 
                        style="background-color: #feefea !important;" 
                        block
                        :loading="isLoading"
                        :disabled="isLoading"
                    >
                        Login
                    </v-btn>
                </div>
            </div>
        </v-card>
    </div>
</template>

<script setup>
   import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { persistStore } from '@/stores/persistStore'; // Assuming this is your Pinia store

const router = useRouter();
const usePersistStore = persistStore();

const loginCredentials = ref({
    username: '',
    password: ''
});

// --- NEW STATE for better UX ---
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
    // 1. Reset state and start loading
    isLoading.value = true;
    errorMessage.value = '';

    try {
        // 2. Send credentials to the backend
        const response = await axios.post("http://localhost:3000/api/loginAccount", loginCredentials.value);

        // --- SUCCESSFUL LOGIN ---
        // The `try` block only continues if the server returns a 2xx status code.
        
        console.log("Login successful:", response.data.message);

        // 3. Save the USER DATA from the server, not the password. This is more secure.
        usePersistStore.saveLoginCredentials(response.data.user); 

        router.push("/dashboard");

        // 4. Redirect to the dashboard
        router.push("/dashboard");

    } catch (error) {
        // --- FAILED LOGIN ---
        // The `catch` block runs if the server returns a 4xx or 5xx error.
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx (e.g., 401 Unauthorized, 404 Not Found)
            console.error("Login failed:", error.response.data.message);
            errorMessage.value = error.response.data.message; // e.g., "Invalid credentials."
        } else if (error.request) {
            // The request was made but no response was received (e.g., server is down)
            console.error("No response from server:", error.request);
            errorMessage.value = "Cannot connect to the server. Please try again later.";
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', error.message);
            errorMessage.value = "An unexpected error occurred.";
        }
    } finally {
        // 5. Stop loading, whether the login succeeded or failed
        isLoading.value = false;
    }
};
</script>