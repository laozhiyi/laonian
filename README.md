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
| **Flask** | Python 后端框架 |
| **SQLite** | 轻量级本地数据库 |
| **Vite** | 构建工具 |

---

## 后端架构

本项目提供 **本地后端** 和 **uniCloud 云端** 两种部署方式，二选一即可。前端已统一封装，切换后端模式无需修改业务代码。

---

### 方式一：本地后端（Python Flask，推荐开发使用）

本地后端使用 **Flask** + **SQLite**，无需安装数据库软件，开箱即用。

#### 项目结构

```
backend/
├── app.py              # 应用入口，启动服务器
├── config.py           # 配置文件
├── init_data.py        # 初始化示例数据
├── requirements.txt    # Python 依赖
├── models/             # 数据模型
│   └── __init__.py     # 8张数据表（User/Category/Course/Order/Favorite/BrowseLog/ClickLog/Address/Cart）
├── routes/             # API 路由
│   ├── __init__.py     # 路由注册
│   ├── auth.py         # 认证接口（登录/注册/个人资料）
│   ├── course.py       # 课程接口（CRUD）
│   ├── category.py     # 分类接口（CRUD）
│   ├── favorite.py     # 收藏接口
│   ├── order.py        # 订单接口
│   └── log.py          # 日志接口
└── utils/              # 工具函数
    ├── auth.py         # Token 生成与验证、密码哈希
    └── id_generator.py # ID 生成器
```

#### 数据库表（9张）

与 uniCloud Schema 对应，共 9 张表：

| 表名 | 说明 |
|------|------|
| users | 用户表（openid/nickname/avatar/role/佣金相关） |
| categories | 课程分类表 |
| courses | 课程表（完整字段同 uniCloud Schema） |
| orders | 分销订单表（pending/confirmed/settled） |
| favorites | 收藏表 |
| browse_logs | 浏览日志表 |
| click_logs | 点击日志表 |
| addresses | 收货地址表 |
| cart | 购物车表 |

#### API 路由一览

| 路由 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | 公开 |
| `/api/auth/login` | POST | 登录 | 公开 |
| `/api/auth/register` | POST | 注册 | 公开 |
| `/api/auth/profile` | GET/PUT | 个人资料 | 需登录 |
| `/api/auth/change-password` | POST | 修改密码 | 需登录 |
| `/api/courses` | GET | 课程列表（分页/筛选/搜索） | 公开 |
| `/api/courses/featured` | GET | 精选课程 | 公开 |
| `/api/courses/recommended` | GET | 推荐课程 | 公开 |
| `/api/courses/<id>` | GET/PUT/DELETE | 课程 CRUD | 公开读/管理员写 |
| `/api/categories` | GET/POST | 分类列表/创建 | 公开读/管理员写 |
| `/api/categories/<id>` | PUT/DELETE | 分类更新/删除 | 管理员 |
| `/api/favorites` | GET/POST | 收藏列表/添加 | 需登录 |
| `/api/favorites/<id>` | DELETE | 取消收藏 | 需登录 |
| `/api/favorites/toggle` | POST | 切换收藏状态 | 需登录 |
| `/api/orders` | GET/POST | 订单列表/创建 | 需登录 |
| `/api/orders/admin/list` | GET | 管理员订单列表 | 管理员 |
| `/api/orders/stats` | GET | 订单统计 | 管理员 |
| `/api/orders/<id>/confirm` | POST | 确认订单 | 管理员 |
| `/api/orders/<id>/settle` | POST | 结算订单 | 管理员 |
| `/api/logs/browse` | GET/POST | 浏览日志 | 公开写/需登录读 |
| `/api/logs/click` | GET/POST | 点击日志 | 公开写/需登录读 |

#### 启动本地后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 初始化数据（首次运行）
python init_data.py

# 启动服务器
python app.py
```

服务器运��在 `http://localhost:3001`，首次启动会自动：
1. 创建 SQLite 数据库文件（`backend/instance/app.db`）
2. 初始化管理员账号 `admin / admin`
3. 初始化 10 个分类 + 10 个示例课程

> 前端开发时需先启动后端。前端通过 `src/utils/cloud-db.js` 中的 `BASE_URL` 连接本地后端，默认 `http://localhost:3001`。

---

### 方式二：uniCloud 云端（生产使用）

本项目采用 **uniCloud** 作为后端服务（BaaS），集成了云数据库和云函数，无需自建服务器。

### 服务商

| 项目 | 内容 |
|------|------|
| 云服务商 | 阿里云 |
| 服务空间 ID | `mp-44a3c609-7e27-4c17-9550-27f618288f6a` |
| 数据区域 | 阿里云（自动就近接入） |

### 云数据库（Schema 设计）

```
uniCloud-aliyun/database/
├── users.schema.json        # 用户表
├── courses.schema.json      # 课程表
├── categories.schema.json   # 分类表
├── orders.schema.json       # 订单表（分销订单）
├── favorites.schema.json     # 收藏表
├── browse-logs.schema.json  # 浏览日志表
├── click-logs.schema.json   # 点击/跳转日志表
├── addresses.schema.json    # 收货地址表
└── cart.schema.json         # 购物车表
```

#### 用户表（users）

