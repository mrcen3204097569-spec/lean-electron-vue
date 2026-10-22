const files = import.meta.glob('./modules/*.ts', {
  eager: true
})

const modules: Record<any, any> = {}

for (const filesKey in files) {
  const mode = files[filesKey]
  const newKey = filesKey.split('/').pop().replace('.ts', '')
  modules[newKey] = mode.default
}

export const api = {
  ...modules
}
