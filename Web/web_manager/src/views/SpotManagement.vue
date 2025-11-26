<template>
  <div class="spot-management">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">景点管理</h3>
        <div class="header-actions">
          <input
            v-model="searchKeyword"
            type="text"
            class="input search-input"
            placeholder="搜索景点名称..."
            @input="handleSearch"
          />
          <button class="btn btn-primary" @click="openAddDialog">
            ➕ 添加景点
          </button>
          <button class="btn btn-default" @click="loadSpots">
            {{ loading ? '加载中...' : '刷新' }}
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>图片</th>
              <th>景点名称</th>
              <th>简介</th>
              <th>积分</th>
              <th>坐标</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="loading">加载中...</td>
            </tr>
            <tr v-else-if="filteredSpots.length === 0">
              <td colspan="7" class="empty-state">
                <div class="empty-state-text">暂无景点数据</div>
              </td>
            </tr>
            <tr v-else v-for="spot in filteredSpots" :key="spot.id">
              <td>{{ spot.id }}</td>
              <td>
                <div class="spot-image-cell">
                  <img 
                    v-if="spot.image" 
                    :src="spot.image" 
                    :alt="spot.name"
                    class="spot-thumbnail"
                    @error="handleImageError"
                  />
                  <span v-else class="no-image">无图片</span>
                </div>
              </td>
              <td>
                <div class="spot-name">{{ spot.name }}</div>
              </td>
              <td>
                <div class="spot-intro" :title="spot.intro">
                  {{ spot.intro || '-' }}
                </div>
              </td>
              <td>
                <span class="score-badge">{{ spot.score || 10 }}</span>
              </td>
              <td>
                <div class="coordinates">
                  <div>{{ spot.latitude }}, {{ spot.longitude }}</div>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-default btn-sm" @click="openEditDialog(spot)">
                    编辑
                  </button>
                  <button class="btn btn-danger btn-sm" @click="handleDelete(spot)">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog dialog-large" @click.stop>
        <div class="dialog-header">
          <h3>{{ dialogMode === 'add' ? '添加景点' : '编辑景点' }}</h3>
          <button class="dialog-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-item">
              <label class="label">景点名称 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="input"
                placeholder="请输入景点名称"
                required
              />
            </div>
            <div class="form-item">
              <label class="label">简介</label>
              <textarea
                v-model="formData.intro"
                class="input textarea"
                placeholder="请输入景点简介"
                rows="3"
              ></textarea>
            </div>
            <div class="form-item">
              <label class="label">景点图片</label>
              <div class="upload-container">
                <div v-if="formData.image" class="image-preview">
                  <img :src="formData.image" alt="预览" class="preview-image" />
                  <button type="button" class="remove-image-btn" @click="removeImage">×</button>
                </div>
                <div v-else class="upload-placeholder">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="file-input"
                    @change="handleFileSelect"
                  />
                  <div class="upload-area" @click="triggerFileInput">
                    <div class="upload-icon">📷</div>
                    <div class="upload-text">点击上传图片</div>
                    <div class="upload-hint">支持 JPG、PNG 等格式</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="label">纬度 *</label>
                <input
                  v-model.number="formData.latitude"
                  type="number"
                  step="0.000001"
                  class="input"
                  placeholder="30.2541"
                  required
                />
              </div>
              <div class="form-item">
                <label class="label">经度 *</label>
                <input
                  v-model.number="formData.longitude"
                  type="number"
                  step="0.000001"
                  class="input"
                  placeholder="120.2132"
                  required
                />
              </div>
            </div>
            <div class="form-item">
              <label class="label">打卡积分 *</label>
              <input
                v-model.number="formData.score"
                type="number"
                class="input"
                placeholder="10"
                min="1"
                required
              />
            </div>
            <div class="dialog-footer">
              <button type="button" class="btn btn-default" @click="closeDialog">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? '提交中...' : '确定' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { spotAPI } from '../api'
import { ElMessage } from '../utils/message'

const loading = ref(false)
const submitting = ref(false)
const spots = ref([])
const searchKeyword = ref('')
const showDialog = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'
const fileInput = ref(null)
const formData = ref({
  id: null,
  name: '',
  intro: '',
  image: '',
  latitude: null,
  longitude: null,
  score: 10
})

// 过滤后的景点列表
const filteredSpots = computed(() => {
  if (!searchKeyword.value) {
    return spots.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return spots.value.filter(spot => 
    spot.name.toLowerCase().includes(keyword) ||
    (spot.intro && spot.intro.toLowerCase().includes(keyword))
  )
})

// 加载景点列表
const loadSpots = async () => {
  loading.value = true
  try {
    const res = await spotAPI.getSpotList()
    if (res.code === 200) {
      spots.value = res.data || []
      ElMessage.success('加载成功')
    }
  } catch (error) {
    console.error('加载景点列表失败:', error)
    ElMessage.error('加载景点列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  // 读取文件并转换为base64
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.image = e.target.result
    ElMessage.success('图片上传成功')
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败')
  }
  reader.readAsDataURL(file)
}

// 移除图片
const removeImage = () => {
  formData.value.image = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 打开添加对话框
const openAddDialog = () => {
  dialogMode.value = 'add'
  formData.value = {
    id: null,
    name: '',
    intro: '',
    image: '',
    latitude: null,
    longitude: null,
    score: 10
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showDialog.value = true
}

// 打开编辑对话框
const openEditDialog = (spot) => {
  dialogMode.value = 'edit'
  formData.value = {
    id: spot.id,
    name: spot.name,
    intro: spot.intro || '',
    image: spot.image || '',
    latitude: spot.latitude,
    longitude: spot.longitude,
    score: spot.score || 10
  }
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  formData.value = {
    id: null,
    name: '',
    intro: '',
    image: '',
    latitude: null,
    longitude: null,
    score: 10
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    const data = {
      name: formData.value.name,
      intro: formData.value.intro,
      image: formData.value.image,
      latitude: formData.value.latitude,
      longitude: formData.value.longitude,
      score: formData.value.score
    }

    let res
    if (dialogMode.value === 'add') {
      res = await spotAPI.addSpot(data)
    } else {
      res = await spotAPI.updateSpot(formData.value.id, data)
    }

    if (res.code === 200) {
      ElMessage.success(res.msg || '操作成功')
      closeDialog()
      loadSpots()
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 图片加载错误处理
const handleImageError = (event) => {
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.no-image')) {
    const span = document.createElement('span')
    span.className = 'no-image'
    span.textContent = '加载失败'
    parent.appendChild(span)
  }
}

// 删除景点
const handleDelete = async (spot) => {
  if (!confirm(`确定要删除景点"${spot.name}"吗？此操作不可恢复。`)) {
    return
  }

  try {
    const res = await spotAPI.deleteSpot(spot.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadSpots()
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadSpots()
})
</script>

<style scoped>
.spot-management {
  max-width: 1400px;
  margin: 0 auto;
}

.spot-image-cell {
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spot-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.spot-thumbnail:hover {
  transform: scale(1.1);
}

.no-image {
  color: #909399;
  font-size: 12px;
  text-align: center;
}

.spot-name {
  font-weight: 600;
  color: #303133;
}

.spot-intro {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
}

.coordinates {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.dialog-large {
  max-width: 600px;
}

.form-item {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.upload-container {
  width: 100%;
}

.image-preview {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.preview-image {
  display: block;
  max-width: 300px;
  max-height: 200px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.upload-placeholder {
  position: relative;
}

.file-input {
  display: none;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .preview-image {
    max-width: 100%;
  }
}
</style>

