const files = import.meta.glob<{ default: Record<string, any> }>('./modules/*.ts', {
  eager: true
})

const modules: Record<string, any> = {}

for (const filesKey in files) {
  const newKey = filesKey.split('/').pop()!.replace('.ts', '')
  modules[newKey] = files[filesKey].default
}

export const api = {
  ...modules
}
