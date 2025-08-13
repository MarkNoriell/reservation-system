v<template>
  <v-container class="pa-4">
    <v-form @submit.prevent="submitImage">
      <v-file-input
        label="Select Image"
        accept="image/*"
        outlined
        dense
        v-model="selectedFile"
        :show-size="true"
      ></v-file-input>
      <v-btn type="submit" color="primary" class="mt-2">
        Upload
      </v-btn>
    </v-form>

    <v-img
      v-if="imageUrl"
      :src="imageUrl"
      alt="Uploaded Image"
      max-width="300"
      class="mt-4"
    ></v-img>

    <br />
    <hr />

    <v-row>
      <v-col
        v-for="img in images"
        :key="img.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-img
          :src="`http://localhost:3000/image/${img.id}`"
          :alt="`Image ${img.id}`"
          max-width="300"
          class="mb-4"
        ></v-img>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const selectedFile = ref(null);
const imageUrl = ref('');
const images = ref([]);

const submitImage = async () => {
  const file = Array.isArray(selectedFile.value)
    ? selectedFile.value[0]
    : selectedFile.value;

  if (!file) {
    console.warn('No file selected');
    return;
  }

  console.log(file,"file");
  

  const formData = new FormData();
  formData.append('image', file);
  console.log('FormData:', [...formData.entries()]); // Debug output

  try {
    const response = await axios.post('http://localhost:3000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const imageId = response.data.id || 1;
    console.log(imageId, 'image id');
    imageUrl.value = `http://localhost:3000/image/${imageId}`;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

const fetchAllImages = async () => {
  try {
    const response = await axios.get('http://localhost:3000/fetchAllImage');
    images.value = response.data;
    console.log(response, 'response');
  } catch (error) {
    console.error('Failed to fetch images:', error);
  }
};

onMounted(() => {
  fetchAllImages();
});
</script>
