<template>
  <div class="user-management">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">用户管理</h3>
        <div class="header-actions">
          <input
            v-model="searchKeyword"
            type="text"
            class="input search-input"
            placeholder="搜索用户名..."
            @input="handleSearch"
          />
          <button class="btn btn-primary" @click="loadUsers">
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
              <th>积分</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="loading">加载中...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="empty-state">
                <div class="empty-state-text">暂无用户数据</div>
              </td>
            </tr>
            <tr v-else v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <div class="user-info">
                  <span class="user-avatar">{{ user.username.charAt(0) }}</span>
                  <span>{{ user.username }}</span>
                </div>
              </td>
              <td>
                <span class="score-badge">{{ user.score || 0 }}</span>
              </td>
              <td>{{ formatDateTime(user.createTime) }}</td>
              <td>
                <button class="btn btn-default btn-sm" @click="viewUserDetail(user)">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="!loading && filteredUsers.length > 0">
        <div class="pagination-info">
          共 {{ filteredUsers.length }} 条记录
        </div>
      </div>
    </div>

    <!-- 用户详情对话框 -->
    <div v-if="showDetailDialog" class="dialog-overlay" @click="closeDetailDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>用户详情</h3>
          <button class="dialog-close" @click="closeDetailDialog">×</button>
        </div>
        <div class="dialog-body" v-if="selectedUser">
          <div class="detail-item">
            <span class="detail-label">用户ID:</span>
            <span class="detail-value">{{ selectedUser.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用户名:</span>
            <span class="detail-value">{{ selectedUser.username }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">积分:</span>
            <span class="detail-value">{{ selectedUser.score || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">注册时间:</span>
            <span class="detail-value">{{ formatDateTime(selectedUser.createTime) }}</span>
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
import { userAPI } from '../api'
import { formatDateTime } from '../utils/format'
import { ElMessage } from '../utils/message'

const loading = ref(false)
const users = ref([])
const searchKeyword = ref('')
const showDetailDialog = ref(false)
const selectedUser = ref(null)

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) {
    return users.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(keyword)
  )
})

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const res = await userAPI.getAllUsers()
    if (res.code === 200) {
      users.value = res.data || []
      ElMessage.success('加载成功')
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 查看用户详情
const viewUserDetail = (user) => {
  selectedUser.value = user
  showDetailDialog.value = true
}

// 关闭详情对话框
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedUser.value = null
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  max-width: 1400px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 200px;
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

.score-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.pagination-info {
  color: #909399;
  font-size: 14px;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.dialog-close:hover {
  background: #f5f7fa;
  color: #303133;
}

.dialog-body {
  padding: 24px;
}

.detail-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f7fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  width: 100px;
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

