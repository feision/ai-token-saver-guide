# SearXNG 部署指南（自托管搜索）

> SearXNG 是隐私友好的开源元搜索引擎，支持 JSON API，可集成到 9Router 提供免费搜索服务

## 环境信息

| 项目 | 值 |
|------|-----|
| **VPS** | 日本 (43.167.159.200) |
| **端口** | 7777 |
| **地址** | http://43.167.159.200:7777 |
| **状态** | 运行中 |

## 快速测试

```bash
# 测试搜索
curl "http://43.167.159.200:7777/search?q=AI+coding&format=json&limit=3"
```

## Docker 部署命令

```bash
# 1. SSH 连接到 VPS
ssh ubuntu@43.167.159.200

# 2. 创建配置文件（启用 JSON 格式）
cat > ~/searxng-settings.yml << 'EOF'
use_default_settings: true
general:
  instance_name: "SearXNG"
search:
  formats:
    - html
    - json
server:
  secret_key: "your-secret-key"
  bind_address: "0.0.0.0"
  port: 8080
  limiter: false
engines:
  - name: google
    engine: google
    shortcut: g
  - name: duckduckgo
    engine: duckduckgo
    shortcut: ddg
EOF

# 3. 停止旧容器（如有）
sudo docker stop searxng 2>/dev/null
sudo docker rm searxng 2>/dev/null

# 4. 启动新容器（挂载配置）
sudo docker run -d \
  --name searxng \
  -p 7777:8080 \
  -v /home/ubuntu/searxng-settings.yml:/etc/searxng/settings.yml:ro \
  -e SEARXNG_SECRET=your-secret-key \
  searxng/searxng
```

## 关键配置说明

### 启用 JSON 格式

SearXNG 默认只启用 HTML 格式。必须修改 `search.formats`：

```yaml
search:
  formats:
    - html
    - json
```

### 挂载配置 vs 环境变量

| 方式 | 说明 |
|------|------|
| **挂载配置文件**（推荐） | 完全控制所有配置，支持 JSON 格式 |
| **环境变量** | 简单，但默认只开 html 格式 |

### 容器内无 bash

SearXNG 容器内没有 bash，修改配置需通过挂载卷方式。

## 管理命令

```bash
# 查看状态
sudo docker ps | grep searxng

# 查看日志
sudo docker logs searxng

# 重启
sudo docker restart searxng

# 删除
sudo docker stop searxng && sudo docker rm searxng
```

## 集成到 9Router

在 9Router Dashboard 中添加 SearXNG 提供商：

```
Provider: searxng
URL: http://43.167.159.200:7777
```

## 参考资料

- [SearXNG GitHub](https://github.com/searxng/searxng)
- [SearXNG 文档](https://docs.searxng.org/)