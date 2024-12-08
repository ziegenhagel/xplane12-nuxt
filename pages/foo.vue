<script setup lang="ts">
const {readDataref, writeDataref} = useXPlane()
// await writeDataref('sim/cockpit/radios/com1_freq_hz', 11922)

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

<template>
  <div>
    <h1>X-Plane Datarefs</h1>

    <table>
      <tr>
        <td>COM1</td>
        <td></td>
        <td>STDBY</td>
      </tr>
      <tr>
        <td>
          <code>{{ com1_freq_hz }}</code>
        </td>
        <td>
          <button @click="switchCom1"><-></button>
        </td>
        <td>
          <code>{{ com1_stdby_freq_hz }}</code>
        </td>
      </tr>

      <tr>
        <td><input type="number" @change="setCom1Freq"
                   min="11800" max="13600" v-model="new_com1_freq_hz"/></td>
        <td></td>
        <td><input type="number" min="11800" max="13600" @change="setCom1StdbyFreq" v-model="new_com1_stdby_freq_hz"/>
        </td>
      </tr>

    </table>

    <hr/>

  </div>
</template>
<style>
@font-face {
  font-family: "7seg";
  src: url("/fonts/7seg.ttf");
}

code, input {
  font-family: "7seg";
  font-size: 2em;
  color: orange;
  width: 100%;
  box-sizing: border-box;
  background: #222;
  border: 2px solid #444;
  padding: 0.2em 0.5em;
  display: block;
}

body {
  background: #333;
}
</style>
