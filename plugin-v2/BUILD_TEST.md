# Plugin-v2 本地打包测试报告

## 📦 打包脚本

新增了本地打包脚本 `scripts/build-local.sh`，不会发布到 GitHub。

### 可用命令

```bash
# 完整打包（所有语言）
npm run build:local

# 指定语言打包
npm run build:local:en   # 英文版 (en+zh, default=en)
npm run build:local:zh   # 中文版 (en+zh, default=zh)
npm run build:local:jp   # 日文版 (en+jp, default=jp)

# 打包所有版本
npm run build:local:all   # 依次打包 en, zh, jp 三个版本
```

## ✅ 测试结果

### 1. 完整打包 (build:local)

- **文件名**: `agricola-tutor-full.zip`
- **大小**: 563K
- **包含语言**: en, zh, jp (所有语言)
- **default_locale**: en (来自 package.json)
- **cards.json**: 832 张卡，1550.7 KB

### 2. 英文版 (build:local:en)

- **文件名**: `agricola-tutor-en.zip`
- **大小**: 553K
- **包含语言**: en, zh
- **default_locale**: en
- **_locales 目录**: en/, zh/
- **cards.json**:
  - 所有卡片的 `localeDescs` 只保留 en, zh
  - 所有卡片的 `localeNames` 只保留 en, zh
  - 所有卡片的 `tiers[].localeDescs` 只保留 en, zh
  - 所有卡片的 `defaultLang` 设置为 en
- **大小缩减**: 0.3% (从 1550.7 KB 降至 1546.8 KB)

### 3. 中文版 (build:local:zh)

- **文件名**: `agricola-tutor-zh.zip`
- **大小**: 553K
- **包含语言**: en, zh
- **default_locale**: zh
- **_locales 目录**: en/, zh/
- **cards.json**: 与 en 版本相同，但 `defaultLang` 设置为 zh
- **大小缩减**: 0.3%

### 4. 日文版 (build:local:jp)

- **文件名**: `agricola-tutor-jp.zip`
- **大小**: 514K
- **包含语言**: en, jp
- **default_locale**: jp
- **_locales 目录**: en/, jp/ (注意：没有 zh/)
- **cards.json**:
  - 所有卡片的 `localeDescs` 只保留 en, jp
  - 所有卡片的 `localeNames` 只保留 en, jp
  - 所有卡片的 `tiers[].localeDescs` 只保留 en, jp
  - 所有卡片的 `defaultLang` 设置为 jp
- **大小缩减**: 26.8% (从 1550.7 KB 降至 1134.9 KB)
  - **主要原因**: 移除了所有中文翻译数据

## 🎯 功能特性

### build-local.sh 脚本功能

1. **自动检测包管理器**
   - 优先使用 pnpm
   - 如果没有 pnpm 则使用 npm

2. **多语言过滤**
   - 调用 `filter-locales.js` 过滤 cards.json
   - 过滤 `localeNames`, `localeDescs`, `tiers[].localeDescs`
   - 设置 `defaultLang` 字段

3. **语言文件管理**
   - 移除不需要的 `_locales/` 子目录
   - 自动创建缺失的语言目录（从 en 复制作为 fallback）
   - 支持 en, zh, jp 三种目标语言

4. **Manifest 更新**
   - 使用 node 安全更新 `manifest.json` 中的 `default_locale`
   - 确保每个语言版本使用正确的默认语言

5. **构建验证**
   - 显示构建类型和配置
   - 验证 zip 文件是否成功创建
   - 显示包大小和下一步操作

6. **多包对比**
   - 显示当前包的大小
   - 列出所有可用的其他版本供对比

## 📊 包大小对比

| 版本 | 文件名 | 大小 | 包含语言 | default_locale | 卡片数据 |
|------|---------|------|-----------|---------------|---------|
| 完整版 | agricola-tutor-full.zip | 563K | en, zh, jp | en | 1550.7 KB (所有) |
| 英文版 | agricola-tutor-en.zip | 553K | en, zh | en | 1546.8 KB (-0.3%) |
| 中文版 | agricola-tutor-zh.zip | 553K | en, zh | zh | 1546.8 KB (-0.3%) |
| 日文版 | agricola-tutor-jp.zip | 514K | en, jp | jp | 1134.9 KB (-26.8%) |

## 🔍 技术细节

### 过滤逻辑 (filter-locales.js)

```javascript
// 配置
en: { keep: ['en', 'zh'], default: 'en' }
zh: { keep: ['en', 'zh'], default: 'zh' }
jp: { keep: ['en', 'jp'], default: 'jp' }
```

### 构建流程

1. **清理构建**: `rm -rf build .plasmo`
2. **Plasmo 构建**: `plasmo build`
3. **过滤卡片**: `node scripts/filter-locales.js`
4. **复制过滤后的卡片**: `cp build/cards-filtered.json build/chrome-mv3-prod/cards.json`
5. **过滤语言文件**: `rm -rf build/chrome-mv3-prod/_locales/xx`
6. **创建缺失语言**: `cp -r en/ zh/` 或 `cp -r en/ jp/`
7. **更新 manifest**: 修改 `default_locale`
8. **创建 zip**: 打包整个 `build/chrome-mv3-prod/` 目录

## 📝 注意事项

1. **语言 fallback**:
   - en 版本包含 zh（因为中文用户也需要看英文名）
   - zh 版本包含 en（同样理由）
   - jp 版本包含 en（同样理由）

2. **locales 源文件**:
   - 源码中只有 `locales/en/` 和 `locales/zh/`
   - `locales/jp/` 不存在，构建时从 `en/` 复制

3. **manifest.json**:
   - `default_locale` 由 Plasmo 根据 package.json 设置
   - 构建后由脚本动态更新

4. **使用方法**:
   ```bash
   # 本地测试
   npm run build:local:en

   # 加载到 Chrome
   chrome://extensions/ -> 开发者模式 -> 加载已解压的扩展程序
   # 选择目录: build/chrome-mv3-prod/
   ```

## ✅ 结论

所有四个版本的本地打包都已测试成功：
- ✅ 完整版（563K）
- ✅ 英文版（553K，en+zh）
- ✅ 中文版（553K，en+zh）
- ✅ 日文版（514K，en+jp，缩小26.8%）

符合需求：
- ✅ 不会发布到 GitHub（本地打包）
- ✅ 支持完整打包
- ✅ 支持指定语言打包（en, zh, jp）
- ✅ 语言过滤正确
- ✅ manifest default_locale 正确设置
- ✅ cards.json defaultLang 字段正确设置