| 字段 | 类型 | 说明 |
|------|------|------|
| openid | string | 微信 OpenID |
| nickname | string | 昵称 |
| avatar | string | 头像 URL |
| role | string | 角色 user/admin |
| fontSize | string | 字体大小设置 |
| interestTags | array | 兴趣标签 |
| interestWeights | object | 兴趣权重（用于推荐） |
| totalCommission | number | 累计佣金（分） |
| withdrawableCommission | number | 可提现佣金（分） |

**权限规则**：用户只能读写自己的数据，管理员可读写所有数据。

#### 课程表（courses）

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 课程标题 |
| subtitle | string | 副标题/简介 |
| cover | string | 封面图片 URL |
| categoryId | string | 分类 ID |
| categoryName | string | 分类名称 |
| tags | array | 标签数组 |
| instructor | object | 讲师信息（name/avatar/bio） |
| platform | string | 来源平台（得到/小鹅通等） |
| originalUrl | string | 第三方原始购买链接 |
| promoteUrl | string | 推广追踪链接 |
| promoteCode | string | 推广码 |
| commissionRate | number | 佣金比例（%） |
| price | number | 原价（分） |
| priceNow | number | 现价（分） |
| discountText | string | 折扣说明 |
| studentCount | int | 学习人数 |
| rating | number | 评分 |
| suitableFor | string | 适合人群 |
| description | string | 详细描述 |
| outline | array | 课程大纲 |
| isFeatured | bool | 是否精选 |
| isHot | bool | 是否热门 |
| status | string | 状态 online/offline |
| viewCount | int | 浏览次数 |
| clickCount | int | 点击跳转次数 |

**权限规则**：课程公开可读，管理员可创建/编辑/删除。

#### 分类表（categories）

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 分类名称 |
| icon | string | 分类图标（emoji） |
| sortOrder | int | 排序 |
| status | string | 状态 active/inactive |

#### 订单表（orders）

分销订单，记录用户通过推广链接产生的订单。

| 字段 | 类型 | 说明 |
|------|------|------|
| orderNo | string | 第三方订单号 |
| courseId | string | 课程 ID |
| courseTitle | string | 课程标题 |
| userId | string | 用户 ID |
| promoteCode | string | 推广码 |
| platform | string | 来源平台 |
| orderAmount | number | 订单金额（分） |
| commission | number | 佣金金额（分） |
| commissionRate | number | 佣金比例 |
| status | string | 状态 pending/confirmed/settled |

**权限规则**：用户只能查看自己的订单，管理员可管理所有订单。

#### 收藏表（favorites）

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| courseId | string | 课程 ID |
| courseTitle | string | 课程标题（冗余） |
| courseCover | string | 课程封面（冗余） |

#### 浏览日志表（browse-logs）

记录用户浏览行为，用于用户画像和推荐。

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| courseId | string | 课程 ID |
| action | string | 动作 view/click/favorite |
| promoteCode | string | 来源推广码 |
| source | string | 来源 home/recommend/search/category |

#### 点击日志表（click-logs）

记录用户点击跳转第三方平台的行为，用于分佣追踪。

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| courseId | string | 课程 ID |
| promoteCode | string | 推广码 |
| promoteUrl | string | 跳转链接 |
| platform | string | 来源平台 |
| ip | string | IP 地址 |

### 云函数

| 云函数 | 说明 |
|--------|------|
| `seed-data` | 初始化示例数据（分类、课程、管理员账号） |

### 前端数据访问层

`src/utils/cloud-db.js` 封装了数据库操作的封装函数：

| 函数 | 说明 |
|------|------|
| `getDB()` | 获取数据库实例 |
| `isUniCloudAvailable()` | 检查 uniCloud 是否可用 |
| `dbGet(collection, id)` | 查询单条记录 |
| `dbAdd(collection, data)` | 添加记录 |
| `dbUpdate(collection, id, data)` | 更新记录 |
| `dbRemove(collection, id)` | 删除记录 |
| `dbWhere(collection, condition, options)` | 条件查询 |
| `uploadFile(filePath, cloudPath)` | 上传文件 |

---
![1776353076381](image/README/1776353076381.p

---

## 快速开始

### 环境要求

- Node.js 18+ / npm / yarn（前端）
- Python 3.9+ / pip（本地后端，可选）
- HBuilderX 3.8+（uniCloud 云端部署方式，可选）

### 1. 启动本地后端（推荐）

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 初始化数据（首次运行）
python init_data.py

# 启动服务器（运在 http://localhost:3001）
python app.py
```

> 首次运行会自动创建 SQLite 数据库（`backend/instance/app.db`）并初始化示例数据。
> 默认管理员账号：`admin` / `admin`

### 2. 启动前端

```bash
# 安装前端依赖
npm install

# H5 端开发（http://localhost:3000）
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 支付宝小程序
npm run dev:mp-alipay

# App 端
npm run dev:custom
```

### 3. 部署方式对比

| 项目 | 本地后端 | uniCloud 云端 |
|------|---------|------------|
| 数据库 | SQLite（本地文件） | 阿里云数据库 |
| 无需安装 | 是（自带数据库） | 是（云服务） |
| 适合场景 | 开发调试 | 生产环境 |
| 访问地址 | http://localhost:3001 | 云端自动分配 |
| 配置复杂度 | 低 | 中 |

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

### uniCloud 配置（可选，仅使用云端部署时需要）

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
