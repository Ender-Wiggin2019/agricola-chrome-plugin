# GitHub Actions 工作流说明

## 自动打包和发布插件

这个工作流会在以下情况自动运行：

### 1. 推送 Tag 时自动发布（推荐）

当你推送一个以 `v` 开头的 tag 时，工作流会自动：

- 将 `ag-tier/plugin/` 目录打包成 zip 文件
- 创建 GitHub Release
- 将 zip 文件上传到 Release 的下载区域

**使用方法：**

```bash
# 创建并推送 tag
git tag v1.0.5
git push origin v1.0.5
```

### 2. 手动触发

你也可以在 GitHub Actions 页面手动触发工作流：

1. 进入仓库的 "Actions" 标签页
2. 选择 "Build and Release Plugin" 工作流
3. 点击 "Run workflow"
4. 输入版本号（例如：`v1.0.5`）
5. 点击 "Run workflow"

## 工作流步骤

1. **检出代码** - 获取最新代码
2. **设置版本号** - 从 tag 或手动输入获取版本号
3. **创建 zip 文件** - 将插件目录打包成 `ag-tier-plugin-{version}.zip`
4. **创建 Release** - 在 GitHub 上创建 Release 并上传 zip 文件
5. **上传 Artifact** - 将 zip 文件保存为构建产物（保留 30 天）

## 生成的 Release

Release 会包含：

- 版本标签（tag）
- Release 说明（包含安装说明）
- 可下载的 zip 文件

## 注意事项

- 确保 `GITHUB_TOKEN` 有创建 Release 的权限（默认已配置）
- zip 文件名格式：`ag-tier-plugin-{version}.zip`
- 版本号建议遵循语义化版本（如 v1.0.5）
