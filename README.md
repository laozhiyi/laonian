# 🍊 橘上生香 - 柑橘农特产品商城小程序

基于 UniApp + Vue 3 + uniCloud 开发的柑橘农特产品电商小程序

[![UniApp](https://img.shields.io/badge/UniApp-3.0-blue?style=flat-square)](https://uniapp.dcloud.io/)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-green?style=flat-square)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 📱 项目简介

「橘上生香」是一款专为柑橘类农特产品设计的展示与销售小程序，提供完整的商城购物体验。项目仅用于演示和个人学习交流，数据存储在 uniCloud 云服务中。

## ✨ 功能特点

### 商城功能
- 🍊 **商品浏览** - 瀑布流展示商品，支持搜索和筛选
- 🛒 **购物车** - 商品添加、数量修改、清空购物车
- 📋 **订单管理** - 下单、查看订单状态、确认收货、退货
- 📍 **地址管理** - 收货地址的添加、编辑、删除、设为默认
- 👤 **个人中心** - 订单列表、地址管理、登录注册

### 管理员功能
- 📦 **商品管理** - 商品上架、编辑、删除、库存管理
- 📊 **订单处理** - 查看订单、发货管理

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| **UniApp 3.0** | 跨平台应用开发框架 |
| **Vue 3** | 前端框架 (Composition API) |
| **Sass** | CSS 预处理器 |
| **uniCloud** | 云开发 (阿里云) |
| **Vite** | 构建工具 |

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
│   │   └── external-course/      # 外部课程详情
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

### 安装依赖

```bash
# 使用 HBuilderX
# 直接打开项目运行即可

# 或使用命令行
npm install
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

### 本地后端配置

如需使用本地后端替代 uniCloud 云数据库，按以下步骤操作：

**1. 安装 Python 依赖**

```bash
cd backend
pip install -r requirements.txt
```

**2. 初始化数据库**

```bash
python init_db.py    # 创建表结构
python seed.py       # 添加测试数据
```

**3. 启动后端服务**

```bash
# 方式一：使用脚本（Windows）
start.bat

# 方式二：命令行启动
python main.py
python -m uvicorn main:app --reload --port 8000
# 常用参数：
python main.py -p 9000          # 指定端口 9000
python main.py -H 127.0.0.1     # 仅本地访问
python main.py -r               # 启用热更新
python main.py -r -p 9000       # 热更新 + 指定端口
```


**6. 前端配置**

修改 `src/utils/cloud-db.js`，将 `BASE_URL` 改为 `http://localhost:8000`（已在代码中配置）。

### uniCloud 配置（可选）

1. 在 HBuilderX 中创建 uniCloud 项目
2. 关联阿里云服务空间
3. 上传 schema 和 cloudfunctions
4. 配置 manifest.json 中的 spaceId 和 clientSecret

## 📝 更新日志

### v1.0.0 (2025-02)
- ✨ 初始版本发布
- 🍊 完成商城核心功能
- 🛒 实现购物车功能
- 📋 实现订单管理
- 👤 实现用户系统
- ⚙️ 实现管理员功能

## 🤝 贡献指南

本项目仅用于学习演示，欢迎提出建议和反馈。

---

**橘上生香 · Orange Fragrance**

从果园到餐桌的美味旅程
