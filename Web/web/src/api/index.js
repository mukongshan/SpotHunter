import axios from 'axios'

// ==================== 真实API配置 ====================
// 创建axios实例（用于真实API调用）
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10秒超时
})

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 处理网络错误
    if (error.message === 'Network Error') {
      console.error('网络错误，请检查后端服务是否启动')
    }
    // 处理超时
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请稍后重试')
    }
    return Promise.reject(error)
  }
)

// ==================== 模拟数据存储 ====================
// 模拟数据存储（用于模拟后端数据）
const mockData = {
  users: new Map(), // 存储用户数据，key为username
  checkIns: [], // 存储打卡记录
  spots: [
    {
      id: 1,
      name: '景区南大门',
      intro: '这是景区的正门，始建于2020年，是游客进入景区的第一站。门楼气势恢宏，展现了景区的文化底蕴。',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      latitude: 30.2541,
      longitude: 120.2132,
      score: 10
    },
    {
      id: 2,
      name: '中心湖',
      intro: '风景优美的人工湖，湖水清澈见底，周围绿树成荫，是游客休闲放松的好去处。',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
      latitude: 30.2555,
      longitude: 120.2145,
      score: 20
    },
    {
      id: 3,
      name: '观景台',
      intro: '位于景区最高点，可以俯瞰整个景区的美景，是拍照打卡的绝佳位置。',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      latitude: 30.2568,
      longitude: 120.2158,
      score: 30
    },
    {
      id: 4,
      name: '文化广场',
      intro: '展示景区历史文化的中心广场，定期举办各种文化活动和表演。',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      latitude: 30.2535,
      longitude: 120.2125,
      score: 15
    },
    {
      id: 5,
      name: '花园小径',
      intro: '蜿蜒曲折的小径，两旁种满了各种花卉，四季都有不同的美景。',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      latitude: 30.2572,
      longitude: 120.2142,
      score: 25
    }
  ]
}

// 模拟网络延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 生成用户ID（简单递增）
let userIdCounter = 100

// 用户相关API
export const userAPI = {
  // 注册
  async register(username, password) {
    await delay(600)

    if (!username || !password) {
      return {
        data: {
          code: 400,
          msg: '请填写完整的账号和密码'
        }
      }
    }

    if (mockData.users.has(username)) {
      return {
        data: {
          code: 409,
          msg: '该账号已存在，请直接登录'
        }
      }
    }

    const newUserId = userIdCounter++
    const user = {
      id: newUserId,
      username,
      password,
      score: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserId}`
    }
    mockData.users.set(username, user)
    const { password: _, ...safeUser } = user

    return {
      data: {
        code: 200,
        msg: '注册成功',
        data: safeUser
      }
    }

    // 真实注册接口
    // return api.post('/user/register', { username, password })
  },

  // 登录
  async login(username, password) {
    await delay(600)

    if (!username || !password) {
      return {
        data: {
          code: 400,
          msg: '请填写完整的账号和密码'
        }
      }
    }

    const user = mockData.users.get(username)

    if (!user || user.password !== password) {
      return {
        data: {
          code: 401,
      msg: '账号或密码错误'
        }
      }
    }

    const { password: _, ...safeUser } = user
    return {
      data: {
        code: 200,
        msg: '登录成功',
        data: safeUser
      }
    }

    // return api.post('/user/login', { username, password })
  },
  
  // 获取用户信息
  async getUserInfo(userId) {
    // ========== 假数据版本（当前使用） ==========
    await delay(400)
    
    // 查找用户
    let user = null
    for (const [username, userData] of mockData.users.entries()) {
      if (userData.id === userId) {
        user = userData
        break
      }
    }
    
    if (!user) {
      return {
        data: {
          code: 404,
          msg: '用户不存在'
        }
      }
    }
    
    return {
      data: {
        code: 200,
        data: {
          id: user.id,
          username: user.username,
          score: user.score,
          avatar: user.avatar
        }
      }
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return api.get('/user/info', { params: { userId } })
  }
}

// 景点相关API
export const spotAPI = {
  // 获取所有景点列表
  async getSpotList() {
    // ========== 假数据版本（当前使用） ==========
    await delay(500)
    
    return {
      data: {
        code: 200,
        data: mockData.spots
      }
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return api.get('/spot/list')
  }
}

// 打卡相关API
export const checkInAPI = {
  // 执行打卡
  async checkIn(userId, spotId, latitude, longitude) {
    // ========== 假数据版本（当前使用） ==========
    await delay(800)
    
    // 查找用户
    let user = null
    for (const [username, userData] of mockData.users.entries()) {
      if (userData.id === userId) {
        user = userData
        break
      }
    }
    
    if (!user) {
      return {
        data: {
          code: 404,
          msg: '用户不存在'
        }
      }
    }
    
    // 查找景点
    const spot = mockData.spots.find(s => s.id === spotId)
    if (!spot) {
      return {
        data: {
          code: 404,
          msg: '景点不存在'
        }
      }
    }
    
    // 检查今天是否已经打过卡（简单检查，实际应该检查日期）
    const today = new Date().toISOString().split('T')[0]
    const alreadyCheckedIn = mockData.checkIns.some(
      ci => ci.userId === userId && ci.spotId === spotId && ci.checkTime.startsWith(today)
    )
    
    if (alreadyCheckedIn) {
      return {
        data: {
          code: 400,
          msg: '今天已经打过卡了，明天再来吧！'
        }
      }
    }
    
    // 创建打卡记录
    const checkInRecord = {
      id: mockData.checkIns.length + 1,
      userId: userId,
      spotId: spotId,
      username: user.username,
      spotName: spot.name,
      checkTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-'),
      image: spot.image
    }
    
    mockData.checkIns.push(checkInRecord)
    
    // 更新用户积分
    user.score += spot.score
    
    return {
      data: {
        code: 200,
        msg: `打卡成功！积分 +${spot.score}`,
        data: {
          newScore: user.score
        }
      }
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return api.post('/checkin', {
    //   userId,
    //   spotId,
    //   latitude,
    //   longitude
    // })
  },
  
  // 获取我的打卡记录
  async getMyHistory(userId) {
    // ========== 假数据版本（当前使用） ==========
    await delay(500)
    
    const userCheckIns = mockData.checkIns
      .filter(ci => ci.userId === userId)
      .map(ci => ({
        id: ci.id,
        spotName: ci.spotName,
        checkTime: ci.checkTime,
        image: ci.image
      }))
      .reverse() // 最新的在前
    
    return {
      data: {
        code: 200,
        data: userCheckIns
      }
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return api.get('/checkin/my-history', { params: { userId } })
  }
}

// 后台管理API
export const adminAPI = {
  // 获取所有打卡记录
  async getAllCheckIns() {
    // ========== 假数据版本（当前使用） ==========
    await delay(500)
    
    const allCheckIns = mockData.checkIns
      .map(ci => ({
        id: ci.id,
        username: ci.username,
        spotName: ci.spotName,
        checkTime: ci.checkTime
      }))
      .reverse() // 最新的在前
      .slice(0, 100) // 最多返回100条
    
    return {
      data: {
        code: 200,
        data: allCheckIns
      }
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return api.get('/admin/checkin/all')
  }
}

// 导出mockData以便调试（可选）
export { mockData }

