<template>
    <div class="centerParent">
        <v-card class="loginCard">
            <div class="loginCardElements">
                <div class="logoCard">
                <v-img width="150px" src="../../public/images/Logo3.png"></v-img>
                </div>
                <div style="width: 80%; display: flex; flex-direction: column; gap: 20px;">
                    <v-text-field style="background-color: #ffe4e1;" hide-details prepend-inner-icon="mdi-account" variant="outlined" placeholder="Username"/>
                    <v-text-field style="background-color: #ffe4e1;" hide-details prepend-inner-icon="mdi-lock" variant="outlined" placeholder="Password"/>
                </div>
                <div style="width: 80%;">
                    <v-btn style="background-color: #feefea !important;" block>Login</v-btn>
                </div>
            </div>
        </v-card>
    </div>
</template>

<script setup>
</script>