# 洛谷保存站 · 旧版前端

<h3 align="center">LGS Legacy Client</h3>

<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</p>

<p align="center">
  将旧版 <a href="https://github.com/laikit-dev/luogu-saver">洛谷保存站</a> 的前端界面，连接上新版 <a href="https://github.com/Ark-Aak/luogu-saver-next">Luogu Saver Next</a> API 的成品。<br>
  保留旧版的使用体验，同时享受新版后端的全部能力。
</p>

---

## 目录

- [项目背景](#项目背景)
- [功能特性](#功能特性)
- [页面预览](#页面预览)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [部署](#部署)
- [页面路由](#页面路由)
- [API 引用](#api-引用)
- [项目结构](#项目结构)
- [相关项目](#相关项目)
- [贡献指南](#贡献指南)
- [许可证](#许可证)
- [致谢](#致谢)

---

## 项目背景

本项目涉及三个仓库，分别对应洛谷保存站发展的不同阶段：

```
luogu-saver (旧版全栈)
    └── 前端部分被重新实现为 → LGS-legacy-client (本仓库)
                                    └── 后端 API 对接 → luogu-saver-next (新版 API)
```

| 项目 | 仓库 | 说明 |
|------|------|------|
| **LGS-legacy-client** | [SomeoneHX/LGS-legacy-client](https://github.com/SomeoneHX/LGS-legacy-client) | **本仓库**。纯静态前端 SPA，保留旧版 UI 风格，连接新版 API |
| **luogu-saver** | [laikit-dev/luogu-saver](https://github.com/laikit-dev/luogu-saver) | 旧版保存站。Express 5 + Nunjucks 全栈应用，目前已不维护 |
| **luogu-saver-next** | [Ark-Aak/luogu-saver-next](https://github.com/Ark-Aak/luogu-saver-next) | 新版保存站。Koa 3 + Vue 3 前后端分离，提供全面 API |

旧版 luogu-saver 采用的是服务端渲染的全栈架构，而新版 luogu-saver-next 采用前后端分离模式并提供了完善的 API。本仓库将旧版前端界面移植为纯静态 SPA，直接调用新版后端 API，在保留经典交互体验的同时复用新版后端的存档能力。

---

## 功能特性

### 内容浏览

| 功能 | 说明 |
|------|------|
| 文章查看 | 浏览已存档的洛谷专栏文章，支持 LaTeX 数学公式渲染与 Shiki 代码语法高亮 |
| 剪贴板查看 | 浏览已存档的洛谷剪贴板内容 |
| 用户主页 | 查看已存档的用户资料与个人简介 |
| 原文跳转 | 一键打开洛谷原文链接 |
| 原文复制 | 一键复制原始 Markdown 内容 |
| 内容更新 | 触发后台重新抓取更新内容 |

### 发现与搜索

| 功能 | 说明 |
|------|------|
| 文章广场 | 手动点击加载更多，每次加载 20 篇，展示热门/推荐标签 |
| 最近更新 | 最新 20 篇更新文章，支持置顶、分类标签、题解关联 |
| 全文搜索 | 分页搜索已存档文章（数据每小时同步） |

### 存档任务

| 功能 | 说明 |
|------|------|
| URL 存档 | 粘贴洛谷文章/剪贴板/用户链接，一键触发后台存档工作流 |
| 任务追踪 | 实时轮询（1 秒间隔）查看存档任务的各步骤进度 |
| 失败重试 | 任务失败后可一键重新执行 |

### 数据监控

| 功能 | 说明 |
|------|------|
| 队列实时看板 | 基于 WebSocket/Socket.IO 的实时统计，展示保存/AI/更新/搜索/读取/RAG/发现 7 个队列状态 |
| 数据统计 | 首页及关于页面展示已存档文章、剪贴板总量 |

### 管理后台

| 功能 | 说明 |
|------|------|
| 队列监控 | 查看各队列等待、活跃、完成、失败任务数 |
| 公告管理 | 编辑站点公告内容，控制启用/关闭 |

### 其他

| 功能 | 说明 |
|------|------|
| Token 登录 | 通过 Token 登录账号，权限自动同步 |
| 用户设置 | 查看账号信息、登出 |
| 法律页面 | 隐私协议、免责声明、数据移除政策 |
| 移动端适配 | 响应式设计，支持手机与平板浏览 |
| SPA 路由 | 基于 History API 的无刷新页面切换 |

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 语言框架 | 纯 JavaScript（零构建步骤，无框架依赖） |
| UI 组件 | [Semantic UI](https://semantic-ui.com/) |
| 弹窗 | [SweetAlert2](https://sweetalert2.github.io/) |
| 数学公式 | [KaTeX](https://katex.org/) |
| 代码高亮 | [Shiki](https://shiki.style/)（ESM 从 CDN 加载） |
| 图标 | [Font Awesome 6](https://fontawesome.com/) |
| 实时通信 | [Socket.IO Client](https://socket.io/) |
| 等宽字体 | [Fira Code](https://github.com/tonsky/FiraCode) |
| 部署方式 | 纯静态文件，无需构建工具 |

---

## 快速开始

### 前置要求

- Node.js >= 18（用于 `npx serve`）
- 一个运行中的 [luogu-saver-next](https://github.com/Ark-Aak/luogu-saver-next) 后端实例

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/SomeoneHX/LGS-legacy-client.git
cd LGS-legacy-client

# 启动开发服务器
npx serve -s . -p 55087
```

### 配置后端地址

修改 `static/self/js/core/config.js` 中的 API 地址：

```js
window.__API_URL__ = 'https://api.luogu.me';  // 改为你的后端地址
```

默认值指向 `api.luogu.me`，如未设置则回退为相对路径 `/api`。

---

## 部署

### Nginx

项目中包含 `nginx.conf` 配置参考：

```nginx
server {
    listen 80;
    server_name luogu.me www.luogu.me;
    root /var/www/luogu-saver-legacy;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

### 任意静态文件服务器

将仓库目录下所有文件放置到任意 HTTP 服务器的静态根目录即可。因为这是一个零构建的纯静态 SPA，不需要编译、打包。

---

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 搜索、存档入口、数据概览 |
| `/article/:id` | 文章详情 | 查看已存档的文章 |
| `/paste/:id` | 剪贴板详情 | 查看已存档的剪贴板 |
| `/user/:id` | 用户主页 | 查看已存档的用户资料 |
| `/search` | 搜索页面 | 全文搜索已存档文章 |
| `/plaza` | 文章广场 | 发现文章（加载更多） |
| `/article/recent` | 最近更新 | 最近 20 篇更新文章 |
| `/task/:id` | 任务追踪 | 查看存档工作流进度 |
| `/statistic` | 队列统计 | 实时队列状态看板 |
| `/admin` | 管理后台 | 队列监控、公告管理 |
| `/settings` | 设置 | 账号信息、登出 |
| `/about` | 关于 | 项目介绍、数据统计 |
| `/legal/privacy` | 隐私协议 | 隐私保护政策 |
| `/legal/disclaimer` | 免责声明 | 免责条款 |
| `/legal/deletion` | 数据移除政策 | 数据删除流程说明 |

---

## API 引用

本项目调用的后端 API 端点一览：

| 方法 | 端点 | 用途 |
|------|------|------|
| GET | `/auth/me` | 获取当前登录用户信息 |
| GET | `/article/count` | 文章总数 |
| GET | `/paste/count` | 剪贴板总数 |
| GET | `/announcement/current` | 获取当前公告 |
| GET | `/article/recent` | 最近更新文章列表 |
| GET | `/plaza/get` | 文章广场分页获取 |
| GET | `/article/query/:id` | 查询单篇文章 |
| GET | `/paste/query/:id` | 查询单个剪贴板 |
| GET | `/user/query/:id` | 查询单个用户 |
| GET | `/search/articles` | 全文搜索文章 |
| GET | `/stats/queues` | 队列统计数据 |
| GET | `/workflow/query/:id` | 查询工作流状态 |
| GET | `/admin/announcement` | 获取公告配置（管理员） |
| POST | `/user/:id/refresh` | 触发用户资料刷新 |
| POST | `/workflow/create/template/:template` | 创建存档工作流 |
| PUT | `/admin/announcement` | 更新公告配置（管理员） |
| WS | `/websocket` (Socket.IO) | 实时队列状态推送 |

---

## 项目结构

```
LGS-legacy-client/
├── index.html                  # SPA 入口页面
├── auth-callback.html          # OAuth 登录回调处理
├── favicon.ico                 # 站点图标
├── nginx.conf                  # Nginx 部署配置
├── LICENSE                     # AGPL-3.0 开源协议
├── legal/                      # 法律页面（预留）
│
├── static/
│   ├── self/
│   │   ├── js/
│   │   │   ├── core/
│   │   │   │   ├── api.js          # HTTP 请求封装
│   │   │   │   ├── auth.js         # 认证逻辑（Token 登录/登出）
│   │   │   │   ├── config.js       # API 地址配置
│   │   │   │   └── router.js       # SPA 路由
│   │   │   ├── pages/
│   │   │   │   ├── home.js         # 首页
│   │   │   │   ├── article.js      # 文章详情
│   │   │   │   ├── paste.js        # 剪贴板详情
│   │   │   │   ├── user.js         # 用户主页
│   │   │   │   ├── search.js       # 搜索
│   │   │   │   ├── plaza.js        # 文章广场
│   │   │   │   ├── recent.js       # 最近更新
│   │   │   │   ├── task.js         # 任务追踪
│   │   │   │   ├── statistic.js    # 队列统计
│   │   │   │   ├── admin.js        # 管理后台
│   │   │   │   ├── settings.js     # 设置
│   │   │   │   ├── about.js        # 关于
│   │   │   │   └── legal.js        # 法律页面
│   │   │   ├── app.js              # 应用入口，路由注册
│   │   │   ├── render.js           # 渲染引擎（KaTeX + Shiki）
│   │   │   ├── utils.js            # URL 解析工具
│   │   │   └── display_utils.js    # 显示/剪贴板工具
│   │   ├── css/
│   │   │   ├── style.css           # 主样式
│   │   │   ├── markdown.css        # Markdown 渲染样式
│   │   │   ├── mobile.css          # 移动端响应式
│   │   │   ├── namecolor.css       # 洛谷用户名颜色
│   │   │   └── footer-link.css     # 页脚链接样式
│   │   ├── fonts/
│   │   │   └── FiraCode-*          # Fira Code 等宽字体
│   │   ├── img/                    # 图片资源
│   │   └── fonts/
│   ├── chartjs/                    # Chart.js
│   ├── fontawesome/                # Font Awesome
│   ├── jquery/                     # jQuery
│   ├── katex/                      # KaTeX
│   ├── semantic/                   # Semantic UI
│   └── sweetalert/                 # SweetAlert2
```

---

## 相关项目

| 项目 | 仓库链接 | 说明 |
|------|----------|------|
| 洛谷保存站（旧版） | [laikit-dev/luogu-saver](https://github.com/laikit-dev/luogu-saver) | 原版保存站，Express 5 + Nunjucks 全栈应用 |
| 洛谷保存站（新版） | [Ark-Aak/luogu-saver-next](https://github.com/Ark-Aak/luogu-saver-next) | 新版保存站，Koa 3 + Vue 3 前后端分离 |
| 本仓库 | [SomeoneHX/LGS-legacy-client](https://github.com/SomeoneHX/LGS-legacy-client) | 旧版前端改装版，纯静态 SPA 对接新版 API |

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/my-feature`
3. 提交变更：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin feature/my-feature`
5. 提交 Pull Request

---

## 许可证

本项目基于 **GNU Affero General Public License v3.0** (AGPL-3.0) 开源。完整的许可证文本见 [LICENSE](./LICENSE)。

本程序修改自 [laikit-dev/luogu-saver](https://github.com/laikit-dev/luogu-saver)，遵循 AGPL-3.0 协议。

---

## 致谢

### 原保存站开发者

- [Federico2903](https://github.com/Federico2903)
- [Murasame](https://github.com/Kaguya-chan)
- [quanac-lcx](https://github.com/quanac-lcx)

### 本项目开发者

- [SomeoneHX](https://github.com/SomeoneHX)
