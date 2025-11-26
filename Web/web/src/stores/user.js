import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userAPI } from '../api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoggedIn = ref(false)

  // 注册
  async function register(username, password) {
    try {
      const response = await userAPI.register(username, password)
      if (response.data.code === 200) {
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.msg || '注册失败' }
      }
    } catch (error) {
      console.error('注册错误:', error)
      return { success: false, message: error.message || '网络错误' }
    }
  }

  // 登录
  async function login(username, password) {
    try {
      const response = await userAPI.login(username, password)
      if (response.data.code === 200) {
        user.value = response.data.data
        isLoggedIn.value = true
        // 保存到localStorage
        localStorage.setItem('userId', user.value.id)
        localStorage.setItem('userInfo', JSON.stringify(user.value))
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.msg || '登录失败' }
      }
    } catch (error) {
      console.error('登录错误:', error)
      return { success: false, message: error.message || '网络错误' }
    }
  }

  // 刷新用户信息
  async function refreshUserInfo() {
    if (!user.value) return
    try {
      const response = await userAPI.getUserInfo(user.value.id)
      if (response.data.code === 200) {
        user.value = { ...user.value, ...response.data.data }
        localStorage.setItem('userInfo', JSON.stringify(user.value))
      }
    } catch (error) {
      console.error('获取用户信息错误:', error)
    }
  }

  // 登出
  function logout() {
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('userId')
    localStorage.removeItem('userInfo')
  }

  // 初始化（从localStorage恢复）
  function init() {
    const savedUser = localStorage.getItem('userInfo')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        isLoggedIn.value = true
      } catch (e) {
        console.error('恢复用户信息失败:', e)
      }
    }
  }

  return {
    user,
    isLoggedIn,
    register,
    login,
    refreshUserInfo,
    logout,
    init
  }
})

