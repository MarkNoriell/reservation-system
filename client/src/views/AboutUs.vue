<template>
  <!-- Main container with a relative position to anchor the background image and overlay -->
  <v-container class="about-us-container" fluid>
    <!-- Background Image: Stretches to cover the entire container -->
    <v-img
      src="/images/Cute Yarn Background.jpeg"
      class="background-image"
      cover
    ></v-img>

    <!-- Changed justify="start" to align content to the left -->
    <v-row class="fill-height" align="center" justify="start">
      
      <!-- Column 1: Vertical "ABOUT US" Text -->
      <v-col cols="1" class="d-none d-md-flex justify-center align-center">
        <div class="vertical-text text-grey-lighten-2">
          ABOUT US
        </div>
      </v-col>

      <v-col cols="auto" class="d-none d-md-flex pa-0">
        <div class="divider-line"></div>
      </v-col>

      <!-- === KEY CHANGE: Increased md and lg values to make the column wider === -->
      <v-col cols="11" md="10" lg="8" class="content-column">
        
        <!-- Title Block: Aligned to the left -->
        <div class="text-left mb-10">
          <h1 class="title-cursive">Iluvmica</h1>
          <p class="subtitle-sans text-grey-lighten-2">HANDMADE CROCHET ITEMS</p>
        </div>
        
        <!-- Content Text -->
        <div class="content-text text-white">
          <p>
            Welcome to iluvmica crochet, a small handmade shop filled with love, creativity, and charm.
          </p>
          <p>
            What began as a simple hobby has grown into a passion for creating crochet pieces that bring warmth and joy to others. At iluvmica crochet, we make each item by hand with care and attention to detail. Whether it's a cozy accessory, a cute plushie, home decor, or a custom gift, every piece is made to make you smile.
          </p>
          <p>
            We believe in taking time to craft each product with love, rather than rushing through it. This is what makes handmade items special—they have a story, a heart, and a personal touch.
          </p>
          <p>
            Our goal is to offer you something meaningful, whether you're buying a gift for someone special or treating yourself to something cute and cozy. With iluvmica crochet, you're not just supporting a small business—you’re supporting creativity, patience, and the beauty of handmade work.
          </p>
          <p>
            Thank you for being here. We’re happy to share our creations with you, one stitch at a time.
          </p>
        </div>
      </v-col>

    </v-row>

  </v-container>
</template>

<script setup>
// No script logic is needed for this static layout
</script>

<style scoped>
/* Ensure you have added the Google Font link in your index.html */
.title-cursive {
  font-family: 'Great Vibes', cursive;
  font-size: 6rem;
  font-weight: normal;
  line-height: 1;
  color: #e798b3; /* Soft pink color */
  text-shadow: 
    -1px -1px 0 #c78299,  
     1px -1px 0 #c78299,
    -1px  1px 0 #c78299,
     1px  1px 0 #c78299;
}

.subtitle-sans {
  font-size: 0.9rem;
  letter-spacing: 0.2em; /* Wide letter spacing */
  /* === WIDENED GAP BETWEEN TITLE AND SUBTITLE === */
  margin-top: 1rem; 
  color: black !important;
}

.about-us-container {
  position: relative;
  min-height: 100vh; /* Make container take full viewport height */
  padding: 5rem 1rem;
  overflow: hidden;
  z-index: 1;
}

/* Overlay for readability */
.about-us-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* === MADE BACKGROUND LIGHTER by reducing overlay opacity === */
  z-index: -1; 
}

.vertical-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  white-space: nowrap;
  color: black !important;
}

.content-text p {
  margin-bottom: 1.5rem; /* Space between paragraphs */
  line-height: 1.7; /* Increased for better readability with larger font */
  /* === MADE FONT LARGER AND WIDER === */
  font-size: 1.15rem;
  letter-spacing: 0.05em;
  color: black;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2; 
  filter: blur(4px);
}

.divider-line {
  width: 1px;
  background-color: black; /* A light, semi-transparent white */
  height: 70vh; /* Adjust height as needed */
  max-height: 600px;
}

.content-column {
  padding-left: 3rem; /* Add space between the divider and the main content */
}


/* Responsive adjustments */
@media (max-width: 960px) {
  .title-cursive {
    font-size: 4rem;
  }
  .content-text p {
    font-size: 1rem; /* Slightly reduce font size on tablets */
  }
}
@media (max-width: 600px) {
  .title-cursive {
    font-size: 3rem;
  }
  .subtitle-sans {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
  }
  .vertical-text {
    display: none; /* Hide vertical text on very small screens */
  }
  /* On small screens, center the text again as it looks better */
  .text-left {
    text-align: center !important;
  }
}
</style>