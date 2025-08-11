<template>
    <div class="centerParent">
        <v-card class="loginCard">
            <div class="loginCardElements">
                <div class="logoCard">
                <v-img width="150px" src="../../public/images/Logo3.png"></v-img>
                </div>
                <div style="width: 80%; display: flex; flex-direction: column; gap: 20px;">
                    <v-text-field v-model="loginCredentials.username" style="background-color: #ffe4e1;" hide-details prepend-inner-icon="mdi-account" variant="outlined" placeholder="Username"/>
                    <v-text-field @keyup.enter="handleLogin()" v-model="loginCredentials.password" style="background-color: #ffe4e1;" hide-details prepend-inner-icon="mdi-lock" variant="outlined" placeholder="Password"/>
                </div>
                <div style="width: 80%;">
                    <v-btn @click="handleLogin()" style="background-color: #feefea !important;" block>Login</v-btn>
                </div>
            </div>
        </v-card>
    </div>
</template>

<script setup>
    import axios from 'axios'
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { persistStore } from '@/stores/persistStore'

    const router = useRouter()
    const usePersistStore = persistStore()

    let loginCredentials = ref({
        username: '',
        password: ''
    })

    const handleLogin = async () => {
        try {
            const { data: isAccountCorrect } = await axios.post("http://localhost:3000/api/loginAccount", loginCredentials.value)
            console.log(isAccountCorrect.response,"loginCredentials");

            if(isAccountCorrect.response.length > 0){
                usePersistStore.saveLoginCredentials(loginCredentials.value)
                router.push("/dashboard")
            }
            else{
                alert("Wrong username or password!")
            }

        } catch (error) {
            console.error("Something went wrong in logging account!", error);
        }
    }

</script>