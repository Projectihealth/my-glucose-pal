# Tavus 对话自动清理指南 - 完整解决方案

## 🎯 最快解决方案（推荐）

### 一键完整重启
在项目根目录运行：
```
scripts/startup/restart_with_cleanup.bat
```

**这会自动做以下事情：**
1. ✅ 清理所有旧的 Tavus 对话
2. ✅ 启动 Dashboard 后端
3. ✅ 启动 Video Avatar 前端
4. ✅ 打开聊天界面

---

## 🧹 快速清理

### 仅清理旧对话
```bash
# 方式1：双击
scripts/cleanup/cleanup_tavus.bat

# 方式2：Python
cd scripts/cleanup
python cleanup_tavus.py

# 方式3：指定对话ID
python cleanup_tavus.py --conversation-id conv_xxxxx
```

---

## 🔧 工作原理

### 自动化流程

```
应用运行中：
  ↓
用户点击"Digital Avatar" → 创建新对话
  ↓
对话URL被自动保存到：
  - 浏览器 localStorage
  - 后端 conversations_history.json
  ↓

下次启动时：
  ↓
运行 cleanup_tavus.py
  ↓
读取 conversations_history.json
  ↓
逐个关闭所有旧对话 ✅
  ↓
清空历史文件
  ↓
应用启动 - 创建新对话成功！
```

---

## ✅ 验证清理成功

运行清理脚本后应该看到：

```
============================================================
🧹 Tavus 对话清理工具
============================================================
✅ 已获得 Tavus API Key

🔍 检查本地保存的对话历史...
✅ 找到 2 条已保存的对话记录

🧹 尝试清理 2 个对话...

  [1/2] 尝试关闭: conv_xxxxx1 (创建于: 2025-10-27T...)
  ✅ 成功关闭

  [2/2] 尝试关闭: conv_xxxxx2 (创建于: 2025-10-27T...)
  ✅ 成功关闭

✅ 清理完成:
   - 成功: 2/2
   - 失败: 0/2

✅ 已清空历史文件
```

---

## 💡 常见问题

### Q: 为什么每次都会出现并发错误？
A: 因为 Tavus 服务器上的旧对话没有被清理。运行清理脚本后就会解决。

### Q: 想手动指定要清理的对话？
A: 
```bash
python cleanup_tavus.py --conversation-id conv_xxxxx
```

### Q: 我能在 Tavus Dashboard 中看到活跃对话吗？
A: 是的！访问 https://www.tavus.io/dashboard，登录后可以看到所有活跃对话，也可以手动关闭。

---

**快速导航**
- 📂 返回 scripts 文件夹 → `../README.md`
- 🚀 启动应用 → `../startup/`
- ✅ 验证配置 → `../verify/`
