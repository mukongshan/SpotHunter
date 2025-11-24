<template>
  <div class="auth-shell">
    <section class="hero-panel">
      <div class="hero-content">
        <p>YUNLAN SCENIC</p>
        <h1>云岚景区 · 数字打卡平台</h1>
        <p>统一的游客身份认证 · 电子沙盘 · 可视化打卡体验</p>
      </div>
      <div class="hero-footer">
        <span>智慧景区专项课题 · 2025</span>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-header">
        <h2>{{ mode === 'login' ? '账号登录' : '新访客注册' }}</h2>
        <p v-if="mode === 'login'">
          输入账号与密码完成身份校验，立即进入云岚景区。
        </p>
        <p v-else>
          首次访问请创建账号，后续可使用同一账号在任意终端登录。
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="form-field">
          <span>{{ mode === 'login' ? '账号' : '设置账号' }}</span>
          <input
            v-model="username"
            type="text"
            placeholder="例如：yunlan_admin"
            :disabled="loading"
            required
          />
        </label>

        <label class="form-field">
          <span>{{ mode === 'login' ? '密码' : '设置密码' }}</span>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :disabled="loading"
            required
          />
        </label>

        <label v-if="mode === 'register'" class="form-field">
          <span>确认密码</span>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :disabled="loading"
            required
          />
        </label>

        <button type="submit" :disabled="loading">
          <span v-if="loading">
            {{ mode === 'login' ? '正在核验身份...' : '创建账号中...' }}
          </span>
          <span v-else>{{ mode === 'login' ? '进入云岚景区' : '完成注册' }}</span>
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <transition name="fade">
        <div v-if="successMessage" class="success-toast">
          {{ successMessage }}
        </div>
      </transition>

      <div class="mode-toggle">
        <p v-if="mode === 'login'">
          <span>第一次到访？</span>
          <button type="button" @click="switchMode('register')">立即注册</button>
        </p>
        <p v-else>
          <span>已经拥有账号？</span>
          <button type="button" @click="switchMode('login')">返回登录</button>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const mode = ref('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const switchMode = (nextMode) => {
  if (mode.value === nextMode) return
  mode.value = nextMode
  error.value = ''
  successMessage.value = ''
  password.value = ''
  confirmPassword.value = ''
}

const handleSubmit = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请输入完整的账号和密码'
    return
  }

  error.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    if (mode.value === 'register') {
      if (password.value !== confirmPassword.value) {
        error.value = '两次输入的密码不一致'
        return
      }

      const result = await userStore.register(username.value.trim(), password.value)
      if (result.success) {
        successMessage.value = '注册成功，请使用该账号登录'
        mode.value = 'login'
        password.value = ''
        confirmPassword.value = ''
      } else {
        error.value = result.message
      }
    } else {
      const result = await userStore.login(username.value.trim(), password.value)
      if (result.success) {
        router.push('/home')
      } else {
        error.value = result.message
      }
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || '网络异常，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  background: linear-gradient(135deg, #fff5ec, #f1f5ff);
}

.hero-panel {
  background: url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  position: relative;
  padding: 48px;
  color: #1d2540;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(29, 37, 64, 0.1);
}

.hero-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 243, 228, 0.8));
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
}

.hero-content p:first-child {
  letter-spacing: 4px;
  font-size: 12px;
  color: rgba(29, 37, 64, 0.6);
}

.hero-content h1 {
  margin: 12px 0;
  font-size: 40px;
  color: #1d2540;
}

.hero-content p:last-child {
  font-size: 16px;
  color: rgba(29, 37, 64, 0.75);
}

.hero-footer {
  position: relative;
  z-index: 1;
  font-size: 13px;
  color: rgba(29, 37, 64, 0.6);
}

.form-panel {
  background: #ffffff;
  color: #1d2540;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
  box-shadow: -40px 0 60px rgba(15, 30, 80, 0.08);
}

.form-header h2 {
  margin: 0;
  font-size: 28px;
}

.form-header p {
  color: rgba(29, 37, 64, 0.6);
}

.auth-form {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

 .form-field span {
  display: block;
  margin-bottom: 8px;
  color: rgba(29, 37, 64, 0.6);
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(29, 37, 64, 0.15);
  background: rgba(249, 250, 255, 0.9);
  color: #1d2540;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: rgba(255, 166, 124, 0.8);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 166, 124, 0.2);
}

button {
  padding: 14px 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffb478, #ff7d78);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 15px 30px rgba(255, 125, 120, 0.35);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ff7b7b;
  font-size: 14px;
}

.success-toast {
  margin-top: 20px;
  padding: 12px 16px;
  background: rgba(47, 155, 88, 0.12);
  border: 1px solid rgba(47, 155, 88, 0.4);
  color: #1c6f3c;
  border-radius: 14px;
  font-size: 14px;
  box-shadow: 0 10px 25px rgba(47, 155, 88, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mode-toggle {
  margin-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: rgba(29, 37, 64, 0.65);
}

.mode-toggle p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mode-toggle button {
  border: none;
  background: transparent;
  color: #ff7d78;
  box-shadow: none;
  padding: 0;
  font-size: 14px;
  font-weight: 600;
}

.mode-toggle button:hover {
  text-decoration: underline;
}

@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }
  .hero-panel {
    display: none;
  }
  .form-panel {
    padding: 40px 24px;
  }
}
</style>
