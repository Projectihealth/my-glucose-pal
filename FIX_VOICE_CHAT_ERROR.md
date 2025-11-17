# Fix Voice Chat Connection Error

## 问题诊断

Voice Chat 点击后报错的原因：

```
XMLHttpRequest cannot load http://localhost:5001/intake/create-web-call
```

### 根本原因
`.env` 文件中配置的 Minerva 端口错误：
- ❌ 配置：`VITE_MINERVA_BACKEND_URL=http://localhost:5001`
- ✅ 实际：Minerva 运行在 `http://localhost:8000`

## 解决方案

已修复 `.env` 文件，使用空字符串让请求走 Vite 代理：

```bash
# 修改前
VITE_MINERVA_BACKEND_URL=http://localhost:5001

# 修改后
VITE_MINERVA_BACKEND_URL=
```

这样前端会使用相对路径 `/intake/create-web-call`，由 Vite 代理到正确的端口 8000。

## 重启服务

### 方法 1: 完全重启（推荐）

```bash
# 1. 停止所有服务 (Ctrl+C)
# 2. 重新启动
./start-all.sh
```

### 方法 2: 只重启前端

```bash
# 找到前端进程并停止
ps aux | grep "npm.*dev" | grep -v grep | awk '{print $2}' | xargs kill

# 重新启动前端
cd apps/frontend && npm run dev
```

## 验证

重启后，访问 http://localhost:8080 并：
1. 点击 Voice Chat
2. 应该能成功连接到 Retell SDK
3. 控制台应该显示：
   ```
   🔑 Requesting access token...
   ✅ Web call created
   📞 Starting Retell call...
   ✅ Call started successfully
   ```

## 配置说明

### Vite Proxy 配置 (vite.config.ts)

```typescript
proxy: {
  '/intake': {
    target: 'http://localhost:8000',  // Minerva FastAPI
    changeOrigin: true,
  },
  '/api': {
    target: 'http://localhost:5000',  // Flask backend
    changeOrigin: true,
  }
}
```

### 服务端口列表

| 服务 | 端口 | URL |
|------|------|-----|
| Frontend (Vite) | 8080 | http://localhost:8080 |
| Flask Backend | 5000 | http://localhost:5000 |
| Minerva (FastAPI) | 8000 | http://localhost:8000 |

---

**修复日期:** 2025-11-17
**状态:** ✅ 已解决

