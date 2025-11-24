<template>
  <div class="admin-container">
    <header class="header">
      <div class="header-content">
        <h1>后台管理</h1>
        <button @click="loadCheckIns" class="refresh-btn" :disabled="loading">
          {{ loading ? '加载中...' : '刷新数据' }}
        </button>
      </div>
    </header>

    <main class="main-content">
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">总打卡记录</span>
          <span class="stat-value">{{ checkIns.length }}</span>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>景点名称</th>
              <th>打卡时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="loading-cell">加载中...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="4" class="error-cell">{{ error }}</td>
            </tr>
            <tr v-else-if="checkIns.length === 0">
              <td colspan="4" class="empty-cell">暂无打卡记录</td>
            </tr>
            <tr v-else v-for="record in checkIns" :key="record.id">
              <td>{{ record.id }}</td>
              <td>{{ record.username }}</td>
              <td>{{ record.spotName }}</td>
              <td>{{ record.checkTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '../api'

const checkIns = ref([])
const loading = ref(false)
const error = ref('')

const loadCheckIns = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await adminAPI.getAllCheckIns()
    if (response.data.code === 200) {
      checkIns.value = response.data.data || []
    } else {
      error.value = '加载打卡记录失败'
    }
  } catch (err) {
    console.error('加载打卡记录错误:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCheckIns()
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.stats-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  color: #667eea;
  font-size: 32px;
  font-weight: bold;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-weight: 500;
}

.data-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.3s;
}

.data-table tbody tr:hover {
  background: #f9f9f9;
}

.data-table tbody tr:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 16px;
  color: #333;
}

.loading-cell, .error-cell, .empty-cell {
  text-align: center;
  color: #666;
  padding: 40px !important;
}

.error-cell {
  color: #e74c3c;
}
</style>

