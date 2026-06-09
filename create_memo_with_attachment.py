import requests, urllib3, json
urllib3.disable_warnings()

BASE = 'http://localhost:8081/api/v1'
TOKEN = 'memos_pat_A87dHmU6XqCRJYNgRvbMMxLUQ6PzjjvG'
headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# 1. 刚才上传成功的附件 UID
# 格式: attachments/xxx
attachment_name = "attachments/oEgE3GGg9Ybwtw239iTzGa"

# 2. 创建 Memo 并关联附件
# v0.28.0 关联方式推测: 在 resources 列表里放 attachment_name
data = {
    'content': '## 附件测试\n\n测试 Memos v0.28.0 附件关联功能。',
    'visibility': 'PRIVATE',
    'resources': [attachment_name]
}

r = requests.post(f'{BASE}/memos', headers=headers, json=data, verify=False)

print(f"Status: {r.status_code}")
memo = r.json()
memo_id = memo.get('name', '')
print(f"URL: http://localhost:8081/{memo_id}")
