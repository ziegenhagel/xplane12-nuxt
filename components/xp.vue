<template>
  <div class="text-white text-xl">
    Doppeltippen zum Ausführen:
  </div>
  <div class="grid gap-1 grid-cols-5">
    <button v-for="button in buttons" @dblclick="command(button.command)"
            class="border-2 border-white bg-sky-500 text-xl text-white rounded py-1 flex items-center gap-1">
      <Icon :name="button.icon" v-if="button.icon" size="30"/>
      {{ button.title }}
    </button>
  </div>

  <div class="flex gap-1 justify-between mt-3">
    <button v-for="i in 10" @click="command(`sim/view/quick_look_${i - 1}`)"
            class="justify-center flex-col flex-1 bg-gray-700 text-3xl text-white rounded py-1 flex items-center">
      <div>{{ i }}</div>
      <div class="text-xs">{{ quickLooksNames[i - 1] }}</div>
    </button>
  </div>
  <div class="flex gap-1 justify-between mt-3">
    <button v-for="i in 10" @dblclick="command(`sim/view/quick_look_${i - 1}_mem`)"
            class="flex-1 justify-center bg-gray-600 text-xs text-white rounded py-1 flex items-center gap-1">
      Mem {{ i }}
    </button>
  </div>
</template>
<script setup>

const buttons = [
  {command: 'sim/operation/quick_start', title: 'ENG Q/s', icon: 'formkit:start'},
  {command: 'sim/operation/show_menu', title: 'Menubar', icon: 'mdi:menu-swap-outline'},
  {command: 'sim/operation/toggle_flight_config', title: 'Flight Config', icon: 'ic:sharp-bento'},
  // {command: 'sim/operation/toggle_main_menu', title: 'Main Menu', icon: 'material-symbols:arrow-menu-open'},
  {command: 'sim/operation/toggle_settings_window', title: 'Settings', icon: 'mynaui:config-vertical'},
  // {command: 'sim/operation/toggle_key_shortcuts_window', title: 'T Key Shortcuts Window'},
  {command: 'sim/operation/toggle_custom_location_window', title: 'Location', icon: 'mdi:map-marker'},
  // {command: 'sim/operation/open_failures_window', title: 'Failures', icon: 'mdi:alert-circle'},
  {command: 'sim/operation/open_weight_and_balance_window', title: 'Weight/BAL', icon: 'mdi:weight-kilogram'},


  /*
  sim/operation/atc_readback                         Readback last ATC message.

sim/operation/reset_flight                         Reset flight to most recent start.
sim/operation/go_to_default                        Reset flight to nearest airport.
sim/operation/reset_to_runway                      Reset flight to nearest runway.
sim/operation/go_next_runway                       Reset flight to next runway on current airport


sim/view/quick_look_0                              Go to save 3-D cockpit location #1.
sim/view/quick_look_1                              Go to save 3-D cockpit location #2.
sim/view/quick_look_2                              Go to save 3-D cockpit location #3.


sim/view/quick_look_0_mem                          Memorize 3-D cockpit location #1.
sim/view/quick_look_1_mem                          Memorize 3-D cockpit location #2.
sim/view/quick_look_2_mem                          Memorize 3-D cockpit location #3.

   */

  // {command: 'sim/operation/atc_readback', title: 'ATC Readback'},
  {command: 'sim/operation/reset_flight', title: 'Reset Flight', icon: 'mdi:restart'},
  {command: 'sim/operation/go_to_default', title: 'Go to Default', icon: 'tabler:building-airport'},
  {command: 'sim/operation/reset_to_runway', title: 'Reset to RWY', icon: 'streamline:street-road'},
  {command: 'sim/operation/go_next_runway', title: 'Next RWY', icon: 'mdi:arrow-right-bold'},
  {command: 'sim/operation/load_situation_1', title: 'Load Sit 1', icon: 'mdi:numeric-1-box'},
  {command: 'sim/operation/load_situation_2', title: 'Load Sit 2', icon: 'mdi:numeric-2-box'},
  {command: 'sim/operation/load_situation_3', title: 'Load Sit 3', icon: 'mdi:numeric-3-box'},

]
const {readDataref, writeDataref, command} = useXPlane()

// 10 sinnvolle kurze Namen für Quick Looks, zb "Cockpit", "Overhead", "FMC", "Radio", ...
const quickLooksNames = [
  'Forward', 'Overhead', 'FCU', 'MCDU', 'RMP/ACP', 'TCAS', 'E SWITCH', 'ECAM', 'PFD/ND', 'Center'
]
</script>
