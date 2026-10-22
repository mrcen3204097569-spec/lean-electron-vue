import type { AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import qs from 'qs'
import { ElMessage } from 'element-plus'

/**
 * 错误信息处理
 * @param {string} message
 */
const errorHandel = (message: string) => {
  ElMessage.error(message)
}

// 创建实例
const instance = axios.create(<CreateAxiosDefaults>{
  timeout: 30 * 1000,
  withCredentials: true, // 允许axios发送请求时携带凭证
  baseURL: ''
})

// 设置 post 请求头 Content-Type 格式
instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

// 拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // post 请求格式化参数
    if (config.method?.toUpperCase() === 'POST') {
      config.data = qs.stringify(config.data)
    }
    return config
  },
  // 错误请求
  (error: any) => {
    errorHandel(typeof error === 'string' ? error : JSON.stringify(error))
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
      errorHandel(response.data.message)
      return Promise.reject(response)
    } else {
      // 处理断网的情况
      // eg:请求超时或断网时，更新state的network状态
      // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
      // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
      if (!window.navigator.onLine) {
        errorHandel('网络已断开连接，请重新连接您的网络')
      } else {
        return Promise.reject(error)
      }
      return Promise.reject(error)
    }
  }
)

export default instance
