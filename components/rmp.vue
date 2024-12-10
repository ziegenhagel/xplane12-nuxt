<template>
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

</template>
<script setup lang="ts">
import {selectAllOnFocus} from "~/composables/frontendFunctions";
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
</script>
