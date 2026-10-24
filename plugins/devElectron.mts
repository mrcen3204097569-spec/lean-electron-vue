import { spawn, type ChildProcess } from 'node:child_process'

export interface DevElectron {
  start: (electronPath: string, devServerUrl: string) => void
  restart: () => Promise<void>
  reload: () => void
  stop: () => Promise<void>
}

function signalTree(child: ChildProcess, signalName: NodeJS.Signals) {
  if (process.platform === 'win32') {
    if (!child.pid) return
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    return
  }
  if (child.pid) {
    try {
      process.kill(-child.pid, signalName)
      return
    } catch {
      // 子进程还不是进程组长时退回普通 kill。
    }
  }
  child.kill(signalName)
}

function waitForExit(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve()
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      signalTree(child, 'SIGKILL')
    }, 2000)
    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
    signalTree(child, 'SIGTERM')
  })
}

/**
 * 持有唯一的 Electron 子进程。重启会先等旧进程退出，避免单实例锁还没放开就拉起下一个。
 * 用户自己关掉窗口时才通知 onUserExit；重启和停止触发的退出不算。
 */
export function createDevElectron(onUserExit: (code: number | null) => void): DevElectron {
  let child: ChildProcess | null = null
  let electronPath = ''
  let devServerUrl = ''
  let stopping = false
  let restarting = false
  let restartQueued = false

  function launch() {
    const next = spawn(electronPath, ['./dist/mainEntry.js'], {
      cwd: process.cwd(),
      detached: process.platform !== 'win32',
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: devServerUrl
      }
    })
    child = next
    next.on('exit', (code) => {
      if (child !== next) return
      child = null
      if (restarting || stopping) return
      onUserExit(code)
    })
  }

  async function killChild() {
    const current = child
    if (!current) return
    child = null
    await waitForExit(current)
  }

  return {
    start(nextElectronPath, nextDevServerUrl) {
      electronPath = nextElectronPath
      devServerUrl = nextDevServerUrl
      launch()
    },
    reload() {
      if (restarting || stopping || !child || !child.connected) return
      try {
        child.send({ type: 'reload-renderer' })
      } catch {
        // 进程正在退出时 send 会失败，下次重启会重新加载页面。
      }
    },
    async restart() {
      if (stopping) return
      if (restarting) {
        restartQueued = true
        return
      }
      restarting = true
      try {
        await killChild()
        if (!stopping) launch()
      } finally {
        restarting = false
        if (restartQueued && !stopping) {
          restartQueued = false
          await this.restart()
        }
      }
    },
    async stop() {
      stopping = true
      await killChild()
    }
  }
}
