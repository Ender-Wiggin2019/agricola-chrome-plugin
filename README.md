# Agricola Card Tier Tooltip Chrome Extension

这个 Chrome 扩展会在 Agricola 游戏页面上自动为卡片添加等级（tier）信息和详情工具提示。

## 功能

- 自动识别页面上的卡片标题（`.card-title`）
- 在卡片标题后显示等级徽章（如 T0, T1 等）
- 点击等级徽章或信息图标可以查看卡片的详细描述
- 支持动态加载的卡片（使用 MutationObserver）

## 安装步骤

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择包含以下文件的文件夹：
   - `manifest.json`
   - `content.js`
   - `styles.css`
   - `cards.json`

## 使用方法

安装后，扩展会自动在包含 `.card-title` 元素的页面上运行。当找到匹配的卡片时，会在卡片标题后显示：
- 梯度（如 T0, T1）
- 信息图标

点击等级徽章或信息图标即可查看卡片的详细描述。

## 文件说明

- `manifest.json`: Chrome 扩展配置文件
- `content.js`: 主要逻辑，负责查找卡片并添加功能
- `styles.css`: 样式文件，定义徽章和工具提示的外观
- `cards.json`: 卡片数据文件
