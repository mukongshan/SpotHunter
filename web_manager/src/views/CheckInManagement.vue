<template>
  <div class="checkin-management">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">打卡记录管理</h3>
        <div class="header-actions">
          <input
            v-model="searchKeyword"
            type="text"
            class="input search-input"
            placeholder="搜索用户名或景点..."
            @input="handleSearch"
          />
          <select v-model="filterType" class="input filter-select" @change="handleFilter">
            <option value="all">全部</option>
            <option value="today">今日</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
          <button class="btn btn-primary" @click="exportData">
            📥 导出数据
          </button>
          <button class="btn btn-default" @click="loadCheckIns">
            {{ loading ? '加载中...' : '刷新' }}
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>景点名称</th>
              <th>打卡时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="loading">加载中...</td>
            </tr>
            <tr v-else-if="filteredCheckIns.length === 0">
              <td colspan="5" class="empty-state">
                <div class="empty-state-text">暂无打卡记录</div>
              </td>
            </tr>
            <tr v-else v-for="checkin in filteredCheckIns" :key="checkin.id">
              <td>{{ checkin.id }}</td>
              <td>
                <div class="user-info">
                  <span class="user-avatar">{{ checkin.username.charAt(0) }}</span>
                  <span>{{ checkin.username }}</span>
                </div>
              </td>
              <td>
                <span class="spot-name">{{ checkin.spotName }}</span>
              </td>
              <td>
                <div class="time-info">
                  <div class="time-main">{{ formatDate(checkin.checkTime) }}</div>
                  <div class="time-sub">{{ formatTime(checkin.checkTime) }}</div>
                </div>
              </td>
              <td>
                <button class="btn btn-default btn-sm" @click="viewDetail(checkin)">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="!loading && filteredCheckIns.length > 0">
        <div class="pagination-info">
          共 {{ filteredCheckIns.length }} 条记录
          <span v-if="filterType !== 'all'" class="filter-info">
            （已筛选：{{ filterTypeText }}）
          </span>
        </div>
      </div>
    </div>

    <!-- 详情对话框 -->
    <div v-if="showDetailDialog" class="dialog-overlay" @click="closeDetailDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>打卡详情</h3>
          <button class="dialog-close" @click="closeDetailDialog">×</button>
        </div>
        <div class="dialog-body" v-if="selectedCheckIn">
          <div class="detail-item">
            <span class="detail-label">记录ID:</span>
            <span class="detail-value">{{ selectedCheckIn.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用户名:</span>
            <span class="detail-value">{{ selectedCheckIn.username }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">景点名称:</span>
            <span class="detail-value">{{ selectedCheckIn.spotName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">打卡时间:</span>
            <span class="detail-value">{{ selectedCheckIn.checkTime }}</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-default" @click="closeDetailDialog">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkInAPI } from '../api'
import { formatDateTime } from '../utils/format'
import { ElMessage } from '../utils/message'

const loading = ref(false)
const checkIns = ref([])
const searchKeyword = ref('')
const filterType = ref('all')
const showDetailDialog = ref(false)
const selectedCheckIn = ref(null)

// 过滤类型文本
const filterTypeText = computed(() => {
  const map = {
    today: '今日',
    week: '本周',
    month: '本月'
  }
  return map[filterType.value] || ''
})

// 过滤后的打卡记录
const filteredCheckIns = computed(() => {
  let result = checkIns.value

  // 时间筛选
  if (filterType.value !== 'all') {
    const now = new Date()
    let startDate

    switch (filterType.value) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        const day = now.getDay()
        startDate = new Date(now.getTime() - (day === 0 ? 6 : day - 1) * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    result = result.filter(checkin => {
      if (!checkin.checkTime) return false
      const checkTime = new Date(checkin.checkTime.replace(/-/g, '/'))
      return checkTime >= startDate
    })
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(checkin =>
      checkin.username.toLowerCase().includes(keyword) ||
      checkin.spotName.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 格式化日期
const formatDate = (dateTime) => {
  if (!dateTime) return '-'
  return dateTime.split(' ')[0] || dateTime
}

// 格式化时间
const formatTime = (dateTime) => {
  if (!dateTime) return '-'
  const parts = dateTime.split(' ')
  return parts[1] || '-'
}

// 加载打卡记录
const loadCheckIns = async () => {
  loading.value = true
  try {
    const res = await checkInAPI.getAllCheckIns()
    if (res.code === 200) {
      checkIns.value = res.data || []
      ElMessage.success('加载成功')
    }
  } catch (error) {
    console.error('加载打卡记录失败:', error)
    ElMessage.error('加载打卡记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑已在computed中处理
}

// 查看详情
const viewDetail = (checkin) => {
  selectedCheckIn.value = checkin
  showDetailDialog.value = true
}

// 关闭详情对话框
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedCheckIn.value = null
}

// 导出数据
const exportData = () => {
  if (filteredCheckIns.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  // 构建CSV内容
  const headers = ['ID', '用户名', '景点名称', '打卡时间']
  const rows = filteredCheckIns.value.map(item => [
    item.id,
    item.username,
    item.spotName,
    item.checkTime
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // 创建下载链接
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `打卡记录_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('导出成功')
}

onMounted(() => {
  loadCheckIns()
})
</script>

<style scoped>
.checkin-management {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-select {
  width: 120px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.spot-name {
  font-weight: 500;
  color: #303133;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-main {
  color: #303133;
  font-size: 14px;
}

.time-sub {
  color: #909399;
  font-size: 12px;
}

.filter-info {
  color: #909399;
  font-size: 13px;
  margin-left: 8px;
}
</style>

