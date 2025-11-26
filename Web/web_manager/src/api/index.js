import request from '../utils/request'

// ==================== 模拟数据存储 ====================
// 模拟数据存储（用于模拟后端数据）
const mockData = {
  users: [
    { id: 101, username: '测试游客001', score: 50, createTime: '2023-11-20 10:00:00' },
    { id: 102, username: '张三', score: 30, createTime: '2023-11-21 09:00:00' },
    { id: 103, username: '李四', score: 80, createTime: '2023-11-19 14:00:00' },
    { id: 104, username: '王五', score: 120, createTime: '2023-11-18 16:00:00' },
    { id: 105, username: '赵六', score: 45, createTime: '2023-11-22 11:00:00' }
  ],
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
  ],
  checkIns: [
    { id: 55, userId: 101, spotId: 1, username: '测试游客001', spotName: '景区南大门', checkTime: '2023-11-21 14:30:00' },
    { id: 54, userId: 102, spotId: 2, username: '张三', spotName: '中心湖', checkTime: '2023-11-21 14:28:00' },
    { id: 53, userId: 103, spotId: 3, username: '李四', spotName: '观景台', checkTime: '2023-11-21 13:15:00' },
    { id: 52, userId: 101, spotId: 2, username: '测试游客001', spotName: '中心湖', checkTime: '2023-11-20 16:20:00' },
    { id: 51, userId: 104, spotId: 4, username: '王五', spotName: '文化广场', checkTime: '2023-11-20 15:10:00' }
  ]
}

// 模拟网络延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 生成ID（简单递增）
let spotIdCounter = 6
let checkInIdCounter = 56

// ==================== 用户管理API ====================
export const userAPI = {
  // 获取所有用户列表
  async getAllUsers() {
    // ========== 假数据版本（当前使用） ==========
    await delay(400)
    
    return {
      code: 200,
      data: [...mockData.users]
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({
    //   url: '/admin/user/all',
    //   method: 'get'
    // })
  },
  
  // 获取用户详情
  async getUserInfo(userId) {
    // ========== 假数据版本（当前使用） ==========
    await delay(300)
    
    const user = mockData.users.find(u => u.id === userId)
    if (!user) {
      return {
        code: 404,
        msg: '用户不存在'
      }
    }
    
    return {
      code: 200,
      data: user
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({
    //   url: '/user/info',
    //   method: 'get',
    //   params: { userId }
    // })
  }
}

// ==================== 景点管理API ====================
export const spotAPI = {
  // 获取所有景点列表
  async getSpotList() {
    // ========== 假数据版本（当前使用） ==========
    await delay(500)
    
    return {
      code: 200,
      data: [...mockData.spots]
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({
    //   url: '/spot/list',
    //   method: 'get'
    // })
  },
  
  // 添加景点
  async addSpot(data) {
    // ========== 假数据版本（当前使用） ==========
    await delay(600)
    
    const newSpot = {
      id: spotIdCounter++,
      ...data,
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    }
    
    mockData.spots.push(newSpot)
    
    return {
      code: 200,
      msg: '添加成功',
      data: newSpot
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({
    //   url: '/admin/spot/add',
    //   method: 'post',
    //   data
    // })
  },
  
  // 更新景点
  async updateSpot(spotId, data) {
    // ========== 假数据版本（当前使用） ==========
    await delay(600)
    
    const index = mockData.spots.findIndex(s => s.id === spotId)
    if (index === -1) {
      return {
        code: 404,
        msg: '景点不存在'
      }
    }
    
    mockData.spots[index] = {
      ...mockData.spots[index],
      ...data
    }
    
    return {
      code: 200,
      msg: '更新成功',
      data: mockData.spots[index]
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({
    //   url: `/admin/spot/${spotId}`,
    //   method: 'put',
    //   data
    // })
  },
  
  // 删除景点
  async deleteSpot(spotId) {
    // ========== 假数据版本（当前使用） ==========
    await delay(500)
    
    const index = mockData.spots.findIndex(s => s.id === spotId)
    if (index === -1) {
      return {
        code: 404,
        msg: '景点不存在'
      }
    }
    
    mockData.spots.splice(index, 1)
    
    return {
      code: 200,
      msg: '删除成功'
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({
    //   url: `/admin/spot/${spotId}`,
    //   method: 'delete'
    // })
  }
}

// ==================== 打卡记录管理API ====================
export const checkInAPI = {
  // 获取所有打卡记录
  async getAllCheckIns(params = {}) {
    // ========== 假数据版本（当前使用） ==========
    await delay(500)
    
    let result = [...mockData.checkIns]
    
    // 按时间倒序排列
    result.sort((a, b) => {
      return new Date(b.checkTime) - new Date(a.checkTime)
    })
    
    // 最多返回100条
    result = result.slice(0, 100)
    
    return {
      code: 200,
      data: result
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({
    //   url: '/admin/checkin/all',
    //   method: 'get',
    //   params
    // })
  }
}

// ==================== 统计数据API ====================
export const statsAPI = {
  // 获取仪表盘统计数据
  async getDashboardStats() {
    // ========== 假数据版本（当前使用） ==========
    await delay(600)
    
    const users = mockData.users
    const spots = mockData.spots
    const checkIns = mockData.checkIns
    
    const today = new Date().toISOString().split('T')[0]
    const todayCheckIns = checkIns.filter(ci => {
      return ci.checkTime && ci.checkTime.startsWith(today)
    }).length
    
    return {
      code: 200,
      data: {
        totalUsers: users.length,
        totalSpots: spots.length,
        totalCheckIns: checkIns.length,
        todayCheckIns: todayCheckIns,
        totalScore: users.reduce((sum, u) => sum + (u.score || 0), 0)
      }
    }
    
    // ========== 真实API版本（切换时取消注释，注释掉上面的假数据代码） ==========
    // return request({ url: '/admin/stats/dashboard', method: 'get' })
  }
}

// 导出mockData以便调试（可选）
export { mockData }
