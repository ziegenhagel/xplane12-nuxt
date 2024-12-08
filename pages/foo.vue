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

// general
const selectAllOnFocus = (event: FocusEvent) => {
  const input = event.target as HTMLInputElement
  input.select()
}
</script>

<template>
  <div>
    <div class="fcu">
      <div class="subpanel">
        <div>
          SPD
          <input type="number" @focus="selectAllOnFocus" v-model="fcu_speed" @change="setFcuSpeed"
                 style="width: 100px"/>
        </div>
        <div>
          HDG
          <input type="number" @focus="selectAllOnFocus" v-model="fcu_heading" @change="setFcuHeading"
                 style="width: 100px"/>
        </div>
      </div>
      <div class="subpanel">
        <div>
          ALT
          <input type="number" @focus="selectAllOnFocus" v-model="fcu_altitude" @change="setFcuAltitude"
                 style="width: 100px"/>
        </div>
        <div>
          VS
          <input type="number" @focus="selectAllOnFocus" v-model="fcu_vs" @change="setFcuVs" style="width: 100px"/>
        </div>
      </div>
    </div>
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
    @apply px-1 text-center
  }
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
