# 景区打卡 - Web管理后台

企业级标准的景区打卡系统管理后台，基于 Vue 3 + Vite 构建。

## 功能特性

### 📊 仪表盘
- 数据统计概览（用户数、景点数、打卡数等）
- 数据可视化图表
- 最近打卡记录展示

### 👥 用户管理
- 用户列表查看
- 用户搜索功能
- 用户详情查看
- 积分统计

### 📍 景点管理
- 景点列表查看
- 景点添加、编辑、删除
- 景点搜索功能
- 坐标和积分管理

### ✅ 打卡记录管理
- 打卡记录列表
- 时间筛选（今日/本周/本月）
- 关键词搜索
- 数据导出（CSV格式）
- 记录详情查看

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **Axios** - HTTP客户端
- **Vite** - 下一代前端构建工具

## 项目结构

```
web_manager/
├── src/
│   ├── api/              # API接口定义
│   ├── components/       # 公共组件
│   │   └── Layout.vue   # 布局组件
│   ├── router/          # 路由配置
│   ├── stores/          # 状态管理
│   ├── utils/           # 工具函数
│   │   ├── request.js   # Axios封装
│   │   ├── message.js   # 消息提示
│   │   └── format.js    # 格式化工具
│   ├── views/           # 页面组件
│   │   ├── Dashboard.vue
│   │   ├── UserManagement.vue
│   │   ├── SpotManagement.vue
│   │   └── CheckInManagement.vue
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── package.json
└── vite.config.js
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## API配置

默认API地址：`http://localhost:8080/api`

如需修改，可在 `src/utils/request.js` 中修改 `baseURL`，或通过环境变量配置：

```env
VITE_API_BASE_URL=http://your-api-server.com/api
```

## 功能说明

### 用户管理
- 查看所有注册用户
- 支持用户名搜索
- 查看用户积分和注册时间

### 景点管理
- 完整的CRUD操作
- 支持景点名称和简介搜索
- 可设置景点坐标和打卡积分

### 打卡记录
- 查看所有用户的打卡记录
- 支持按时间筛选
- 支持用户名和景点名称搜索
- 可导出为CSV文件

## 企业级特性

✅ 统一的错误处理机制  
✅ 请求拦截和响应拦截  
✅ 消息提示系统  
✅ 响应式布局设计  
✅ 代码模块化组织  
✅ 可扩展的架构设计  
✅ 完善的用户体验  

## 注意事项

1. 确保后端API服务已启动（默认端口8080）
2. 如果后端接口未实现，系统会使用模拟数据
3. 部分功能需要后端支持，请根据实际情况调整

## 开发规范

- 使用 Composition API
- 组件采用 `<script setup>` 语法
- 样式使用 scoped 作用域
- API调用统一通过 `src/api/index.js`
- 工具函数统一放在 `src/utils/`

## License

MIT
