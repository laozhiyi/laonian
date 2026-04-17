# 🍊 橘上生香 - 老年生活服务平台

基于 UniApp + Vue 3 + uniCloud 开发的老年人学习与生活服务小程序

[![UniApp](https://img.shields.io/badge/UniApp-3.0-blue?style=flat-square)](https://uniapp.dcloud.io/)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-green?style=flat-square)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 📱 项目简介

「橘上生香」是一款专为老年人设计的学习与生活服务平台，提供丰富的在线课程、便捷的购物体验和贴心的个人服务。让老年生活更加丰富多彩，享受科技带来的便利。

## ✨ 功能特点

### 课程学习
- 📚 **丰富课程** - 涵盖健康养生、书法绘画、棋类博弈、烹饪美食、音乐艺术等多个领域
- 🎥 **视频教学** - 高清视频课程，随时随地学习新技能
- 📖 **课程分类** - 按类别浏览，快速找到感兴趣的课程

### 商城功能
- 🛒 **商品浏览** - 精选商品展示，支持搜索和筛选
- 🛒 **购物车** - 商品添加、数量修改、清空购物车
- 📋 **订单管理** - 下单、查看订单状态、确认收货
- 📍 **地址管理** - 收货地址的添加、编辑、删除、设为默认

### 个人中心
- 👤 **用户中心** - 个人信息管理、订单列表、地址管理
- 📝 **我的课程** - 收藏和管理感兴趣的课程
- 🔔 **消息通知** - 订单状态、活动通知

### 管理员功能
- 📦 **商品管理** - 商品上架、编辑、删除、库存管理
- 📊 **订单处理** - 查看订单、发货管理
- 📚 **课程管理** - 课程上架、编辑、删除
- 📈 **数据统计** - 销售统计、用户统计

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| **UniApp 3.0** | 跨平台应用开发框架 |
| **Vue 3** | 前端框架 (Composition API) |
| **Sass** | CSS 预处理器 |
| **uniCloud** | 云开发 (阿里云) |
| **Vite** | 构建工具 |
| **FastAPI** | 后端 API 服务 |
| **SQLite** | 数据库存储 |

## 📂 项目结构

```
xiaochengxu2/
├── src/                          # 前端源码 (UniApp + Vue 3)
│   ├── pages/                    # 页面组件
│   │   ├── index/                # 首页
│   │   ├── mall/                 # 商城页
│   │   ├── me/                   # 个人中心
│   │   ├── auth/                 # 登录注册
│   │   ├── product/              # 商品详情
│   │   ├── admin/                # 管理员页面
│   │   ├── order/                # 订单相关
│   │   ├── address/              # 地址管理
│   │   ├── checkout/             # 结算页面
│   │   └── external-course/      # 外部课程（列表+详情）
│   ├── components/               # 公共组件
│   ├── utils/                    # 工具函数
│   │   ├── request.js            # 请求封装
│   │   ├── cloud-db.js           # 云数据库操作
│   │   ├── cache.js              # 缓存工具
│   │   ├── user.js               # 用户相关
│   │   ├── product.js            # 商品相关
│   │   ├── cart.js               # 购物车相关
│   │   ├── order.js              # 订单相关
│   │   ├── address.js            # 地址相关
│   │   ├── course.js             # 课程相关
│   │   └── external-course.js    # 外部课程相关
│   ├── static/                   # 静态资源
│   │   ├── tabbar/               # TabBar 图标
│   │   └── covers/               # 课程封面图片
│   ├── App.vue                   # 应用入口
│   ├── main.js                   # JS 入口
│   ├── manifest.json             # 应用配置
│   ├── pages.json                # 页面配置
│   └── uni.scss                  # 全局样式
├── public/                       # 公共资源
├── backend/                      # 后端服务 (FastAPI)
│   ├── app/
│   │   ├── __init__.py           # 应用初始化
│   │   ├── database.py           # 数据库配置
│   │   ├── models/               # 数据模型
│   │   │   ├── user.py           # 用户模型
│   │   │   ├── product.py        # 商品模型
│   │   │   ├── cart.py           # 购物车模型
│   │   │   ├── order.py          # 订单模型
│   │   │   ├── address.py        # 地址模型
│   │   │   ├── course.py         # 课程模型
│   │   │   └── external_course.py # 外部课程模型
│   │   ├── routers/              # API 路由
│   │   │   ├── user.py           # 用户接口
│   │   │   ├── product.py        # 商品接口
│   │   │   ├── cart.py           # 购物车接口
│   │   │   ├── order.py          # 订单接口
│   │   │   ├── address.py        # 地址接口
│   │   │   ├── course.py         # 课程接口
│   │   │   └── external_course.py # 外部课程接口
│   │   ├── schemas/              # 数据验证模型
│   │   └── types/                # 类型定义
│   ├── data/                     # SQLite 数据库文件
│   ├── config.py                 # 配置文件
│   ├── main.py                   # FastAPI 主入口
│   ├── init_db.py                # 数据库初始化
│   ├── seed.py                   # 测试数据
│   ├── seed_external_courses.py  # 外部课程测试数据
│   ├── migrate_external_courses.py # 外部课程迁移脚本
│   ├── migrate_video_field.py     # 视频字段迁移脚本
│   ├── requirements.txt           # Python 依赖
│   ├── start.bat                 # Windows 启动脚本
│   └── start.sh                  # macOS/Linux 启动脚本
├── uniCloud-aliyun/              # uniCloud 配置
│   └── database/                 # 云数据库 schema
├── docs/                         # 项目文档
├── node_modules/                 # 依赖包
├── vite.config.js                # Vite 配置
├── package.json                  # 项目依赖
├── pyrightconfig.json            # Python 类型检查配置
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 环境要求

- HBuilderX 3.8+ 或 Node.js 18+
- npm 或 yarn
- Python 3.8+ (后端)

### 安装依赖

```bash
# 前端依赖
npm install

# 后端依赖
cd backend
pip install -r requirements.txt
```

### 运行项目

```bash
# H5 端开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# App 端
npm run dev:custom
```

### 启动后端

```bash
cd backend
python main.py
```

### 构建发布

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# App 构建 (在 HBuilderX 中操作)
# 发行 -> 原生App-云打包
```

## 📖 使用说明

### 账号说明

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin |
| 普通用户 | (自行注册) | (自行设置) |

### 课程分类

| 分类 | 说明 |
|------|------|
| 健康养生 | 保健知识、运动健身 |
| 棋类博弈 | 象棋、围棋、跳棋等 |
| 烹饪美食 | 各类美食制作教程 |
| 书法绘画 | 书法入门、国画技巧 |
| 音乐艺术 | 乐器演奏、声乐学习 |
| 科技数码 | 智能手机、电脑基础 |
| 文化艺术 | 诗词鉴赏、传统文化 |

## 📝 更新日志

### v1.0.0 (2025-02)
- ✨ 初始版本发布
- 📚 完成课程学习功能
- 🛒 完成商城核心功能
- 🛒 实现购物车功能
- 📋 实现订单管理
- 👤 实现用户系统
- ⚙️ 实现管理员功能

## 🤝 贡献指南

本项目仅用于学习演示，欢迎提出建议和反馈。

---

**橘上生香 · Orange Fragrance**

让老年生活更加精彩
