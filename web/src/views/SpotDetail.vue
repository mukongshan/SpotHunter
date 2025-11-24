<template>
  <div class="detail-layout">
    <header class="detail-top-bar">
      <div class="top-bar-content">
      <button class="ghost-btn" @click="goBack">返回总览</button>
      <div class="header-title">
        <p>SCENIC SPOT</p>
        <h1>{{ spot?.name || '景点详情' }}</h1>
      </div>
      <div class="header-meta" v-if="spot">
        <span>经度 {{ spot.longitude.toFixed(4) }}</span>
        <span>纬度 {{ spot.latitude.toFixed(4) }}</span>
      </div>
      </div>
    </header>

    <section v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>加载景点信息...</p>
    </section>

    <section v-else-if="error" class="state-box error">
      {{ error }}
    </section>

    <section v-else-if="spot" class="detail-content">
      <div class="visual-column">
        <div class="hero-card">
          <img :src="spot.image" :alt="spot.name" />
          <div class="hero-overlay">
            <div>
              <p>今日推荐景点</p>
              <h2>{{ spot.name }}</h2>
            </div>
            <div class="badge">打卡 +{{ spot.score }} 积分</div>
          </div>
        </div>

        <div class="mini-map">
          <header>
            <p>定位沙盘</p>
            <span>仅展示该景点的坐标关系</span>
          </header>
          <div class="mini-map__canvas">
            <div class="mini-map__grid"></div>
            <div class="mini-map__ring"></div>
            <div class="mini-map__marker">
              <span></span>
              <div>
                <strong>{{ spot.name }}</strong>
                <small>{{ spot.latitude.toFixed(5) }}, {{ spot.longitude.toFixed(5) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-column">
        <article class="info-card">
          <h3>景点简介</h3>
          <p>{{ spot.intro }}</p>
        </article>

        <article class="info-card">
          <h3>地理信息</h3>
          <div class="coords">
            <div>
              <span>Latitude</span>
              <strong>{{ spot.latitude.toFixed(6) }}</strong>
            </div>
            <div>
              <span>Longitude</span>
              <strong>{{ spot.longitude.toFixed(6) }}</strong>
            </div>
          </div>
        </article>

        <article class="info-card highlight">
          <div>
            <h3>现场打卡</h3>
            <p>请到达指定坐标，点击按钮即可完成现场打卡并累计积分。</p>
          </div>
          <button
            class="primary-btn"
            :disabled="checkingIn || alreadyCheckedIn"
            @click="handleCheckIn"
          >
            <span v-if="checkingIn">正在核验位置...</span>
            <span v-else-if="alreadyCheckedIn">今日已完成打卡</span>
            <span v-else>立即打卡</span>
          </button>
          <p v-if="alreadyCheckedIn" class="tip">今天已经完成该景点打卡，欢迎明日再来。</p>
        </article>
      </div>
    </section>

    <transition name="fade">
      <div v-if="checkInMessage" class="toast" @click="checkInMessage = ''">
        {{ checkInMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { spotAPI, checkInAPI } from '../api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const spot = ref(null)
const loading = ref(true)
const error = ref('')
const checkingIn = ref(false)
const checkInMessage = ref('')
const checkedInToday = ref(false)

const alreadyCheckedIn = computed(() => checkedInToday.value)

const loadSpotDetail = async () => {
  const spotId = parseInt(route.params.id)
  if (!spotId) {
    error.value = '无效的景点ID'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const response = await spotAPI.getSpotList()
    if (response.data.code === 200) {
      const foundSpot = response.data.data.find(s => s.id === spotId)
      if (foundSpot) {
        spot.value = foundSpot
        await checkTodayCheckIn()
      } else {
        error.value = '景点不存在'
      }
    } else {
      error.value = '加载景点信息失败'
    }
  } catch (err) {
    console.error('加载景点详情错误:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const checkTodayCheckIn = async () => {
  if (!userStore.user || !spot.value) return
  try {
    const response = await checkInAPI.getMyHistory(userStore.user.id)
    if (response.data.code === 200) {
      const today = new Date().toISOString().split('T')[0]
      const todayCheckIns = response.data.data.filter(record =>
        record.spotName === spot.value.name &&
        record.checkTime.startsWith(today.replace(/-/g, '-'))
      )
      checkedInToday.value = todayCheckIns.length > 0
    }
  } catch (err) {
    console.error('检查打卡记录错误:', err)
  }
}

const handleCheckIn = async () => {
  if (!spot.value || !userStore.user) return
  checkingIn.value = true
  try {
    let latitude = spot.value.latitude
    let longitude = spot.value.longitude
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          latitude = position.coords.latitude
          longitude = position.coords.longitude
          performCheckIn(latitude, longitude)
        },
        () => performCheckIn(latitude, longitude)
      )
    } else {
      performCheckIn(latitude, longitude)
    }
  } catch (err) {
    console.error('打卡错误:', err)
    checkInMessage.value = '打卡失败，请稍后重试'
    checkingIn.value = false
  }
}

const performCheckIn = async (latitude, longitude) => {
  try {
    const response = await checkInAPI.checkIn(
      userStore.user.id,
      spot.value.id,
      latitude,
      longitude
    )

    if (response.data.code === 200) {
      checkInMessage.value = response.data.msg || '打卡成功！'
      if (response.data.data?.newScore !== undefined) {
        userStore.user.score = response.data.data.newScore
      } else {
        await userStore.refreshUserInfo()
      }
      checkedInToday.value = true
      setTimeout(() => {
        checkInMessage.value = ''
      }, 3000)
    } else {
      checkInMessage.value = response.data.msg || '打卡失败'
      if (response.data.msg?.includes('已经打过卡')) {
        checkedInToday.value = true
      }
    }
  } catch (err) {
    console.error('打卡错误:', err)
    checkInMessage.value = err.response?.data?.msg || '网络错误，请稍后重试'
  } finally {
    checkingIn.value = false
  }
}

const goBack = () => router.back()

onMounted(() => {
  loadSpotDetail()
})
</script>

<style scoped>
.detail-layout {
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff5ec, #f0f6ff);
  color: #1d2540;
  padding: 32px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.detail-top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(15, 30, 80, 0.05);
  box-shadow: 0 8px 20px rgba(15, 30, 80, 0.08);
  margin: -32px -40px 32px;
  padding: 0 40px;
}

.top-bar-content {
  width: min(1200px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.ghost-btn {
  background: transparent;
  border: 1px solid rgba(29, 37, 64, 0.2);
  border-radius: 12px;
  padding: 10px 18px;
  color: #1d2540;
  cursor: pointer;
}

.header-title h1 {
  margin: 4px 0 0;
  font-size: 28px;
}

.header-title p,
.header-meta span {
  color: rgba(29, 37, 64, 0.55);
  font-size: 13px;
}

.header-meta {
  display: flex;
  gap: 14px;
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 28px;
}

.visual-column,
.info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 25px 45px rgba(15, 30, 80, 0.15);
}

.hero-card img {
  width: 100%;
  height: 320px;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.6));
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px;
  color: #fff;
}

.hero-overlay p {
  margin: 0;
  opacity: 0.85;
}

.hero-overlay h2 {
  margin: 6px 0 0;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 16px;
  border-radius: 14px;
}

.mini-map {
  background: #ffffff;
  border-radius: 22px;
  padding: 18px;
  border: 1px solid rgba(15, 30, 80, 0.05);
  box-shadow: 0 12px 30px rgba(15, 30, 80, 0.08);
}

.mini-map header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
}

.mini-map__canvas {
  height: 260px;
  border-radius: 18px;
  background: radial-gradient(circle at 30% 30%, #dfe8ff, #c3d6ff);
  position: relative;
  overflow: hidden;
}

.mini-map__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(29, 37, 64, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 37, 64, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}

.mini-map__ring {
  position: absolute;
  inset: 40px;
  border: 1px solid rgba(29, 37, 64, 0.08);
  border-radius: 50%;
}

.mini-map__marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
  align-items: center;
}

.mini-map__marker span {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb478, #ff7d78);
  box-shadow: 0 0 30px rgba(255, 125, 120, 0.5);
  animation: pulse 2s infinite;
}

.info-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 24px;
  border: 1px solid rgba(15, 30, 80, 0.05);
  box-shadow: 0 12px 30px rgba(15, 30, 80, 0.08);
}

