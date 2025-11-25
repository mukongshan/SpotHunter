<template>
  <header class="global-top-bar">
    <div class="top-bar-inner">
      <button class="logo" @click="goHome">
        <span class="badge">YUNLAN</span>
        <div>
          <strong>{{ title }}</strong>
          <small>{{ subtitle }}</small>
        </div>
      </button>
      <nav v-if="navItems.length" class="nav-links">
        <button
          v-for="item in navItems"
          :key="item.label"
          :class="{ active: item.active }"
          @click="handleNav(item)"
        >
          {{ item.label }}
        </button>
      </nav>
      <div v-else class="nav-spacer"></div>
      <div class="user-mini" v-if="userStore.user" @click="goProfile">
        <div>
          <span>欢迎</span>
          <strong>{{ userStore.user.username }}</strong>
        </div>
        <img :src="userStore.user.avatar" :alt="userStore.user.username" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const props = defineProps({
  title: {
    type: String,
    default: '云岚智慧景区'
  },
  subtitle: {
    type: String,
    default: '智慧导览 · 互动打卡'
  },
  navItems: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  router.push('/home')
}

const goProfile = () => {
  router.push('/profile')
}

const handleNav = (item) => {
  if (item?.to) {
    router.push(item.to)
  } else if (typeof item?.onClick === 'function') {
    item.onClick()
  }
}
</script>

<style scoped>
.global-top-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(15, 30, 80, 0.05);
  box-shadow: 0 10px 24px rgba(15, 30, 80, 0.08);
  backdrop-filter: blur(12px);
}

.top-bar-inner {
  width: min(1400px, calc(100% - 60px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 14px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border: none;
  background: transparent;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffb478, #ff7d78);
  color: white;
  font-size: 12px;
  letter-spacing: 1px;
}

.logo small {
  color: rgba(29, 37, 64, 0.6);
  font-size: 12px;
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.nav-spacer {
  height: 1px;
}

.nav-links button {
  border: none;
  background: transparent;
  color: rgba(29, 37, 64, 0.65);
  padding: 10px 18px;
  border-radius: 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-links button.active {
  background: rgba(255, 125, 120, 0.12);
  color: #ff7d78;
  font-weight: 600;
}

.user-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  justify-self: end;
}

.user-mini img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 125, 120, 0.25);
}

.user-mini span {
  display: block;
  font-size: 12px;
  color: rgba(29, 37, 64, 0.5);
}

@media (max-width: 960px) {
  .top-bar-inner {
    grid-template-columns: 1fr auto;
    gap: 12px;
    width: calc(100% - 32px);
    padding: 12px 0;
  }
  .nav-links {
    display: none;
  }
  .nav-spacer {
    display: none;
  }
  .logo {
    flex: 1;
    min-width: 0;
  }
  .logo strong {
    font-size: 15px;
  }
  .logo small {
    display: none;
  }
}

@media (max-width: 768px) {
  .top-bar-inner {
    width: calc(100% - 24px);
    padding: 10px 0;
    gap: 8px;
  }
  .logo {
    gap: 6px;
    min-width: 0;
  }
  .badge {
    padding: 4px 8px;
    font-size: 10px;
    flex-shrink: 0;
  }
  .logo > div {
    min-width: 0;
    overflow: hidden;
  }
  .logo strong {
    font-size: 14px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .logo small {
    display: none;
  }
  .nav-links {
    display: none;
  }
  .user-mini {
    gap: 6px;
    flex-shrink: 0;
  }
  .user-mini > div {
    display: none;
  }
  .user-mini img {
    width: 32px;
    height: 32px;
  }
}
</style>

