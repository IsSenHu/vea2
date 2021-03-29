import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { Connector } from '@/utils/WebSocketUtils'
import { Auth, requestByClient } from '@/utils/HttpUtils'

const state = {
  id: null,
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  selfSettings: {},
  businessSettings: {},
  justLogin: false
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_SELF_SETTINGS: (state, selfSettings) => {
    state.selfSettings = selfSettings
  },
  SET_BUSINESS_SETTINGS: (state, businessSettings) => {
    state.businessSettings = businessSettings
  },
  SET_JUST_LOGIN: (state, justLogin) => {
    state.justLogin = justLogin
  }
}

export const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      requestByClient(Auth, 'post', '/auth/login', { username: username, password: password, clientId: this.$store.getters.clientId }, resp => {
        const respJson = resp.data
        const { code, data } = respJson
        if (code === 0) {
          commit('SET_TOKEN', data.token)
          commit('SET_JUST_LOGIN', true)
          setToken(data.token)
          const storageInfo = {}
          storageInfo.id = data.id
          storageInfo.name = data.name
          storageInfo.introduction = data.introduction
          storageInfo.avatar = data.avatar
          storageInfo.roles = data.roles.length > 0 ? data.roles : ['123456789']
          console.log(storageInfo)
          localStorage.setItem('info', JSON.stringify(storageInfo))
          resolve()
        } else {
          reject(respJson.error)
        }
      }, error => {
        console.log(error)
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      const info = JSON.parse(localStorage.getItem('info'))
      if (info) {
        const { roles, id, name, avatar, introduction, selfConfig, businessSetting } = info
        // roles must be a non-empty array
        if (!roles) {
          reject('用户必须有角色')
        }
        commit('SET_ID', id)
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_SELF_SETTINGS', selfConfig)
        commit('SET_BUSINESS_SETTINGS', businessSetting)
        resolve(info)
      } else {
        reject('Verification failed, please Login again.')
      }
    })
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      requestByClient(Auth, 'post', '/auth/logout', null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          commit('SET_ID', null)
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_NAME', '')
          commit('SET_AVATAR', '')
          commit('SET_INTRODUCTION', '')
          commit('SET_JUST_LOGIN', false)
          commit('SET_SELF_SETTINGS', {})
          commit('SET_BUSINESS_SETTINGS', {})
          removeToken()
          resetRouter()
          resolve()
          Connector.disconnect()
        } else {
          reject(respJson.error)
        }
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  },
  // justLogin
  justLogin({ commit }, justLogin) {
    commit('SET_JUST_LOGIN', justLogin)
  },
  // selfSettings
  selfSettings({ commit }, selfSettings) {
    commit('SET_SELF_SETTINGS', selfSettings)
  },
  // businessSettings
  businessSettings({ commit }, businessSettings) {
    commit('SET_BUSINESS_SETTINGS', businessSettings)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
