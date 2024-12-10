<script setup lang="ts">
import Mcdu from "~/pages/mcdu.vue";
import {selectAllOnFocus} from "~/composables/frontendFunctions";
import Fcu from "~/pages/fcu.vue";

const {readDataref, writeDataref, command} = useXPlane()

const com1_freq_hz = ref(0)
const com1_stdby_freq_hz = ref(0)

const {data} = await readDataref('sim/cockpit/radios/com1_freq_hz')
com1_freq_hz.value = data
const {data: data2} = await readDataref('sim/cockpit/radios/com1_stdby_freq_hz')
com1_stdby_freq_hz.value = data2

const new_com1_freq_hz = ref(com1_freq_hz.value)
const new_com1_stdby_freq_hz = ref(com1_stdby_freq_hz.value)

const setCom1Freq = async () => {
  com1_freq_hz.value = new_com1_freq_hz.value
  await writeDataref('sim/cockpit/radios/com1_freq_hz', new_com1_freq_hz.value)
}

const setCom1StdbyFreq = async () => {
  com1_stdby_freq_hz.value = new_com1_stdby_freq_hz.value
  await writeDataref('sim/cockpit/radios/com1_stdby_freq_hz', new_com1_stdby_freq_hz.value)
}

const switchCom1 = async () => {
  const tmp = com1_freq_hz.value
  com1_freq_hz.value = com1_stdby_freq_hz.value
  com1_stdby_freq_hz.value = tmp
  new_com1_freq_hz.value = com1_freq_hz.value
  new_com1_stdby_freq_hz.value = com1_stdby_freq_hz.value
  await writeDataref('sim/cockpit/radios/com1_freq_hz', com1_freq_hz.value)
  await writeDataref('sim/cockpit/radios/com1_stdby_freq_hz', com1_stdby_freq_hz.value)
}

// TCAS
const squawk = ref(0)
const {data: data7} = await readDataref('sim/cockpit/radios/transponder_code')
squawk.value = data7

const setSquawk = async () => {
  await writeDataref('sim/cockpit/radios/transponder_code', squawk.value)
}

// commands
const cmd = async (cmd: string) => {
  await command(cmd)
}
</script>

<template>
  <div>
    <fcu />
   <div class="rmp">
      <section>
        <div>ACTIVE</div>
        <input type="number" @focus="selectAllOnFocus" @change="setCom1Freq" min="11800" max="13600"
               v-model="new_com1_freq_hz"/>
      </section>
      <section>
        <button class="bg-black text-green-600 text-2xl mb-2 px-3 rounded" style="padding-bottom: 2px"
                @click="switchCom1"
        >&hArr;
        </button>
      </section>
      <section>
        <div>STDBY</div>
        <input type="number" @focus="selectAllOnFocus" @change="setCom1StdbyFreq" min="11800" max="13600"
               v-model="new_com1_stdby_freq_hz"/>
      </section>
    </div>

    <div class="tcas">
      <section>
        <div>SQUAWK</div>
        <input type="number" @focus="selectAllOnFocus" @change="setSquawk" min="0" max="7777" v-model="squawk"/>
      </section>
    </div>
  </div>

  <mcdu />
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
