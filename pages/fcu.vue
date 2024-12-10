<template>
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

</template>
<script setup>
import {selectAllOnFocus} from "~/composables/frontendFunctions.ts";
const {readDataref, writeDataref, command} = useXPlane()

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
