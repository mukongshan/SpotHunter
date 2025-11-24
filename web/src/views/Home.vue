<template>
  <div class="home-page">
    <TopBar
      title="云岚智慧景区"
      subtitle="打卡 · 导览 · 互动"
      :nav-items="navItems"
    />

    <div class="home-layout">
      <section class="hero-panel">
      <div class="hero-text">
        <p class="eyebrow">2025 云岚文旅 · 智慧打卡</p>
        <h1>把整座景区装进行程沙盘</h1>
        <p class="subtitle">
          通过数字化交互地图实时掌握景点热度、完成打卡任务，并同步后台积分。
          点击任意景点即可查看亮点与立即打卡。
        </p>
        <div class="hero-actions">
          <button class="primary" @click="resetView">回到沙盘中心</button>
        </div>
      </div>
        <div class="hero-stats">
        <div class="stat-card">
          <span>我的积分</span>
          <strong>{{ userStore.user?.score || 0 }}</strong>
          <small>完成更多景点打卡即可累积积分</small>
        </div>
        <div class="stat-card">
          <span>可打卡景点</span>
          <strong>{{ totalSpots }}</strong>
          <small>核心景观全部同步到电子沙盘</small>
        </div>
        <div class="stat-card">
          <span>今日推荐</span>
          <strong>云岚湖岸</strong>
          <small>光照 9/10 · 适合傍晚拍照</small>
        </div>
      </div>
      </section>

      <section class="info-strip">
        <article class="info-card">
          <h3>欢迎回来，{{ userStore.user?.username || '游客' }}</h3>
          <p>今日仍有 <strong>{{ totalSpots }}</strong> 个景点等待打卡。</p>
        </article>
        <article class="info-card soft">
          <p>天气良好 · 体感 23℃ · 轻微风速</p>
          <span>建议携带遮阳伞</span>
        </article>
        <article class="info-card soft">
          <p>沙盘数据实时更新，所有坐标已与景区导览同步。</p>
        </article>
      </section>

      <section class="map-panel">
      <div class="map-toolbar">
        <div>
          <h2>中心园区沙盘</h2>
          <p>拖拽调整视角 · 支持缩放与景点交互</p>
        </div>
        <div class="map-controls">
          <button @click="resetView">重置</button>
          <button @click="zoomOut">-</button>
          <button @click="zoomIn">+</button>
        </div>
      </div>

      <div class="map-stage" ref="mapStage" @pointerdown="startPan">
        <div v-if="loading" class="map-overlay">
          <div class="spinner"></div>
          <p>正在加载景点数据...</p>
        </div>
        <div v-else-if="error" class="map-overlay error">
          <p>{{ error }}</p>
          <button @click="loadSpots">重新加载</button>
        </div>

        <div v-show="!loading && !error" class="map-canvas" :style="mapTransform">
          <div class="map-background"></div>
          <div class="map-grid-overlay"></div>

          <transition-group name="marker">
            <div
              v-for="spot in spots"
              :key="spot.id"
              class="map-marker"
              :style="markerStyle(spot)"
              @click.stop="openSpotPopover(spot)"
            >
              <span class="marker-dot"></span>
              <span class="marker-label">{{ spot.name }}</span>
            </div>
          </transition-group>

          <div
            v-if="selectedSpot"
            class="spot-popover"
            :style="popoverStyle"
          >
            <header>
              <h3>{{ selectedSpot.name }}</h3>
              <button @click="closePopover">×</button>
            </header>
            <p>{{ selectedSpot.intro }}</p>
            <div class="spot-meta">
              <span>积分 +{{ selectedSpot.score }}</span>
              <small>{{ selectedSpot.latitude.toFixed(4) }}, {{ selectedSpot.longitude.toFixed(4) }}</small>
            </div>
            <div class="spot-actions">
              <button class="primary" :disabled="checkingIn" @click="handleCheckIn">
                {{ checkingIn ? '打卡中...' : '立即打卡' }}
              </button>
              <button class="ghost" @click="router.push(`/spot/${selectedSpot.id}`)">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer class="map-footer">
        <span>提示：点击任意景点标记即可查看简介并完成打卡</span>
      </footer>
      </section>
    </div>

    <transition name="fade">
      <div v-if="checkInMessage" class="toast" @click="checkInMessage = ''">
        {{ checkInMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { spotAPI, checkInAPI } from '../api'
import TopBar from '../components/TopBar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const spots = ref([])
const loading = ref(true)
const error = ref('')
const selectedSpot = ref(null)
const popoverPosition = ref({ top: '0%', left: '0%' })
const checkingIn = ref(false)
const checkInMessage = ref('')

const mapStage = ref(null)
const mapScale = ref(1)
const mapOffset = ref({ x: 0, y: 0 })
const lastOffset = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const pointerState = ref({ id: null, startX: 0, startY: 0 })

const bounds = computed(() => {
  if (!spots.value.length) return null
  const lats = spots.value.map(s => s.latitude)
  const lngs = spots.value.map(s => s.longitude)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  return { minLat, maxLat, minLng, maxLng }
})

const totalSpots = computed(() => spots.value.length)
const navItems = computed(() => [])

const loadSpots = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await spotAPI.getSpotList()
    if (response.data.code === 200) {
      spots.value = response.data.data
      await nextTick()
      resetView()
    } else {
      error.value = '加载景点列表失败'
    }
  } catch (err) {
    console.error('加载景点列表错误:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const mapTransform = computed(() => ({
  transform: `translate(${mapOffset.value.x}px, ${mapOffset.value.y}px) scale(${mapScale.value})`
}))

