<template>
  DATAREFS
  <table>
    <tr>
      <th>dataref</th>
      <th>value</th>
    </tr>
    <tr v-for="dataref in datarefs" :key="dataref.dataref">
      <td>{{ dataref.dataref }}</td>
      <td>{{ dataref.data }}</td>
    </tr>
  </table>

  COMMANDS (click to command)
  <div class="flex gap-2">
    <button v-for="command in commands" :key="command" @click="commandClicked(command)">
      {{ command.split('/').pop() }}
    </button>
  </div>

  <div
      style="color: green; font-size: 1.5em; margin-top: 20px"
  >{{ message }}
  </div>

</template>
<script setup lang="ts">
const {readDataref, writeDataref, command} = useXPlane()
/*
NOT WORKING datarefs:
 [
    'sim/cockpit/electrical/strobe_lights_on',
    'sim/cockpit/electrical/nav_lights_on',
    'sim/cockpit/electrical/landing_lights_on',
    'sim/cockpit/electrical/taxi_light_on',
    'sim/cockpit2/switches/taxi_light_on',
    'sim/cockpit2/switches/spot_light_on',
    'sim/cockpit/electrical/cockpit_lights_on',
    'sim/cockpit/electrical/cockpit_lights',
  ]

 */

const datarefs = ref([])
const loadDatarefs = async () => {
  datarefs.value = []
  for (const dataref of working_datarefs) {
    const {data} = await readDataref(dataref)
    datarefs.value.push({dataref, data})
  }
}
loadDatarefs()

const working_datarefs = [
  'sim/cockpit/electrical/beacon_lights_on',
  'sim/cockpit/electrical/landing_lights_on',
]

/*
NOT WORKING commands:
  'sim/operation/rwy_lights_off',
  'sim/operation/rwy_lights_lo',
  'sim/operation/rwy_lights_med',
  'sim/operation/rwy_lights_hi',
  'sim/lights/nav_lights_on',
  'sim/lights/nav_lights_off',
  'sim/lights/nav_lights_toggle',
  'sim/lights/beacon_lights_toggle',
  'sim/lights/strobe_lights_on',
  'sim/lights/strobe_lights_off',
  'sim/lights/strobe_lights_toggle',
  'sim/lights/taxi_lights_on',
  'sim/lights/taxi_lights_off',
  'sim/lights/taxi_lights_toggle',
  'sim/lights/landing_lights_on',
  'sim/lights/landing_lights_off',
  'sim/lights/landing_lights_toggle',


  PLZ TEST:

sim/operation/rwy_lights_off                       Runway lights off.
sim/operation/rwy_lights_lo                        Runway lights lo.
sim/operation/rwy_lights_med                       Runway lights med.
sim/operation/rwy_lights_hi                        Runway lights hi.
 */

const commands = [
  'sim/lights/beacon_lights_toggle',
  'sim/lights/landing_lights_toggle',

    'sim/electrical/APU_start', // NOT WORKING
    'sim/electrical/APU_generator_on',
    'sim/electrical/APU_generator_off',
    'sim/electrical/APU_on',
    'sim/electrical/APU_off',
    'sim/bleed_air/apu_toggle', // bleed

]

const message = ref("")
const commandClicked = async (com: string) => {

  let oldValues = datarefs.value
  await command(com)
  // loadDatarefs()
  let newValues = datarefs.value
  // look if  any value has changed
  let msgConcat = ""
  for (let i = 0; i < oldValues.length; i++) {
    if (oldValues[i].data !== newValues[i].data) {
      msgConcat = oldValues[i].data + " -> " + newValues[i].data
    }
  }
  message.value = 'Commanded: ' + com + ': ' + msgConcat
}
</script>
