<template>
  <div class="flex items-center justify-center h-screen">
    <div class="fms" style="width: 27em">
      <div class="fms-top">

        <div class="fms-display">
          <div class="lsks">
            <button v-for="(line, index) in [1, 2, 3, 4, 5, 6]" class="lsk" @click="lsk(line,'l')">-</button>
          </div>
          <div class="lines">
            <div v-for="(line, index) in displayLines" :key="index" class="fms-line">
              <template v-for="(char, charIndex) in line.chars" :key="charIndex">
        <span
            :style="getCharacterStyle(char.style)"
            :title="char.style"
            class="fms-char"
        >{{ char.text }}</span>
              </template>
            </div>
          </div>
          <div class="lsks">
            <button v-for="(line, index) in [1, 2, 3, 4, 5, 6]" class="lsk" @click="lsk(line,'r')">-</button>
          </div>
        </div>
      </div>

      <div class="fms-keys">
        <div class="lg grid grid-cols-6">
          <button v-for="(key,cmd) in FMS_KEYS.controlKeys" @click="fmsclick(cmd)">{{ key }}</button>
        </div>
      </div>

    </div>
    <img width="400" src="/mcdu.jpeg" alt="MCDU"/>
  </div>
  <button @click="updateFmsData">Update</button>
</template>

<script setup>
import {ref, computed} from 'vue'

const {readDataref, command} = useXPlane()
const rawTextLines = ref(Array(16).fill(''))
const rawStyleLines = ref(Array(16).fill(''))

// UTF-8 Decoder Funktion
function utf8Decode(bytes) {
  const chars = []
  let i = 0

  while (i < bytes.length) {
    let char = ''
    const firstByte = bytes.charCodeAt(i)

    // Standard ASCII
    if (firstByte < 0x80) {
      char = String.fromCharCode(firstByte)
      i += 1
    }
    // 2-Byte Sequenz
    else if ((firstByte & 0xE0) === 0xC0) {
      if (i + 1 < bytes.length) {
        const secondByte = bytes.charCodeAt(i + 1)
        const codePoint = ((firstByte & 0x1F) << 6) | (secondByte & 0x3F)
        char = String.fromCodePoint(codePoint)
        i += 2
      } else {
        char = '?'
        i += 1
      }
    }
    // 3-Byte Sequenz
    else if ((firstByte & 0xF0) === 0xE0) {
      if (i + 2 < bytes.length) {
        const secondByte = bytes.charCodeAt(i + 1)
        const thirdByte = bytes.charCodeAt(i + 2)
        const codePoint = ((firstByte & 0x0F) << 12) |
            ((secondByte & 0x3F) << 6) |
            (thirdByte & 0x3F)
        char = String.fromCodePoint(codePoint)
        i += 3
      } else {
        char = '?'
        i += 1
      }
    }
    // Ungültige Sequenz
    else {
      char = '?'
      i += 1
    }

    chars.push(char)
  }

  return chars
}

const getCharacterStyle = (styleCode) => {
  const styles = {
    backgroundColor: '#000',
    color: '#fff'  // Default: weiß
  }

  styles.id = styleCode

  switch (Number(styleCode)) {
    case 0:
      styles.color = '#FFFFFF' // weiß
      break
    case 1:
      styles.color = 'cyan' // cyan
      styles.fontSize = '0.75em'
      break
    case 4:
      styles.color = '#90EE90' // hellgrün
      break
    case 7:
      styles.color = '#FFFFFF' // weiß
      styles.fontSize = '0.75em'
      break
    case 9:
      styles.color = '#FF0000' // rot
      break
    case 129:
      styles.color = 'cyan' // cyan
      break
    case 134:
      styles.color = 'orange' // orange
      break
    case 131:
      styles.color = 'yellow' // gelb
      break
    case 3:
      styles.color = 'yellow' // gelb
      styles.fontSize = '0.75em'
      break
    case 6:
      styles.color = 'orange'
      styles.fontSize = '0.75em'
      break
    default:
      styles.color = '#FFFFFF'
  }

  return styles
}

const displayLines = computed(() => {
  return rawTextLines.value.map((text, lineIndex) => {
    const decodedText = atob(text)
    const decodedStyle = atob(rawStyleLines.value[lineIndex])

    // UTF-8 Dekodierung durchführen
    const chars = utf8Decode(decodedText).map((char, index) => ({
      text: char,
      style: decodedStyle.charCodeAt(index) || 0
    }))

    return {chars}
  })
})