const markerStyle = (spot) => {
  if (!bounds.value) return {}
  const { minLat, maxLat, minLng, maxLng } = bounds.value
  const latRange = maxLat - minLat || 1
  const lngRange = maxLng - minLng || 1
  const top = ((maxLat - spot.latitude) / latRange) * 100
  const left = ((spot.longitude - minLng) / lngRange) * 100
  return { top: `${top}%`, left: `${left}%` }
}

const startPan = (event) => {
  const target = event.target
  if (!target.closest('.map-marker') && !target.closest('.spot-popover') && selectedSpot.value) {
    closePopover()
  }
  if (target.closest('.map-marker') || target.closest('.spot-popover')) {
    return
  }
  event.preventDefault()
  isPanning.value = true
  pointerState.value = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY
  }
  mapStage.value?.setPointerCapture(event.pointerId)
}

const handlePointerMove = (event) => {
  if (!isPanning.value || pointerState.value.id !== event.pointerId) return
  const dx = event.clientX - pointerState.value.startX
  const dy = event.clientY - pointerState.value.startY
  mapOffset.value = {
    x: lastOffset.value.x + dx,
    y: lastOffset.value.y + dy
  }
}

const stopPan = (event) => {
  if (!isPanning.value || pointerState.value.id !== event.pointerId) return
  isPanning.value = false
  lastOffset.value = { ...mapOffset.value }
  mapStage.value?.releasePointerCapture(event.pointerId)
}

const zoomIn = () => {
  mapScale.value = Math.min(mapScale.value + 0.1, 1.8)
}

const zoomOut = () => {
  mapScale.value = Math.max(mapScale.value - 0.1, 0.8)
}

const resetView = () => {
  mapScale.value = 1
  mapOffset.value = { x: 0, y: 0 }
  lastOffset.value = { x: 0, y: 0 }
}

const openSpotPopover = (spot) => {
  selectedSpot.value = spot
  const style = markerStyle(spot)
  popoverPosition.value = { ...style }
}

const closePopover = () => {
  selectedSpot.value = null
}

const popoverStyle = computed(() => ({
  top: popoverPosition.value.top,
  left: popoverPosition.value.left
}))

const handleCheckIn = async () => {
  if (!selectedSpot.value || !userStore.user) return
  checkingIn.value = true

  try {
    let latitude = selectedSpot.value.latitude
    let longitude = selectedSpot.value.longitude

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => performCheckIn(pos.coords.latitude, pos.coords.longitude),
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
      selectedSpot.value.id,
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
      setTimeout(() => (checkInMessage.value = ''), 3000)
    } else {
      checkInMessage.value = response.data.msg || '打卡失败'
    }
  } catch (err) {
    console.error('打卡错误:', err)
    checkInMessage.value = err.response?.data?.msg || '网络错误，请稍后重试'
  } finally {
    checkingIn.value = false
  }
}

onMounted(() => {
  loadSpots()
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopPan)
  window.addEventListener('pointercancel', stopPan)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', stopPan)
  window.removeEventListener('pointercancel', stopPan)
})
</script>

<style scoped>
:root {
  --bg: radial-gradient(circle at top, #fef7f2 0%, #f6fbff 45%, #edf3ff 100%);
  --panel: #ffffff;
  --border: rgba(15, 30, 80, 0.08);
  --text: #1d2540;
  --accent: #2a7cff;
  --sunset: linear-gradient(135deg, #ffb478, #ff7d78);
}

.home-page {
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 48px;
}

.home-page {
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 48px;
}

.home-layout {
  min-height: 100vh;
  padding: 32px 0 0;
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: min(1280px, calc(100% - 120px));
  margin: 24px auto 0;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  gap: 32px;
  background: linear-gradient(135deg, #fff3e4, #e3ecff);
  border-radius: 34px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 30px 60px rgba(255, 178, 120, 0.25);
  position: relative;
  overflow: hidden;
}

.hero-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80') center/cover;
  opacity: 0.12;
  pointer-events: none;
}

.hero-text {
  position: relative;
  z-index: 1;
}

.hero-text .eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: rgba(29, 37, 64, 0.7);
  text-transform: uppercase;
}

.hero-text h1 {
  margin: 12px 0;
  font-size: 40px;
  line-height: 1.2;
}

.subtitle {
  margin: 0;
  color: rgba(29, 37, 64, 0.75);
  font-size: 16px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-top: 28px;
}

.hero-actions button {
  border: none;
  border-radius: 16px;
  padding: 14px 22px;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(42, 124, 255, 0.15);
}

.hero-actions .primary {
  background: var(--sunset);
  color: white;
}

.hero-actions .ghost {
  background: rgba(255, 255, 255, 0.7);
  color: var(--text);
}

.hero-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px rgba(15, 30, 80, 0.12);
}

