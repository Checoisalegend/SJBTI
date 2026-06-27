# SJBTI 世界杯人格测试

这是一个纯前端静态网站，用 HTML、CSS 和 JavaScript 实现，不需要数据库或后端服务。

## 本地预览

直接打开 `index.html` 即可运行。如果浏览器缓存旧资源，刷新页面或给资源版本号加一位即可。

## 结果卡替换

网站结果页直接加载 `assets/result-cards/` 里的 WebP 文件。替换签名版图片时，只需要保持文件名完全一致，例如 `独裁者.webp`、`詹姆斯梅.webp`、`跳水罗.webp`。

替换结果卡后，建议把 `app.js` 顶部的 `RESULT_ASSET_VERSION` 改成一个新的值，用来绕过 Cloudflare 和浏览器的旧图片缓存。

## 文案修改

常改的展示文案都集中在 `copy.js`：

- `standardResults`：24 个标准人格。
- `standardResults[人格名].slogan`：结果卡片上的一句 slogan。
- `standardResults[人格名].descriptions.novice`：萌新组介绍。
- `standardResults[人格名].descriptions.fan`：懂球组介绍。
- `specialResults`：梅罗极端隐藏款和其他隐藏人格，不分萌新/懂球组。
- `players`：球员简称、中文名和国家队主色。

如果改了 slogan 或球员简称，需要同步替换 `assets/result-cards/` 里的对应结果卡图片，因为结果页展示的是已经排版好的整张结果卡。

## 项目结构

- `index.html`：页面结构。
- `styles.css`：界面样式。
- `data.js`：题库、分支、维度和人格映射。
- `copy.js`：结果页文案、slogan、球员简称和配色。
- `app.js`：答题流程、计分、结果渲染和保存结果。
- `assets/result-cards/`：最终结果卡 WebP，网站结果页直接加载这里。
- `tools/`：构建发布包和自动化测试。
- `reference/`、`tmp/`、`assets/personality-images/`：本地制作资料，不进入发布包，也不提交到 GitHub。
- `dist/`：运行发布脚本后生成的上线目录。

## 发布前检查

```powershell
$tests = Get-ChildItem tools -Filter "test_*.js" | Sort-Object Name
foreach ($test in $tests) {
  node $test.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node tools/build-release.js
```

生成完成后，只部署 `dist` 目录。

## Cloudflare Pages

推荐使用 GitHub 连接 Cloudflare Pages：

- Framework preset：`None`
- Build command：`node tools/build-release.js`
- Build output directory：`dist`

也可以在 Cloudflare Pages 里直接上传 `dist` 目录做临时发布。完整流程见 `DEPLOY.md`。