const updateFmsData = async () => {
  try {
    const textPromises = Array.from({length: 16}, (_, i) =>
        readDataref(`sim/cockpit2/radios/indicators/fms_cdu1_text_line${i}`)
    )

    const stylePromises = Array.from({length: 16}, (_, i) =>
        readDataref(`sim/cockpit2/radios/indicators/fms_cdu1_style_line${i}`)
    )

    const [textResults, styleResults] = await Promise.all([
      Promise.all(textPromises),
      Promise.all(stylePromises)
    ])

    rawTextLines.value = textResults.map(result => result.data)
    rawStyleLines.value = styleResults.map(result => result.data)
  } catch (error) {
    console.error('Error updating FMS data:', error)
  }
}

let updateInterval
onMounted(() => {
  updateFmsData()
  updateInterval = setInterval(updateFmsData, 60000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

const lsk = async (line, side) => {
  await command(`sim/FMS/ls_${line}${side}`)
  await updateFmsData()
}

const FMS_KEYS = {
  // Navigation-related keys
  // navKeys: [
  //   'index',
  //   'foln',
  //   'grz',
  //   'des',
  //   'dir intc',
  //   'legs',
  //   'delaarr',
  //   'fix',
  //   'navrad',
  //   'airport'
  // ],

  // Control and execution keys
  controlKeys: {
    'dir_intc': 'DIR',
    'prog': 'PROG',
    'perf': 'PERF',
    'index': 'INIT',
    'data': 'DATA',
    '_0': '',
    'airport': 'F-PLN',
    'navrad': 'NAV RAD',
    'fuel_pred': 'FUEL',
    'sec_fpln': 'SEC F-PLN',
    '_3': 'ATC COMM',
    '_1': 'MCDU MENU',
  },
  navigationKeys: {
    'airport ': 'AIR PORT',
    '_2': ''
  },

  // Performance and data keys
  performanceKeys: [
    'perf',
    'fuel pred',
    'data'
  ],

  // Numeric keys
  numericKeys: [
    'key_0',
    'key_1',
    'key_?',
    'key_3',
    'key_4',
    'key_5',
    'key_6',
    'key_7',
    'key_8',
    'key_9'
  ],

  // Alphabetic keys
  alphabeticKeys: [
    'key_A',
    'key_B',
    'key_C',
    'key_D',
    'key_E',
    'key_F',
    'key_G',
    'key_H',
    'key_I',
    'key_J',
    'key_K',
    'key_L',
    'key_M',
    'key_N',
    'key_o',
    'key_P',
    'Key_Q',
    'key_R',
    'key_S',
    'key_T',
    'key_u',
    'key_V',
    'key_W',
    'key_X',
    'key_Y',
    'key_Z'
  ],

  // Special characters and control keys
  specialKeys: [
    'key_period',
    'key_minus',
    'key_slash',
    'key_back',
    'key_space',
    'key_delete',
    'key_clear',
    'key_overfly'
  ]
};


const fmsclick = async (key) => {
  await command(`sim/FMS/${key}`)
  await updateFmsData()
}
</script>

<style scoped>
.fms-display {
  padding: 2.9rem .4rem 0;
  font-family: monospace;
  font-size: 1.5em;
  @apply flex gap-4;

  .lines {
    @apply bg-black border border-gray-500 border-2 border-b-gray-300 rounded-lg p-2;
  }
}

.fms-top {
  background: url('/fms-top.png') no-repeat top center;
  background-size: 100%;
}

.fms-line {
  white-space: pre;
  line-height: 1.02;
}

.fms-char {
  display: inline-block;
  width: 1ch;
  text-align: center;
}

.lsks {
  @apply flex flex-col;
  margin-top: 2.35em;
  gap: .8em;

  .lsk {
    @apply px-4 h-6 flex items-center justify-center bg-black text-white rounded;
    background: #343434;
    background: url('/fms-lsk.png') no-repeat center center;
    background-size: 100% 100%;
  }
}

.fms-keys {
  .lg {
    button {
      @apply text-sm h-10 leading-3;
      padding-top: 10px;
    }
  }

  button {
    background: url('/fms-key.png') no-repeat center center;
    background-size: 100% 100%;
    color: #FFFDFA;
    text-shadow: 0 0 5px orangered;
  }
}
</style>
