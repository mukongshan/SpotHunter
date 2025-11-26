import { defineStore } from 'pinia'

// 应用全局状态管理
export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    sidebarCollapsed: false
  }),
  
  actions: {
    setLoading(loading) {
      this.loading = loading
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    }
  }
})

