<template>
  <v-app style="background-color: #FFF8F5;">
    <v-app-bar app color="transparent" flat class="px-md-12">
      <img src="../../public/images/Logo3.png" alt="PreServe logo" height="40" class="mr-3">
      <v-toolbar-title class="font-weight-bold text-h5" style="color: #5D4037;">
        PreServe
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn text class="text-capitalize" style="color: #5D4037;">Home</v-btn>
      <v-btn text class="text-capitalize" style="color: #5D4037;">Shop</v-btn>
      <v-btn text class="text-capitalize" style="color: #5D4037;">Reservation</v-btn>
      <v-btn text class="text-capitalize" style="color: #5D4037;">About</v-btn>
      <v-btn text class="text-capitalize" style="color: #5D4037;">Contact</v-btn>

    </v-app-bar>

    <v-main>
      <v-container class="py-12">
        <v-row align="center" justify="center" class="bg-pink-lighten-5 rounded-xl pa-12">
          <v-col cols="12" md="4">
            <v-img src="../../public/images/bear crochet.png" alt="Crochet Bear Keychain" contain height="250"></v-img>
          </v-col>
          <v-col cols="12" md="6">
            <h1 class="text-h4 text-md-h3 font-weight-bold mb-4" style="color: #5D4037; line-height: 1.4;">
              PreServe: A Web-Based Order Reservation and Management System for Iluvmica Crochet Cavite City
            </h1>
            <v-btn outlined large color="#D8A798" class="text-capitalize" style="border-width: 2px;">
              Shop Now
            </v-btn>
          </v-col>
        </v-row>

        <div class="mt-16">
          <h2 class="text-h4 font-weight-bold mb-8" style="color: #5D4037;">Shop</h2>
          <v-row>
            <v-col
              v-for="product in products"
              :key="product.name"
              cols="12"
              sm="6"
              md="3"
            >
              <v-card class="text-center" flat style="background-color: transparent;">
                <v-card class="d-inline-block pa-2" flat rounded="lg">
                    <v-img :src="product.image" :alt="product.name" height="180" width="180"></v-img>
                </v-card>
                <v-card-text>
                  <div class="text-h6 font-weight-medium" style="color: #5D4037;">{{ product.name }}</div>
                  <div class="font-weight-regular my-1" style="color: #5D4037;">P {{ product.price.toFixed(2) }}</div>
                  <div class="text-body-2" :class="product.inStock ? 'text-green-darken-1' : 'text-orange-darken-1'">{{ product.status }}</div>
                  <div class="text-body-2" style="color: #795548;">{{ product.orderType }}</div>
                  <v-btn outlined rounded color="#D8A798" class="mt-4 text-capitalize" style="border-width: 2px;">
                    Reserve
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const products = ref([
  {
    name: 'Bear Keychain',
    price: 150.00,
    status: 'In Stock',
    orderType: 'Information on Stocks',
    image: '../../public/images/bear crochet.png',
    inStock: true,
  },
  {
    name: 'Duck Plushie',
    price: 350.00,
    status: 'Made-to-Order',
    orderType: 'Made-Order',
    image: '../../public/images/duck.png',
    inStock: false,
  },
  {
    name: 'Anime Character',
    price: 500.00,
    status: 'In Stock',
    orderType: 'Allme-cton',
    image: '../../public/images/anime.jpeg',
    inStock: true,
  },
  {
    name: 'Flower Coaster',
    price: 120.00,
    status: 'Made-to-Order',
    orderType: 'Made-to-Order',
    image: '../../public/images/flower.png',
    inStock: false,
  }
]);
</script>

<style scoped>
/* You can add any additional custom styles here */
.bg-pink-lighten-5 {
  background-color: #FFF1EE !important;
}
</style>