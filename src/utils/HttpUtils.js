import axios from 'axios'
import { getToken } from '@/utils/auth'

const gateway = 'http://127.0.0.1:9999'

export const Auth = axios.create({
  baseURL: gateway + '/auth-center-server',
  withCredentials: false
})

export const User = axios.create({
  baseURL: gateway + '/user-server',
  withCredentials: false
})

export const Blog = axios.create({
  baseURL: 'http://127.0.0.1:19999/blog-admin',
  withCredentials: false
})

export const Health = axios.create({
  baseURL: 'http://118.24.38.46:7777/gateway/health-server',
  withCredentials: false
})

export function requestByClient(client, method, url, data, then, errorCall) {
  let headers = {}
  if (getToken()) {
    headers = {
      '_token': getToken()
    }
  }
  client({
    headers: headers,
    method: method,
    url: url,
    data: data
  })
    .then(then)
    .catch(error => {
      errorCall && errorCall(error)
      console.error(error)
    })
}

export function request(method, url, data, then) {
  Auth({
    headers: {
      'Authorization': getToken()
    },
    method: method,
    url: url,
    data: data
  })
    .then(then)
    .catch(error => {
      console.error(error)
    })
}
// this.$store.getters
