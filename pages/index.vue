<template>
  <div class="flex">
    <div>
      <fcu/>
      <rmp/>
      <tcas/>
    </div>
    <mcdu/>
  </div>
</template>
<style>

@font-face {
  font-family: "7seg";
  src: url("/fonts/7seg.ttf");
}

.fcu {
  @apply flex gap-2 p-2
}

.subpanel {
  @apply flex bg-black rounded-lg overflow-hidden px-2 border border-gray-500 border-2 border-b-gray-300
}

.rmp {
  @apply flex gap-2 p-2 items-end text-white;

  input {
    @apply px-2 text-center
  }
}

.tcas {
  @apply text-white px-2;

  input {
    @apply text-white px-3
  }
}

button {
  @apply bg-black text-white p-2 rounded-lg
}

code, input {
  font-family: "7seg";
  font-size: 2em;
  color: orange;
  box-sizing: border-box;
  display: block;
  background: black;
}

body {
  background: #6D87A1;
  font-family: sans-serif;
}

.fcu {
  display: flex;
  align-items: center;
  gap: .5em;

  div {
    color: orange;
  }
}
</style>
<script setup lang="ts">
</script>
