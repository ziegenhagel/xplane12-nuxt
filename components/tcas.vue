<template>
  <div class="tcas">
    <section>
      <div>SQUAWK</div>
      <input type="number" @focus="selectAllOnFocus" @change="setSquawk" min="0" max="7777" v-model="squawk"/>
    </section>
  </div>
</template>
<script setup lang="ts">
import {selectAllOnFocus} from "~/composables/frontendFunctions";

const {readDataref, writeDataref, command} = useXPlane()

// TCAS
const squawk = ref(0)
const {data: data7} = await readDataref('sim/cockpit/radios/transponder_code')
squawk.value = data7

const setSquawk = async () => {
  await writeDataref('sim/cockpit/radios/transponder_code', squawk.value)
}
</script>
