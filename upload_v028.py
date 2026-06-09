import requests, urllib3, json, base64
urllib3.disable_warnings()

BASE = 'http://localhost:8081/api/v1'
TOKEN = 'memos_pat_A87dHmU6XqCRJYNgRvbMMxLUQ6PzjjvG'
headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# 1. 读取文件并转 Base64
file_path = 'C:\\Users\\Administrator\\Documents\\Codex\\9Router\\rtk-build-fix-report.md'
with open(file_path, 'rb') as f:
    content_b64 = base64.b64encode(f.read()).decode('utf-8')

# 2. 构造 CreateAttachmentRequest (参考 Connect RPC / Protobuf 结构)
# 根据 v0.28.0 源码推测的字段: filename, content (base64)
data = {
    'filename': 'rtk-report.md',
    'content': content_b64
}

# 3. 发送请求
r = requests.post(f'{BASE}/attachments', headers=headers, json=data, verify=False)

print(f"Status: {r.status_code}")
print(f"Response: {json.dumps(r.json(), indent=2) if r.status_code == 200 else r.text}")
