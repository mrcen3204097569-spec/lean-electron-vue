import { defineStore } from 'pinia'
import { IRootState } from '@/types/store.data'

export const useRootStore = defineStore('root', {
  state: (): IRootState => {
    return {
      test: 'testStore'
    }
  },
  getters: {
    formatTest: (state: IRootState) => state.test + 'format'
  },
  actions: {
    setTest(str: string) {
      this.test = str
    }
  }
})
