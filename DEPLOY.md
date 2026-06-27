# SJBTI 上线指南

这个网站是纯静态站，Cloudflare Pages 足够使用，不需要服务器、数据库或 Workers。

## 推荐方案：Cloudflare Pages + GitHub

1. 在 GitHub 创建仓库，例如 `SJBTI`。
2. 把本项目推送到仓库。
3. 在 Cloudflare 控制台进入 **Workers & Pages**。
4. 选择 **Create application > Pages > Connect to Git**。
5. 授权并选择 GitHub 仓库。
6. 构建设置填写：

| 设置 | 内容 |
| --- | --- |
| Framework preset | `None` |
| Build command | `node tools/build-release.js` |
| Build output directory | `dist` |

以后每次推送到 GitHub，Cloudflare 都会自动重新构建并发布。

## 临时方案：Direct Upload

在项目目录运行：

```powershell
node tools/build-release.js
```

然后在 Cloudflare Pages 选择 **Direct Upload**，上传生成后的 `dist` 文件夹。

注意：Direct Upload 项目后续不能直接切换成 Git 集成。准备长期维护的话，建议一开始就使用 GitHub 方案。

## 自定义域名

项目部署后：

1. 打开 Cloudflare Pages 项目。
2. 进入 **Custom domains**。
3. 点击 **Set up a custom domain**。
4. 输入域名，例如 `sjbti.xyz`。
5. 按页面提示完成 DNS 配置。

如果域名在阿里云购买，最终仍建议把 DNS 托管交给 Cloudflare，或者至少按 Cloudflare 提示添加 CNAME/验证记录。

## 每次更新网站

1. 修改代码、题库、文案或图片。
2. 如果替换了 `assets/result-cards/` 里的结果卡图片，保持 39 个 WebP 文件名完全一致，并把 `app.js` 顶部的 `RESULT_ASSET_VERSION` 改成新值。
3. 运行全部测试。
4. 运行 `node tools/build-release.js`。
5. 推送到 GitHub，等待 Cloudflare 自动部署。

上线包只需要 `dist`。原始 PNG、参考资料和审核档案都不会进入 `dist`。
