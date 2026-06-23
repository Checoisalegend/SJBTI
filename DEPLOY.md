# FBTI 上线指南

## 推荐方案：Cloudflare Pages + GitHub

这个网站是纯静态网站，Cloudflare Pages 足够使用，不需要购买服务器、数据库或 Workers。

### 1. 创建 GitHub 仓库

1. 登录 GitHub，新建一个空仓库，例如 `fbti-football-test`。
2. 将本项目提交并推送到仓库。
3. 不要单独上传 `dist`，Cloudflare 会自动生成它。

### 2. 连接 Cloudflare Pages

1. 登录 Cloudflare 控制台。
2. 进入 **Workers & Pages**。
3. 选择 **Create application > Pages > Connect to Git**。
4. 授权 GitHub，选择刚才创建的仓库。
5. 构建设置填写：

| 设置 | 内容 |
| --- | --- |
| Framework preset | `None` |
| Build command | `node tools/build-release.js` |
| Build output directory | `dist` |

6. 点击部署。完成后会获得类似 `项目名.pages.dev` 的公开网址。

以后每次推送代码到 GitHub，Cloudflare 都会自动重新发布。

## 更快的临时方案：Direct Upload

先在项目目录运行：

```powershell
node tools/build-release.js
```

然后在 Cloudflare Pages 选择 **Drag and drop your files**，上传 `dist` 文件夹。

注意：Cloudflare 的 Direct Upload 项目之后不能直接切换为 Git 集成。若准备长期更新网站，建议一开始就使用 GitHub 方案。

也可以安装 Node.js 后使用 Wrangler：

```powershell
npx wrangler login
npx wrangler pages project create
npx wrangler pages deploy dist
```

## 自定义域名

项目部署后：

1. 打开 Cloudflare Pages 项目。
2. 进入 **Custom domains**。
3. 选择 **Set up a custom domain**。
4. 输入已购买的域名或子域名，例如 `fbti.example.com`。
5. 按页面提示完成 DNS 配置。

在购买域名前，`pages.dev` 地址已经可以让任何人直接访问。

## 每次更新网站

1. 修改代码或替换人格图片。
2. 运行全部测试。
3. 推送到 GitHub。
4. 等待 Cloudflare 自动部署完成。

人格图片仍需放在 `assets/personality-images/`，文件名与人格名称保持一致。
