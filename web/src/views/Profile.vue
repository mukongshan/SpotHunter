<template>
  <div class="profile-page">
    <TopBar
      title="云岚智慧景区"
      subtitle="个人中心"
      :nav-items="navItems"
    />

    <section class="profile-hero">
      <div class="identity">
        <img :src="userStore.user?.avatar" :alt="userStore.user?.username" />
        <div>
          <p>访客身份</p>
          <h2>{{ userStore.user?.username }}</h2>
          <button @click="refreshScore" :disabled="refreshing">
            {{ refreshing ? '刷新中...' : '刷新积分' }}
          </button>
        </div>
      </div>
      <div class="score-pill">
        <span>当前积分</span>
        <strong>{{ userStore.user?.score || 0 }}</strong>
        <small>完成更多景点打卡即可升级</small>
      </div>
    </section>
    <section class="history-card">
      <div class="history-header">
        <div>
          <p>我的足迹</p>
          <h3>近期打卡记录</h3>
        </div>
        <router-link to="/home">返回互动沙盘 →</router-link>
      </div>

      <div v-if="loadingHistory" class="loading">加载中...</div>
      <div v-else-if="historyError" class="error">{{ historyError }}</div>
      <div v-else-if="checkInHistory.length === 0" class="empty">
        还没有打卡记录，今天就去完成第一条吧！
      </div>
      <div v-else class="history-list">
        <div
          v-for="record in checkInHistory"
          :key="record.id"
          class="history-item"
        >
          <img :src="record.image" :alt="record.spotName" class="history-image" />
          <div class="history-info">
            <h4 class="history-spot-name">{{ record.spotName }}</h4>
            <p class="history-time">{{ record.checkTime }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="logout-card">
      <div class="logout-content">
        <div>
          <h4>退出登录</h4>
          <p>退出后可使用头像再次登录，数据将继续保留。</p>
        </div>
        <button class="logout-btn" @click="handleLogout">退出账号</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { checkInAPI } from '../api'
import TopBar from '../components/TopBar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const checkInHistory = ref([])
const loadingHistory = ref(false)
const historyError = ref('')
const refreshing = ref(false)

const navItems = computed(() => [
  {
    label: '互动沙盘',
    to: '/home',
    active: route.path === '/home'
  },
  {
    label: '个人中心',
    to: '/profile',
    active: route.path === '/profile'
  }
])

// 加载打卡记录
const loadHistory = async () => {
  if (!userStore.user) return
  
  loadingHistory.value = true
  historyError.value = ''
  
  try {
    const response = await checkInAPI.getMyHistory(userStore.user.id)
    if (response.data.code === 200) {
      checkInHistory.value = response.data.data || []
    } else {
      historyError.value = '加载打卡记录失败'
    }
  } catch (err) {
    console.error('加载打卡记录错误:', err)
    historyError.value = '网络错误，请稍后重试'
  } finally {
    loadingHistory.value = false
  }
}

// 刷新积分
const refreshScore = async () => {
  refreshing.value = true
  await userStore.refreshUserInfo()
  refreshing.value = false
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (!userStore.user) {
    router.push('/login')
  } else {
    loadHistory()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff5ec, #f0f6ff);
  padding-bottom: 60px;
  color: #1d2540;
}

.profile-hero {
  width: min(1200px, calc(100% - 120px));
  margin: 40px auto 24px;
  background: linear-gradient(135deg, #fff3e4, #e3ecff);
  border-radius: 28px;
  padding: 32px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr) auto;
  gap: 24px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 30px 60px rgba(255, 178, 120, 0.25);
}

.identity {
  display: flex;
  gap: 20px;
  align-items: center;
}

.identity img {
  width: 96px;
  height: 96px;
  border-radius: 30px;
  border: 4px solid rgba(255, 125, 120, 0.4);
  object-fit: cover;
}

.identity button {
  border: none;
  border-radius: 12px;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.8);
  color: #ff7d78;
  font-size: 14px;
  cursor: pointer;
}

.identity button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.score-pill {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 22px;
  padding: 20px 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  text-align: center;
}

.score-pill span {
  display: block;
  font-size: 13px;
  color: rgba(29, 37, 64, 0.55);
}

.score-pill strong {
  display: block;
  font-size: 48px;
  margin: 6px 0;
  color: #ff7d78;
}

.logout-btn {
  border: none;
  border-radius: 14px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff9a5a, #ff6d4b);
  color: white;
  cursor: pointer;
  box-shadow: 0 12px 25px rgba(255, 109, 75, 0.35);
}

.history-card,
.logout-card {
  width: min(1200px, calc(100% - 120px));
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 28px 40px;
  border: 1px solid rgba(15, 30, 80, 0.05);
  box-shadow: 0 20px 40px rgba(15, 30, 80, 0.08);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 18px;
}

.history-header p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 12px;
  color: rgba(29, 37, 64, 0.55);
}

.history-header h3 {
  margin: 6px 0 0;
}

.history-header a {
  color: #ff7d78;
  text-decoration: none;
  font-size: 14px;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px;
  color: rgba(29, 37, 64, 0.6);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(249, 250, 255, 0.9);
  border-radius: 18px;
  border: 1px solid rgba(15, 30, 80, 0.05);
}

.history-image {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  object-fit: cover;
}

.history-info h4 {
  margin: 0 0 8px;
}

.history-info p {
  margin: 0;
  color: rgba(29, 37, 64, 0.6);
}

.logout-card {
  padding: 24px 28px;
  margin-top: 24px;
}

.logout-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-card h4 {
  margin: 0 0 6px;
}

.logout-card p {
  margin: 0;
  color: rgba(29, 37, 64, 0.6);
}

@media (max-width: 960px) {
  .profile-hero,
  .history-card,
  .logout-card {
    width: calc(100% - 32px);
    padding: 24px;
  }
  .profile-hero {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .identity {
    flex-direction: column;
    text-align: center;
  }
  .score-pill {
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding-bottom: 40px;
  }
  .profile-hero,
  .history-card,
  .logout-card {
    width: calc(100% - 24px);
    margin: 20px auto 16px;
    padding: 20px;
    border-radius: 20px;
  }
  .profile-hero {
    padding: 20px;
    gap: 16px;
  }
  .identity {
    gap: 12px;
  }
  .identity img {
    width: 72px;
    height: 72px;
    border-radius: 24px;
  }
  .identity h2 {
    font-size: 18px;
  }
  .identity button {
    padding: 6px 14px;
    font-size: 13px;
  }
  .score-pill {
    padding: 16px 20px;
  }
  .score-pill strong {
    font-size: 36px;
  }
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .history-header h3 {
    font-size: 18px;
  }
  .history-item {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  .history-image {
    width: 100%;
    height: 180px;
  }
  .logout-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .logout-btn {
    width: 100%;
    padding: 12px;
  }
}
</style>

