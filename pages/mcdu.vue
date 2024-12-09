<template>
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
</script>

<style scoped>
.fms-display {
  background-color: #000;
  padding: 1rem;
  font-family: monospace;
  line-height: 1.2;
  font-size: 1.5em;
  @apply flex gap-4
}

.fms-line {
  white-space: pre;
  height: 1.2em;
}

.fms-char {
  display: inline-block;
  width: 1ch;
  text-align: center;
}

.lsks {
  @apply flex flex-col;
  margin-top: 2.35em;
  gap: 1.18em;

  .lsk {
    @apply px-4 h-6 flex items-center justify-center bg-black text-white rounded;
    background: #343434;
  }
}
</style>
