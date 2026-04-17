# 代码上传 Git 指南

本项目有两个 Git 远程仓库，用途不同：

| 远程仓库 | 地址 | 用途 |
|---------|------|------|
| `origin` | https://github.com/laozhiyi/laonian.git | GitHub，代码备份 |

---

## 一、准备工作

### 1. 确保本地 Git 已配置
```bash
git config --global user.name "laozhiyi"
git config --global user.email "你的GitHub邮箱@example.com"
```

### 2. 查看当前远程仓库
```bash
git remote -v
```
输出应包含 `origin`（GitHub）。

---

## 二、提交代码

### 推送到 GitHub（代码备份）

```bash
git add .
git commit -m "描述你的更改"
git push origin main      # 推送到 GitHub 主分支
# 或
git push origin master   # 推送到 GitHub 主分支
```

---

## 三、日常开发工作流

每次开发完成后，按以下顺序执行：

第 1 步：提交代码到 GitHub（备份）
```
git add .
git commit -m "完成了XX功能"
git push origin main
```

---

## 四、从远程仓库更新到本地

### 从 GitHub 拉取最新代码
```bash
git fetch origin main
git pull origin main
```

> 如果本地有未提交的更改，先 `git stash` 暂存，拉取完成后再 `git stash pop` 恢复。

---

## 五、分支管理

| 分支 | 用途 | 推送目标 |
|------|------|---------|
| `main` | 主分支，日常使用 | `origin` |

```bash
# 创建新分支
git checkout -b dev
git push -u origin dev    # 推送到 GitHub

# 切回 main
git checkout main

# 合并 dev 到 main 后推送
git merge dev
git push origin main
```

---

## 六、常见问题

### 1. 推送到 GitHub 时认证失败
推荐使用 **Personal Access Token** 或 GitHub CLI：
```bash
gh auth login
```

### 2. 如何确认代码已推送到 GitHub？
```bash
# 在本地查看最近提交
git log origin/main --oneline -5
```

### 3. 查看当前所有远程仓库
```bash
git remote -v
```

### 4. 添加新的远程仓库（如果需要）
```bash
# 添加 GitHub 仓库
git remote add origin https://github.com/laozhiyi/laonian.git
```

### 5. 如果之前有其他 origin，可以更新
```bash
git remote set-url origin https://github.com/laozhiyi/laonian.git
```

---

## 七、首次推送现有项目到新仓库

如果项目已有代码，需要推送到新的 GitHub 仓库：

```bash
# 1. 进入项目目录
cd 项目路径

# 2. 初始化 Git（如果还没有）
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "初始提交"

# 5. 添加远程仓库
git remote add origin https://github.com/laozhiyi/laonian.git

# 6. 推送到 GitHub
git push -u origin main
```
