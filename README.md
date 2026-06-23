# FBTI 足球人格测试

纯 HTML、CSS、JavaScript 实现的足球人格测试网站，不需要数据库或后端服务。

## 本地预览

直接打开 `index.html` 即可运行。

## 项目结构

- `index.html`：页面结构
- `styles.css`：界面样式
- `data.js`：题库、人格映射和隐藏结果
- `app.js`：答题流程、评分与结果渲染
- `assets/personality-images/`：网站实际使用的人格图片
- `reference/`：长期参考资料，不会进入发布目录
- `review-assets/`：图片生成与审核档案，不会进入发布目录
- `tools/`：自动化测试和发布脚本
- `dist/`：运行发布脚本后生成的上线目录

## 发布前检查

```powershell
Get-ChildItem tools -Filter "test_*.js" | Sort-Object Name | ForEach-Object {
  node $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node tools/build-release.js
```

生成完成后，只部署 `dist` 目录。

发布脚本只把 960×1280 以内的无损 WebP 交付图复制到 `dist`。原始 PNG 会留在项目中作为高清母版，不进入线上发布包。

替换原始 PNG 后，可运行 `python tools/optimize_personality_images.py` 重新生成 WebP 交付图；该脚本需要 Pillow 和 NumPy。

## Cloudflare Pages

推荐使用 Git 集成：

- 框架预设：`None`
- 构建命令：`node tools/build-release.js`
- 构建输出目录：`dist`

也可以在 Cloudflare Pages 中使用 Direct Upload，直接上传生成后的 `dist` 文件夹。

完整步骤见 [DEPLOY.md](./DEPLOY.md)。
