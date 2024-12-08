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

/// FCU
const fcu_altitude = ref(0)
const fcu_heading = ref(0)
const fcu_speed = ref(0)
const fcu_vs = ref(0)

const {data: data3} = await readDataref('sim/cockpit/autopilot/altitude')
fcu_altitude.value = data3
const {data: data4} = await readDataref('sim/cockpit/autopilot/heading_mag')
fcu_heading.value = data4
const {data: data5} = await readDataref('sim/cockpit/autopilot/airspeed')
fcu_speed.value = data5
const {data: data6} = await readDataref('sim/cockpit/autopilot/vertical_velocity')
fcu_vs.value = data6

const setFcuAltitude = async () => {
  await writeDataref('sim/cockpit/autopilot/altitude', fcu_altitude.value)
}
const setFcuHeading = async () => {
  await writeDataref('sim/cockpit/autopilot/heading_mag', fcu_heading.value)
}
const setFcuSpeed = async () => {
  await writeDataref('sim/cockpit/autopilot/airspeed', fcu_speed.value)
}
const setFcuVs = async () => {
  await writeDataref('sim/cockpit/autopilot/vertical_velocity', fcu_vs.value)
}

</script>

<template>
  <div>
    <h1>FCU</h1>
    <div class="flex">
      SPD
      <input type="number" v-model="fcu_speed" @change="setFcuSpeed" style="width: 100px"/>

      HDG
      <input type="number" v-model="fcu_heading" @change="setFcuHeading" style="width: 100px"/>

      ALT
      <input type="number" v-model="fcu_altitude" @change="setFcuAltitude" style="width: 100px"/>

      VS
      <input type="number" v-model="fcu_vs" @change="setFcuVs" style="width: 100px"/>
    </div>

    <hr/>
    <h1>RMP</h1>
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

.flex {
  display: flex;
  align-items: center;
  gap: .5em;
}

.flex input {
  margin-right: 1em;
  flex: 1;
}
</style>
