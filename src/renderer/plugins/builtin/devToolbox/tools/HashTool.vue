<template>
  <div class="hash-tool">
    <div class="input-section">
      <div class="area-label">待计算散列文本 (Input String):</div>
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="4"
        placeholder="输入要计算哈希的明文字符串..."
        @input="computeHashes"
      />
    </div>

    <div class="options-bar">
      <el-checkbox v-model="uppercase" @change="computeHashes">大写输出</el-checkbox>
      <el-input
        v-model="compareHash"
        placeholder="粘贴目标哈希以比对一致性..."
        style="width: 320px; margin-left: 12px"
      />
      <el-tag v-if="compareStatus" :type="compareStatus.match ? 'success' : 'danger'">
        {{ compareStatus.msg }}
      </el-tag>
    </div>

    <div class="results-grid">
      <div v-for="item in hashResults" :key="item.algorithm" class="hash-card">
        <div class="card-header">
          <span class="algo-name">{{ item.algorithm }}</span>
          <el-button link type="primary" size="small" @click="copyHash(item.value)">复制</el-button>
        </div>
        <div class="card-value">{{ item.value || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="HashTool">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const inputText = ref('Hello, lean-electron-vue!')
const uppercase = ref(false)
const compareHash = ref('')

interface HashItem {
  algorithm: string
  value: string
}

const hashResults = ref<HashItem[]>([
  { algorithm: 'SHA-256', value: '' },
  { algorithm: 'SHA-512', value: '' },
  { algorithm: 'SHA-1', value: '' },
  { algorithm: 'MD5', value: '' }
])

// 纯 JS MD5 实现
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0],
      b = x[1],
      c = x[2],
      d = x[3]
    a = ff(a, b, c, d, k[0], 7, -680876936)
    d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819)
    b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897)
    d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341)
    b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416)
    d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063)
    b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682)
    d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290)
    b = ff(b, c, d, a, k[15], 22, 1236535329)

    a = gg(a, b, c, d, k[1], 5, -165796510)
    d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713)
    b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691)
    d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335)
    b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438)
    d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961)
    b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467)
    d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473)
    b = gg(b, c, d, a, k[12], 20, -1926607734)

    a = hh(a, b, c, d, k[5], 4, -378558)
    d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562)
    b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060)
    d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632)
    b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174)
    d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979)
    b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487)
    d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520)
    b = hh(b, c, d, a, k[2], 23, -995338651)

    a = ii(a, b, c, d, k[0], 6, -198630844)
    d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905)
    b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571)
    d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523)
    b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359)
    d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380)
    b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070)
    d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259)
    b = ii(b, c, d, a, k[9], 21, -343485551)

    x[0] = add32(a, x[0])
    x[1] = add32(b, x[1])
    x[2] = add32(c, x[2])
    x[3] = add32(d, x[3])
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t))
    return add32((a << s) | (a >>> (32 - s)), b)
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t)
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff
  }

  const n = string.length
  let state = [1732584193, -271733879, -1732584194, 271733878]
  let i: number
  let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (i = 64; i <= n; i += 64) {
    const chunk = string.substring(i - 64, i)
    const block: number[] = []
    for (let j = 0; j < 64; j += 4) {
      block.push(
        chunk.charCodeAt(j) |
          (chunk.charCodeAt(j + 1) << 8) |
          (chunk.charCodeAt(j + 2) << 16) |
          (chunk.charCodeAt(j + 3) << 24)
      )
    }
    md5cycle(state, block)
  }
  const rem = string.substring(i - 64)
  for (let j = 0; j < rem.length; j++) {
    tail[j >> 2] |= rem.charCodeAt(j) << ((j % 4) << 3)
  }
  tail[rem.length >> 2] |= 0x80 << ((rem.length % 4) << 3)
  if (rem.length > 55) {
    md5cycle(state, tail)
    tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  tail[14] = n * 8
  md5cycle(state, tail)
  let res = ''
  for (let j = 0; j < 4; j++) {
    for (let k = 0; k < 4; k++) {
      const byte = (state[j] >> (k * 8)) & 0xff
      res += (byte < 16 ? '0' : '') + byte.toString(16)
    }
  }
  return res
}

async function computeSubtleHash(algo: string, text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function computeHashes() {
  if (!inputText.value) {
    hashResults.value.forEach((r) => (r.value = ''))
    return
  }

  const sha256 = await computeSubtleHash('SHA-256', inputText.value)
  const sha512 = await computeSubtleHash('SHA-512', inputText.value)
  const sha1 = await computeSubtleHash('SHA-1', inputText.value)
  const md5Val = md5(inputText.value)

  const fmt = (v: string) => (uppercase.value ? v.toUpperCase() : v.toLowerCase())

  hashResults.value = [
    { algorithm: 'SHA-256', value: fmt(sha256) },
    { algorithm: 'SHA-512', value: fmt(sha512) },
    { algorithm: 'SHA-1', value: fmt(sha1) },
    { algorithm: 'MD5', value: fmt(md5Val) }
  ]
}

const compareStatus = computed(() => {
  if (!compareHash.value) return null
  const target = compareHash.value.trim().toLowerCase()
  const matched = hashResults.value.find((r) => r.value.toLowerCase() === target)
  if (matched) {
    return { match: true, msg: `匹配成功！符合 ${matched.algorithm}` }
  }
  return { match: false, msg: '无匹配项' }
})

async function copyHash(val: string) {
  if (!val) return
  if (window.electronSystemApi) {
    await window.electronSystemApi.clipboardWriteText(val)
  } else {
    await navigator.clipboard.writeText(val)
  }
  ElMessage.success('哈希值已复制')
}

computeHashes()
</script>

<style scoped lang="scss">
.hash-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.area-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--el-text-color-secondary, #909399);
}
.options-bar {
  display: flex;
  align-items: center;
}
.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.hash-card {
  padding: 10px 14px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-fill-color-blank, #fff);
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    .algo-name {
      font-size: 13px;
      font-weight: 600;
      color: #409eff;
    }
  }
  .card-value {
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    word-break: break-all;
    user-select: all;
    color: var(--el-text-color-primary, #303133);
  }
}
</style>
