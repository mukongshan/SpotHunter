<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.key">
        <div class="stat-icon" :style="{ background: stat.color }">
          {{ stat.icon }}
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">数据概览</h3>
        </div>
        <div class="chart-content">
          <div class="chart-item" v-for="item in chartData" :key="item.label">
            <div class="chart-label">{{ item.label }}</div>
            <div class="chart-bar">
              <div 
                class="chart-fill" 
                :style="{ width: item.percentage + '%', background: item.color }"
              ></div>
            </div>
            <div class="chart-value">{{ item.value }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">最近打卡记录</h3>
          <button class="btn btn-default" @click="loadCheckIns">刷新</button>
        </div>
        <div class="recent-checkins">
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else-if="recentCheckIns.length === 0" class="empty-state">
            <div class="empty-state-text">暂无打卡记录</div>
          </div>
          <div v-else class="checkin-list">
            <div 
              v-for="checkin in recentCheckIns.slice(0, 10)" 
              :key="checkin.id"
              class="checkin-item"
            >
              <div class="checkin-info">
                <span class="checkin-user">{{ checkin.username }}</span>
                <span class="checkin-spot">{{ checkin.spotName }}</span>
              </div>
              <div class="checkin-time">{{ checkin.checkTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { statsAPI, checkInAPI } from '../api'
import { ElMessage } from '../utils/message'

const loading = ref(false)
const dashboardData = ref({
  totalUsers: 0,
  totalSpots: 0,
  totalCheckIns: 0,
  todayCheckIns: 0,
  totalScore: 0
})
const recentCheckIns = ref([])

// 统计数据
const stats = computed(() => [
  {
    key: 'users',
    label: '总用户数',
    value: dashboardData.value.totalUsers,
    icon: '👥',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    key: 'spots',
    label: '景点总数',
    value: dashboardData.value.totalSpots,
    icon: '📍',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    key: 'checkins',
    label: '总打卡数',
    value: dashboardData.value.totalCheckIns,
    icon: '✅',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    key: 'today',
    label: '今日打卡',
    value: dashboardData.value.todayCheckIns,
    icon: '📅',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    key: 'score',
    label: '总积分',
    value: dashboardData.value.totalScore,
    icon: '⭐',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
])

// 图表数据
const chartData = computed(() => {
  const max = Math.max(
    dashboardData.value.totalUsers,
    dashboardData.value.totalSpots,
    dashboardData.value.totalCheckIns
  )
  
  return [
    {
      label: '用户数',
      value: dashboardData.value.totalUsers,
      percentage: max > 0 ? (dashboardData.value.totalUsers / max) * 100 : 0,
      color: '#667eea'
    },
    {
      label: '景点数',
      value: dashboardData.value.totalSpots,
      percentage: max > 0 ? (dashboardData.value.totalSpots / max) * 100 : 0,
      color: '#f5576c'
    },
    {
      label: '打卡数',
      value: dashboardData.value.totalCheckIns,
      percentage: max > 0 ? (dashboardData.value.totalCheckIns / max) * 100 : 0,
      color: '#4facfe'
    }
  ]
})

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await statsAPI.getDashboardStats()
    if (res.code === 200) {
      dashboardData.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最近打卡记录
const loadCheckIns = async () => {
  loading.value = true
  try {
    const res = await checkInAPI.getAllCheckIns()
    if (res.code === 200) {
      recentCheckIns.value = res.data || []
      ElMessage.success('刷新成功')
    }
  } catch (error) {
    console.error('加载打卡记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
  loadCheckIns()
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-content {
  padding: 20px 0;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-item:last-child {
  margin-bottom: 0;
}

.chart-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.chart-bar {
  flex: 1;
  height: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.chart-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s;
}

.chart-value {
  width: 60px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  flex-shrink: 0;
}

.recent-checkins {
  min-height: 300px;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  transition: background 0.3s;
}

.checkin-item:hover {
  background: #ebeef5;
}

.checkin-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkin-user {
  font-weight: 600;
  color: #303133;
}

.checkin-spot {
  color: #606266;
  font-size: 14px;
}

.checkin-time {
  color: #909399;
  font-size: 13px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>

