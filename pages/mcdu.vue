<template>
  <div class="flex items-center justify-center h-screen">
    <div class="fms" style="width: 27em">
      <div class="fms-top">

        <div class="fms-display relative">
          <div class="lsks">
            <button v-for="(line, index) in [1, 2, 3, 4, 5, 6]" class="lsk" @click="lsk(line,'l')">-</button>
            <div class="written-line text-white bg-black font-bold  ml-16 font-mono text-lg"
                 style="position:absolute;bottom:0;z-index:99999"
                 v-if="writtenLineVisible"> {{ writtenLine }}
            </div>
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

      <div class="fms-keys mb-3">
        <div class="lg grid gap-1 mb-1 grid-cols-6">
          <button v-for="(key,cmd) in FMS_KEYS.controlKeys" @click="fmsclick(cmd)">{{ key }}</button>
        </div>

        <div class="grid gap-1 grid-cols-6 items-start">
          <div class="lg gap-1 grid grid-cols-2 col-span-2">
            <button v-for="(key,cmd) in FMS_KEYS.navigationKeys" @click="fmsclick(cmd)">{{
                key
              }}
            </button>
            <!-- NUMERIC KEYS -->
            <div class="grid grid-cols-3 col-span-2">
              <button v-for="(key,cmd) in FMS_KEYS.numericKeys" class="rounded-full aspect-square text-lg"
                      @click="fmsclick(cmd)">{{ key }}
              </button>
            </div>
          </div>
          <!-- ALPHABETIC KEYS -->
          <div class="gap-1 grid grid-cols-5 col-span-4">
            <button v-for="(key,cmd) in FMS_KEYS.alphabeticKeys" class="aspect-square "
                    @click="fmsclick(cmd)">{{ key }}
            </button>
          </div>
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

const writtenLine = ref('')
const writtenLineVisible = ref(false)

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
  writtenLine.value = ''

  await command(`sim/FMS/ls_${line}${side}`)
  await updateFmsData()
}

const FMS_KEYS = {

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
    'key_delete': '(DEL)',
    'key_prev': '←',
    'key_up': '↑',
    'key_next': '→',
    'key_down': '↓',
  },

  // Performance and data keys
  performanceKeys: [
    'perf',
    'fuel pred',
    'data'
  ],

  // Numeric keys
  numericKeys: {
    'key_1': '1',
    'key_2': '2',
    'key_3': '3',
    'key_4': '4',
    'key_5': '5',
    'key_6': '6',
    'key_7': '7',
    'key_8': '8',
    'key_9': '9',
    'key_period': '.',
    'key_0': '0',
    'key_minus': '-/+',
  },

  // Alphabetic keys
  alphabeticKeys: {
    'key_A': 'A',
    'key_B': 'B',
    'key_C': 'C',
    'key_D': 'D',
    'key_E': 'E',
    'key_F': 'F',
    'key_G': 'G',
    'key_H': 'H',
    'key_I': 'I',
    'key_J': 'J',
    'key_K': 'K',
    'key_L': 'L',
    'key_M': 'M',
    'key_N': 'N',
    'key_O': 'O',
    'key_P': 'P',
    'key_Q': 'Q',
    'key_R': 'R',
    'key_S': 'S',
    'key_T': 'T',
    'key_U': 'U',
    'key_V': 'V',
    'key_W': 'W',
    'key_X': 'X',
    'key_Y': 'Y',
    'key_Z': 'Z',
    'key_slash': '/',
    'key_space': 'SP',
    'key_overfly': '▵',
    'key_clear': 'CLR',
  },


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


let lastWrittenLine = null

const fmsclick = async (key) => {

  // wenn der key key_A .. key_Z, key_slash, key_space, key_overfly, key_clear, key_delete, key_period, key_minus, key_0 .. key_9 ist, dann
  // schreibe den key in writtenLine bzw bearbeite writtenLine entsprechend

  // regex für key_A .. key_Z, key_slash, key_space, key_overfly, key_clear, key_delete, key_period, key_minus, key_0 .. key_9
  const regex = /key_(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|slash|space|overfly|clear|delete|period|minus|0|1|2|3|4|5|6|7|8|9)/
  if (regex.test(key)) {
    // wenn key_clear, dann writtenLine = ''
    if (key === 'key_clear') {
      writtenLine.value = writtenLine.value.slice(0, -1)
    }
    // wenn key_delete, dann writtenLine = writtenLine.slice(0, -1)
    else if (key === 'key_delete') {
      writtenLine.value = ''
    }
    // wenn key_period, dann writtenLine += '.'
    else if (key === 'key_period') {
      writtenLine.value += '.'
    }
    // wenn key_minus, dann writtenLine += '-'
    else if (key === 'key_minus') {
      writtenLine.value += '-'
    }
    // wenn key_space, dann writtenLine += ' '
    else if (key === 'key_space') {
      writtenLine.value += ' '
    } else if (key === 'key_slash') {
      writtenLine.value += '/'
    }
    // wenn key_overfly, dann writtenLine += '▵'
    else if (key === 'key_overfly') {
      writtenLine.value += '▵'
    }
    // wenn key_A .. key_Z, dann writtenLine += key
    else {
      writtenLine.value += key.slice(4)
    }

    // hide written line nach 1 sekunde ohne änderung
    lastWrittenLine = setTimeout(() => {
      writtenLineVisible.value = false
    }, 1000)
    writtenLineVisible.value = true

  }

  await command(`sim/FMS/${key}`)
  await updateFmsData()
}
</script>

<style scoped>
.fms-display {
  padding: 2.4rem .4rem 0;
  font-family: monospace;
  font-size: 1.5em;
  @apply flex gap-4;

  .lines {
    @apply bg-black border-gray-500 rounded-lg p-2;
  }
}

.fms {
  background: url('/mcdu.jpg') no-repeat top center;
  background-size: 100%;
}

.fms-line {
  white-space: pre;
  line-height: 0.88;
}

.fms-char {
  display: inline-block;
  width: 1ch;
  text-align: center;
}

.lsks {
  @apply flex flex-col;
  margin-top: 1.6em;
  gap: .59em;

  .lsk {
    @apply px-4 h-6 flex items-center justify-center bg-black text-white rounded;
    background: #343434;
    background: url('/fms-lsk.png') no-repeat center center;
    background-size: 100% 100%;
  }
}

.fms-keys {
  @apply px-12 mt-2;

  .lg {
    button {
      @apply text-xs h-9 leading-3;
      padding-top: 6px;
    }
  }

  button {
    background: url('/fms-key.png') no-repeat center center;
    background-size: 100% 100%;
    color: #FFFDFA;
    font-family: 'Arial';
    text-shadow: 0 0 5px orangered;
  }
}
</style>
