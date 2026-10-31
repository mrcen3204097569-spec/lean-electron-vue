import { ref } from 'vue'

const STORAGE_KEY = 'lean_app_sound_enabled'

export const isSoundEnabled = ref<boolean>(
  typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) !== 'false' : true
)

export function setSoundEnabled(enabled: boolean) {
  isSoundEnabled.value = enabled
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }
}

export type SoundType = 'success' | 'click' | 'toggle' | 'alert'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

export function playSound(type: SoundType = 'click') {
  if (!isSoundEnabled.value) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime

    if (type === 'click') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05)
      osc.start(now)
      osc.stop(now + 0.05)
    } else if (type === 'toggle') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08)
      osc.start(now)
      osc.stop(now + 0.08)
    } else if (type === 'success') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now)
      osc.frequency.setValueAtTime(880, now + 0.08)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc.start(now)
      osc.stop(now + 0.3)
    } else if (type === 'alert') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(350, now)
      osc.frequency.linearRampToValueAtTime(260, now + 0.15)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    }
  } catch {
    // 忽略音频初始化限制
  }
}