.info-card h3 {
  margin: 0 0 12px;
}

.info-card p {
  margin: 0;
  color: rgba(29, 37, 64, 0.75);
  line-height: 1.8;
}

.coords {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.coords span {
  color: rgba(29, 37, 64, 0.55);
  display: block;
  margin-bottom: 6px;
}

.highlight {
  border: 1px solid rgba(255, 125, 120, 0.4);
  background: linear-gradient(135deg, rgba(255, 180, 120, 0.15), rgba(255, 125, 120, 0.12));
}

.primary-btn {
  width: 100%;
  background: linear-gradient(135deg, #ffb478, #ff7d78);
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  color: white;
  font-size: 16px;
  margin: 18px 0 8px;
  cursor: pointer;
  box-shadow: 0 15px 30px rgba(255, 125, 120, 0.35);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tip {
  margin: 0;
  color: rgba(29, 37, 64, 0.6);
  font-size: 14px;
}

.toast {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #44c268;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.state-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 22px;
  border: 1px solid rgba(15, 30, 80, 0.05);
  padding: 40px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(15, 30, 80, 0.08);
}

.state-box.error {
  color: #ff6d4b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 125, 120, 0.2);
  border-top-color: #ff7d78;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.9; }
  50% { transform: scale(1.3); opacity: 0.4; }
  100% { transform: scale(0.9); opacity: 0.9; }
}

@media (max-width: 1100px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
}
</style>
