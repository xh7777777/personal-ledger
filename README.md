# 个人记账工具

前后端分离的本地个人记账工具，包含 Vue 前端、Hono API、账户管理、收入/支出流水 CRUD、时间筛选和分类统计。

## 本地运行

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

前端打开 `http://localhost:5173`，后端 API 运行在 `http://localhost:4173`。

## Docker 运行

```bash
docker compose up --build
```

打开 `http://localhost:4173`。

## 当前范围

- 数据保存在后端本地 JSON 文件，Docker 中挂载到 `ledger-data` volume。
- 首版无登录、无云同步、无持仓、无行情。
- 后续可以把 JSON 存储替换为 SQLite，API 和前端页面结构可以保持不变。
