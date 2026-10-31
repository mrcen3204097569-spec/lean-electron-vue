import type { AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import qs from 'qs'
import { ElMessage } from 'element-plus'

/**
 * 错误信息处理
 * @param {string} message
 */
const errorHandler = (message: string) => {
  ElMessage.error(message)
}

// 创建实例
const instance = axios.create(<CreateAxiosDefaults>{
  timeout: 30 * 1000,
  withCredentials: true, // 允许axios发送请求时携带凭证
  baseURL: import.meta.env.VITE_API_BASE_URL || ''
})

// 拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 仅在显式声明 urlencoded 且非 FormData 时格式化参数
    if (
      config.method?.toUpperCase() === 'POST' &&
      !(config.data instanceof FormData) &&
      config.headers?.['Content-Type']?.toString().includes('application/x-www-form-urlencoded')
    ) {
      config.data = qs.stringify(config.data)
    }
    return config
  },
  // 错误请求
  (error: any) => {
    errorHandler(typeof error === 'string' ? error : JSON.stringify(error))
    return Promise.reject(error)
  }
)

// 响应器
instance.interceptors.response.use(
  (res: AxiosResponse): Promise<AxiosResponse> => {
    if (res.status >= 200 && res.status <= 206) {
      return Promise.resolve(res)
    } else {
      return Promise.reject(res)
    }
  },
  (error: any) => {
    const { response } = error
    if (response) {
      // 请求已发出，但是不在2xx的范围
      const message =
        response.data?.message || response.data?.error || response.statusText || '请求出错'
      errorHandler(typeof message === 'string' ? message : JSON.stringify(message))
      return Promise.reject(response)
    } else {
      // 处理断网的情况
      if (!window.navigator.onLine) {
        errorHandler('网络已断开连接，请重新连接您的网络')
      } else {
        return Promise.reject(error)
      }
      return Promise.reject(error)
    }
  }
)

export default instance
