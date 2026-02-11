# 🍊 橘上生香 - 柑橘农特产品商城小程序

<div align="center">

![Logo Placeholder](https://via.placeholder.com/150x150/FF9000/FFFFFF?text=🍊)

基于 UniApp + Vue 3 + uniCloud 开发的柑橘农特产品电商小程序

[![UniApp](https://img.shields.io/badge/UniApp-3.0-blue?style=flat-square)](https://uniapp.dcloud.io/)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-green?style=flat-square)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

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
uni-preset-vue-vite/
├── src/
│   ├── pages/            # 页面组件
│   │   ├── index/        # 首页
│   │   ├── mall/         # 商城
│   │   ├── me/           # 个人中心
│   │   ├── auth/         # 登录注册
│   │   ├── product/      # 商品详情
│   │   ├── admin/        # 管理员页面
│   │   ├── order/        # 订单相关
│   │   ├── address/      # 地址管理
│   │   └── checkout/     # 结算页面
│   ├── components/       # 公共组件
│   ├── utils/            # 工具函数
│   │   ├── request.js    # 网络请求封装
│   │   ├── user.js       # 用户相关
│   │   ├── product.js    # 商品相关
│   │   ├── cart.js       # 购物车相关
│   │   ├── order.js      # 订单相关
│   │   └── address.js    # 地址相关
│   ├── static/           # 静态资源
│   ├── App.vue           # 应用入口
│   ├── main.js           # JS 入口
│   └── manifest.json     # 应用配置
├── public/               # 公共资源
├── vite.config.js        # Vite 配置
└── package.json          # 项目依赖
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

### uniCloud 配置

1. 在 HBuilderX 中创建 uniCloud 项目
2. 关联阿里云服务空间
3. 上传 schema 和 cloudfunctions
4. 配置 manifest.json 中的 spaceId 和 clientSecret

## 📷 截图预览

<div align="center">

| 首页 | 商城 | 商品详情 |
|:---:|:---:|:---:|
| ![Home](https://via.placeholder.com/200x400/FFFAF5/FF9000?text=首页) | ![Mall](https://via.placeholder.com/200x400/FFFAF5/FF9000?text=商城) | ![Detail](https://via.placeholder.com/200x400/FFFAF5/FF9000?text=商品详情) |

| 购物车 | 订单 | 个人中心 |
|:---:|:---:|:---:|
| ![Cart](https://via.placeholder.com/200x400/FFFAF5/FF9000?text=购物车) | ![Order](https://via.placeholder.com/200x400/FFFAF5/FF9000?text=订单) | ![Profile](https://via.placeholder.com/200x400/FFFAF5/FF9000?text=个人中心) |

</div>

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

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

**橘上生香 · Orange Fragrance**

从果园到餐桌的美味旅程

</div>
