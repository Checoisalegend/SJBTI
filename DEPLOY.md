# SJBTI 上线指南

这个网站是纯静态站，Cloudflare Pages 足够使用，不需要服务器、数据库或 Workers。

## 推荐方案：Cloudflare Pages + GitHub

1. 在 GitHub 创建或打开你的 `SJBTI` 仓库。
2. 把本项目推送到该仓库。
3. 在 Cloudflare 控制台进入 **Workers & Pages**。
4. 选择 **Create application > Pages > Connect to Git**。
5. 授权并选择 GitHub 仓库。
6. 构建设置填写：

| 设置 | 内容 |
| --- | --- |
| Framework preset | `None` |
| Build command | `node tools/build-release.js` |
| Build output directory | `dist` |

之后每次推送到 GitHub，Cloudflare 都会自动重新构建并发布。

## Direct Upload 临时方案

在项目目录运行：

```powershell
node tools/build-release.js
```

然后在 Cloudflare Pages 选择 **Direct Upload**，上传生成后的 `dist` 文件夹。

注意：Direct Upload 更适合临时发布。长期维护建议使用 GitHub 连接方式。

## 自定义域名

项目部署后：

1. 打开 Cloudflare Pages 项目。
2. 进入 **Custom domains**。
3. 点击 **Set up a custom domain**。
4. 输入 `sjbti.xyz`。
5. 按页面提示完成 DNS 配置。

如果域名在阿里云购买，建议按 Cloudflare 提示添加 CNAME/验证记录；更长期稳定的方式是把 DNS 托管交给 Cloudflare。

## 每次更新网站

1. 修改代码、题库、文案或图片。
2. 如果替换 `assets/result-cards/` 里的结果卡图片，保持 39 个 WebP 文件名完全一致。
3. 如果图片内容变了，建议把 `app.js` 顶部的 `RESULT_ASSET_VERSION` 改成新的值，避免浏览器缓存旧图。
4. 运行全部测试。
5. 运行 `node tools/build-release.js`。
6. 推送到 GitHub，等待 Cloudflare 自动部署。

上线包只需要 `dist`。原始参考资料、临时文件和审核素材不会进入 `dist`。
