<template>
  <div class="flex gap-1 m-2">
    <button class="aspect-square bg-black w-16 uppercase border rounded-lg"
            v-for="btn in btns" :key="btn.label" @click="clearMaster(btn.command)"
            :class="{ 'active': btn.active}"
            :style="{color: btn.color}">
      <div class="flex justify-center items-center">{{ btn.label }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
const {readDataref, writeDataref, command} = useXPlane()
const btns = ref([
  {label: 'Master Caut', command: 'sim/annunciator/clear_master_caution', color: 'orange', active: false},
  {label: 'Master Warn', command: 'sim/annunciator/clear_master_warning', color: 'red', active: false},
  // {label: 'Master Acc', command: 'sim/annunciator/clear_master_accept', color: 'gray', active: false},
])


// read datarefs for sim/cockpit/warnings/master_caution_on
const reloadData = async () => {
  const {data: data1} = await readDataref('sim/cockpit/warnings/master_caution_on')
  const {data: data2} = await readDataref('sim/cockpit/warnings/master_warning_on')
  // const {data: data3} = await readDataref('sim/cockpit/warnings/master_accept_on')
  btns.value[0].active = data1
  btns.value[1].active = data2
  // btns.value[2].active = data3
}

// once every 3 seconds
if (typeof window !== 'undefined') {
  reloadData()
  setInterval(reloadData, 10000)
}

const clearMaster = async (which: string) => {
  await command(which)
  reloadData()
}
</script>
<style scoped>
.active div {
  animation: blink .5s infinite;
}

button:hover {
  animation: click .2s ease;
}

@keyframes click {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

button:not(.active) div {
  opacity: 0.25;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>
