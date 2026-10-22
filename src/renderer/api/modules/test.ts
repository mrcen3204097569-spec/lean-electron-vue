import instance from '@/api/api.config'
import { IApiTestParams } from '@/types/api.data'

export enum ETestApi {
  TEST = '/api/test'
}

const testModule = {
  getTest(params: IApiTestParams) {
    return instance.get(ETestApi.TEST, { params })
  }
}

export default testModule
