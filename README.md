# 什么值得学 - 在线课程学习平台

基于 UniApp + Vue 3 + uniCloud 开发的终身学习内容推荐小程序，帮助用户发现值得学习的优质课程。

[![UniApp](https://img.shields.io/badge/UniApp-3.0-blue?style=flat-square)](https://uniapp.dcloud.io/)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-green?style=flat-square)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 项目简介

「什么值得学」是一款专注于优质课程内容推荐的在线学习平台，为用户提供发现、浏览、学习、收藏课程的一站式体验。项目数据存储在 uniCloud 云服务中。

---

## 功能特点

### 用户端功能
- 首页推荐 — 精选课程展示，支持课程分类筛选
- 发现页 — 瀑布流浏览全部课程，支持关键词搜索
- 课程详情 — 课程介绍、讲师信息、适合人群、课程目录
- 学习记录 — 记录用户的学习进度和浏览历史
- 我的收藏 — 收藏感兴趣的课程
- 个人中心 — 学习记录、收藏管理、账号设置

### 管理员功能
- 课程管理 — 课程上架、编辑、删除、分类管理
- 订单管理 — 查看和处理用户订单
- 数据统计 — 平台数据概览
- 分类管理 — 课程分类的增删改

---

## 技术栈

| 技术 | 用途 |
|------|------|
| **UniApp 3.0** | 跨平台应用开发框架 |
| **Vue 3** | 前端框架 (Composition API) |
| **Sass** | CSS 预处理器 |
| **uniCloud** | 云开发 (阿里云) |
| **Vite** | 构建工具 |

---

## 项目结构

```
xiaochengxu/
├── src/
│   ├── pages/
│   │   ├── index/           # 首页
│   │   ├── discover/        # 发现页
│   │   ├── course/          # 课程详情
│   │   ├── search/          # 搜索页
│   │   ├── user/            # 用户中心、学习记录、收藏、设置等
│   │   ├── auth/            # 登录注册
│   │   └── admin/           # 管理后台（课程/订单/统计/分类管理）
│   ├── components/          # 公共组件
│   ├── utils/              # 工具函数
│   │   ├── cloud-db.js      # uniCloud 数据库操作
│   │   ├── user.js          # 用户相关
│   │   ├── course.js        # 课程相关
│   │   ├── order.js         # 订单相关
│   │   ├── favorite.js      # 收藏相关
│   │   ├── category.js      # 分类相关
│   │   ├── track.js         # 学习记录相关
│   │   └── mock-data.js     # 模拟数据
│   ├── static/              # 静态资源（图标等）
│   ├── App.vue              # 应用入口
│   ├── main.js              # JS 入口
│   ├── manifest.json        # 应用配置
│   └── pages.json           # 页面路由配置
├── uniCloud-aliyun/
│   ├── cloudfunctions/      # 云函数
│   └── database/            # 数据库 Schema
├── public/                   # 公共资源
├── vite.config.js            # Vite 配置
└── package.json             # 项目依赖
```

---

## 快速开始

### 环境要求

- HBuilderX 3.8+ 或 Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# H5 端开发（http://localhost:3000）
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 支付宝小程序
npm run dev:mp-alipay

# App 端
npm run dev:custom
```

### 构建发布

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# App 构建（在 HBuilderX 中操作）
# 发行 -> 原生App-云打包
```

---

## 使用说明

### 账号说明

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin |
| 普通用户 | (自行注册) | (自行设置) |

### uniCloud 配置

1. 在 HBuilderX 中创建 uniCloud 项目
2. 关联阿里云服务空间
3. 上传 schema 和 cloudfunctions
4. 配置 manifest.json 中的 spaceId 和 clientSecret

---

## 更新日志

### v1.0.0 (2025-02)
- 初始版本发布
- 完成首页推荐和课程展示
- 实现发现页瀑布流浏览
- 实现课程详情页
- 实现搜索功能
- 实现用户中心及学习记录
- 实现收藏功能
- 实现管理员功能

---

什么值得学 · Discover Worthy Learning
