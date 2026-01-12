# 部署指南

本指南介绍如何将 Agricola Card Search 部署到各种平台。

## 构建生产版本

首先，构建生产版本：

```bash
cd web
npm run build
```

构建完成后，`dist` 目录包含所有静态文件。

## 部署选项

### 1. Vercel（推荐）

Vercel 提供免费托管和自动部署。

#### 步骤：

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 在 `web` 目录中运行：
```bash
vercel
```

3. 按照提示完成部署

#### 自动部署（推荐）：

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入你的 GitHub 仓库
4. 设置构建配置：
   - Framework Preset: `Vite`
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2. Netlify

Netlify 也提供免费托管。

#### 手动部署：

1. 访问 [netlify.com](https://netlify.com)
2. 拖拽 `dist` 目录到部署区域

#### 自动部署：

1. 将代码推送到 GitHub
2. 在 Netlify 中连接你的仓库
3. 设置构建配置：
   - Base directory: `web`
   - Build command: `npm run build`
   - Publish directory: `web/dist`

### 3. GitHub Pages

适合静态网站托管。

#### 步骤：

1. 安装 `gh-pages` 包：
```bash
npm install --save-dev gh-pages
```

2. 在 `package.json` 中添加脚本：
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. 更新 `vite.config.ts`，添加 base：
```typescript
export default defineConfig({
  base: '/agricola-chrome-plugin/',  // 替换为你的仓库名
  // ... 其他配置
})
```

4. 部署：
```bash
npm run deploy
```

### 4. 自托管（Docker）

如果你想自己托管，可以使用 Docker。

#### Dockerfile：

创建 `web/Dockerfile`：

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 构建和运行：

```bash
# 构建镜像
docker build -t agricola-card-search .

# 运行容器
docker run -d -p 8080:80 agricola-card-search
```

访问 `http://localhost:8080`

### 5. 静态文件服务器

最简单的方式是使用任何静态文件服务器。

#### 使用 serve：

```bash
npm install -g serve
cd web/dist
serve -s .
```

#### 使用 Python：

```bash
cd web/dist
python3 -m http.server 8000
```

## 环境变量配置

如果需要配置环境变量，在 `web` 目录创建 `.env` 文件：

```env
VITE_API_URL=https://your-api.com
```

在代码中使用：
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## 性能优化建议

### 1. 启用 GZIP 压缩

在 Nginx 中：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. 设置缓存头

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN

将 `dist` 目录上传到 CDN（如 Cloudflare、AWS CloudFront）。

### 4. 优化图片

如果有图片资源，使用 WebP 格式并进行压缩。

## 监控和分析

### Google Analytics

在 `index.html` 中添加：

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry 错误追踪

安装 Sentry：

```bash
npm install @sentry/react
```

在 `main.tsx` 中配置：

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  // ...
});
```

## 持续集成/部署 (CI/CD)

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          cd web
          npm ci
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./web
```

## 故障排除

### 构建失败

- 确保所有依赖已安装：`npm install`
- 清除缓存：`rm -rf node_modules package-lock.json && npm install`
- 检查 Node.js 版本：需要 18+

### 404 错误（部署后）

- 确保 SPA 路由配置正确
- 在 Netlify 创建 `_redirects` 文件：
  ```
  /* /index.html 200
  ```
- 在 Vercel 创建 `vercel.json`：
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### 数据文件 404

- 确保 `cards.json` 和 `authors.json` 在 `public` 目录
- 检查文件路径大小写

## 域名配置

部署后，可以配置自定义域名：

1. 在 DNS 提供商添加 CNAME 记录
2. 在托管平台（Vercel/Netlify）添加自定义域名
3. 等待 DNS 传播（可能需要 24-48 小时）

## 成本估算

- **Vercel/Netlify 免费套餐**: 足够个人项目使用
- **自托管**: 最低 $5/月（VPS）
- **CDN**: 按流量计费，小型项目通常 < $10/月

## 维护建议

1. 定期更新依赖：`npm update`
2. 监控网站性能和错误
3. 备份数据文件
4. 保持 Node.js 版本更新
