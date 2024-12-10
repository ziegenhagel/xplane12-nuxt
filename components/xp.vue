<template>
  <div class="flex gap-1 flex-wrap">
    <button v-for="button in buttons" @click="command(button.command)"
            class="border-2 border-white bg-sky-500 text-white rounded py-0">
      {{ button.title }}
    </button>
  </div>

</template>
<script setup>

const buttons = [
  {command: 'sim/operation/quick_start', title: 'ENG Quickstart'},
  {command: 'sim/operation/show_menu', title: 'Menubar'},
  {command: 'sim/operation/toggle_flight_config', title: 'Flight Config'},
  {command: 'sim/operation/toggle_main_menu', title: 'Main Menu'},
  {command: 'sim/operation/toggle_settings_window', title: 'Settings'},
  // {command: 'sim/operation/toggle_key_shortcuts_window', title: 'T Key Shortcuts Window'},
  {command: 'sim/operation/toggle_custom_location_window', title: 'Location'},
  {command: 'sim/operation/open_failures_window', title: 'Failures'},
  {command: 'sim/operation/open_weight_and_balance_window', title: 'Weight/BAL'},


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

  {command: 'sim/operation/atc_readback', title: 'ATC Readback'},
  {command: 'sim/operation/reset_flight', title: 'Reset Flight'},
  {command: 'sim/operation/go_to_default', title: 'Go to Default'},
  {command: 'sim/operation/reset_to_runway', title: 'Reset to Runway'},
  {command: 'sim/operation/go_next_runway', title: 'Next Runway'},
  {command: 'sim/view/quick_look_0', title: 'Quick Look 1'},
  {command: 'sim/view/quick_look_1', title: 'Quick Look 2'},
  {command: 'sim/view/quick_look_2', title: 'Quick Look 3'},
  {command: 'sim/view/quick_look_0_mem', title: 'Mem Ql1'},
  {command: 'sim/view/quick_look_1_mem', title: 'Mem Ql2'},
  {command: 'sim/view/quick_look_2_mem', title: 'Mem Ql3'},

]
const {readDataref, writeDataref, command} = useXPlane()
</script>
