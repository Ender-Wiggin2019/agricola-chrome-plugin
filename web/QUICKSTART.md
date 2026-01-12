# 快速开始指南

## 安装和运行

### 方法 1: 使用启动脚本（推荐）

```bash
cd web
./start.sh
```

这个脚本会自动：
- 安装依赖（如果需要）
- 复制数据文件
- 启动开发服务器

### 方法 2: 手动步骤

```bash
cd web

# 1. 安装依赖
npm install

# 2. 复制数据文件
mkdir -p public
cp ../plugin/cards.json public/
cp ../plugin/authors.json public/

# 3. 启动开发服务器
npm run dev
```

## 访问应用

开发服务器启动后，在浏览器中访问：

```
http://localhost:5173
```

## 构建生产版本

```bash
npm run build
```

构建文件将生成在 `dist` 目录中。

预览生产版本：

```bash
npm run preview
```

## 功能特点

### 🔍 搜索功能
- 支持按卡牌编号（No）搜索
- 支持按中文名称搜索
- 支持按英文名称搜索
- 实时搜索，最多显示 3 个结果

### 🎨 卡牌展示
- **Tier 等级**：显示 Baitu、EN、Chen 三个评级系统
  - 不同等级使用不同颜色（绿色=优秀，红色=较差）
  - 等级旁边的 "+" 表示有详细评论
- **详细评论**：每个评级下方显示评论者的头像和评论内容
- **统计数据**：显示 Lumin 提供的统计数据
  - PWR (Power): 卡牌强度
  - ADP (Average Draft Position): 平均选秀位置
  - APR (Average Pick Round): 平均选择轮次
  - Draw Play Rate: 抽到后的使用率

### 🎯 颜色编码

**Baitu Tier (T0-T4)**
- 绿色 (T0-T1): 优秀
- 金色 (T2): 良好
- 橙色 (T3): 一般
- 红色 (T4): 较差

**EN/Chen Tier (A-F)**
- 绿色 (A-B): 优秀
- 黄绿色 (C): 良好
- 黄色 (D): 中等
- 橙色 (E): 一般
- 红色 (F): 较差

**ADP 统计**
- 绿色: < 2 (非常受欢迎)
- 黄色: 2-4.5 (较受欢迎)
- 红色: > 4.5 (不太受欢迎)

**Draw Play Rate**
- 绿色: > 90% (几乎必玩)
- 黄色: 70-90% (经常玩)
- 红色: < 70% (偶尔玩)

## 性能优化

- ✅ 使用 React.memo 和 useMemo 优化渲染
- ✅ 搜索结果限制在 3 个，避免过多 DOM 节点
- ✅ 轻量级组件库（shadcn/ui）
- ✅ 按需加载数据
- ✅ Tailwind CSS 生产环境自动清除未使用的样式

## 技术栈

- **Vite**: 快速构建工具
- **React 18**: UI 框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **shadcn/ui**: 组件库

## 文件结构

```
web/
├── public/           # 静态资源
│   ├── cards.json   # 卡牌数据
│   └── authors.json # 作者信息
├── src/
│   ├── components/  # React 组件
│   ├── lib/         # 工具函数
│   ├── types/       # TypeScript 类型
│   ├── App.tsx      # 主应用
│   └── main.tsx     # 入口文件
└── package.json     # 依赖配置
```

## 致谢

- Plugin creator: Ender
- Statistics: Lumin
- Tier and comments providers: Yuxiao_Huang, Chen233, Mark Hartnady
- Special thanks: Henry