.stat-card span {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(29, 37, 64, 0.55);
}

.stat-card strong {
  display: block;
  margin: 8px 0;
  font-size: 32px;
}

.stat-card small {
  color: rgba(29, 37, 64, 0.6);
  font-size: 13px;
}

.info-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.info-card {
  background: var(--panel);
  border-radius: 18px;
  padding: 18px 24px;
  border: 1px solid var(--border);
  box-shadow: 0 12px 30px rgba(15, 30, 80, 0.08);
}

.info-card.soft {
  background: rgba(255, 255, 255, 0.9);
}

.info-card h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.info-card p,
.info-card span {
  margin: 0;
  color: rgba(29, 37, 64, 0.65);
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.score {
  background: rgba(42, 124, 255, 0.08);
  border: 1px solid rgba(42, 124, 255, 0.2);
  border-radius: 16px;
  padding: 10px 20px;
  text-align: center;
}

.score span {
  display: block;
  font-size: 12px;
  color: rgba(29, 37, 64, 0.6);
}

.score strong {
  font-size: 28px;
  color: #2a7cff;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-meta img {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(42, 124, 255, 0.2);
}

.user-meta p {
  margin: 0;
  font-weight: 600;
}

.user-meta a {
  color: rgba(29, 37, 64, 0.55);
  font-size: 14px;
  text-decoration: none;
}

.map-panel {
  background: var(--panel);
  border-radius: 28px;
  border: 1px solid var(--border);
  box-shadow: 0 30px 60px rgba(15, 30, 80, 0.08);
  display: flex;
  flex-direction: column;
}

.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border);
}

.map-toolbar h2 {
  margin: 0;
  font-size: 22px;
}

.map-toolbar p {
  margin: 6px 0 0;
  color: rgba(29, 37, 64, 0.55);
}

.map-controls {
  display: flex;
  gap: 12px;
}

.map-controls button {
  border: 1px solid var(--border);
  background: rgba(42, 124, 255, 0.08);
  color: var(--text);
  border-radius: 12px;
  padding: 8px 14px;
  cursor: pointer;
}

.map-stage {
  height: 620px;
  position: relative;
  overflow: hidden;
  cursor: grab;
}

.map-stage:active {
  cursor: grabbing;
}

.map-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  text-align: center;
  gap: 12px;
}

.map-overlay.error {
  color: #ff6d4b;
}

.map-overlay button {
  border: none;
  background: var(--sunset);
  color: white;
  border-radius: 999px;
  padding: 8px 20px;
  cursor: pointer;
}

.map-canvas {
  width: 100%;
  height: 100%;
  transform-origin: center;
  position: relative;
  transition: transform 0.15s ease-out;
}

.map-background {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, #e3eafe, #bfd5ff);
}

.map-grid-overlay {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(29, 37, 64, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 37, 64, 0.08) 1px, transparent 1px);
  background-size: 80px 80px;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.marker-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff6d4b;
  box-shadow: 0 10px 30px rgba(255, 109, 75, 0.4);
}

.marker-label {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 14px;
  padding: 6px 12px;
  font-size: 13px;
  box-shadow: 0 8px 20px rgba(20, 35, 80, 0.15);
}

.spot-popover {
  position: absolute;
  transform: translate(-50%, calc(-100% - 18px));
  width: 280px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 50px rgba(15, 30, 80, 0.15);
  padding: 18px;
}

.spot-popover header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spot-popover header button {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.spot-popover p {
  margin: 12px 0;
  color: rgba(29, 37, 64, 0.7);
  line-height: 1.6;
}

.spot-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(29, 37, 64, 0.6);
}

.spot-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.spot-actions button {
  flex: 1;
  border-radius: 12px;
  padding: 10px 0;
  border: none;
  cursor: pointer;
}

.spot-actions .primary {
  background: linear-gradient(135deg, #ff9a5a, #ff6d4b);
  color: white;
}

.spot-actions .ghost {
  background: rgba(42, 124, 255, 0.1);
  color: var(--text);
}

.map-footer {
  padding: 18px 32px;
  border-top: 1px solid var(--border);
  color: rgba(29, 37, 64, 0.6);
}

.toast {
  position: fixed;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  background: #2a7cff;
  color: white;
  padding: 12px 20px;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(42, 124, 255, 0.3);
  z-index: 40;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(42, 124, 255, 0.15);
  border-top-color: #2a7cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.map-overlay .spinner {
  margin-bottom: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 960px) {
  .home-layout {
    padding: 24px 0 32px;
    width: calc(100% - 32px);
  }
  .top-bar {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .nav-links {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .map-stage {
    height: 520px;
  }
}
</style>
