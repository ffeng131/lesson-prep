# 部署到 Netlify 指南

## 🚀 部署方式

### 方式一：从 Git 仓库部署（推荐）

#### 步骤 1：准备 Git 仓库

```bash
# 进入项目目录
cd /Users/hljy/Documents/0-海科/0-鸿儒教研/产品原型/AI原型/手机端集备

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit - 集体备课 H5 端原型"

# 添加远程仓库（以 GitHub 为例）
git remote add origin https://github.com/yourusername/collective-lesson-prep.git

# 推送到远程仓库
git push -u origin main
```

#### 步骤 2：部署到 Netlify

1. **登录 Netlify**：访问 [Netlify Dashboard](https://app.netlify.com/)
2. **点击 "Add new site"** → "Import an existing project"
3. **选择 Git 提供商**（GitHub/GitLab/Bitbucket）
4. **选择你的仓库**
5. **配置部署设置**：
   - **Branch to deploy**: `main`
   - **Build command**: `echo 'Static files ready'`（保持默认或留空）
   - **Publish directory**: `.`（当前目录）
6. **点击 "Deploy site"**

#### 步骤 3：访问你的网站

部署完成后，Netlify 会自动分配一个域名，例如：
`https://your-project-name.netlify.app`

---

### 方式二：使用 Netlify CLI 部署

#### 步骤 1：安装 Netlify CLI

```bash
npm install -g netlify-cli
```

#### 步骤 2：登录 Netlify

```bash
netlify login
```

#### 步骤 3：部署项目

```bash
# 进入项目目录
cd /Users/hljy/Documents/0-海科/0-鸿儒教研/产品原型/AI原型/手机端集备

# 初始化 Netlify 项目
netlify init

# 部署到生产环境
netlify deploy --prod
```

---

### 方式三：拖放上传（最简单）

1. 访问 [Netlify Drop](https://app.netlify.com/drop)
2. 将项目文件夹拖放到浏览器中
3. 等待上传和部署完成
4. 获取部署地址

---

## ⚙️ 配置说明

### netlify.toml 配置文件

项目已包含 `netlify.toml` 配置文件，包含以下设置：

| 配置项 | 说明 |
|--------|------|
| `publish = "."` | 发布目录为当前目录 |
| `command` | 构建命令（静态项目无需构建） |
| `redirects` | 重定向规则（支持 SPA 路由） |
| `headers` | 缓存策略配置 |

### 自定义域名

1. 在 Netlify Dashboard 中选择你的项目
2. 进入 "Domain settings"
3. 添加自定义域名或配置 Netlify 提供的域名

---

## 📝 部署检查清单

- ✅ 项目根目录包含 `index.html`
- ✅ 已创建 `netlify.toml` 配置文件
- ✅ 所有资源文件路径正确（使用相对路径）
- ✅ 项目已推送到 Git 仓库（方式一）

---

## 🔗 相关链接

- **Netlify Dashboard**: https://app.netlify.com/
- **Netlify CLI 文档**: https://docs.netlify.com/cli/get-started/
- **Netlify 部署文档**: https://docs.netlify.com/site-deploys/create-deploys/

---

**部署成功后，你的项目将可以通过 Netlify 提供的域名公开访问！**